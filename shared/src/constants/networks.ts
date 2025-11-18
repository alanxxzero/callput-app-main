export const SupportedChains = {
  Arbitrum: "Arbitrum",
  "Berachain Mainnet": "Berachain Mainnet",
} as const;
export type SupportedChains = keyof typeof SupportedChains;

export const ChainIds: { [key in SupportedChains]: number } = {
  [SupportedChains.Arbitrum]: 42161,
  [SupportedChains["Berachain Mainnet"]]: 80094,
} as const;

export const ChainNames: { [key: number]: SupportedChains } = {
  42161: SupportedChains.Arbitrum,
  80094: SupportedChains["Berachain Mainnet"],
} as const;

export const RpcUrls: { [key in SupportedChains]: string } = {
  [SupportedChains.Arbitrum]: "",
  [SupportedChains["Berachain Mainnet"]]: "",
} as const;

export const BlockExplorers: { [key in SupportedChains]: string } = {
  [SupportedChains.Arbitrum]: "",
  [SupportedChains["Berachain Mainnet"]]: "",
} as const;

export const ChainMetadata: {
  [key in SupportedChains]: {
    chainName: string;
    nativeCurrency: {
      name: string;
      symbol: string;
      decimals: number;
    };
    iconUrl?: string;
  };
} = {
  [SupportedChains.Arbitrum]: {
    chainName: "Arbitrum",
    nativeCurrency: {
      name: "Ethereum",
      symbol: "ETH",
      decimals: 18,
    },
    iconUrl: "",
  },
  [SupportedChains["Berachain Mainnet"]]: {
    chainName: "Berachain",
    nativeCurrency: {
      name: "Bera",
      symbol: "BERA",
      decimals: 18,
    },
    iconUrl: "",
  },
} as const;
