import React, { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useDisconnect, useSwitchChain } from "wagmi";
import { twJoin } from "tailwind-merge";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import AccountForMobile from "./AccountForMobile";
import { SupportedChains } from "@/networks/constants";
import { getChainIdFromNetworkConfigs, getNetworkConfigs, getRpcUrlFromNetworkConfigs, isBerachain, isSupportedChain } from "@/networks/helpers";
import { CUSTOM_CSS } from "@/networks/configs";
import { NetworkState } from "@/networks/types";
import { setSelectedChain } from "@/store/slices/NetworkSlice";

interface SwitchChainProps {
  chain: SupportedChains;
  handleSwitchNetwork: (networkState: NetworkState) => void;
}

const SwitchChain: React.FC<SwitchChainProps> = ({
  chain,
  handleSwitchNetwork,
}) => {
  const networkConfigs = getNetworkConfigs();

  const activeIndex = useMemo(() => {
    if (!Object.keys(networkConfigs)?.includes(chain)) {
      return 0;
    }

    return Object.keys(networkConfigs)?.findIndex((networkName) => {
      return chain === networkName;
    });
  }, [chain]);

  useLayoutEffect(() => {
    if (Object.keys(networkConfigs)?.includes(chain)) {
      return;
    }

    const networkName = Object.keys(networkConfigs)?.[0];

    handleSwitchNetwork({
      chain: networkName as SupportedChains,
      chainId: getChainIdFromNetworkConfigs(networkName as SupportedChains),
      rpcUrl: getRpcUrlFromNetworkConfigs(networkName as SupportedChains),
      isBerachain: isBerachain(networkName as SupportedChains),
    });
  }, [chain]);

  return (
    <div
      className={twJoin(
        "flex items-center self-stretch",
        "relative p-[5px] rounded",
        "bg-[rgba(240,235,229,0.1)]"
      )}
    >
      {/* Background */}
      <div
        style={{ left: `${activeIndex * 30 + 5}px` }}
        className={twJoin(
          "transition-all",
          "absolute",
          "w-[30px] h-[30px] rounded",
          CUSTOM_CSS[chain].backgroundClassForMobile
        )}
      />

      {/* Logo list */}
      {Object.keys(networkConfigs).map((networkName) => {
        const isActive = networkName === chain;

        return (
          <button
            key={networkName}
            className={twJoin(
              "w-[30px] h-[30px] rounded",
              "relative z-[2] cursor-pointer"
            )}
            type="submit"
            onClick={() => {
              handleSwitchNetwork({
                chain: networkName as SupportedChains,
                chainId: getChainIdFromNetworkConfigs(networkName as SupportedChains),
                rpcUrl: getRpcUrlFromNetworkConfigs(networkName as SupportedChains),
                isBerachain: isBerachain(networkName as SupportedChains),
              });
            }}
          >
            {/* Active logo */}
            <img
              className={twJoin(
                "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[15px]",
                "transition-all delay-[50ms]",
                isActive ? "opacity-100 z-[2]" : "opacity-0 z-[1]"
              )}
              src={
                CUSTOM_CSS[networkName as SupportedChains].walletActiveLogoForMobileSrc
              }
            />

            {/* Inactive Logo */}
            <img
              className={twJoin(
                "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[15px]",
                "transition-all delay-[50ms]",
                !isActive ? "opacity-100 z-[2]" : "opacity-0 z-[1]"
              )}
              src={
                CUSTOM_CSS[networkName as SupportedChains].walletLogoForMobileSrc
              }
            />
          </button>
        );
      })}
    </div>
  );
};

function WalletForMobile() {
  const dispatch = useAppDispatch();
  const { chain: currentChain } = useAppSelector(state => state.network) as NetworkState;

  return (
    <ConnectButton.Custom>
      {({ account, chain, openConnectModal, mounted }) => {
        const { disconnect } = useDisconnect();
        const { switchChainAsync } = useSwitchChain();

        const [isForceDisconncted, setIsForceDisconnected] =
          useState<boolean>(false);

        const handleSwitchNetwork = async (networkState: NetworkState) => {
          if (!account) return dispatch(setSelectedChain(networkState));

          if (isSupportedChain(networkState.chain)) {
            try {
              const result = await switchChainAsync({
                chainId: networkState.chainId,
              });
              if (result) dispatch(setSelectedChain(networkState));
            } catch (error) {
              console.error("Failed to switch network:", error);
              disconnect();
            }
          }
        };

        useEffect(() => {
          if (isForceDisconncted) {
            setIsForceDisconnected(false);
            openConnectModal();
            return;
          }

          if (!account) return;

          // Case 1. Wallet connected, but chain is unsupported
          if (
            account &&
            !isSupportedChain(chain?.name as SupportedChains)
          ) {
            setIsForceDisconnected(true);
            return disconnect();
          }

          // Case 2. When chain from redux and chain from rainbowkit are different
          if (chain?.name !== currentChain) {
            dispatch(
              setSelectedChain({
                chain: chain?.name as SupportedChains,
                chainId: getChainIdFromNetworkConfigs(chain?.name as SupportedChains),
                rpcUrl: getRpcUrlFromNetworkConfigs(chain?.name as SupportedChains),
                isBerachain: isBerachain(chain?.name as SupportedChains),
              })
            )
            return;
          }
        }, [chain]);

        return (
          <div
            className={
              !mounted ? "opacity-0 pointer-events-none select-none" : ""
            }
            aria-hidden={!mounted}
          >
            {(() => {
              return (
                <div className="flex items-center gap-x-[6px] md:gap-2">
                  <SwitchChain
                    chain={currentChain}
                    handleSwitchNetwork={handleSwitchNetwork}
                  />
                  {account ? (
                    <AccountForMobile />
                  ) : (
                    <div
                      className={twJoin(
                        "p-2 md:px-3 rounded",
                        "text-[14px] md:text-[16px] leading-[24px] font-bold font-plex-mono",
                        "text-greene6 bg-[rgba(240,235,229,0.1)]"
                      )}
                    >
                      <button onClick={openConnectModal} type="button">
                        Connect
                      </button>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}

export default WalletForMobile;
