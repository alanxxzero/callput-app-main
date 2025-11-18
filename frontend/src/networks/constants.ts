export const SupportedChains = {
  "Arbitrum": "Arbitrum",
  "Berachain Mainnet": "Berachain Mainnet",
} as const;

export type SupportedChains = keyof typeof SupportedChains;