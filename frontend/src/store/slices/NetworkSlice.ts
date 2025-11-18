import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { NetworkConfigs, NetworkState } from "@/networks/types";
import { SupportedChains } from "@/networks/constants";
import { getChainIdFromNetworkConfigs, getNetworkConfigs, getRpcUrlFromNetworkConfigs, isBerachain } from "@/networks/helpers";

const networkConfigs: NetworkConfigs = getNetworkConfigs();

export const loadNetworkStateFromLocalStorage = (): NetworkState => {
  const storedChain = localStorage.getItem("moby:selectedChain") as SupportedChains;

  if (storedChain && networkConfigs && Object.keys(networkConfigs).includes(storedChain)) {
    return {
      chain: storedChain,
      chainId: getChainIdFromNetworkConfigs(storedChain),
      rpcUrl: getRpcUrlFromNetworkConfigs(storedChain),
      isBerachain: isBerachain(storedChain),
    };
  }

  const defaultChain = Object.keys(networkConfigs)[0] as SupportedChains;

  return {
    chain: defaultChain,
    chainId: getChainIdFromNetworkConfigs(defaultChain),
    rpcUrl: getRpcUrlFromNetworkConfigs(defaultChain),
    isBerachain: isBerachain(defaultChain),
  };
};

const setChainToLocalStorage = (chain: SupportedChains) => {
  localStorage.setItem("moby:selectedChain", chain);
};

const removeChainFromLocalStorage = () => {
  localStorage.removeItem("moby:selectedChain");
};

const initialState: NetworkState = loadNetworkStateFromLocalStorage();

const networkSlice = createSlice({
  name: "network",
  initialState: initialState,
  reducers: {
    setSelectedChain: (state, action: PayloadAction<NetworkState>) => {
      setChainToLocalStorage(action.payload.chain);
      return action.payload;
    },
    removeSelectedChain: (state) => {
      removeChainFromLocalStorage();
      const defaultChain = Object.keys(networkConfigs)[0] as SupportedChains;
      return {
        chain: defaultChain,
        chainId: getChainIdFromNetworkConfigs(defaultChain),
        rpcUrl: getRpcUrlFromNetworkConfigs(defaultChain),
        isBerachain: isBerachain(defaultChain),
      };
    },
  },
});

export const { setSelectedChain, removeSelectedChain } = networkSlice.actions;

export default networkSlice.reducer;
