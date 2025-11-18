import {
  QAStringToTickerMap,
  QATickerToNumberMap,
  UAIndexToNumberMap,
  UAIndexToStringMap,
  UAIndexToTickerMap,
  UAStringToTickerMap,
  UATickerToIndexMap,
  UATickerToNumberMap,
} from "../types/asset-mappings";
import { CONTRACT_ADDRESSES } from "./addresses";
import { NetworkQuoteAsset, UnderlyingAsset } from "./assets";
import { SupportedChains } from "./networks";

export const UA_TICKER_TO_INDEX: UATickerToIndexMap = {
  [SupportedChains["Arbitrum"]]: {
    [UnderlyingAsset.BTC]: 1,
    [UnderlyingAsset.ETH]: 2,
  },
  [SupportedChains["Berachain Mainnet"]]: {
    [UnderlyingAsset.BTC]: 1,
    [UnderlyingAsset.ETH]: 2,
  },
};

export const UA_TICKER_TO_DECIMAL: UATickerToNumberMap = {
  [SupportedChains["Arbitrum"]]: {
    [UnderlyingAsset.BTC]: 8,
    [UnderlyingAsset.ETH]: 18,
  },
  [SupportedChains["Berachain Mainnet"]]: {
    [UnderlyingAsset.BTC]: 8,
    [UnderlyingAsset.ETH]: 18,
  },
};

export const UA_INDEX_TO_TICKER: UAIndexToTickerMap = {
  [SupportedChains["Arbitrum"]]: {
    [1]: UnderlyingAsset.BTC,
    [2]: UnderlyingAsset.ETH,
  },
  [SupportedChains["Berachain Mainnet"]]: {
    [1]: UnderlyingAsset.BTC,
    [2]: UnderlyingAsset.ETH,
  },
};

export const UA_INDEX_TO_DECIMAL: UAIndexToNumberMap = {
  [SupportedChains["Arbitrum"]]: {
    [1]: UA_TICKER_TO_DECIMAL["Arbitrum"][UnderlyingAsset.BTC],
    [2]: UA_TICKER_TO_DECIMAL["Arbitrum"][UnderlyingAsset.ETH],
  },
  [SupportedChains["Berachain Mainnet"]]: {
    [1]: UA_TICKER_TO_DECIMAL["Berachain Mainnet"][UnderlyingAsset.BTC],
    [2]: UA_TICKER_TO_DECIMAL["Berachain Mainnet"][UnderlyingAsset.ETH],
  },
};

export const UA_INDEX_TO_ADDRESS: UAIndexToStringMap = {
  [SupportedChains["Arbitrum"]]: {
    [1]: CONTRACT_ADDRESSES["Arbitrum"].WBTC,
    [2]: CONTRACT_ADDRESSES["Arbitrum"].WETH,
  },
  [SupportedChains["Berachain Mainnet"]]: {
    [1]: CONTRACT_ADDRESSES["Berachain Mainnet"].WBTC,
    [2]: CONTRACT_ADDRESSES["Berachain Mainnet"].WETH,
  },
};

export const UA_ADDRESS_TO_TICKER: UAStringToTickerMap = {
  [SupportedChains["Arbitrum"]]: {
    [CONTRACT_ADDRESSES["Arbitrum"].WBTC.toLowerCase()]: UnderlyingAsset.BTC,
    [CONTRACT_ADDRESSES["Arbitrum"].WETH.toLowerCase()]: UnderlyingAsset.ETH,
  },
  [SupportedChains["Berachain Mainnet"]]: {
    [CONTRACT_ADDRESSES["Berachain Mainnet"].WBTC.toLowerCase()]: UnderlyingAsset.BTC,
    [CONTRACT_ADDRESSES["Berachain Mainnet"].WETH.toLowerCase()]: UnderlyingAsset.ETH,
  },
};

export const QA_TICKER_TO_DECIMAL: QATickerToNumberMap = {
  [SupportedChains["Arbitrum"]]: {
    [NetworkQuoteAsset["Arbitrum"].ETH]: 18,
    [NetworkQuoteAsset["Arbitrum"].WBTC]: 8,
    [NetworkQuoteAsset["Arbitrum"].WETH]: 18,
    [NetworkQuoteAsset["Arbitrum"].USDC]: 6,
  },
  [SupportedChains["Berachain Mainnet"]]: {
    [NetworkQuoteAsset["Berachain Mainnet"].WBTC]: 8,
    [NetworkQuoteAsset["Berachain Mainnet"].WETH]: 18,
    [NetworkQuoteAsset["Berachain Mainnet"].USDC]: 6,
    [NetworkQuoteAsset["Berachain Mainnet"].HONEY]: 18,
  },
};

export const QA_ADDRESS_TO_TICKER: QAStringToTickerMap = {
  [SupportedChains["Arbitrum"]]: {
    [CONTRACT_ADDRESSES["Arbitrum"].WBTC.toLowerCase()]: NetworkQuoteAsset["Arbitrum"].WBTC,
    [CONTRACT_ADDRESSES["Arbitrum"].WETH.toLowerCase()]: NetworkQuoteAsset["Arbitrum"].WETH,
    [CONTRACT_ADDRESSES["Arbitrum"].USDC.toLowerCase()]: NetworkQuoteAsset["Arbitrum"].USDC,
  },
  [SupportedChains["Berachain Mainnet"]]: {
    [CONTRACT_ADDRESSES["Berachain Mainnet"].WBTC.toLowerCase()]: NetworkQuoteAsset["Berachain Mainnet"].WBTC,
    [CONTRACT_ADDRESSES["Berachain Mainnet"].WETH.toLowerCase()]: NetworkQuoteAsset["Berachain Mainnet"].WETH,
    [CONTRACT_ADDRESSES["Berachain Mainnet"].USDC.toLowerCase()]: NetworkQuoteAsset["Berachain Mainnet"].USDC,
    ...(CONTRACT_ADDRESSES["Berachain Mainnet"].HONEY && {
      [CONTRACT_ADDRESSES["Berachain Mainnet"].HONEY.toLowerCase()]:
        NetworkQuoteAsset["Berachain Mainnet"].HONEY,
    }),
  },
};
