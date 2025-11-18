import { SupportedChains } from "./networks";

export const MainStableAsset = {
  USDC: "USDC",
} as const;

export const UnderlyingAsset = {
  BTC: "BTC",
  ETH: "ETH",
} as const;

export const UnderlyingAssetWithAll = {
  ALL: "ALL",
  ...UnderlyingAsset,
} as const;

export const BaseQuoteAsset = {
  WBTC: "WBTC",
  WETH: "WETH",
  USDC: "USDC",
} as const;

export const NetworkQuoteAsset = {
  [SupportedChains["Arbitrum"]]: {
    ...BaseQuoteAsset,
    ETH: "ETH",
  },
  [SupportedChains["Berachain Mainnet"]]: {
    ...BaseQuoteAsset,
    HONEY: "HONEY",
  },
} as const;

export type MainStableAsset = keyof typeof MainStableAsset;
export type UnderlyingAsset = keyof typeof UnderlyingAsset;
export type UnderlyingAssetWithAll = keyof typeof UnderlyingAssetWithAll;
export type BaseQuoteAsset = keyof typeof BaseQuoteAsset;
export type NetworkQuoteAsset<T extends SupportedChains> =
  | BaseQuoteAsset
  | (T extends "Arbitrum" ? "ETH" : never)
  | (T extends "Berachain Mainnet" ? "HONEY" : never);

export const NormalizedAssetType = {
  SPOT: "SPOT",
  FUTURES: "FUTURES",
} as const;

export const NormalizedSpotAsset = {
  BTC: "BTC",
  ETH: "ETH",
  USDC: "USDC",
  HONEY: "HONEY",
  btc: "btc",
  eth: "eth",
  usdc: "usdc",
  honey: "honey",
} as const;

export const NormalizedFuturesAsset = {
  BTC: "BTC",
  ETH: "ETH",
  btc: "btc",
  eth: "eth",
} as const;

export type NormalizedAssetType = keyof typeof NormalizedAssetType;
export type NormalizedSpotAsset = keyof typeof NormalizedSpotAsset;
export type NormalizedFuturesAsset = keyof typeof NormalizedFuturesAsset;
