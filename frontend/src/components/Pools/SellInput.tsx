import BigNumber from "bignumber.js";
import { useEffect, useRef, useState } from "react";
import { twJoin } from "tailwind-merge";
import { useAccount } from "wagmi";
import { advancedFormatNumber } from "@/utils/helper";
import { writeUnstakeAndRedeemOlp, writeUnstakeAndRedeemOlpNAT } from "@/utils/contract";
import { loadBalance } from "@/store/slices/UserSlice";
import { OrderSide } from "@/utils/types";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { CountdownTimer } from "../Common/CountdownTimer";
import { OlpKey } from "@/utils/enums";
import { useOlpOperationsStatus } from "@/hooks/useOlpOperationsStatus";
import { getCooldownTimestampInSec, getOlpBalance, getQuoteAssetBalance } from "@/store/selectors/userSelectors";
import Button from "../Common/Button";

import IconWalletGray from "@assets/icon-input-wallet-gray.svg";
import IconArrowDownRed from "@assets/icon-arrow-down-red.svg";
import IconArrowUpWhite from "@assets/icon-arrow-up-white.svg";
import IconArrowCooldown from "@assets/icon-arrow-cooldown.svg";
import QuoteAssetDropDown from "../Common/QuoteAssetDropDown";
import { OLP_INFO, QA_INFO, QA_TICKER_TO_ADDRESS } from "@/networks/assets";
import { BaseQuoteAsset, convertQuoteAssetToNormalizedSpotAsset, FuturesAssetIndexMap, NetworkQuoteAsset, SpotAssetIndexMap } from "@moby/shared";
import { SupportedChains } from "@/networks/constants";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { NetworkState } from "@/networks/types";

BigNumber.config({
  EXPONENTIAL_AT: 1000,
  DECIMAL_PLACES: 80,
})

type SellInputProps = {
  payAmount: string;
  setPayAmount: (value: string) => void;
  receiveAmount: string;
  setReceiveAmount: (value: string) => void;
  selectedQuoteAsset: NetworkQuoteAsset<SupportedChains>;
  setSelectedQuoteAsset: (value: NetworkQuoteAsset<SupportedChains>) => void;
  setSelectedOrderSide: (value: OrderSide) => void;
  olpKey: OlpKey;
  olpPrice: string;
  isDisabled: boolean;
  isDeprecated: boolean;
};

type FocusedInput = 'pay' | 'receive';

const SellInput: React.FC<SellInputProps> = ({
  payAmount,
  setPayAmount,
  receiveAmount,
  setReceiveAmount,
  selectedQuoteAsset,
  setSelectedQuoteAsset,
  setSelectedOrderSide,
  olpKey,
  olpPrice,
  isDisabled,
  isDeprecated
}) => {
  const dispatch = useAppDispatch();
  const { chain, isBerachain } = useAppSelector(state => state.network) as NetworkState;

  if (QA_INFO[chain][selectedQuoteAsset as keyof typeof QA_INFO[typeof chain]] === undefined) {
    setSelectedQuoteAsset(NetworkQuoteAsset[chain].USDC);
  }

  const { address, connector, isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();
  
  const futuresAssetIndexMap = useAppSelector((state: any) => state.market.futuresAssetIndexMap) as FuturesAssetIndexMap;
  const spotAssetIndexMap = useAppSelector((state: any) => state.market.spotAssetIndexMap) as SpotAssetIndexMap;
  const olpStats = useAppSelector((state: any) => state.market.olpStats);
  
  const inputRef = useRef<HTMLInputElement>(null);
  
  const [focusedInput, setFocusedInput] = useState<FocusedInput>('pay');
  const [isButtonLoading, setIsButtonLoading] = useState<boolean>(false);

  const quoteAssetBalance = useAppSelector(state => getQuoteAssetBalance(state, selectedQuoteAsset));
  const olpBalance = useAppSelector(state => getOlpBalance(state, olpKey));
  
  // Check if OLP operations are in progress (positions being processed)
  const { isInProgress: isOlpOperationInProgress } = useOlpOperationsStatus(olpKey);
  const cooldownTimestampInSec = useAppSelector(state => getCooldownTimestampInSec(state, olpKey));
  
  const isAbleToSell = new BigNumber(Math.floor(Date.now() / 1000)).isGreaterThan(cooldownTimestampInSec)

  // availableOlpToSell 관련 state 및 useEffect
  const [availableOlpToSell, setAvailableOlpToSell] = useState<string>("0");
  const [isAvailableOlpToSellEnough, setIsAvailableOlpToSellEnough] = useState<boolean>(true);

  useEffect(() => {
    const olpAssetAmounts = olpStats[olpKey].assetAmounts;

    const availableQuoteTokenAmounts = selectedQuoteAsset === BaseQuoteAsset.WBTC
      ? olpAssetAmounts.wbtc.availableAmount
      : selectedQuoteAsset === BaseQuoteAsset.WETH || selectedQuoteAsset === "ETH"
        ? olpAssetAmounts.weth.availableAmount
        : selectedQuoteAsset === BaseQuoteAsset.USDC
          ? olpAssetAmounts.usdc.availableAmount
          : selectedQuoteAsset === "HONEY"
            ? olpAssetAmounts.honey.availableAmount
            : "0"

    const normalizedQuoteAsset = convertQuoteAssetToNormalizedSpotAsset(selectedQuoteAsset, false);

    if (!normalizedQuoteAsset) return;

    const availableQuoteTokenValue = new BigNumber(availableQuoteTokenAmounts)
      .multipliedBy(BigNumber(spotAssetIndexMap[normalizedQuoteAsset]))
      .toNumber()

    const parsedOlpPrice = new BigNumber(olpPrice)
      .dividedBy(10 ** 30)
      .toNumber()

    const nextAvailableOlpToSell = parsedOlpPrice !== 0
      ? new BigNumber(availableQuoteTokenValue)
        .dividedBy(parsedOlpPrice)
        .toFixed(18)
      : "0"

    setAvailableOlpToSell(nextAvailableOlpToSell);

    if (Number(olpBalance) <= Number(nextAvailableOlpToSell)) {
      setIsAvailableOlpToSellEnough(true);
    } else {
      setIsAvailableOlpToSellEnough(false);
    }
  }, [olpStats, olpBalance, spotAssetIndexMap, selectedQuoteAsset])

  // 가격 변동에 따른 amount 업데이트 (PayAmount 고정 -> ReceiveAmount 변동)
  useEffect(() => {
    if (focusedInput === 'pay') {
      const receiveAmount = getReceiveAmount(payAmount);
      setReceiveAmount(receiveAmount);
    } else if (focusedInput === 'receive') {
      const payAmount = getPayAmount(receiveAmount);
      setPayAmount(payAmount)
    }
  }, [futuresAssetIndexMap])

  const handleInputFocus = (inputType: FocusedInput) => {
    setFocusedInput(inputType);
  };

  const getMaxValue = (): string => {
    if (isNaN(Number(olpBalance))) return "0";

    if (!isAbleToSell) {
      return "0"
    } else if (isAvailableOlpToSellEnough) {
      return olpBalance;
    } else {
      return availableOlpToSell;
    }
  };

  // ReceiveAmount(OLP) 기반으로 PayAmount(Quote) 구하는 함수
  const getPayAmount = (receiveAmount: string): string => {
    let payAmount = "0";
    let receiveAmountInUSD = 0;

    if (selectedQuoteAsset === "ETH") {
      receiveAmountInUSD = Number(receiveAmount) * Number(futuresAssetIndexMap.eth);
    } else if (selectedQuoteAsset === BaseQuoteAsset.WBTC) {
      receiveAmountInUSD = Number(receiveAmount) * Number(futuresAssetIndexMap.btc);
    } else if (selectedQuoteAsset === BaseQuoteAsset.WETH) {
      receiveAmountInUSD = Number(receiveAmount) * Number(futuresAssetIndexMap.eth);
    } else if (selectedQuoteAsset === BaseQuoteAsset.USDC) {
      receiveAmountInUSD = Number(receiveAmount);
    } else if (selectedQuoteAsset === "HONEY") {
      receiveAmountInUSD = Number(receiveAmount);
    }
    
    payAmount = BigNumber(receiveAmountInUSD).div(BigNumber(olpPrice).div(10**30)).toString();

    if (isNaN(Number(payAmount))) return "0";
    return payAmount;
  }

  // PayAmount(Quote) 기반으로 ReceiveAmount(OLP) 구하는 함수
  const getReceiveAmount = (payAmount: string): string => {
    let receiveAmount = "0";
    
    const payAmountInUSD = BigNumber(payAmount).multipliedBy(BigNumber(olpPrice).dividedBy(10 ** 30)).toString();
    
    if (selectedQuoteAsset === "ETH") {
      receiveAmount = BigNumber(payAmountInUSD).div(futuresAssetIndexMap.eth).toString();
    } else if (selectedQuoteAsset === BaseQuoteAsset.WBTC) {
      receiveAmount = BigNumber(payAmountInUSD).div(futuresAssetIndexMap.btc).toString();
    } else if (selectedQuoteAsset === BaseQuoteAsset.WETH) {
      receiveAmount = BigNumber(payAmountInUSD).div(futuresAssetIndexMap.eth).toString();
    } else if (selectedQuoteAsset === BaseQuoteAsset.USDC) {
      receiveAmount = payAmountInUSD.toString();
    } else if (selectedQuoteAsset === "HONEY") {
      receiveAmount = payAmountInUSD.toString();
    }
  
    if (isNaN(Number(receiveAmount))) return "0";
    return receiveAmount;
  }

  const handleUnstakeAndRedeemOlp = async () => {
    if (isBerachain && selectedQuoteAsset === "ETH") {
      return
    } else if (!isBerachain && selectedQuoteAsset === "HONEY") {
      return
    }
    
    setIsButtonLoading(true);

    let result;

      if (selectedQuoteAsset === "ETH") {
      const args = [
        new BigNumber(payAmount).multipliedBy(10 ** 18).toFixed(0),
        0,
        address
      ]
  
      result = await writeUnstakeAndRedeemOlpNAT(olpKey, args, chain)
    } else {
      const args = [
        QA_TICKER_TO_ADDRESS[chain][selectedQuoteAsset as keyof typeof QA_TICKER_TO_ADDRESS[typeof chain]],
        new BigNumber(payAmount).multipliedBy(10 ** 18).toFixed(0),
        0,
        address
      ]
  
      result = await writeUnstakeAndRedeemOlp(olpKey, args, chain)
    }

    if (result && address) {
      dispatch(loadBalance({ chain, address }));
    }

    setPayAmount("");
    setReceiveAmount("");
    setIsButtonLoading(false);
  }

  const renderButton = () => {
    if (isDisabled) return (
      <Button
        name="Coming Soon"
        color="default"
        disabled
        onClick={() => {}}
      />
    )
    

    if (isButtonLoading) return (
      <Button
        name="..."
        color="default"
        disabled
        onClick={() => {}}
      />
    )

    if (!connector || !isConnected) return (
      <Button  name="Connect Wallet" color="greenc1" onClick={() => {
        if (openConnectModal) openConnectModal();
      }} />
    )

    // Check if positions are being processed
    if (isOlpOperationInProgress) {
      return <Button name="In progress" color="default" disabled={true} onClick={() => {}} />
    }

    let buttonName = `Sell ${OLP_INFO[chain][olpKey].symbol}`

    const isButtonDisabled = !address || !payAmount || BigNumber(payAmount).isLessThanOrEqualTo(0);

    const isInsufficientBalance = BigNumber(payAmount).gt(olpBalance);
    const isExceedAvailalbeOlpToSell = BigNumber(payAmount).gt(availableOlpToSell);
    const isNotCooldowned = BigNumber(payAmount).gt(0) && !isAbleToSell;
    const isButtonError = isInsufficientBalance || isExceedAvailalbeOlpToSell || isNotCooldowned;

    if (isButtonError) {
      if (isInsufficientBalance) {
        buttonName = `Insufficient OLP balance`
      } else if (isExceedAvailalbeOlpToSell || isNotCooldowned) {
        buttonName = "Exceed max available quanitity"
      }    
    } else if (!payAmount || BigNumber(payAmount).isLessThanOrEqualTo(0)) {
      buttonName = "Enter amount to sell"
    }

    return (
      <Button 
        name={buttonName}
        color="red"
        isError={isButtonError}
        disabled={isButtonDisabled}
        onClick={handleUnstakeAndRedeemOlp} />
    )
  }

  return (
    <>
      <div
        className={twJoin(
          "flex flex-col",
          "w-full h-[107px]",
          "rounded-[6px] bg-black17",
          "px-[18px] py-[12px]"
        )}
      >
        <div className="flex flex-row justify-between items-center h-[26px]">
          <p className="text-[14px] text-gray80 font-semibold">
            <span>Pay</span>
          </p>
          <div className="flex flex-row justify-end">
            
            <div className="flex flex-row justify-center items-center">
              <img className="w-[14px] h-[14px]" src={IconWalletGray}/>
              {
                !isAbleToSell // isNotCooldowned
                  ? <div className="flex flex-row items-center">
                      <p className="text-[12px] text-gray52 font-semibold ml-[6px]">
                        {advancedFormatNumber(Number(olpBalance), 4, "")}
                      </p>
                      <img className="w-[14px] h-[14px] ml-[4px]" src={IconArrowCooldown} />
                      <div className="ml-[4px] relative group cursor-help w-fit font-semibold border-b-[1px] border-dashed border-b-greenc1">
                        <p className="text-whitee0 text-[12px] hover:text-greenc1 ">0.0000</p>
                        <div className={twJoin(
                          "w-max h-[44px] z-30",
                          "absolute hidden px-[11px] py-[6px] bottom-[24px] -left-[12px]",
                          "bg-black1f rounded-[4px] border-[1px] border-[rgba(224,224,224,.1)] shadow-[0_0_8px_0_rgba(10,10,10,.72)]",
                          "group-hover:block"
                        )}>
                          <p className="text-[12px] text-gray80 leading-[0.85rem]">
                            {`Your ${advancedFormatNumber(Number(olpBalance), 4, "")} ${OLP_INFO[chain][olpKey].symbol} under cooldown.`}
                          </p>
                          <div className="flex flex-row text-[12px] text-greenc1">
                            <p>Remaining&nbsp;</p>
                            <CountdownTimer className="text-[12px] text-greenc1" targetTimestamp={cooldownTimestampInSec} compactFormat={true} />
                          </div>
                        </div>
                      </div> 
                    </div>
                  : !isAvailableOlpToSellEnough
                    ? <div className="flex flex-row items-center">
                        <p className="text-[12px] text-gray52 font-semibold ml-[6px]">
                          {advancedFormatNumber(Number(olpBalance), 4, "")}
                        </p>
                        <img className="w-[14px] h-[14px] ml-[4px]" src={IconArrowCooldown} />
                        <div className="ml-[4px] relative group cursor-help w-fit font-semibold border-b-[1px] border-dashed border-b-greenc1">
                            <p className="text-whitee0 text-[12px] hover:text-greenc1 ">{advancedFormatNumber(Number(availableOlpToSell), 4, "")}</p>
                            <div className={twJoin(
                              "w-max h-[44px] z-30",
                              "absolute hidden px-[11px] py-[6px] bottom-[24px] -left-[12px]",
                              "bg-black1f rounded-[4px] border-[1px] border-[rgba(224,224,224,.1)] shadow-[0_0_8px_0_rgba(10,10,10,.72)]",
                              "group-hover:block"
                            )}>
                              <p className="text-[12px] text-gray80 leading-[0.85rem]">
                                Your asset is currently locked as collateral.
                              </p>
                              <p className="text-[12px] text-gray80 leading-[0.85rem]">
                                Available asset for withdrawal is <span className="text-greenc1">{`${advancedFormatNumber(Number(availableOlpToSell), 4, "")} ${OLP_INFO[chain][olpKey].symbol}`}</span>
                              </p>
                            </div>
                          </div>
                      </div>
                    : <p className={twJoin(
                      "text-[12px] text-whitee0 font-semibold ml-[6px]",
                      )}>
                        {advancedFormatNumber(Number(olpBalance), 4, "")}
                      </p>
              }
            </div>
            
            <div
              className={twJoin(
                "cursor-pointer",
                "flex flex-row justify-center items-center",
                "w-[55px] h-[22px] ml-[10px] rounded-[11px] bg-black2e",
                "text-[12px] text-greenc1 font-semibold"
              )}
              onClick={() => {
                const newValue = getMaxValue();

                // PayAmount 업데이트
                setPayAmount(newValue);

                // 업데이트 PayAmount에 따른 ReceiveAmount 업데이트
                const receiveAmount = getReceiveAmount(newValue);
                setReceiveAmount(receiveAmount);
              }}
            >
              MAX
            </div>

          </div>
        </div>
        
        <div className="flex flex-row justify-center items-center mt-[20px]">
          {/* <img className="w-[32px] h-[32px] min-w-[32px] min-h-[32px]" src={symbolSrc} /> */}
          <input
            ref={inputRef}
            value={payAmount}
            placeholder="0"
            className={twJoin(
              "w-full ml-[16px]",
              "text-[20px] text-greenc1 font-bold bg-transparent",
              "focus:outline-none",
              "placeholder:text-[20px] placeholder-gray80 placeholder:font-bold"
            )}
            onChange={(e) => {
              if (e.target.value.includes(" ")) return;
              if (isNaN(Number(e.target.value))) return;

              if (e.target.value === "") {
                setPayAmount("");
                setReceiveAmount("");
                return;
              }

              // PayAmount 업데이트
              setPayAmount(e.target.value.replace(/^0+(?=\d)/, ''));

              // 업데이트 PayAmount에 따른 ReceiveAmount 업데이트
              const receiveAmount = getReceiveAmount(e.target.value.replace(/^0+(?=\d)/, ''));
              setReceiveAmount(receiveAmount);
            }}
            onFocus={() => handleInputFocus('pay')}
          />
          <div>
            <p className="ml-[16px] text-[16px] text-whitee0 font-semibold">{OLP_INFO[chain][olpKey].symbol}</p>
          </div>
        </div>
      </div>

      <div className={twJoin(
        'absolute top-[100px] left-[158px]',
        "flex flex-row justify-center items-center",
        'w-[28px] h-[28px] min-w-[28px] min-h-[28px] rounded-[18px] bg-black26',
        "shadow-[0px_2px_12px_0_rgba(0,0,0,0.2)]",
        isDeprecated ? "" : "group cursor-pointer active:opacity-80 active:scale-95"
      )}
      onClick={() => {
        if (isDeprecated) return;
        setPayAmount("");
        setReceiveAmount("");
        setSelectedOrderSide("Buy")
      }}
      >
        <img className="block group-hover:hidden w-[14px] h-[14px] min-w-[14px] min-h-[14px]" src={IconArrowDownRed}/>
        <img className="hidden group-hover:block w-[14px] h-[14px] min-w-[14px] min-h-[14px]" src={IconArrowUpWhite}/>
      </div>

      <div
        className={twJoin(
          "flex flex-col",
          "w-full h-[107px]",
          "rounded-[6px] bg-black17",
          "px-[18px] py-[12px]"
        )}
      >
        <div className="flex flex-row justify-between items-center h-[26px]">
          <p className="text-[14px] text-gray80 font-semibold">
            <span>Receive</span>
          </p>
          <div className="flex flex-row justify-end">
            
            <div className="flex flex-row justify-center items-center">
              <img className="w-[14px] h-[14px]" src={IconWalletGray} />
              <p className="text-[12px] text-gray80 font-semibold ml-[6px]">
                {advancedFormatNumber(Number(quoteAssetBalance), 4, "")}
              </p>
            </div>

          </div>
        </div>
        <div className="flex flex-row justify-center items-center mt-[20px]">
          <img src={QA_INFO[chain][selectedQuoteAsset as keyof typeof QA_INFO[typeof chain]].src} className="w-[32px] h-[32px] min-w-[32px] min-h-[32px]"/>
          <input
            ref={inputRef}
            value={receiveAmount}
            placeholder="0"
            className={twJoin(
              "w-full ml-[16px]",
              "text-[20px] text-greenc1 font-bold bg-transparent",
              "focus:outline-none",
              "placeholder:text-[20px] placeholder-gray80 placeholder:font-bold"
            )}
            onChange={(e) => {
              if (e.target.value.includes(" ")) return;
              if (isNaN(Number(e.target.value))) return;

              if (e.target.value === "") {
                setPayAmount("");
                setReceiveAmount("");
                return;
              }

              // ReceiveAmount 업데이트
              setReceiveAmount(e.target.value.replace(/^0+(?=\d)/, ''));

              // 업데이트 ReceiveAmount에 따른 PayAmount 업데이트
              const payAmount = getPayAmount(e.target.value.replace(/^0+(?=\d)/, ''));
              setPayAmount(payAmount);
            }}
            onFocus={() => handleInputFocus('receive')}
          /> 
          <QuoteAssetDropDown
            selectedQuoteAsset={selectedQuoteAsset}
            setSelectedQuoteAsset={setSelectedQuoteAsset}
            scale="medium"
            defaultQuoteAsset={selectedQuoteAsset}
          />
        </div>
      </div>

      
      <div className='w-[344px] h-[48px] mt-[4px]'>
        {renderButton()}
      </div>
    </>
  );
};

export default SellInput;
