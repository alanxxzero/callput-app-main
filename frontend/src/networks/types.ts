import { SupportedChains } from "./constants";
import { MainStableAsset, NetworkQuoteAsset, UnderlyingAsset, UnderlyingAssetWithAll } from "@moby/shared";

export type NetworkConfig = {
  CHAIN_ID: number;
  RPC_URL: string; 
}

export type NetworkConfigs = {
  [key in SupportedChains]?: NetworkConfig;
};

export type NetworkState = {
  chain: SupportedChains;
  chainId: number;
  rpcUrl: string;
  isBerachain: boolean;
};

export type MenuMap = {
  [key in SupportedChains]: {
    id: number;
    name: string;
    url: string;
    isExternal: boolean;
    isNew: boolean;
    isDisabled: boolean;
    mobileIcon: string;
    mobileIconSelected: string;
    isMobileDisabled: boolean;
  }[];
};

export type OlpTermMap = {
  [key in SupportedChains]: {
    SHORT: number;
    MID: number;
  };
};

export type CustomCssMap = {
  [key in SupportedChains]: {
    logoSrc: string;
    walletLogoSrc: string;
    dropdownIconSrc: string;
    backgroundClass: string;
    outlineClass: string;
    walletLogoForMobileSrc?: string;
    walletActiveLogoForMobileSrc?: string;
    backgroundClassForMobile?: string;
    backgroundLineForMobile?: string;
    outlineClassForMobile?: string;
  };
};

export type ContractAddresses = {
  WNAT: string;
  WBTC: string;
  WETH: string;
  USDC: string;
  OPTIONS_AUTHORITY: string;
  VAULT_PRICE_FEED: string;
  OPTIONS_MARKET: string;
  S_VAULT: string;
  M_VAULT: string;
  L_VAULT: string;
  S_VAULT_UTILS: string;
  M_VAULT_UTILS: string;
  L_VAULT_UTILS: string;
  S_USDG: string;
  M_USDG: string;
  L_USDG: string;
  S_OLP: string;
  M_OLP: string;
  L_OLP: string;
  S_OLP_MANAGER: string;
  M_OLP_MANAGER: string;
  L_OLP_MANAGER: string;
  S_REWARD_TRACKER: string;
  M_REWARD_TRACKER: string;
  L_REWARD_TRACKER: string;
  S_REWARD_DISTRIBUTOR: string;
  M_REWARD_DISTRIBUTOR: string;
  L_REWARD_DISTRIBUTOR: string;
  S_REWARD_ROUTER_V2: string;
  M_REWARD_ROUTER_V2: string;
  L_REWARD_ROUTER_V2: string;
  CONTROLLER: string;
  POSITION_MANAGER: string;
  SETTLE_MANAGER: string;
  FEE_DISTRIBUTOR: string;
  BTC_OPTIONS_TOKEN: string;
  ETH_OPTIONS_TOKEN: string;
  FAST_PRICE_EVENTS: string;
  FAST_PRICE_FEED: string;
  POSITION_VALUE_FEED: string;
  SETTLE_PRICE_FEED: string;
  SPOT_PRICE_FEED: string;
  PRIMARY_ORACLE: string;
  VIEW_AGGREGATOR: string;
  REFERRAL: string;
};

// export type BaseContractAddressMap = {
//   [key in SupportedChains]: BaseContractAddresses;
// };

export type BerachainSpecificAddresses = {
  WBERA: string;
  HONEY: string;
  BHONEY?: string;
  BERA?: string;
  BYUSD?: string;
  "HONEY-WBTC LP"?: string;
  "USDC.e-HONEY LP"?: string;
  "BYUSD-HONEY LP"?: string;
  "WBERA-HONEY LP"?: string;
  DOV_SWAP_UTIL?: string;
  DOV_VAULT_QUEUE_EVENTS?: string;
  DOV_WBERA_HONEY?: string;
  DOV_VAULT_QUEUE_WBERA_HONEY?: string;
  DOV_BYUSD_HONEY?: string;
  DOV_VAULT_QUEUE_BYUSD_HONEY?: string;
  DOV_USDC_HONEY?: string;
  DOV_VAULT_QUEUE_USDC_HONEY?: string;
};

export type ContractAddressMap = {
  [key in SupportedChains]: key extends "Berachain Mainnet"
    ? ContractAddresses & BerachainSpecificAddresses
    : ContractAddresses;
};

export type SocialMap = {
  [key in SupportedChains]: {
    id: number;
    name: string;
    url: string;
    iconSrc: string;
    iconSrcSelected: string;
    isDisabled: boolean;
  }[];
};

/*
 * Asset
 */

export type AssetInfoItem = {
  name: string;
  symbol: string;
  src: string;
  disabledSrc?: string;
  color?: string;
};

/*
 * Underlying Asset
 */

export type UAInfo = {
  [K in SupportedChains]: {
    [A in UnderlyingAsset]: AssetInfoItem;
  };
};

export type UAInfoWithAll = {
  [K in SupportedChains]: {
    [A in UnderlyingAssetWithAll]: AssetInfoItem;
  };
};

export type UATickerToNumberMap = {
  [K in SupportedChains]: {
    [A in UnderlyingAsset]: number;
  };
};

export type UATickerToStringMap = {
  [K in SupportedChains]: {
    [A in UnderlyingAsset]: string;
  };
};

export type UATickerToQATickerMap = {
  [K in SupportedChains]: {
    [A in UnderlyingAsset]: keyof (typeof NetworkQuoteAsset)[K];
  };
};

export type UAIndexToStringMap = {
  [key in SupportedChains]: {
    [key: number]: UnderlyingAsset;
  };
};

/*
 * Quote Asset
 */

export type QAInfo = {
  [K in SupportedChains]: {
    [A in keyof (typeof NetworkQuoteAsset)[K]]: AssetInfoItem;
  };
};

export type QATickerToNumberMap = {
  [K in SupportedChains]: {
    [A in keyof (typeof NetworkQuoteAsset)[K]]: number;
  };
};

export type QATickerToStringMap = {
  [K in SupportedChains]: {
    [A in keyof (typeof NetworkQuoteAsset)[K]]: string;
  };
};

export type QAAddressToTickerMap = {
  [K in SupportedChains]: {
    [address: string]: keyof (typeof NetworkQuoteAsset)[K];
  };
};

/*
 * Main Stable Asset
 */

export type MSAInfo = {
  [K in SupportedChains]: {
    [A in MainStableAsset]: AssetInfoItem;
  };
};

export type MSATickerToNumberMap = {
  [K in SupportedChains]: {
    [A in MainStableAsset]: number;
  };
};
