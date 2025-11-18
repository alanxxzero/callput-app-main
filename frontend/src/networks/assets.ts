import { SupportedChains } from "./constants";
import { CONTRACT_ADDRESSES } from "./addresses";
import {
  QAAddressToTickerMap,
  UATickerToQATickerMap,
  UATickerToStringMap,
  UATickerToNumberMap,
  UAIndexToStringMap,
  QATickerToNumberMap,
  QATickerToStringMap,
  MSATickerToNumberMap,
  QAInfo,
  UAInfo,
  MSAInfo,
  UAInfoWithAll,
} from "./types";
import { zeroAddress } from "viem";
import { MainStableAsset, NetworkQuoteAsset, UnderlyingAsset, UnderlyingAssetWithAll } from "@moby/shared";

import IconSymbolEth from "../assets/icon-symbol-eth.svg";
import IconSymbolWbtc from "../assets/icon-symbol-wbtc.svg";
import IconSymbolWeth from "../assets/icon-symbol-weth.svg";
import IconSymbolUsdc from "../assets/icon-symbol-usdc.svg";
import IconSymbolHoney from "../assets/icon-symbol-honey.svg";
import IconSymbolTotal from "../assets/mobile/icon-symbol-total.svg";

import IconSymbolEthDisabled from "../assets/icon-symbol-eth-disabled.svg";
import IconSymbolWbtcDisabled from "../assets/icon-symbol-wbtc-disabled.svg";
import IconSymbolSOlp from "../assets/icon-symbol-solp.svg";
import IconSymbolMOlp from "../assets/icon-symbol-molp.svg";
import IconSymbolLOlp from "../assets/icon-symbol-lolp.svg";
import { OlpKey } from "../utils/enums";

/*
 * Underlying Asset
 */

export const UA_INFO: UAInfo = {
  [SupportedChains["Arbitrum"]]: {
    [UnderlyingAsset.BTC]: {
      name: "Bitcoin",
      symbol: "BTC",
      src: IconSymbolWbtc,
      disabledSrc: IconSymbolWbtcDisabled,
      color: "#F7931A",
    },
    [UnderlyingAsset.ETH]: {
      name: "Ethereum",
      symbol: "ETH",
      src: IconSymbolEth,
      disabledSrc: IconSymbolEthDisabled,
      color: "#7B8DE8",
    },
  },
  [SupportedChains["Berachain Mainnet"]]: {
    [UnderlyingAsset.BTC]: {
      name: "Bitcoin",
      symbol: "BTC",
      src: IconSymbolWbtc,
      disabledSrc: IconSymbolWbtcDisabled,
      color: "#F7931A",
    },
    [UnderlyingAsset.ETH]: {
      name: "Ethereum",
      symbol: "ETH",
      src: IconSymbolEth,
      disabledSrc: IconSymbolEthDisabled,
      color: "#7B8DE8",
    },
  },
};

export const UA_INFO_WITH_ALL: UAInfoWithAll = {
  [SupportedChains["Arbitrum"]]: {
    [UnderlyingAssetWithAll.ALL]: {
      name: "All Assets",
      symbol: "ALL",
      src: IconSymbolTotal,
      color: "#F0EBE5",
    },
    [UnderlyingAssetWithAll.BTC]: {
      name: "Bitcoin",
      symbol: "BTC",
      src: IconSymbolWbtc,
      color: "#F7931A",
    },
    [UnderlyingAssetWithAll.ETH]: {
      name: "Ethereum",
      symbol: "ETH",
      src: IconSymbolEth,
      color: "#7B8DE8",
    },
  },
  [SupportedChains["Berachain Mainnet"]]: {
    [UnderlyingAssetWithAll.ALL]: {
      name: "All Assets",
      symbol: "ALL",
      src: IconSymbolTotal,
      color: "#F0EBE5",
    },
    [UnderlyingAssetWithAll.BTC]: {
      name: "Bitcoin",
      symbol: "BTC",
      src: IconSymbolWbtc,
      color: "#F7931A",
    },
    [UnderlyingAssetWithAll.ETH]: {
      name: "Ethereum",
      symbol: "ETH",
      src: IconSymbolEth,
      color: "#7B8DE8",
    },
  },
};

export const UA_TICKER_TO_ADDRESS: UATickerToStringMap = {
  [SupportedChains["Arbitrum"]]: {
    [UnderlyingAsset.BTC]: CONTRACT_ADDRESSES[SupportedChains["Arbitrum"]].WBTC,
    [UnderlyingAsset.ETH]: CONTRACT_ADDRESSES[SupportedChains["Arbitrum"]].WETH,
  },
  [SupportedChains["Berachain Mainnet"]]: {
    [UnderlyingAsset.BTC]: CONTRACT_ADDRESSES[SupportedChains["Berachain Mainnet"]].WBTC,
    [UnderlyingAsset.ETH]: CONTRACT_ADDRESSES[SupportedChains["Berachain Mainnet"]].WETH,
  },
};

export const UA_TICKER_TO_INDEX: UATickerToNumberMap = {
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

export const UA_TICKER_TO_OPTIONS_TOKEN: UATickerToStringMap = {
  [SupportedChains["Arbitrum"]]: {
    [UnderlyingAsset.BTC]: CONTRACT_ADDRESSES[SupportedChains["Arbitrum"]].BTC_OPTIONS_TOKEN,
    [UnderlyingAsset.ETH]: CONTRACT_ADDRESSES[SupportedChains["Arbitrum"]].ETH_OPTIONS_TOKEN,
  },
  [SupportedChains["Berachain Mainnet"]]: {
    [UnderlyingAsset.BTC]: CONTRACT_ADDRESSES[SupportedChains["Berachain Mainnet"]].BTC_OPTIONS_TOKEN,
    [UnderlyingAsset.ETH]: CONTRACT_ADDRESSES[SupportedChains["Berachain Mainnet"]].ETH_OPTIONS_TOKEN,
  },
};

export const UA_TICKER_TO_QA_TICKER: UATickerToQATickerMap = {
  [SupportedChains["Arbitrum"]]: {
    [UnderlyingAsset.BTC]: NetworkQuoteAsset["Arbitrum"].WBTC,
    [UnderlyingAsset.ETH]: NetworkQuoteAsset["Arbitrum"].WETH,
  },
  [SupportedChains["Berachain Mainnet"]]: {
    [UnderlyingAsset.BTC]: NetworkQuoteAsset["Berachain Mainnet"].WBTC,
    [UnderlyingAsset.ETH]: NetworkQuoteAsset["Berachain Mainnet"].WETH,
  },
};

export const UA_TICKER_TO_MAX_OPEN_SIZE_FOR_VANILLA: UATickerToNumberMap = {
  [SupportedChains["Arbitrum"]]: {
    [UnderlyingAsset.BTC]: 10,
    [UnderlyingAsset.ETH]: 200,
  },
  [SupportedChains["Berachain Mainnet"]]: {
    [UnderlyingAsset.BTC]: 10,
    [UnderlyingAsset.ETH]: 200,
  },
};

export const UA_TICKER_TO_MAX_OPEN_SIZE_FOR_SPREAD: UATickerToNumberMap = {
  [SupportedChains["Arbitrum"]]: {
    [UnderlyingAsset.BTC]: 200,
    [UnderlyingAsset.ETH]: 5000,
  },
  [SupportedChains["Berachain Mainnet"]]: {
    [UnderlyingAsset.BTC]: 200,
    [UnderlyingAsset.ETH]: 5000,
  },
};

export const UA_TICKER_TO_TICKER_INTERVAL: UATickerToNumberMap = {
  [SupportedChains["Arbitrum"]]: {
    [UnderlyingAsset.BTC]: 50,
    [UnderlyingAsset.ETH]: 1,
  },
  [SupportedChains["Berachain Mainnet"]]: {
    [UnderlyingAsset.BTC]: 50,
    [UnderlyingAsset.ETH]: 1,
  },
};

export const UA_INDEX_TO_TICKER: UAIndexToStringMap = {
  [SupportedChains["Arbitrum"]]: {
    1: UnderlyingAsset.BTC,
    2: UnderlyingAsset.ETH,
  },
  [SupportedChains["Berachain Mainnet"]]: {
    1: UnderlyingAsset.BTC,
    2: UnderlyingAsset.ETH,
  },
};

/*
 * Quote Asset
 */

export const QA_INFO: QAInfo = {
  [SupportedChains["Arbitrum"]]: {
    [NetworkQuoteAsset["Arbitrum"].ETH]: { name: "Ethereum", symbol: "ETH", src: IconSymbolEth },
    [NetworkQuoteAsset["Arbitrum"].WBTC]: { name: "Wrapped BTC", symbol: "WBTC", src: IconSymbolWbtc },
    [NetworkQuoteAsset["Arbitrum"].WETH]: { name: "Wrapped ETH", symbol: "WETH", src: IconSymbolWeth },
    [NetworkQuoteAsset["Arbitrum"].USDC]: { name: "USD Coin", symbol: "USDC", src: IconSymbolUsdc },
  },
  [SupportedChains["Berachain Mainnet"]]: {
    [NetworkQuoteAsset["Berachain Mainnet"].WBTC]: {
      name: "Wrapped BTC",
      symbol: "WBTC",
      src: IconSymbolWbtc,
    },
    [NetworkQuoteAsset["Berachain Mainnet"].WETH]: {
      name: "Wrapped ETH",
      symbol: "WETH",
      src: IconSymbolWeth,
    },
    [NetworkQuoteAsset["Berachain Mainnet"].USDC]: { name: "USD Coin", symbol: "USDC", src: IconSymbolUsdc },
    [NetworkQuoteAsset["Berachain Mainnet"].HONEY]: { name: "Honey", symbol: "HONEY", src: IconSymbolHoney },
  },
};

export const QA_LIST = {
  [SupportedChains["Arbitrum"]]: [
    NetworkQuoteAsset["Arbitrum"].ETH,
    NetworkQuoteAsset["Arbitrum"].WBTC,
    NetworkQuoteAsset["Arbitrum"].WETH,
    NetworkQuoteAsset["Arbitrum"].USDC,
  ],
  [SupportedChains["Berachain Mainnet"]]: [
    NetworkQuoteAsset["Berachain Mainnet"].WBTC,
    NetworkQuoteAsset["Berachain Mainnet"].WETH,
    NetworkQuoteAsset["Berachain Mainnet"].USDC,
    NetworkQuoteAsset["Berachain Mainnet"].HONEY,
  ],
};

export const QA_TICKER_TO_ADDRESS: QATickerToStringMap = {
  [SupportedChains["Arbitrum"]]: {
    [NetworkQuoteAsset["Arbitrum"].ETH]: zeroAddress,
    [NetworkQuoteAsset["Arbitrum"].WBTC]: CONTRACT_ADDRESSES[SupportedChains["Arbitrum"]].WBTC,
    [NetworkQuoteAsset["Arbitrum"].WETH]: CONTRACT_ADDRESSES[SupportedChains["Arbitrum"]].WETH,
    [NetworkQuoteAsset["Arbitrum"].USDC]: CONTRACT_ADDRESSES[SupportedChains["Arbitrum"]].USDC,
  },
  [SupportedChains["Berachain Mainnet"]]: {
    [NetworkQuoteAsset["Berachain Mainnet"].WBTC]:
      CONTRACT_ADDRESSES[SupportedChains["Berachain Mainnet"]].WBTC,
    [NetworkQuoteAsset["Berachain Mainnet"].WETH]:
      CONTRACT_ADDRESSES[SupportedChains["Berachain Mainnet"]].WETH,
    [NetworkQuoteAsset["Berachain Mainnet"].USDC]:
      CONTRACT_ADDRESSES[SupportedChains["Berachain Mainnet"]].USDC,
    [NetworkQuoteAsset["Berachain Mainnet"].HONEY]:
      CONTRACT_ADDRESSES[SupportedChains["Berachain Mainnet"]].HONEY,
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

export const QA_TICKER_TO_IMG: QATickerToStringMap = {
  [SupportedChains["Arbitrum"]]: {
    [NetworkQuoteAsset["Arbitrum"].ETH]: IconSymbolEth,
    [NetworkQuoteAsset["Arbitrum"].WBTC]: IconSymbolWbtc,
    [NetworkQuoteAsset["Arbitrum"].WETH]: IconSymbolWeth,
    [NetworkQuoteAsset["Arbitrum"].USDC]: IconSymbolUsdc,
  },
  [SupportedChains["Berachain Mainnet"]]: {
    [NetworkQuoteAsset["Berachain Mainnet"].WBTC]: IconSymbolWbtc,
    [NetworkQuoteAsset["Berachain Mainnet"].WETH]: IconSymbolWeth,
    [NetworkQuoteAsset["Berachain Mainnet"].USDC]: IconSymbolUsdc,
    [NetworkQuoteAsset["Berachain Mainnet"].HONEY]: IconSymbolHoney,
  },
};

export const QA_TICKER_TO_NAME: QATickerToStringMap = {
  [SupportedChains["Arbitrum"]]: {
    [NetworkQuoteAsset["Arbitrum"].ETH]: "Ethereum",
    [NetworkQuoteAsset["Arbitrum"].WBTC]: "Wrapped BTC",
    [NetworkQuoteAsset["Arbitrum"].WETH]: "Wrapped ETH",
    [NetworkQuoteAsset["Arbitrum"].USDC]: "USD Coin",
  },
  [SupportedChains["Berachain Mainnet"]]: {
    [NetworkQuoteAsset["Berachain Mainnet"].WBTC]: "Wrapped BTC",
    [NetworkQuoteAsset["Berachain Mainnet"].WETH]: "Wrapped ETH",
    [NetworkQuoteAsset["Berachain Mainnet"].USDC]: "USD Coin",
    [NetworkQuoteAsset["Berachain Mainnet"].HONEY]: "Honey",
  },
};

export const QA_ADDRESS_TO_TICKER: QAAddressToTickerMap = {
  [SupportedChains["Arbitrum"]]: {
    [zeroAddress]: NetworkQuoteAsset["Arbitrum"].ETH,
    [CONTRACT_ADDRESSES[SupportedChains["Arbitrum"]].WBTC]: NetworkQuoteAsset["Arbitrum"].WBTC,
    [CONTRACT_ADDRESSES[SupportedChains["Arbitrum"]].WETH]: NetworkQuoteAsset["Arbitrum"].WETH,
    [CONTRACT_ADDRESSES[SupportedChains["Arbitrum"]].USDC]: NetworkQuoteAsset["Arbitrum"].USDC,
  },
  [SupportedChains["Berachain Mainnet"]]: {
    [CONTRACT_ADDRESSES[SupportedChains["Berachain Mainnet"]].WBTC]:
      NetworkQuoteAsset["Berachain Mainnet"].WBTC,
    [CONTRACT_ADDRESSES[SupportedChains["Berachain Mainnet"]].WETH]:
      NetworkQuoteAsset["Berachain Mainnet"].WETH,
    [CONTRACT_ADDRESSES[SupportedChains["Berachain Mainnet"]].USDC]:
      NetworkQuoteAsset["Berachain Mainnet"].USDC,
    [CONTRACT_ADDRESSES[SupportedChains["Berachain Mainnet"]].HONEY]:
      NetworkQuoteAsset["Berachain Mainnet"].HONEY,
  },
};

/*
 * Main Stable Asset
 */

export const MSA_INFO: MSAInfo = {
  [SupportedChains["Arbitrum"]]: {
    [MainStableAsset.USDC]: { name: "USD Coin", symbol: "USDC", src: IconSymbolUsdc },
  },
  [SupportedChains["Berachain Mainnet"]]: {
    [MainStableAsset.USDC]: { name: "USD Coin", symbol: "USDC", src: IconSymbolUsdc },
  },
};

export const MSA_TICKER_TO_DECIMAL: MSATickerToNumberMap = {
  [SupportedChains["Arbitrum"]]: {
    [MainStableAsset.USDC]: 6,
  },
  [SupportedChains["Berachain Mainnet"]]: {
    [MainStableAsset.USDC]: 6,
  },
};

/*
 * Option Liquidity Pool
 */

export const OLP_INFO = {
  [SupportedChains["Arbitrum"]]: {
    [OlpKey.sOlp]: { name: "OLP", symbol: "OLP", src: IconSymbolSOlp, term: "" },
    [OlpKey.mOlp]: { name: "Mid-Term OLP", symbol: "mOLP", src: IconSymbolMOlp, term: "Mid-Term" },
    [OlpKey.lOlp]: { name: "Long-Term OLP", symbol: "lOLP", src: IconSymbolLOlp, term: "Long-Term" },
  },
  [SupportedChains["Berachain Mainnet"]]: {
    [OlpKey.sOlp]: { name: "OLP", symbol: "OLP", src: IconSymbolSOlp, term: "" },
    [OlpKey.mOlp]: { name: "Mid-Term OLP", symbol: "mOLP", src: IconSymbolMOlp, term: "Mid-Term" },
    [OlpKey.lOlp]: { name: "Long-Term OLP", symbol: "lOLP", src: IconSymbolLOlp, term: "Long-Term" },
  },
};

export const OLP_MANAGER_ADDRESSES = {
  [SupportedChains["Arbitrum"]]: {
    [OlpKey.sOlp]: CONTRACT_ADDRESSES[SupportedChains["Arbitrum"]].S_OLP_MANAGER,
    [OlpKey.mOlp]: CONTRACT_ADDRESSES[SupportedChains["Arbitrum"]].M_OLP_MANAGER,
    [OlpKey.lOlp]: CONTRACT_ADDRESSES[SupportedChains["Arbitrum"]].L_OLP_MANAGER,
  },
  [SupportedChains["Berachain Mainnet"]]: {
    [OlpKey.sOlp]: CONTRACT_ADDRESSES[SupportedChains["Berachain Mainnet"]].S_OLP_MANAGER,
    [OlpKey.mOlp]: CONTRACT_ADDRESSES[SupportedChains["Berachain Mainnet"]].M_OLP_MANAGER,
    [OlpKey.lOlp]: CONTRACT_ADDRESSES[SupportedChains["Berachain Mainnet"]].L_OLP_MANAGER,
  },
};
