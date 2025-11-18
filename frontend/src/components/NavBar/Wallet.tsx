import React, { useContext, useEffect, useRef, useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useDisconnect, useSwitchChain } from "wagmi";
import { twJoin } from "tailwind-merge";
import AddReferralButton from "./AddReferralButton";
import Account from "./Account";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import ToggleChain from "./ToggleChain";
import GuideIcon from '@assets/guide-icon.svg'
import MobySimpleGuidePopup from "../Common/MobySimpleGuidePopup";
import { ModalContext } from "../Common/ModalContext";
import { CUSTOM_CSS } from "@/networks/configs";
import { SupportedChains } from "@/networks/constants";
import { getChainIdFromNetworkConfigs, getNetworkConfigs, getRpcUrlFromNetworkConfigs, isBerachain, isSupportedChain } from "@/networks/helpers";
import { NetworkState } from "@/networks/types";
import { setSelectedQuoteAsset } from "@/store/slices/SelectedOption";
import { setSelectedChain } from "@/store/slices/NetworkSlice";

interface SwitchChainProps {
  chain: SupportedChains;
  handleSwitchNetwork: (networkState: NetworkState) => void;
}

const SwitchChain: React.FC<SwitchChainProps> = ({ chain, handleSwitchNetwork}) => {
  const networkConfigs = getNetworkConfigs();

  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const dropDownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    document.body.addEventListener("click", event => {
      if (dropDownRef.current?.contains(event.target as Node)) return;
      setIsDropdownOpen(false);
    })
  }, []);
  
  const backgroundClass = CUSTOM_CSS[chain].backgroundClass; 

  return (
    <div className="relative">
      <div
        className={twJoin(
          "cursor-pointer",
          "flex flex-row items-center gap-[6px] px-[10px]",
          "w-[60px] h-[36px]",
          "bg-cover bg-center bg-no-repeat",
          backgroundClass,
        )}
        ref={dropDownRef}
        onClick={() => {
          setIsDropdownOpen(!isDropdownOpen);
        }}
      >
        <img className="w-[18px]" src={CUSTOM_CSS[chain].walletLogoSrc} />
        <img className="w-[18px]" src={CUSTOM_CSS[chain].dropdownIconSrc} />
      </div>
      {isDropdownOpen && (
        <div
          className={twJoin(
            "z-30 absolute top-[52px] right-0",
            "w-fit h-fit p-[4px]",
            "bg-black1f rounded-[4px] border-[1px] border-black29 shadow-[0px_0px_36px_0_rgba(10,10,10,0.72)]"
          )}
        >
          {(Object.keys(networkConfigs)).map((networkName) => (
            <button 
              key={networkName}
              className={twJoin(
                "cursor-pointer flex flex-row items-center",
                "w-full h-[36px] px-[10px]",
                "text-whitee0",
                "hover:bg-black29 hover:rounded-[3px] hover:text-greenc1",
                "active:bg-black1f active:opacity-80 active:scale-95"
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
              <div key={networkName} className="flex flex-row items-center justify-between w-full">
                <p className="whitespace-nowrap text-[15px] font-semibold">{networkName}</p>
                <img src={CUSTOM_CSS[networkName as SupportedChains].logoSrc} className="ml-[10px] w-[24px] h-[24px] min-w-[24px] min-h-[24px]"/>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function Wallet() {
  const dispatch = useAppDispatch();
  const { chain: currentChain } = useAppSelector(state => state.network) as NetworkState;

  const { openModal } = useContext(ModalContext)

  return (
    <ConnectButton.Custom>
        {({
          account,
          chain,
          openConnectModal,
          mounted,
        }) => {
          const { disconnect, isSuccess } = useDisconnect();
          const { switchChainAsync } = useSwitchChain();

          const [isForceDisconncted, setIsForceDisconnected] = useState<boolean>(false);

          const handleSwitchNetwork = async (networkState: NetworkState) => {
            if (!account) return dispatch(setSelectedChain(networkState));

            if (isSupportedChain(networkState.chain)) {
              try {
                const result = await switchChainAsync({ chainId: networkState.chainId });
                if (result) dispatch(setSelectedChain(networkState));
              } catch (error) {
                console.error("Failed to switch network:", error);
                disconnect();
              }
            }
          }

          useEffect(() => {
            if (isForceDisconncted) {
              setIsForceDisconnected(false);
              openConnectModal();
              return;
            }

            if (!account) return;

            // Case 1. Wallet connected, but chain is unsupported
            if (account && !isSupportedChain(chain?.name as SupportedChains)) {
              setIsForceDisconnected(true);
              return disconnect();
            }

            // Case 2. When chain from redux and chain from rainbowkit are different
            if (chain?.name !== currentChain) {
              dispatch(setSelectedChain({
                chain: chain?.name as SupportedChains,
                chainId: getChainIdFromNetworkConfigs(chain?.name as SupportedChains),
                rpcUrl: getRpcUrlFromNetworkConfigs(chain?.name as SupportedChains),
                isBerachain: isBerachain(chain?.name as SupportedChains),
              }));
              return;
            }
          }, [chain]);

          return (
            <div
              className="overflow-visible pl-[20px]"
              {...(!mounted && {
                'aria-hidden': true,
                'style': {
                  opacity: 0,
                  pointerEvents: 'none',
                  userSelect: 'none',
                },
              })}
            >
              {(() => {
                
                return (
                  <div className="flex flex-row items-center gap-[12px]">
                    {account && <AddReferralButton />}
                    <div className="flex flex-row items-center">
                      {/* <SwitchChain network={network} handleSwitchNetwork={handleSwitchNetwork} /> */}

                      <img
                        className={twJoin(
                          "w-[36px] h-[36px]",
                          "cursor-pointer active:opacity-80 active:scale-95",
                        )}
                        src={GuideIcon} 
                        onClick={() => {
                          openModal(
                            <MobySimpleGuidePopup />,
                            {
                              modalClassName: [
                                "backdrop-blur-none",
                                "bg-[#121212] bg-opacity-80",
                              ]
                            }
                          )
                        }}
                      />
                      <div
                        className={twJoin(
                          "w-[1px] h-[24px] mx-[16px]",
                          "bg-[#333333]"
                        )}
                      />

                      <ToggleChain chain={currentChain} handleSwitchNetwork={handleSwitchNetwork} />
                      {account
                        ? <Account />
                        : <div className="flex flex-row items-center gap-[12px]">
                            <button
                              className={twJoin(
                                "flex flex-row justify-center items-center",
                                "w-fit h-[36px] p-[12px] rounded-r-[4px] bg-black29",
                                "text-primaryc1 text-[15px] font-bold ",
                                "cursor-pointer"
                              )}
                              onClick={openConnectModal}
                              type="button"
                            >
                              Connect Wallet
                            </button>
                          </div>
                      }
                      
                    </div>
                  </div>
                )
              })()}
            </div>
          );
        }}
      </ConnectButton.Custom>
  );
}

export default Wallet;