import { twJoin } from "tailwind-merge";

import {advancedFormatNumber, copyToClipboard, defaultUserName, shortenAddress} from "@/utils/helper";
import { useAccount, useDisconnect } from "wagmi";
import React, {useEffect, useState} from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

import IconCopyAddress from "@assets/icon-copy-address.svg";
import IconDisconnect from "@assets/icon-disconnect.svg";
import  IconProfileDefault from "@assets/icon-profile-default.svg";
import IconProfileBera from "@assets/icon-profile-bera.svg";
import IconExplorer from "@assets/icon-explorer.svg";
import IconArrowToggleOpen from "@assets/icon-arrow-toggle-open.svg";
import IconArrowToggleClose from "@assets/icon-arrow-toggle-close.svg";
import SymbolBitcoinCircle from "@assets/symbol-bitcoin-circle.svg";
import SymbolEthereumCircle from "@assets/symbol-ethereum-circle.svg";
import { resetPosition } from "@/store/slices/PositionsSlice";
import Twitter from "@/components/NavBar/Twitter.tsx";
import { ILeadTrader, ILeadTraders } from "@/interfaces/interfaces.marketSlice";
import { disconnect$ } from "@/streams/store";
import { NetworkState } from "@/networks/types";

type AccountInfoProps = {
  isCopied: boolean,
  setIsCopied: (value: boolean) => void
}

const AccountInfo: React.FC<AccountInfoProps> = ({
  isCopied, setIsCopied
}) => {
  const dispatch = useAppDispatch();
  const { address, chain } = useAccount();
  const { disconnect } = useDisconnect();
  const [isTwitterConnected, setIsTwitterConnected] = useState<boolean>(false);

  const handleDisconnect = () => {
    dispatch(resetPosition()); // Correctly dispatch the action
    disconnect$.next(true)
    disconnect(); // Call your disconnect function
  };

  const twitterInfo = useAppSelector((state: any) => state.user.twitterInfo);
  const userTradeData = useAppSelector((state: any) => state.user.tradeData);
  const leadTraders: ILeadTraders = useAppSelector((state: any) => state.market.leadTraders);
  const { isBerachain } = useAppSelector(state => state.network) as NetworkState;

  useEffect(() => {
    setIsTwitterConnected(twitterInfo.isConnected);
  }, [twitterInfo])

  const btcTradeCount = userTradeData.BTC.tradeCount || 0;
  const btcTradeSize = userTradeData.BTC.tradeSize || "0";
  const btcNotionalVolume = userTradeData.BTC.notionalVolume || "0";

  const ethTradeCount = userTradeData.ETH.tradeCount || 0;
  const ethTradeSize = userTradeData.ETH.tradeSize || "0";
  const ethNotionalVolume = userTradeData.ETH.notionalVolume || "0";

  const [isTotalOpenCloseCountOpen, setIsTotalOpenCloseCountOpen] = useState<boolean>(false);
  const [isTotalOpenCloseSizeOpen, setIsTotalOpenCloseSizeOpen] = useState<boolean>(false);
  const [isTotalNotionalVolumeOpen, setIsTotalNotionalVolumeOpen] = useState<boolean>(false);

  const copyTradeData = getUserCopyTradeData(address, leadTraders);

  
  const copyTraders = Number(copyTradeData.copyTraders)
  const copyTradesVolume = Number(copyTradeData.copyTradesVolume)
  const rebatesFromCopyTrades = Number(copyTradeData.rebatesFromCopyTrades)

  const userName = isTwitterConnected && twitterInfo.username
  ? twitterInfo.username
  : defaultUserName(address)
  const profileUrl = isTwitterConnected && twitterInfo.profileImageUrl
    ? twitterInfo.profileImageUrl
    : isBerachain 
      ? IconProfileBera
      : IconProfileDefault
  

  return (

      <div className={twJoin(
          "absolute right-0 top-[52px]",
          "flex flex-col w-[400px] h-fit min-h-[180px] gap-[24px] px-[16px] pt-[24px] pb-[8px] bg-black1f rounded-[3px] border-[1px] border-black29 shadow-[0px_2px_6px_0_rgba(0,0,0,0.12)]"
      )}>

        {/*Account*/}
        <div className="flex flex-row gap-[10px] w-[368px] h-[56px] pl-[8px] pt-[4px] pb-[4px] items-center">

          <div className="flex gap-[16px]">
            {/*IconProfile*/}
            <div
                className="cursor-pointer flex flex-row justify-center items-center shrink-0 w-[48px] h-[48px]"
            >
              <img className="w-[48px] h-[48px] rounded-full object-cover" src={profileUrl} alt="Profile"/>
            </div>

            {/*Twitter Name and shorten Address*/}
            <div className="flex flex-col gap-[2px] items-start">
              <div className="text-[21px] w-[168px] h-[22px] font-bold text-whitee0 leading-[22px]">{userName}</div>
              <div className="text-[13px] w-[168px] h-[16px]  text-gray99 font-normal">{shortenAddress(address)}</div>
            </div>
          </div>

          {/*Remove Twitter*/}
          {<Twitter isTwitterConnected={isTwitterConnected} setIsTwitterConnected={setIsTwitterConnected} />}
        </div>

        <div className="flex flex-col gap-[8px]">

          {/*Open/Close Count, Size, Notional Volume*/}
          <div className=" w-[368px] h-[10fpx] px-[8px] py-[18px] bg-black29 rounded-[3px]">

            {/* Total Open/Close Count */}
            <div
                className="cursor-pointer flex flex-row justify-between items-center w-full h-[24px] rounded-[3px] pr-[12px] hover:bg-black33"
                onClick={() => setIsTotalOpenCloseCountOpen(!isTotalOpenCloseCountOpen)}
            >
              <div className="flex flex-row items-center">
                {isTotalOpenCloseCountOpen
                    ? <img className="w-[24px] h-[24px]" src={IconArrowToggleClose}/>
                    : <img className="w-[24px] h-[24px]" src={IconArrowToggleOpen}/>
                }
                <p className="text-[13px] text-whitee0 font-semibold">Open/Close Count</p>
              </div>
              <p className="text-[13px] text-primaryc1 font-semibold">{advancedFormatNumber(btcTradeCount + ethTradeCount, 0)}</p>
            </div>
            {isTotalOpenCloseCountOpen && (
                <div className="flex flex-col gap-[8px] py-[8px] pl-[26px] text-[13px] text-gray80">
                  <div className="flex flex-row justify-between items-center pr-[12px]">
                    <div className="flex flex-row gap-[8px]">
                      <img className="w-[18px] h-[18px]" src={SymbolBitcoinCircle}/>
                      <p>BTC</p>
                    </div>
                    <p className="text-[13px] font-semibold">{advancedFormatNumber(btcTradeCount, 0)}</p>
                  </div>
                  <div className="flex flex-row justify-between items-center pr-[12px]">
                    <div className="flex flex-row gap-[8px]">
                      <img className="w-[18px] h-[18px]" src={SymbolEthereumCircle}/>
                      <p>ETH</p>
                    </div>
                    <p className="text-[13px] font-semibold">{advancedFormatNumber(ethTradeCount, 0)}</p>
                  </div>
                </div>
            )}

            {/* Total Open/Close Size */}
            <div
                className="cursor-pointer flex flex-row justify-between items-center w-full h-[24px] rounded-[3px] pr-[12px] hover:bg-black33"
                onClick={() => setIsTotalOpenCloseSizeOpen(!isTotalOpenCloseSizeOpen)}
            >
              <div className="flex flex-row items-center">
                {isTotalOpenCloseSizeOpen
                    ? <img className="w-[24px] h-[24px]" src={IconArrowToggleClose}/>
                    : <img className="w-[24px] h-[24px]" src={IconArrowToggleOpen}/>
                }
                <p className="text-[13px] text-whitee0 font-semibold">Open/Close Size</p>
              </div>
              <p className="text-[13px] text-primaryc1 font-semibold">{advancedFormatNumber(Number(btcTradeSize) + Number(ethTradeSize), 4)}</p>
            </div>
            {isTotalOpenCloseSizeOpen && (
                <div className="flex flex-col gap-[8px] py-[8px] pl-[26px] text-[13px] text-gray80">
                  <div className="flex flex-row justify-between items-center pr-[12px]">
                    <div className="flex flex-row gap-[8px]">
                      <img className="w-[18px] h-[18px]" src={SymbolBitcoinCircle}/>
                      <p>BTC</p>
                    </div>
                    <p className="text-[13px] font-semibold">{advancedFormatNumber(Number(btcTradeSize), 4)}</p>
                  </div>
                  <div className="flex flex-row justify-between items-center pr-[12px]">
                    <div className="flex flex-row gap-[8px]">
                      <img className="w-[18px] h-[18px]" src={SymbolEthereumCircle}/>
                      <p>ETH</p>
                    </div>
                    <p className="text-[13px] font-semibold">{advancedFormatNumber(Number(ethTradeSize), 4)}</p>
                  </div>
                </div>
            )}

            {/* Total Notional Volume */}
            <div
                className="cursor-pointer flex flex-row justify-between items-center w-full h-[24px] rounded-[3px] pr-[12px] hover:bg-black33"
                onClick={() => setIsTotalNotionalVolumeOpen(!isTotalNotionalVolumeOpen)}
            >
              <div className="flex flex-row items-center">
                {isTotalNotionalVolumeOpen
                    ? <img className="w-[24px] h-[24px]" src={IconArrowToggleClose}/>
                    : <img className="w-[24px] h-[24px]" src={IconArrowToggleOpen}/>
                }
                <p className="text-[13px] text-whitee0 font-semibold">Notional Volume</p>
              </div>
              <p className="text-[13px] text-primaryc1 font-semibold">{advancedFormatNumber(Number(btcNotionalVolume) + Number(ethNotionalVolume), 2, "$")}</p>
            </div>
            {isTotalNotionalVolumeOpen && (
                <div className="flex flex-col gap-[8px] py-[8px] pl-[26px] text-[13px] text-gray80">
                  <div className="flex flex-row justify-between items-center pr-[12px]">
                    <div className="flex flex-row gap-[8px]">
                      <img className="w-[18px] h-[18px]" src={SymbolBitcoinCircle}/>
                      <p>BTC</p>
                    </div>
                    <p className="text-[13px] font-semibold">{advancedFormatNumber(Number(btcNotionalVolume), 2, "$")}</p>
                  </div>
                  <div className="flex flex-row justify-between items-center pr-[12px]">
                    <div className="flex flex-row gap-[8px]">
                      <img className="w-[18px] h-[18px]" src={SymbolEthereumCircle}/>
                      <p>ETH</p>
                    </div>
                    <p className="text-[13px] font-semibold">{advancedFormatNumber(Number(ethNotionalVolume), 2, "$")}</p>
                  </div>
                </div>
            )}
          </div>

          {/*Copy Trades*/}
          <div className="w-full h-[104px] px-[16px] py-[18px] bg-black29 rounded-[3px]">

            {/* Total Copy Traders */}
            <div
                className="flex flex-row justify-between items-center w-full h-[24px] rounded-[3px] pr-[4px]"
            >
              <div className="flex flex-row items-center">
                <p className="text-[13px] text-whitee0 font-semibold">Copy Traders</p>
              </div>
              <p className="text-[13px] text-primaryc1 font-semibold">{advancedFormatNumber(copyTraders, 0)}</p>
            </div>

            {/* Total Copy Trades Volume */}
            <div
                className="flex flex-row justify-between items-center w-full h-[24px] rounded-[3px] pr-[4px]"
            >
              <div className="flex flex-row items-center">
                <p className="text-[13px] text-whitee0 font-semibold">Copy Trades Volume</p>
              </div>
              <p className="text-[13px] text-primaryc1 font-semibold">{advancedFormatNumber(Number(copyTradesVolume), 2, "$")}</p>
            </div>

            {/* Total Rebates from Copy Trades */}
            <div
                className="flex flex-row justify-between items-center w-full h-[24px] rounded-[3px] pr-[4px]"
            >
              <div className="flex flex-row items-center">
                <p className="text-[13px] text-whitee0 font-semibold">Rebates from Copy Trades</p>
              </div>
              <p className="text-[13px] text-primaryc1 font-semibold">{advancedFormatNumber(Number(rebatesFromCopyTrades), 2, "$")}</p>
            </div>
          </div>

          <div className="flex flex-row w-full justify-between items-start gap-[4px] pb-[0px]">

            {/*Copy Address*/}
            <div className="inline-flex flex-col item-center w-[120px] h-[88px] rounded-[3px] gap-[6px] pl-[23px] pt-[20px] pb-[24px] pr-[22px] hover:bg-black29 active:opacity-50 active:scale-96">
              <div
                  onClick={() => {
                    if (isCopied) return;
                    copyToClipboard(address as string);
                    setIsCopied(true);
                  }}
              >
                <div className="flex justify-center item-center">
                  <img className={twJoin("cursor-pointer w-[24px] h-[24px] p-[4.25px] rounded-[3px]", isCopied ? "hidden" : "block")} src={IconCopyAddress}/>
                  <p className={twJoin(
                      " h-[24px] p-[4.25px] rounded-[3px] text-[11px] text-primaryc1 font-semibold bg-black1 border-[1px] border-solid border-[rgba(224,224,224,.1)] shadow-[0px_0px_8px_0_rgba(10,10,10,0.72)]",
                      isCopied ? "block" : "hidden"
                  )}>Copied</p>
                </div>
              </div>
              <p className="text-[12px] text-gray80 font-semibold leading-[14px] whitespace-nowrap">Copy Address</p>
            </div>

{/*className="cursor-pointer flex flex-row justify-between items-center w-full h-[24px] rounded-[3px] pr-[4px] hover:bg-black33"*/}


            {/*Icon Explorer*/}
            <div className="inline-flex flex-col item-center  w-[120px] h-[88px] rounded-[3px] gap-[6px] pl-[22px] pt-[20px] pb-[24px] pr-[22px] hover:bg-black29 active:opacity-50 active:scale-96">
              <div
                  onClick={() => {
                    if (!chain?.blockExplorers) return
                    window.open(chain?.blockExplorers.default.url + "/address/" + address, "_blank")
                  }}
              >
                <div className="flex justify-center item-center">
                  <img className="cursor-pointer w-[24px] h-[24px] pt-[4px] pr-[2.288px] pb-[3.324px] pl-[3.2px] rounded-[3px]" src={IconExplorer}/>
                </div>
              </div>
              <p className="text-[12px] text-gray80 font-semibold leading-[14px] whitespace-nowrap">View Explorer</p>
            </div>


            {/*Disconnect*/}
            <div className="inline-flex flex-col item-center  w-[120px] h-[88px] rounded-[3px] gap-[6px] px-[30px] pt-[20px] pb-[24px] hover:bg-black29 active:opacity-50 active:scale-96">
              <div
                  onClick={handleDisconnect}
              >
                <div className="flex justify-center item-center">
                  <img className="cursor-pointer w-[24px] h-[24px] px-[4px] py-[3.75px] rounded-[3px]" src={IconDisconnect}/>
                </div>
              </div>
              <p className="text-[12px] text-gray80 font-semibold leading-[14px] whitespace-nowrap">Disconnect</p>
            </div>
          </div>
        </div>

      </div>
  )
}

export default AccountInfo;


export const getUserCopyTradeData = (address: `0x${string}`|undefined, allLeadTraders: ILeadTraders): {copyTraders: number, copyTradesVolume: number, rebatesFromCopyTrades: number, } => {
  const leadTraders = allLeadTraders.ETH.concat(allLeadTraders.BTC);
  if (!address) return {copyTraders: 0, copyTradesVolume: 0, rebatesFromCopyTrades: 0};
  const leadTrader: ILeadTrader| undefined = leadTraders.find(t => t.address === address);

  const copyTraders = leadTrader ? leadTrader.copyTraders : 0;
  const copyTradesVolume = leadTrader ? leadTrader.copyTradesVolume : 0;
  const rebatesFromCopyTrades = leadTrader ? leadTrader.rebatesFromCopyTrades : 0;

  return {
    copyTraders,
    copyTradesVolume,
    rebatesFromCopyTrades
  };
};