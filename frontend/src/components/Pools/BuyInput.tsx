import BigNumber from "bignumber.js";

import { useEffect, useRef, useState } from "react";
import { twJoin } from "tailwind-merge";
import { useAccount } from "wagmi";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { loadAllowanceForPool, loadBalance } from "@/store/slices/UserSlice";
import { advancedFormatNumber } from "@/utils/helper";
import { OrderSide } from "@/utils/types";
import { writeApproveERC20, writeMintAndStakeOlp, writeMintAndStakeOlpNAT } from "@/utils/contract";
import { OlpKey } from "@/utils/enums";
import { useOlpOperationsStatus } from "@/hooks/useOlpOperationsStatus";

import Button from "../Common/Button";

import IconWalletGray from "@assets/icon-input-wallet-gray.svg";
import IconArrowDownGreen from "@assets/icon-arrow-down-green.svg";
import IconArrowUpWhite from "@assets/icon-arrow-up-white.svg";
import QuoteAssetDropDown from "../Common/QuoteAssetDropDown";
import { OLP_INFO, OLP_MANAGER_ADDRESSES, QA_INFO, QA_TICKER_TO_ADDRESS, QA_TICKER_TO_DECIMAL } from "@/networks/assets";
import { BaseQuoteAsset, FuturesAssetIndexMap, NetworkQuoteAsset } from "@moby/shared";
import { SupportedChains } from "@/networks/constants";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { NetworkState } from "@/networks/types";
import { getOlpBalance, getOlpManagerAllowanceForQuoteAsset, getQuoteAssetBalance } from "@/store/selectors/userSelectors";

BigNumber.config({
  EXPONENTIAL_AT: 1000,
  DECIMAL_PLACES: 80,
})

type BuyInputProps = {
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

const BuyInput: React.FC<BuyInputProps> = ({
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

  const inputRef = useRef<HTMLInputElement>(null);

  const [focusedInput, setFocusedInput] = useState<FocusedInput>('pay');
  const [isButtonLoading, setIsButtonLoading] = useState<boolean>(false);

  const quoteAssetBalance = useAppSelector(state => getQuoteAssetBalance(state, selectedQuoteAsset));
  const olpBalance = useAppSelector(state => getOlpBalance(state, olpKey));
  const olpAllowanceForQuoteAsset = useAppSelector(state => getOlpManagerAllowanceForQuoteAsset(state, olpKey, selectedQuoteAsset));
  
  // Check if OLP operations are in progress (positions being processed)
  const { isInProgress: isOlpOperationInProgress } = useOlpOperationsStatus(olpKey);

  // 1. OlpManager 대상 Selected Quote Asset Allowance 체크
  const isQuoteAssetApproved = selectedQuoteAsset === "ETH"
    ? true
    : new BigNumber(olpAllowanceForQuoteAsset)
        .isGreaterThanOrEqualTo(
          new BigNumber(payAmount || "0")
            .multipliedBy(10 ** QA_TICKER_TO_DECIMAL[chain][selectedQuoteAsset as keyof typeof QA_TICKER_TO_DECIMAL[typeof chain]])
            .toFixed(0)
        )

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
    if (isNaN(Number(quoteAssetBalance))) return "0";
    return quoteAssetBalance;
  };

  // ReceiveAmount(Quote) 기반으로 PayAmount(OLP) 구하는 함수
  const getPayAmount = (receiveAmount: string): string => {
    let payAmount = "0";
    
    const receiveAmountInUSD = BigNumber(receiveAmount).multipliedBy(BigNumber(olpPrice).dividedBy(10 ** 30)).toString();

    if (selectedQuoteAsset === "ETH") {
      payAmount = BigNumber(receiveAmountInUSD).dividedBy(futuresAssetIndexMap.eth).toString();
    } else if (selectedQuoteAsset === BaseQuoteAsset.WBTC) {
      payAmount = BigNumber(receiveAmountInUSD).dividedBy(futuresAssetIndexMap.btc).toString();
    } else if (selectedQuoteAsset === BaseQuoteAsset.WETH) {
      payAmount = BigNumber(receiveAmountInUSD).dividedBy(futuresAssetIndexMap.eth).toString();
    } else if (selectedQuoteAsset === BaseQuoteAsset.USDC) {
      payAmount = receiveAmountInUSD;
    } else if (selectedQuoteAsset === "HONEY") {
      payAmount = receiveAmountInUSD;
    }

    if (isNaN(Number(payAmount))) return "0";
    return payAmount;
  }

  // PayAmount(OLP) 기반으로 ReceiveAmount(Quote) 구하는 함수
  const getReceiveAmount = (payAmount: string): string => {
    let receiveAmount = "0";
    let payAmountInUSD = 0;

    if (selectedQuoteAsset === "ETH") {
      payAmountInUSD = Number(payAmount) * Number(futuresAssetIndexMap.eth);
    } else if (selectedQuoteAsset === BaseQuoteAsset.WBTC) {
      payAmountInUSD = Number(payAmount) * Number(futuresAssetIndexMap.btc);
    } else if (selectedQuoteAsset === BaseQuoteAsset.WETH) {
      payAmountInUSD = Number(payAmount) * Number(futuresAssetIndexMap.eth);
    } else if (selectedQuoteAsset === BaseQuoteAsset.USDC) {
      payAmountInUSD = Number(payAmount);
    } else if (selectedQuoteAsset === "HONEY") {
      payAmountInUSD = Number(payAmount);
    }

    receiveAmount =  BigNumber(payAmountInUSD).dividedBy(BigNumber(olpPrice).dividedBy(10**30)).toString();

    if (isNaN(Number(receiveAmount))) return "0";
    return receiveAmount;
  }

  const handleApproveForQuoteAsset = async () => {
    if (selectedQuoteAsset === "ETH") return;
    if (!isBerachain && selectedQuoteAsset === "HONEY") return;

    setIsButtonLoading(true);

    const tokenAddress = QA_TICKER_TO_ADDRESS[chain][selectedQuoteAsset as keyof typeof QA_TICKER_TO_ADDRESS[typeof chain]] as `0x${string}`
    const spenderAddress = OLP_MANAGER_ADDRESSES[chain][olpKey] as `0x${string}`
    const result = await writeApproveERC20(
      tokenAddress,
      spenderAddress,
      BigInt(new BigNumber(payAmount || "0")
        .multipliedBy(1.5)
        .multipliedBy(10 ** QA_TICKER_TO_DECIMAL[chain][selectedQuoteAsset as keyof typeof QA_TICKER_TO_DECIMAL[typeof chain]])
        .toFixed(0))
    );

    if (result) {
      dispatch(loadAllowanceForPool({ chain, address }));
    }

    setIsButtonLoading(false);
  }

  const handleMintAndStakeOlp = async () => {
    if (isBerachain && selectedQuoteAsset === "ETH") {
      return;
    } else if (!isBerachain && selectedQuoteAsset === "HONEY") {
      return;
    } 

    setIsButtonLoading(true);

    let result;

    if (selectedQuoteAsset === "ETH") {
      const args = [0, 0]
      result = await writeMintAndStakeOlpNAT(olpKey, args, payAmount, chain)
    } else {
      const args = [
        QA_TICKER_TO_ADDRESS[chain][selectedQuoteAsset as keyof typeof QA_TICKER_TO_ADDRESS[typeof chain]],
        new BigNumber(payAmount).multipliedBy(10 ** QA_TICKER_TO_DECIMAL[chain][selectedQuoteAsset as keyof typeof QA_TICKER_TO_DECIMAL[typeof chain]]).toFixed(0),
        0,
        0
      ]

      result = await writeMintAndStakeOlp(olpKey, args, chain)
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
      <Button
        name="Connect Wallet"
        color="greenc1"
        onClick={() => {
          if (openConnectModal) openConnectModal();
        }}
      />
    )

    // Check if positions are being processed
    if (isOlpOperationInProgress) {
      return <Button name="In progress" color="default" disabled={true} onClick={() => {}} />
    }
    
    // Approve Check
    if (!isQuoteAssetApproved) return <Button  name={`Approve ${selectedQuoteAsset}`} color="default" onClick={handleApproveForQuoteAsset} />
    
    let buttonName = `Buy OLP`
    
    const isButtonDisabled = !address || !payAmount || BigNumber(payAmount).isLessThanOrEqualTo(0) || BigNumber(payAmount).gt(quoteAssetBalance);
    
    const isInsufficientBalance = BigNumber(payAmount).gt(quoteAssetBalance);
    const isButtonError = isInsufficientBalance;
    
    if (isButtonError) {
      if (isInsufficientBalance) {
        buttonName = `Insufficient ${selectedQuoteAsset} balance` 
      }
    } else if (!payAmount || BigNumber(payAmount).isLessThanOrEqualTo(0)) {
      buttonName = "Enter amount to buy"
    }

    return (
      <Button 
        name={buttonName}
        color="green"
        isError={isButtonError}
        disabled={isButtonDisabled}
        onClick={handleMintAndStakeOlp}
      />
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
              <img className="w-[14px] h-[14px]" src={IconWalletGray} />
              <p className="text-[12px] text-whitee0 font-semibold ml-[6px]">
                {advancedFormatNumber(Number(quoteAssetBalance), 4, "")}
              </p>
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

                // 업데이트 된 PayAmount로 ReceiveAmount 업데이트
                const receiveAmount = getReceiveAmount(newValue);
                setReceiveAmount(receiveAmount);
              }}
            >
              MAX
            </div>

          </div>
        </div>
        <div className="flex flex-row justify-center items-center mt-[20px]">
          <img src={QA_INFO[chain][selectedQuoteAsset as keyof typeof QA_INFO[typeof chain]].src} className="w-[32px] h-[32px] min-w-[32px] min-h-[32px]"/>
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

              // 업데이트 된 PayAmount로 ReceiveAmount 업데이트
              const receiveAmount = getReceiveAmount(e.target.value.replace(/^0+(?=\d)/, ''));

              if (Infinity === Number(receiveAmount)) {
                setPayAmount("");
                setReceiveAmount("");
                return;
              }

              setReceiveAmount(receiveAmount);
            }}
            onFocus={() => handleInputFocus('pay')}
          />
          <QuoteAssetDropDown
            selectedQuoteAsset={selectedQuoteAsset}
            setSelectedQuoteAsset={setSelectedQuoteAsset}
            scale="medium"
            defaultQuoteAsset={selectedQuoteAsset}
          />
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
        setSelectedOrderSide("Sell")
      }}
      >
        <img className="block group-hover:hidden w-[14px] h-[14px] min-w-[14px] min-h-[14px]" src={IconArrowDownGreen} />
        <img className="hidden group-hover:block w-[14px] h-[14px] min-w-[14px] min-h-[14px]" src={IconArrowUpWhite} />
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
                {advancedFormatNumber(Number(olpBalance), 4, "")}
              </p>
            </div>

          </div>
        </div>
        <div className="flex flex-row justify-center items-center mt-[20px]">
          {/* <img className="w-[32px] h-[32px] min-w-[32px] min-h-[32px]" src={symbolSrc} /> */}
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

              // 업데이트 된 ReceiveAmount로 PayAmount 업데이트
              const payAmount = getPayAmount(e.target.value.replace(/^0+(?=\d)/, ''));
              setPayAmount(payAmount);
            }}
            onFocus={() => handleInputFocus('receive')}
          />
          <div>
            <p className="ml-[16px] text-[16px] text-whitee0 font-semibold">{OLP_INFO[chain][olpKey].symbol}</p>
          </div>
        </div>
      </div>

      <div className='mt-[4px] w-[344px] h-[48px] '>
        {renderButton()}
      </div>

      <div className="mt-[8px] h-[45px] text-[11px] text-gray52 font-semibold">
        <p>• Purchased OLP will be auto-staked.</p>
        <p>• You can unstake & sell OLP after 7 days of cooldown.</p>
        <p>• Additional purchase of OLP result in resetting cooldown time.</p>
      </div>
    </>
  );
};

export default BuyInput;


