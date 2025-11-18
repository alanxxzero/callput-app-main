import { SupportedChains } from "./constants";

export const BaseOlpAsset = {
  WBTC: "WBTC",
  WETH: "WETH",
  USDC: "USDC",
} as const;

export const NetworkOlpAsset = {
  [SupportedChains["Arbitrum"]]: {
    ...BaseOlpAsset,
  },
  [SupportedChains["Berachain Mainnet"]]: {
    ...BaseOlpAsset,
    HONEY: "HONEY",
  },
};

export type BaseOlpAsset = keyof typeof BaseOlpAsset;
export type NetworkOlpAsset<T extends SupportedChains> =
  | BaseOlpAsset
  | (T extends "Berachain Mainnet" ? "HONEY" : never);