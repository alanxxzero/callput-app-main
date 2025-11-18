import BigNumber from 'bignumber.js'
import initializeContracts from "../../contract";

import { fetchDataFromS3, getS3, putS3 } from "../../utils/aws";
import { sendMessage } from '../../utils/slack';
import { CONTRACT_ADDRESSES } from '../../constants/constants.addresses';
import { Keeper } from "../../constants/safe";
import { safeTx } from '../../../safeTx';
import { LogLevel } from '../../utils/enums';
import { MESSAGE_TYPE } from '../../utils/messages';
import { getDateISOString, getTimestampFromDateAndTime } from '../../utils/date';

const checklistData = {
  feedSettlePrice: false,
  prepareVaultSettlement: false,
  settleVaultPositions: false,
  allSettled: false,
};

export const feedSettlePrice = async () => {
  const chainId = Number(process.env.CHAIN_ID);

  const { SettlePriceFeed } = await initializeContracts();

  const dateISOString = getDateISOString();
  const expiry = getTimestampFromDateAndTime(dateISOString, 8, 0, 0) / 1000;

  const settlePriceData = await getS3({
    Bucket: process.env.MOBY_GLOBAL_DATA_BUCKET,
    Key: process.env.MOBY_GLOBAL_DATA_SETTLE_PRICE_KEY
  })

  const settleCheckData = await fetchDataFromS3({
    Bucket: process.env.MOBY_DATA_BUCKET,
    Key: process.env.MOBY_DATA_SETTLE_CHECK_KEY,
    initialData: {
      [dateISOString]: checklistData,
    },
  });

  if (!settlePriceData[expiry]) {
    console.log("Twap price hasn't been feeded yet.");
    return;
  }

  const checklist = settleCheckData[dateISOString] || checklistData; 

  if (checklist.feedSettlePrice === true) {
    console.log("Settle price has already been feeded.");
    return;
  }

  try {
    const feedSettlePrices = async () => {
      const txData = await SettlePriceFeed.feedSettlePrices.populateTransaction(
        [CONTRACT_ADDRESSES[chainId].WBTC, CONTRACT_ADDRESSES[chainId].WETH],
        [settlePriceData[expiry].BTC, settlePriceData[expiry].ETH].map((price) => new BigNumber(price).multipliedBy(10 ** 30).toString()),
        expiry
      )
      
      await safeTx(
        Keeper.SETTLE_OPERATOR,
        {
          to: txData.to,
          data: txData.data,
          value: "0"
        }
      )
    }

    await feedSettlePrices();

    checklist.feedSettlePrice = true;
    settleCheckData[dateISOString] = checklist;

    await putS3({
      Bucket: process.env.MOBY_DATA_BUCKET,
      Key: process.env.MOBY_DATA_SETTLE_CHECK_KEY as string,
      Body: JSON.stringify(settleCheckData),
      CacheControl: "no-cache",
    });
  } catch (error) {
    console.log("Error in processFeedSettlePrice:", error);
    await sendMessage(
      `\`[Lambda][feed.settlePrice]\` ${MESSAGE_TYPE.ERROR_DURING_FEEDING_SETTLE_PRICE}`,
      LogLevel.ERROR,
      {
        description: error?.message || error,
      }
    )
  }
};