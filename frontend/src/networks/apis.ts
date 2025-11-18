import { SupportedChains } from "./constants"

export const BLOCK_EXPLORER = {
  [SupportedChains["Arbitrum"]]: "https://arbiscan.io",
  [SupportedChains["Berachain Mainnet"]]: "https://berascan.com",
}

export const API_QUERY_BASE_URL = {
  [SupportedChains["Arbitrum"]]: "https://37a7zn60pa.execute-api.ap-northeast-2.amazonaws.com/default/moby-lam-newarb-prod-query",
  [SupportedChains["Berachain Mainnet"]]: "https://e1gwnm482a.execute-api.ap-northeast-2.amazonaws.com/default/moby-lam-beram-prod-query",
}

export const VOLUME_DATA_API = {
  [SupportedChains["Arbitrum"]]: "https://5kjx4q22r2.execute-api.ap-northeast-2.amazonaws.com/prod/getVolumeData",
  [SupportedChains["Berachain Mainnet"]]: "https://63npoycp9b.execute-api.ap-northeast-2.amazonaws.com/prod/getVolumeData",
}

export const TRADE_DATA_API = {
  [SupportedChains["Arbitrum"]]: "https://moby-arb-data.s3.ap-northeast-2.amazonaws.com/trade-data.json.gz",
  [SupportedChains["Berachain Mainnet"]]: "https://moby-data-berachain-mainnet.s3.ap-northeast-2.amazonaws.com/trade-data.json.gz",
}

export const CONNECT_TWITTER_API = {
  [SupportedChains["Arbitrum"]]: "https://5kjx4q22r2.execute-api.ap-northeast-2.amazonaws.com/prod/connectTwitter?address=",
  [SupportedChains["Berachain Mainnet"]]: "https://5kjx4q22r2.execute-api.ap-northeast-2.amazonaws.com/prod/connectTwitter?address=",
}

export const REMOVE_TWITTER_API = {
  [SupportedChains["Arbitrum"]]: "https://5kjx4q22r2.execute-api.ap-northeast-2.amazonaws.com/prod/removeTwitter?address=",
  [SupportedChains["Berachain Mainnet"]]: "https://5kjx4q22r2.execute-api.ap-northeast-2.amazonaws.com/prod/removeTwitter?address=",
}

export const GET_TWITTER_API = {
  [SupportedChains["Arbitrum"]]: "https://5kjx4q22r2.execute-api.ap-northeast-2.amazonaws.com/prod/getTwitterInfo?addresses=",
  [SupportedChains["Berachain Mainnet"]]: "https://5kjx4q22r2.execute-api.ap-northeast-2.amazonaws.com/prod/getTwitterInfo?addresses=",
}

export const OLP_DETAIL_DATA_API = {
  [SupportedChains["Arbitrum"]]: "https://arb-data.moby.trade/olp-pool-dashboard-data.json",
  [SupportedChains["Berachain Mainnet"]]: "https://arb-data.moby.trade/olp-pool-dashboard-data-berachain.json",
}

export const MARKET_DATA_API = {
  [SupportedChains["Arbitrum"]]: "https://moby-arb-data.s3.ap-northeast-2.amazonaws.com/market-data.json",
  [SupportedChains["Berachain Mainnet"]]: "https://moby-data-berachain-mainnet.s3.ap-northeast-2.amazonaws.com/market-data.json",
}

export const LEADERBOARD_API = {
  [SupportedChains["Arbitrum"]]: API_QUERY_BASE_URL[SupportedChains["Arbitrum"]] + "?method=getLeaderboard",
  [SupportedChains["Berachain Mainnet"]]: API_QUERY_BASE_URL[SupportedChains["Berachain Mainnet"]] + "?method=getLeaderboard",
}

export const USER_POINT_INFO_API = {
  [SupportedChains["Arbitrum"]]: API_QUERY_BASE_URL[SupportedChains["Arbitrum"]] + "?method=getUserPointInfo&address=",
  [SupportedChains["Berachain Mainnet"]]: API_QUERY_BASE_URL[SupportedChains["Berachain Mainnet"]] + "?method=getUserPointInfo&address=",
}

export const OLP_APR_API = {
  [SupportedChains["Arbitrum"]]: API_QUERY_BASE_URL[SupportedChains["Arbitrum"]] + "?method=getOlpApr",
  [SupportedChains["Berachain Mainnet"]]: API_QUERY_BASE_URL[SupportedChains["Berachain Mainnet"]] + "?method=getOlpApr",
}

export const COPY_TRADE_POSITION_HISTORY_API = {
  [SupportedChains["Arbitrum"]]: API_QUERY_BASE_URL[SupportedChains["Arbitrum"]] + "?method=getCopyTradePositionHistory&timestamp=",
  [SupportedChains["Berachain Mainnet"]]: API_QUERY_BASE_URL[SupportedChains["Berachain Mainnet"]] + "?method=getCopyTradePositionHistory&timestamp=",
}

export const MY_POSITION_HISTORY_API = {
  [SupportedChains["Arbitrum"]]: API_QUERY_BASE_URL[SupportedChains["Arbitrum"]] + "?method=getMyPositionHistory",
  [SupportedChains["Berachain Mainnet"]]: API_QUERY_BASE_URL[SupportedChains["Berachain Mainnet"]] + "?method=getMyPositionHistory",
}

export const MY_POSITION_API = {
  [SupportedChains["Arbitrum"]]: API_QUERY_BASE_URL[SupportedChains["Arbitrum"]] + "?method=getMyPositions&address=",
  [SupportedChains["Berachain Mainnet"]]: API_QUERY_BASE_URL[SupportedChains["Berachain Mainnet"]] + "?method=getMyPositions&address=",
} 

export const VAULT_QUEUE_ITEMS_API = {
  [SupportedChains["Arbitrum"]]: API_QUERY_BASE_URL[SupportedChains["Arbitrum"]] + "?method=getVaultQueueItems",
  [SupportedChains["Berachain Mainnet"]]: API_QUERY_BASE_URL[SupportedChains["Berachain Mainnet"]] + "?method=getVaultQueueItems",
}

export const HAS_VAULT_QUEUE_ITEMS_API = {
  [SupportedChains["Arbitrum"]]: API_QUERY_BASE_URL[SupportedChains["Arbitrum"]] + "?method=hastVaultQueueItems",
  [SupportedChains["Berachain Mainnet"]]: API_QUERY_BASE_URL[SupportedChains["Berachain Mainnet"]] + "?method=hastVaultQueueItems",

}