import BigNumber from 'bignumber.js';
import initializeContracts from '../contract';
import { sendMessage } from '../utils/slack';
import { LogLevel } from '../utils/enums';
import { MESSAGE_TYPE } from '../utils/messages';
import { getSpotS3, getOlppvS3 } from '../utils/aws-getter';
import { REDIS_KEYS } from '../utils/redis-key';
import { initializeRedis } from '../redis';
import { SENSITIVITY_SPOT_RATE, UPDATE_THRESHOLD_SPOT_IN_MS } from '../constants/global';
import { CONTRACT_ADDRESSES } from '../constants/constants.addresses';
import { processFeedTx } from '../utils/tx-processing';
import { Keeper } from "../constants/safe"
import { getDeadline } from '../utils/misc';
import { shouldUpdateMarketIndex, shouldUpdateOlppv } from './helpers';
import { isIgnorableError } from '../utils/helper';
import { SpotAssetIndexMapRes } from '@moby/shared';
import { Olppv } from './interfaces';

BigNumber.config({
  EXPONENTIAL_AT: 1000,
  DECIMAL_PLACES: 80,
});

export const feedUnified = async (assets: string[]) => {
  const { redis } = await initializeRedis();
  const chainId = Number(process.env.CHAIN_ID);

  try {
    // Get contracts first to check positionRequestKeysStart
    const { SpotPriceFeed, PositionValueFeed, PositionManager } = await initializeContracts();

    // Fetch previous and current data for both spot and PV
    const [
      prevSpot, 
      spot, 
      prevOlppv, 
      olppv,
      currentPositionKeysStart,
      ackPositionKeysStart
    ] = await Promise.all([
      redis.get(REDIS_KEYS.SPOT.LAST_FEED),
      getSpotS3(),
      redis.get(REDIS_KEYS.OLP.PV.LAST_FEED),
      getOlppvS3(),
      PositionManager.positionRequestKeysStart(),
      PositionValueFeed.ackPositionKeysStart()
    ]);

    console.log(currentPositionKeysStart, 'currentPositionKeysStart')
    console.log(ackPositionKeysStart, 'ackPositionKeysStart')

    const parsedPrevSpot = prevSpot ? (JSON.parse(prevSpot) as SpotAssetIndexMapRes) : null;
    const parsedPrevOlppv = prevOlppv ? (JSON.parse(prevOlppv) as Olppv) : null;
    
    console.log(olppv.positionKeysStart, 'olppv.positionKeysStart')

    // Validate OLPPV data is for the current position state
    // Check if the OLPPV data includes the positionKeysStart it was calculated with
    if (olppv.positionKeysStart !== undefined && Number(olppv.positionKeysStart) !== Number(currentPositionKeysStart)) {
      console.log(`feed.unified.ts: OLPPV data is stale. Expected positionKeysStart: ${currentPositionKeysStart}, got: ${olppv.positionKeysStart}`);
      console.log('feed.unified.ts: Waiting for fresh OLPPV calculation with current positionKeysStart');
      return; // Don't feed stale data
    }

    // Check if either spot or PV needs updating
    const shouldUpdateSpot = !prevSpot || shouldUpdateMarketIndex(
      assets,
      parsedPrevSpot,
      spot,
      SENSITIVITY_SPOT_RATE,
      UPDATE_THRESHOLD_SPOT_IN_MS,
    );

    // Include position state mismatch check in shouldUpdatePv
    const shouldUpdatePv = !prevOlppv || shouldUpdateOlppv(
      parsedPrevOlppv, 
      olppv,
      Number(currentPositionKeysStart),
      Number(ackPositionKeysStart)
    );

    // Update if either spot or PV needs updating
    const shouldUpdate = shouldUpdateSpot || shouldUpdatePv;

    console.log('feed.unified.ts: prevSpot ', parsedPrevSpot);
    console.log('feed.unified.ts: spot ', spot);
    console.log('feed.unified.ts: prevOlppv ', parsedPrevOlppv);
    console.log('feed.unified.ts: olppv ', olppv);
    console.log('feed.unified.ts: shouldUpdateSpot ', shouldUpdateSpot);
    console.log('feed.unified.ts: shouldUpdatePv ', shouldUpdatePv);
    console.log('feed.unified.ts: shouldUpdate ', shouldUpdate);

    if (!shouldUpdate) {
      console.log('feed.unified.ts: No updates needed');
      return;
    }

    // Prepare spot price feed transaction
    const spotTxData = await SpotPriceFeed.feedSpotPrices.populateTransaction(
      assets.map((asset) => {
        if (asset === 'HONEY') return CONTRACT_ADDRESSES[chainId].HONEY;
        if (asset === 'USDC') return CONTRACT_ADDRESSES[chainId].USDC;
        return CONTRACT_ADDRESSES[chainId][`W${asset}`];
      }),
      assets.reduce((acc, cur) => {
        acc.push(new BigNumber(spot.data[cur]).multipliedBy(10 ** 30).toString());
        return acc;
      }, []),
      getDeadline(chainId),
    );

    // Prepare position value feed transaction
    const pvTxData = await PositionValueFeed.feedPV_V2.populateTransaction(
      [
        CONTRACT_ADDRESSES[chainId].S_VAULT,
        CONTRACT_ADDRESSES[chainId].M_VAULT,
        CONTRACT_ADDRESSES[chainId].L_VAULT,
      ],
      [olppv.data.sOlp, olppv.data.mOlp, olppv.data.lOlp].map((price) =>
        new BigNumber(price)
          .multipliedBy(10 ** 30)
          .abs()
          .toFixed(0),
      ),
      [olppv.data.sOlp, olppv.data.mOlp, olppv.data.lOlp].map((price) => 
        new BigNumber(price).isNegative()
      ),
      Number(currentPositionKeysStart), // Use the current position keys start we fetched earlier
      getDeadline(chainId),
    );

    // Use batch transactions with Safe to ensure atomicity
    await processFeedTx('feedUnified', async () => {
      const { safeTxBatch } = await import('../../safeTx');
      return await safeTxBatch(
        Keeper.POSITION_VALUE_FEEDER, // This keeper should have permissions for both feeds
        [
          {
            to: spotTxData.to as string,
            data: spotTxData.data as string,
            value: "0"
          },
          {
            to: pvTxData.to as string,
            data: pvTxData.data as string,
            value: "0"
          }
        ]
      );
    });

    // Update Redis cache for successful feeds
    await redis.set(REDIS_KEYS.SPOT.LAST_FEED, JSON.stringify(spot));
    await redis.set(REDIS_KEYS.OLP.PV.LAST_FEED, JSON.stringify(olppv));
    
    console.log('feed.unified.ts: spot and PV have been fed successfully.');

  } catch (error) {
    console.log('Error processing unified feed:', error);

    const isIgnorable = isIgnorableError(error);

    if (!isIgnorable) {
      await sendMessage(
        `\`[Lambda][feed.unified.ts]\` Error during unified feed (Spot + PV)`,
        LogLevel.ERROR,
        {
          description: error?.message || error,
        },
      );
    }

    return;
  }
};