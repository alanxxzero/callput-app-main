import { ChainId } from "./constants.networks";

export const CONFIG = {
  [ChainId.ARBITRUM_ONE]: {
    RPC_URLS: [
      "https://arb-mainnet.g.alchemy.com/v2/kTmx8K4C9pMM9WUKCRkRnBVGo9nmyc0O",
      "https://arb1.arbitrum.io/rpc",
    ],
    SUBQL_URL: "http://15.165.51.185:3111/graphql",
  },
  [ChainId.ARBITRUM_SEPOLIA]: {
    RPC_URLS: [
      "https://arb-sepolia.g.alchemy.com/v2/GyjxJ09S4VrK5Lk5qt64Foxl0jfrSzuv",
      "https://sepolia-rollup.arbitrum.io/rpc",
    ],
    SUBQL_URL: "http://3.36.112.209:3111/graphql",
  },
  [ChainId.BERACHAIN_MAINNET]: {
    RPC_URLS: [
      "https://berachain-mainnet.g.alchemy.com/v2/kTmx8K4C9pMM9WUKCRkRnBVGo9nmyc0O",
      "https://rpc.berachain.com",
    ],
    SUBQL_URL: "http://43.202.220.162:3111/graphql",
  },
};
