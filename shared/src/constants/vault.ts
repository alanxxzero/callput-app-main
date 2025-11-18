import { VaultIndexToNameMap, VaultIndexToStringMap } from "../types/vault";
import { SupportedChains } from "./networks";
import { CONTRACT_ADDRESSES } from "./addresses";

export const VAULT_INDEX_TO_ADDRESS: VaultIndexToStringMap = {
  [SupportedChains["Arbitrum"]]: {
    [0]: CONTRACT_ADDRESSES["Arbitrum"].S_VAULT,
    [1]: CONTRACT_ADDRESSES["Arbitrum"].M_VAULT,
    [2]: CONTRACT_ADDRESSES["Arbitrum"].L_VAULT,
  },
  [SupportedChains["Berachain Mainnet"]]: {
    [0]: CONTRACT_ADDRESSES["Berachain Mainnet"].S_VAULT,
    [1]: CONTRACT_ADDRESSES["Berachain Mainnet"].M_VAULT,
    [2]: CONTRACT_ADDRESSES["Berachain Mainnet"].L_VAULT,
  },
};

export const VAULT_INDEX_TO_NAME: VaultIndexToNameMap = {
  [SupportedChains["Arbitrum"]]: {
    [0]: "sVault",
    [1]: "mVault",
    [2]: "lVault",
  },
  [SupportedChains["Berachain Mainnet"]]: {
    [0]: "sVault",
    [1]: "mVault",
    [2]: "lVault",
  },
};
