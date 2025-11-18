import initializeContracts from '../contract';
import { LogLevel } from '../utils/enums';
import { MESSAGE_TYPE } from '../utils/messages';

import { sendMessage } from '../utils/slack';

const UPDATE_SECOND_THRESHOLD = BigInt(60); // sec
const UPDATE_MINUTE_THRESHOLD = BigInt(180); // sec

export const checkFeedUpdates = async () => {
  try {
    const { SpotPriceFeed, PositionValueFeed } = await initializeContracts();

    const currentTime = BigInt(Math.floor(Date.now() / 1000));

    const [spotPriceLastUpdatedAt, positionValueFeedLastUpdatedAt]  = await Promise.all([
      SpotPriceFeed.getLastUpdatedAt(),
      PositionValueFeed.getPVLastUpdatedAt()
    ])

    const diffInSpotPriceLastUpdateTime = currentTime - spotPriceLastUpdatedAt;
    console.log(diffInSpotPriceLastUpdateTime, "diffInSpotPriceLastUpdateTime")
    if (diffInSpotPriceLastUpdateTime > UPDATE_MINUTE_THRESHOLD) {
      await sendMessage(
        `\`[Lambda][check.feedUpdates.ts]\` ${MESSAGE_TYPE.SPOT_PRICE_NOT_UPDATED}`,
        LogLevel.CRITICAL,
        {
          description: "since " + diffInSpotPriceLastUpdateTime.toString() + "s ago",
        }
      )
    }

    const diffInPositionValueFeedLastUpdateTime = currentTime - positionValueFeedLastUpdatedAt;
    console.log(diffInPositionValueFeedLastUpdateTime, "diffInPositionValueFeedLastUpdateTime")
    if (diffInPositionValueFeedLastUpdateTime > UPDATE_MINUTE_THRESHOLD) {
      await sendMessage(
        `\`[Lambda][check.feedUpdates.ts]\` ${MESSAGE_TYPE.POSITION_VALUE_NOT_UPDATED}`,
        LogLevel.CRITICAL,
        {
          description: "since " + diffInPositionValueFeedLastUpdateTime.toString() + "s ago",
        }
      )
    }
  } catch (error) {
    console.log('Error processing feed updates:', error)
    await sendMessage(
      `\`[Lambda][check.feedUpdates.ts]\` ${MESSAGE_TYPE.ERROR_DURING_CHECKING_FEED_UPDATES}`,
      LogLevel.ERROR,
      {
        description: error?.message || error,
      }
    )
  }
}