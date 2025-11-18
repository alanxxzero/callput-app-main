import { executePositionRequestParallel } from "./src/process/parallel.executePositionRequest";
import { getMyPositions, getOlpApr, getMyPositionHistory, getCopyTradePositionHistory, getVaultQueueItems, getOlpStatsDaily, hasVaultQueueItems, getMyAccountSummary } from "./src/api";
import { collectTradeDataParallel } from "./src/process/parallel.collectTradeData";
import { checkFileUpdates } from "./src/process/check.fileUpdates";
import { checkFeedUpdates } from "./src/process/check.feedUpdates";
import { notifyTradeData } from "./src/process/notify.tradeData";
import { collectOlpStats } from "./src/process/collect.olpStats";
import { _applyWeeklyRewardPoints, applyOLPDepositPoint, getLeaderboard, getUserPointInfo } from "./src/user/point";
import { feedDefillamaData } from "./src/etc/feedDefillama";
import { checkKeeperBalances } from "./src/process/check.keeperBalances";
import { getRevenueData } from "./src/etc/getRevenueData";
import { collectMarketDataParallel } from "./src/process/parallel.collectMarketData";
import { getProtocolNetRevenueData } from "./src/etc/getProtocolNetRevenue";
import { detectPriceVolatility } from "./src/process/instrument/detect.priceVolatility";
import { feedInstruments } from "./src/process/instrument/feed.instruments";
import { updateOptionsMarket } from "./src/process/instrument/update.optionsMarket";
import { distributeFee } from "./src/process/fee/distribute.fee";
import { distributeReward } from "./src/process/fee/distribute.reward";
import { clearPositions } from "./src/process/clear.positions";
import { checkAvailableAmounts } from "./src/process/check.availableAmounts";
import { SecretKeyManager } from "./crypto";

import REQUIREMENTS from "./src/constants/constants.requirements";
import { updateDashboardData } from "./src/olpPoolDashboard/updateDashboardData";
import { getReferralInfo } from "./src/user/referral";
import { feedSettlePrice } from "./src/process/settle/feed.settlePrice";
import { executeVaultSettlement } from "./src/process/settle/execute.vaultSettlement";
import { notifyPositions } from "./src/process/notify.positions";
import { checkMarketChange } from "./src/process/check.marketChange";
import { collateralAmountToSize, getComboCollateralAmount } from "./src/calculation";
import { collectMarketData } from "./src/process/collect.marketData";
import { updateOlppvParallel } from "./src/feed/parallel.updateOlppv";
import { feedOnchainDataParallel } from "./src/feed/parallel.feedOnchainData";
import { updateDaily } from "./src/process/update.daily";
import { getOlppvFromOnchain } from "./src/feed/update.olppv"

// Schedule
// 1s interval (fast task)
// executePosition

// 1m interval (normal task)
// feedInstruments, settleOption, clearing, feeDistribution, updateOptionMarket

const isServerDisabled = false;

const loadEnv = async () => {
    const secretKeyManager = new SecretKeyManager({ region: 'ap-northeast-2', DEFAULT_PATH: process.env.SECRET_PATH })

    const chainId = Number(process.env.CHAIN_ID);

    // load from constants files

    process.env.GOOGLE_SPREADSHEET_ID = REQUIREMENTS[chainId]["GOOGLE_SPREADSHEET_ID"]
    process.env.SLACK_NOTIFICATION_CHANNEL_ID = REQUIREMENTS[chainId]["SLACK_NOTIFICATION_CHANNEL_ID"]
    process.env.SLACK_ALERT_CHANNEL_ID = REQUIREMENTS[chainId]["SLACK_ALERT_CHANNEL_ID"]
    process.env.DUNE_DATA_BUCKET = REQUIREMENTS[chainId]["DUNE_DATA_BUCKET"]
    process.env.MOBY_DATA_OLP_DASHBOARD_KEY = REQUIREMENTS[chainId]["MOBY_DATA_OLP_DASHBOARD_KEY"]
    process.env.DUNE_QUERY_ID_FEES_AND_RP = REQUIREMENTS[chainId]["DUNE_QUERY_ID_FEES_AND_RP"]
    process.env.DUNE_QUERY_ID_NOTIONAL_VOLUME = REQUIREMENTS[chainId]["DUNE_QUERY_ID_NOTIONAL_VOLUME"]
    process.env.DUNE_QUERY_ID_PNL = REQUIREMENTS[chainId]["DUNE_QUERY_ID_PNL"]
    process.env.DUNE_QUERY_ID_DISTRIBUTED_ETH_REWARD = REQUIREMENTS[chainId]["DUNE_QUERY_ID_DISTRIBUTED_ETH_REWARD"]
    process.env.DUNE_QUERY_ID_OLP_INFO = REQUIREMENTS[chainId]["DUNE_QUERY_ID_OLP_INFO"]
    process.env.SLACK_NOTIFICATION_CHANNEL_ID = REQUIREMENTS[chainId]["SLACK_NOTIFICATION_CHANNEL_ID"]
    process.env.SLACK_ALERT_CHANNEL_ID = REQUIREMENTS[chainId]["SLACK_ALERT_CHANNEL_ID"]
    process.env.SLACK_TRADE_CHANNEL_ID = REQUIREMENTS[chainId]["SLACK_TRADE_CHANNEL_ID"]
    process.env.MAX_POSITION_PROCESS_ITEMS = REQUIREMENTS[chainId]["MAX_POSITION_PROCESS_ITEMS"]
    process.env.MAX_SETTLE_POSITION_PROCESS_ITEMS = REQUIREMENTS[chainId]["MAX_SETTLE_POSITION_PROCESS_ITEMS"]
  
    // load from secret manager
    const decrypted = JSON.parse(await secretKeyManager.decrypt({ keyName: 'keeper_signers' }))

    const decrypted2 = JSON.parse(await secretKeyManager.decrypt({ keyName: 'moby_lambda_requirements' }))
  
    process.env.KEEPER_OPTIONS_MARKET_KEY = decrypted["KP_OPTIONS_MARKET"]
    process.env.KEEPER_POSITION_PROCESSOR_KEY = decrypted["KP_POSITION_PROCESSOR"]
    process.env.KEEPER_SETTLE_OPERATOR_KEY = decrypted["KP_SETTLE_OPERATOR"]
    process.env.KEEPER_POSITION_VALUE_FEEDER_KEY = decrypted["KP_PV_FEEDER_1"]
    process.env.KEEPER_POSITION_VALUE_FEEDER_SUB1_KEY = decrypted["KP_PV_FEEDER_2"]
    process.env.KEEPER_SPOT_PRICE_FEEDER_KEY = decrypted["KP_SPOT_FEEDER_1"]
    process.env.KEEPER_SPOT_PRICE_FEEDER_SUB1_KEY = decrypted["KP_SPOT_FEEDER_2"]
    process.env.KEEPER_FEE_DISTRIBUTOR_KEY = decrypted["KP_FEE_DISTRIBUTOR"]
    process.env.KEEPER_CLEARING_HOUSE_KEY = decrypted["KP_CLEARING_HOUSE"]
  
    process.env.MOBY_REDIS_HOST = decrypted2["MOBY_REDIS_HOST"]
    process.env.MOBY_REDIS_PASSWORD = decrypted2["MOBY_REDIS_PASSWORD"]
    process.env.MOBY_REDIS_GLOBAL_HOST = decrypted2["MOBY_REDIS_GLOBAL_HOST"]
    process.env.MOBY_REDIS_GLOBAL_PASSWORD = decrypted2["MOBY_REDIS_GLOBAL_PASSWORD"]
    process.env.TWITTER_CLIENT_ID = decrypted2["TWITTER_CLIENT_ID"]
    process.env.TWITTER_CLIENT_SECRET = decrypted2["TWITTER_CLIENT_SECRET"]
    process.env.TWITTER_BEARER_TOKEN = decrypted2["TWITTER_BEARER_TOKEN"]
    process.env.DUNE_API_KEY = decrypted2["DUNE_API_KEY"]
    process.env.SLACK_BOT_TOKEN = decrypted2["SLACK_BOT_TOKEN"]
};

//////////////////////////////
//  process parallel        //
//////////////////////////////

export const processExecutePositionRequestParallel = async (event) => {
    if (isServerDisabled) return;
    await loadEnv();
    return await executePositionRequestParallel(
        event,
        process.env.MAX_RUNNING_TIME_FOR_PARALLEL_TASK
    );
};

export const processCollectMarketDataParallel = async (event) => {
    if (isServerDisabled) return;
    await loadEnv();
    return await collectMarketDataParallel(
        event,
        process.env.MAX_RUNNING_TIME_FOR_PARALLEL_TASK
    );
};

export const processCollectTradeDataParallel = async (event) => {
    if (isServerDisabled) return;
    await loadEnv();
    return await collectTradeDataParallel(
        event,
        process.env.MAX_RUNNING_TIME_FOR_PARALLEL_TASK
    );
};

export const processUpdateOlppvParallel = async (event) => {
    if (isServerDisabled) return;
    await loadEnv()
    return await updateOlppvParallel(event, process.env.MAX_RUNNING_TIME_FOR_PARALLEL_TASK)
}

export const processFeedOnchainDataParallel = async (event) => {
    if (isServerDisabled) return;
    await loadEnv()
    const spotAssets = ["BTC", "ETH", "USDC", "HONEY"];
    return await feedOnchainDataParallel(
        {
            ...event,
            spotAssets
        },
        process.env.MAX_RUNNING_TIME_FOR_PARALLEL_TASK
    )
}

//////////////////////////////
//  process single          //
//////////////////////////////

export const processUpdateDaily = async (event) => {
    if (isServerDisabled) return;
    await loadEnv()
    return await updateDaily();
}

export const processNotifyTradeData = async (event) => {
    if (isServerDisabled) return;
    await loadEnv();
    return await notifyTradeData();
};

export const processNotifyPositions = async (event) => {
    if (isServerDisabled) return;
    await loadEnv();
    return await notifyPositions();
};

export const processCheckAvailableAmounts = async (event) => {
    if (isServerDisabled) return;
    await loadEnv();
    return await checkAvailableAmounts();
};

export const processCheckMarketChange = async (event) => {
    if (isServerDisabled) return;
    await loadEnv();
    return await checkMarketChange();
};

export const processCheckKeeperBalances = async (event) => {
    if (isServerDisabled) return;
    await loadEnv();
    return await checkKeeperBalances();
};

export const processCheckFeedUpdates = async (event) => {
    if (isServerDisabled) return;
    await loadEnv();
    return await checkFeedUpdates();
};

export const processCheckFileUpdates = async (event) => {
    if (isServerDisabled) return;
    await loadEnv();
    return await checkFileUpdates();
};

export const processCollectOlpStats = async (event) => {
    if (isServerDisabled) return;
    await loadEnv();
    return await collectOlpStats();
};

export const processCollectMarketDaily = async (event) => {
    if (isServerDisabled) return;
    await loadEnv();
    return await collectMarketData(0, false);
};

export const processDetectPriceVolatility = async (event) => {
    if (isServerDisabled) return;
    await loadEnv();
    return await detectPriceVolatility();
};

export const processFeedInstruments = async (event) => {
    if (isServerDisabled) return;
    await loadEnv();
    return await feedInstruments();
};

export const processUpdateOptionsMarket = async (event) => {
    if (isServerDisabled) return;
    await loadEnv();
    return await updateOptionsMarket("");
};

export const processDistributeFee = async (event) => {
    if (isServerDisabled) return;
    await loadEnv();
    return await distributeFee();
};

export const processDistributeReward = async (event) => {
    if (isServerDisabled) return;
    await loadEnv();
    return await distributeReward();
};

export const processClearPositions = async (event) => {
    if (isServerDisabled) return;
    await loadEnv();
    return await clearPositions();
};

export const processFeedSettlePrice = async (event) => {
    if (isServerDisabled) return;
    await loadEnv()
    return await feedSettlePrice()
}

export const processExecuteVaultSettlement = async (event) => {
    if (isServerDisabled) return;
    await loadEnv()
    return await executeVaultSettlement()
}


export const query = async (event) => {
    await loadEnv();
    const allowedOrigins = ["https://galxe.com"];
    const origin = event.headers.origin;
    const isAllowedOrigin = allowedOrigins.includes(origin);

    // Preflight request handling
    if (event.httpMethod === "OPTIONS") {
        return {
            statusCode: 204,
            headers: {
                "Access-Control-Allow-Origin": isAllowedOrigin ? origin : "*",
                "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Max-Age": "86400", // 24 hours
            },
            body: null,
        };
    }

    const isGetRequest = event?.requestContext?.http?.method === 'GET'

    // Handle actual request
    if (isGetRequest && !event.queryStringParameters) {
        return {
            statusCode: 400,
            headers: {
                "Access-Control-Allow-Origin": isAllowedOrigin ? origin : "*",
            },
            body: "No query string parameters provided",
        };
    }

    // get query string
    const { method } = isGetRequest
        ? event.queryStringParameters 
        : JSON.parse(event.body)

    if (!method) {
        return {
            statusCode: 400,
            headers: {
                "Access-Control-Allow-Origin": isAllowedOrigin ? origin : "*",
            },
            body: "Method not provided in query string parameters",
        };
    }

    let response;

    switch (method) {
        // case 'getPositions':
        //   response = await getPositions(event)
        //   break
        case "getMyPositions":
            response = await getMyPositions(event);
            break;
        case "getOlpApr":
            response = await getOlpApr(event);
            break;
        // case 'hasPosition':
        //   response = await hasPosition(event)
        //   break
        // case 'getMyTradeData':
        //   response = await getMyTradeData(event)
        //   break
        case "getMyPositionHistory":
            response = await getMyPositionHistory(event);
            break;
        // case 'getUserAddLiquidity':
        //   response = await getUserAddLiquidity(event);
        //   break;
        // case 'getMyAddLiquidity':
        //   response = await getMyAddLiquidity(event);
        //   break;
        case 'getReferralInfo':
          response = await getReferralInfo(event.queryStringParameters?.address);
          break
        case 'getUserPointInfo':
          response = await getUserPointInfo(event.queryStringParameters?.address);
          break;
        case 'getLeaderboard':
          response = await getLeaderboard()
          break;
        case 'getCopyTradePositionHistory':
            response = await getCopyTradePositionHistory(event)
            break;
        case 'getComboCollateralAmount':
            response = await getComboCollateralAmount(event)
            break
        case 'comboCollateralAmountToSize':
            response = await collateralAmountToSize(event)
            break
        case 'infraredVaults':
            response = await fetch("https://infrared.finance/api/backend-vaults?chainId=80094").then((res) => res.json())
            break
        case 'getVaultQueueItems':
            response = await getVaultQueueItems(event)
            break
        case 'hasVaultQueueItems':
            response = await hasVaultQueueItems(event)
            break
        case 'getOlpStatsDaily':
            response = await getOlpStatsDaily(event)
            break
        case 'getMyAccountSummary':
            response = await getMyAccountSummary(event)
            break
        default:
            response = { error: "Invalid method" };
            break;
    }

    return {
        statusCode: 200,
        headers: {
            "Access-Control-Allow-Origin": isAllowedOrigin ? origin : "*",
            "Access-Control-Allow-Methods": isAllowedOrigin
                ? "GET, POST"
                : "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
        },
        body: JSON.stringify(response),
    };
};

export const applyOLPDepositPoints = async (event) => {
    await loadEnv();

    const timestamp = new Date().getTime();

    await applyOLPDepositPoint(timestamp);

    const response = {
        statusCode: 200,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Credentials": true,
        },
        body: JSON.stringify({ result: true }),
    };

    return response;
};

export const applyWeeklyRewardPoints = async (event) => {
    await loadEnv();

    const timestamp = new Date().getTime();

    await _applyWeeklyRewardPoints(timestamp);
};

// end_time : timestamp
export const getVolumeData = async (event) => {
    await loadEnv();

    const endTime = Number(
        event.queryStringParameters?.end_time || new Date().getTime()
    );

    const timeDiff = Math.abs(new Date().getTime() - endTime);

    if (timeDiff > 86400 * 1000 * 365) {
        return {
            statusCode: 400,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Credentials": true,
            },
            body: JSON.stringify({ error: "Invalid end time" }),
        };
    }

    return {
        statusCode: 200,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Credentials": true,
        },
        body: JSON.stringify(await feedDefillamaData(endTime)),
    };
};

// end_time : timestamp
export const getRevenue = async (event) => {
    await loadEnv();

    const endTime = Number(
        event.queryStringParameters?.end_time || new Date().getTime()
    );

    const timeDiff = Math.abs(new Date().getTime() - endTime);

    if (timeDiff > 86400 * 1000 * 365) {
        return {
            statusCode: 400,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Credentials": true,
            },
            body: JSON.stringify({ error: "Invalid end time" }),
        };
    }

    return {
        statusCode: 200,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Credentials": true,
        },
        body: JSON.stringify(await getRevenueData(endTime)),
    };
};

// end_time : timestamp
export const getProtocolNetRevenue = async (event) => {
    await loadEnv();

    const endTime = Number(
        event.queryStringParameters?.end_time || new Date().getTime()
    );

    const timeDiff = Math.abs(new Date().getTime() - endTime);

    if (timeDiff > 86400 * 1000 * 365) {
        return {
            statusCode: 400,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Credentials": true,
            },
            body: JSON.stringify({ error: "Invalid end time" }),
        };
    }

    return {
        statusCode: 200,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Credentials": true,
        },
        body: JSON.stringify(await getProtocolNetRevenueData(endTime)),
    };
};

/////////////////////
// OLP Pool Dashboard
/////////////////////

export const updateOlpPoolDashboardData = async (event) => {
  await loadEnv()
  const result = await updateDashboardData()
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
    body: JSON.stringify(result),
  }
}

export const demo = async () => {
    await loadEnv()
}