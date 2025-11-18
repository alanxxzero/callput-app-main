import WithTooltip from "@/components/Common/WithTooltip";
import useQuoteAssetInfo from "@/hooks/useQuoteAssetInfo";
import { advancedFormatNumber } from "@/utils/helper";
import { OptionDirection, OptionStrategy, OrderSide } from "@/utils/types";
import { BaseQuoteAsset, convertQuoteAssetToNormalizedSpotAsset, FEE_RATES, NetworkQuoteAsset, SpotAssetIndexMap, TRADE_FEE_CALCULATION_LIMIT_RATE, UnderlyingAsset } from "@moby/shared";
import { twJoin } from "tailwind-merge";
import { SupportedChains } from "@/networks/constants";
import { QA_INFO, QA_TICKER_TO_DECIMAL, QA_TICKER_TO_IMG } from "@/networks/assets";

import { handleMaxValue } from "../utils/calculations";
import QuoteAssetSelector from "./QuoteAssetSelector";
import { useEffect, useState } from "react";
import { useAppSelector } from "@/store/hooks";
import { IOptionDetail } from "@/interfaces/interfaces.marketSlice";
import { NetworkState } from "@/networks/types";
import { BN } from "@/utils/bn";
import { useThrottledValue } from "@/hooks/common";

type FocusedInput = "size" | "pay" | null;

interface OptionPreviewTradeInputProps {
  selectedOption: IOptionDetail;
  underlyingAsset: UnderlyingAsset;
  expiry: number;
  optionDirection: OptionDirection;
  orderSide: OrderSide;
  optionStrategy: OptionStrategy;
  selectedOptionPair: IOptionDetail;
  underlyingFutures: number;
  markPriceForVanilla: number;
  markPriceForSpread: number;
  basedExecutionPriceForVanilla: number;
  basedExecutionPriceForSpread: number;
  riskPremiumForVanilla: number;
  riskPremiumForSpread: number;
  setRiskPremiumForVanilla: (riskPremium: number) => void;
  setRiskPremiumForSpread: (riskPremium: number) => void;
  executionPriceForVanilla: number;
  executionPriceForSpread: number;
  setExecutionPriceForVanilla: (executionPrice: number) => void;
  setExecutionPriceForSpread: (executionPrice: number) => void;
  quoteAsset: NetworkQuoteAsset<SupportedChains>;
  setQuoteAsset: (quoteAsset: NetworkQuoteAsset<SupportedChains>) => void;
  quoteAssetAmountForVanilla: string;
  quoteAssetAmountForSpread: string;
  setQuoteAssetAmountForVanilla: (amount: string) => void;
  setQuoteAssetAmountForSpread: (amount: string) => void;
  quoteAssetValueForVanilla: number;
  quoteAssetValueForSpread: number;
  setQuoteAssetValueForVanilla: (value: number) => void;
  setQuoteAssetValueForSpread: (value: number) => void;
  collateralAssetForVanilla: NetworkQuoteAsset<SupportedChains>;
  collateralAssetAmountForVanilla: string;
  collateralAssetForSpread: NetworkQuoteAsset<SupportedChains>;
  collateralAssetAmountForSpread: string;
  setCollateralAssetAmountForVanilla: (amount: string) => void;
  setCollateralAssetAmountForSpread: (amount: string) => void;
  tradeFeeUsdForVanilla: number;
  tradeFeeUsdForSpread: number;
  setTradeFeeUsdForVanilla: (tradeFeeUsd: number) => void;
  setTradeFeeUsdForSpread: (tradeFeeUsd: number) => void;
  sizeForVanilla: string;
  sizeForSpread: string;
  setSizeForVanilla: (size: string) => void;
  setSizeForSpread: (size: string) => void;
  availableSizeForVanilla: number;
  availableSizeForSpread: number;
  handleCalculateRiskPremium: (size: string, isBuy: boolean, isVanilla: boolean) => number;
  handleInitializeInputValues: () => void;
}

function OptionPreviewTradeInput({
  selectedOption,
  underlyingAsset,
  expiry,
  optionDirection,
  orderSide,
  optionStrategy,
  selectedOptionPair,
  underlyingFutures,
  markPriceForVanilla,
  markPriceForSpread,
  basedExecutionPriceForVanilla,
  basedExecutionPriceForSpread,
  riskPremiumForVanilla,
  riskPremiumForSpread,
  setRiskPremiumForVanilla,
  setRiskPremiumForSpread,
  executionPriceForVanilla,
  executionPriceForSpread,
  setExecutionPriceForVanilla,
  setExecutionPriceForSpread,
  quoteAsset,
  setQuoteAsset,
  quoteAssetAmountForVanilla,
  quoteAssetAmountForSpread,
  setQuoteAssetAmountForVanilla,
  setQuoteAssetAmountForSpread,
  quoteAssetValueForVanilla,
  quoteAssetValueForSpread,
  setQuoteAssetValueForVanilla,
  setQuoteAssetValueForSpread,
  collateralAssetForVanilla,
  collateralAssetAmountForVanilla,
  collateralAssetForSpread,
  collateralAssetAmountForSpread,
  setCollateralAssetAmountForVanilla,
  setCollateralAssetAmountForSpread,
  tradeFeeUsdForVanilla,
  tradeFeeUsdForSpread,
  setTradeFeeUsdForVanilla,
  setTradeFeeUsdForSpread,
  sizeForVanilla,
  sizeForSpread,
  setSizeForVanilla,
  setSizeForSpread,
  availableSizeForVanilla,
  availableSizeForSpread,
  handleCalculateRiskPremium,
  handleInitializeInputValues,
}: OptionPreviewTradeInputProps) {
  const [focusedInput, setFocusedInput] = useState<FocusedInput>(null);

  const { chain } = useAppSelector(state => state.network) as NetworkState;

  if (QA_INFO[chain][quoteAsset as keyof typeof QA_INFO[typeof chain]] === undefined) {
    setQuoteAsset(NetworkQuoteAsset[chain].USDC);
  }

  const spotAssetIndexMap = useAppSelector((state: any) => state.market.spotAssetIndexMap) as SpotAssetIndexMap;

  const throttledUnderlyingFutures = useThrottledValue(underlyingFutures, 60 * 1000);

  const underlyingAssetSpotIndex = spotAssetIndexMap[underlyingAsset];
  const normalizedQuoteAsset = convertQuoteAssetToNormalizedSpotAsset(quoteAsset, false);

  if (!normalizedQuoteAsset) return null;
  
  const quoteAssetSpotIndex = spotAssetIndexMap[normalizedQuoteAsset];

  const isCall = optionDirection === "Call";
  const isBuy = orderSide === "Buy";

  const handleInputFocus = (inputType: FocusedInput) => {
    setFocusedInput(inputType);
  };

  // update value when focused input is size
  useEffect(() => {
    if (focusedInput !== "size") return;

    if (sizeForVanilla === "0" || sizeForSpread === "0") {
      handleInitializeInputValues();
      return;
    }
    
    const rpRateForVanilla = handleCalculateRiskPremium(sizeForVanilla, isBuy, true);
    const rpRateForSpread = handleCalculateRiskPremium(sizeForSpread, isBuy, false);
    const riskPremiumForVanilla = markPriceForVanilla * rpRateForVanilla;
    const riskPremiumForSpread = markPriceForSpread * rpRateForSpread;

    const executionPriceForVanilla = isBuy
      ? markPriceForVanilla + riskPremiumForVanilla
      : markPriceForVanilla - riskPremiumForVanilla;
    const executionPriceForSpread = isBuy
      ? markPriceForSpread + riskPremiumForSpread
      : markPriceForSpread - riskPremiumForSpread;

    setRiskPremiumForVanilla(riskPremiumForVanilla);
    setRiskPremiumForSpread(riskPremiumForSpread);
    setExecutionPriceForVanilla(executionPriceForVanilla);
    setExecutionPriceForSpread(executionPriceForSpread);

    const totalExecutionPriceForVanilla = Number(sizeForVanilla) * executionPriceForVanilla;
    const totalExecutionPriceForSpread = Number(sizeForSpread) * executionPriceForSpread;

    const tradeFeeRateForVanilla = isBuy
      ? FEE_RATES.OPEN_BUY_NAKED_POSITION
      : FEE_RATES.OPEN_SELL_NAKED_POSITION;
    const tradeFeeRateForSpread = FEE_RATES.OPEN_COMBO_POSITION;

    const tradeFeeUsdForVanilla = new BN(underlyingAssetSpotIndex)
      .multipliedBy(sizeForVanilla)
      .multipliedBy(tradeFeeRateForVanilla)
      .toNumber();

    const tradeFeeUsdForSpread = new BN(underlyingAssetSpotIndex)
      .multipliedBy(sizeForSpread)
      .multipliedBy(tradeFeeRateForSpread)
      .toNumber();

    const maxTradeFeeUsdForVanilla = new BN(totalExecutionPriceForVanilla)
      .multipliedBy(TRADE_FEE_CALCULATION_LIMIT_RATE)
      .toNumber();
    const maxTradeFeeUsdForSpread = new BN(totalExecutionPriceForSpread)
      .multipliedBy(TRADE_FEE_CALCULATION_LIMIT_RATE)
      .toNumber();

    const tradeFeeUsdAfterMaxForVanilla =
      tradeFeeUsdForVanilla > maxTradeFeeUsdForVanilla ? maxTradeFeeUsdForVanilla : tradeFeeUsdForVanilla;
    const tradeFeeUsdAfterMaxForSpread =
      tradeFeeUsdForSpread > maxTradeFeeUsdForSpread ? maxTradeFeeUsdForSpread : tradeFeeUsdForSpread;

    setTradeFeeUsdForVanilla(tradeFeeUsdAfterMaxForVanilla);
    setTradeFeeUsdForSpread(tradeFeeUsdAfterMaxForSpread);

    const quoteAssetValueForVanilla = isBuy
      ? new BN(sizeForVanilla)
          .multipliedBy(executionPriceForVanilla)
          .plus(tradeFeeUsdAfterMaxForVanilla)
          .toNumber()
      : new BN(sizeForVanilla).multipliedBy(executionPriceForVanilla).toNumber();

    const quoteAssetValueForSpread = isBuy
      ? new BN(sizeForSpread)
          .multipliedBy(executionPriceForSpread)
          .plus(tradeFeeUsdAfterMaxForSpread)
          .toNumber()
      : new BN(sizeForSpread).multipliedBy(executionPriceForSpread).toNumber();

    const quoteAssetAmountForVanilla = new BN(quoteAssetValueForVanilla)
      .dividedBy(quoteAssetSpotIndex)
      .toString();
    const quoteAssetAmountForSpread = new BN(quoteAssetValueForSpread)
      .dividedBy(quoteAssetSpotIndex)
      .toString();

    setQuoteAssetValueForVanilla(quoteAssetValueForVanilla);
    setQuoteAssetValueForSpread(quoteAssetValueForSpread);
    setQuoteAssetAmountForVanilla(quoteAssetAmountForVanilla);
    setQuoteAssetAmountForSpread(quoteAssetAmountForSpread);

    if (!isBuy) {
      let collateralAssetAmountForVanilla = isCall
        ? sizeForVanilla
        : new BN(sizeForVanilla)
            .multipliedBy(selectedOption.strikePrice)
            .div(spotAssetIndexMap.usdc)
            .toFixed(QA_TICKER_TO_DECIMAL[chain][BaseQuoteAsset.USDC]);

      let collateralAssetAmountForSpread = new BN(sizeForSpread)
        .multipliedBy(Math.abs(selectedOption.strikePrice - selectedOptionPair.strikePrice))
        .div(spotAssetIndexMap.usdc)
        .toFixed(QA_TICKER_TO_DECIMAL[chain][BaseQuoteAsset.USDC]);

      const collateralAssetValueForVanilla = isCall
        ? new BN(collateralAssetAmountForVanilla)
            .multipliedBy(underlyingAssetSpotIndex)
            .plus(tradeFeeUsdAfterMaxForVanilla)
            .toNumber()
        : new BN(collateralAssetAmountForVanilla)
            .multipliedBy(spotAssetIndexMap.usdc)
            .plus(tradeFeeUsdAfterMaxForVanilla)
            .toNumber();

      const collateralAssetValueForSpread = new BN(collateralAssetAmountForSpread)
        .multipliedBy(spotAssetIndexMap.usdc)
        .plus(tradeFeeUsdAfterMaxForSpread)
        .toNumber();

      const normalizedCollateralAssetForVanilla = convertQuoteAssetToNormalizedSpotAsset(collateralAssetForVanilla, false);
      const normalizedCollateralAssetForSpread = convertQuoteAssetToNormalizedSpotAsset(collateralAssetForSpread, false);

      if (!normalizedCollateralAssetForVanilla || !normalizedCollateralAssetForSpread) return;
      
      const collateralAssetSpotPriceForVanilla = spotAssetIndexMap[normalizedCollateralAssetForVanilla];
      const collateralAssetSpotPriceForSpread = spotAssetIndexMap[normalizedCollateralAssetForSpread];

      collateralAssetAmountForVanilla = new BN(collateralAssetValueForVanilla)
        .dividedBy(collateralAssetSpotPriceForVanilla)
        .toString();
      collateralAssetAmountForSpread = new BN(collateralAssetValueForSpread)
        .dividedBy(collateralAssetSpotPriceForSpread)
        .toString();

      setCollateralAssetAmountForVanilla(collateralAssetAmountForVanilla);
      setCollateralAssetAmountForSpread(collateralAssetAmountForSpread);
    }
  }, [
    optionStrategy,
    sizeForVanilla,
    sizeForSpread,
    markPriceForVanilla,
    markPriceForSpread,
    throttledUnderlyingFutures,
    quoteAsset,
  ]);

  // update value when focused input is pay
  useEffect(() => {
    if (focusedInput !== "pay" || orderSide === "Sell") return;

    if (quoteAssetAmountForVanilla === "0" || quoteAssetAmountForSpread === "0") {
      handleInitializeInputValues();
      return;
    }

    const quoteAssetValueForVanilla = new BN(quoteAssetAmountForVanilla)
      .multipliedBy(quoteAssetSpotIndex)
      .toNumber();
    const quoteAssetValueForSpread = new BN(quoteAssetAmountForSpread)
      .multipliedBy(quoteAssetSpotIndex)
      .toNumber();

    setQuoteAssetValueForVanilla(quoteAssetValueForVanilla);
    setQuoteAssetValueForSpread(quoteAssetValueForSpread);

    const estimatedSizeForVanilla =
      basedExecutionPriceForVanilla === 0 ? 0 : quoteAssetValueForVanilla / basedExecutionPriceForVanilla;
    const estimatedSizeForSpread =
      basedExecutionPriceForSpread === 0 ? 0 : quoteAssetValueForSpread / basedExecutionPriceForSpread;

    const rpRateForVanilla = handleCalculateRiskPremium(String(estimatedSizeForVanilla), isBuy, true);
    const rpRateForSpread = handleCalculateRiskPremium(String(estimatedSizeForSpread), isBuy, false);

    const riskPremiumForVanilla = isBuy
      ? markPriceForVanilla * rpRateForVanilla
      : markPriceForVanilla * -rpRateForVanilla;
    const riskPremiumForSpread = isBuy
      ? markPriceForSpread * rpRateForSpread
      : markPriceForSpread * -rpRateForSpread;

    const executionPriceForVanilla = markPriceForVanilla + riskPremiumForVanilla;
    const executionPriceForSpread = markPriceForSpread + riskPremiumForSpread;

    setRiskPremiumForVanilla(riskPremiumForVanilla);
    setRiskPremiumForSpread(riskPremiumForSpread);
    setExecutionPriceForVanilla(executionPriceForVanilla);
    setExecutionPriceForSpread(executionPriceForSpread);

    const tradeFeeRateForVanilla = isBuy
      ? FEE_RATES.OPEN_BUY_NAKED_POSITION
      : FEE_RATES.OPEN_SELL_NAKED_POSITION;
    const tradeFeeRateForSpread = FEE_RATES.OPEN_COMBO_POSITION;

    const tradeFeeUsdForVanilla = new BN(underlyingAssetSpotIndex)
      .multipliedBy(estimatedSizeForVanilla)
      .multipliedBy(tradeFeeRateForVanilla)
      .toNumber();

    const tradeFeeUsdForSpread = new BN(underlyingAssetSpotIndex)
      .multipliedBy(estimatedSizeForSpread)
      .multipliedBy(tradeFeeRateForSpread)
      .toNumber();

    const maxTradeFeeUsdForVanilla = new BN(quoteAssetValueForVanilla)
      .multipliedBy(TRADE_FEE_CALCULATION_LIMIT_RATE)
      .toNumber();
    const maxTradeFeeUsdForSpread = new BN(quoteAssetValueForSpread)
      .multipliedBy(TRADE_FEE_CALCULATION_LIMIT_RATE)
      .toNumber();

    const tradeFeeUsdAfterMaxForVanilla =
      tradeFeeUsdForVanilla > maxTradeFeeUsdForVanilla ? maxTradeFeeUsdForVanilla : tradeFeeUsdForVanilla;
    const tradeFeeUsdAfterMaxForSpread =
      tradeFeeUsdForSpread > maxTradeFeeUsdForSpread ? maxTradeFeeUsdForSpread : tradeFeeUsdForSpread;

    setTradeFeeUsdForVanilla(tradeFeeUsdAfterMaxForVanilla);
    setTradeFeeUsdForSpread(tradeFeeUsdAfterMaxForSpread);

    const feeAmountForVanilla = new BN(tradeFeeUsdAfterMaxForVanilla)
      .dividedBy(quoteAssetSpotIndex)
      .toNumber();
    const feeAmountForSpread = new BN(tradeFeeUsdAfterMaxForSpread).dividedBy(quoteAssetSpotIndex).toNumber();

    const payoutAmountAfterFeeForVanilla = new BN(quoteAssetAmountForVanilla)
      .minus(feeAmountForVanilla)
      .toNumber();
    const payoutAmountAfterFeeForSpread = new BN(quoteAssetAmountForSpread)
      .minus(feeAmountForSpread)
      .toNumber();

    const sizeForVanilla =
      executionPriceForVanilla === 0
        ? "0"
        : new BN(payoutAmountAfterFeeForVanilla)
            .multipliedBy(quoteAssetSpotIndex)
            .dividedBy(executionPriceForVanilla)
            .toString();

    const sizeForSpread =
      executionPriceForSpread === 0
        ? "0"
        : new BN(payoutAmountAfterFeeForSpread)
            .multipliedBy(quoteAssetSpotIndex)
            .dividedBy(executionPriceForSpread)
            .toString();

    setSizeForVanilla(sizeForVanilla);
    setSizeForSpread(sizeForSpread);
  }, [
    optionStrategy,
    quoteAssetAmountForVanilla,
    quoteAssetAmountForSpread,
    basedExecutionPriceForVanilla,
    basedExecutionPriceForSpread,
    markPriceForVanilla,
    markPriceForSpread,
    throttledUnderlyingFutures,
    quoteAsset,
  ]);

  return (
    <div className="flex flex-col w-[384px] h-[184px] px-[20px] py-[12px]">
      <OptionPreviewTradeInputSize
        optionStrategy={optionStrategy}
        sizeForVanilla={sizeForVanilla}
        sizeForSpread={sizeForSpread}
        setSizeForVanilla={setSizeForVanilla}
        setSizeForSpread={setSizeForSpread}
        availableSizeForVanilla={availableSizeForVanilla}
        availableSizeForSpread={availableSizeForSpread}
        handleInputFocus={handleInputFocus}
      />
      <div className="h-[24px]" />
      {orderSide === "Buy" ? (
        <OptionPreviewTradeInputPayForBuy
          optionStrategy={optionStrategy}
          quoteAsset={quoteAsset}
          setQuoteAsset={setQuoteAsset}
          quoteAssetAmountForVanilla={quoteAssetAmountForVanilla}
          quoteAssetAmountForSpread={quoteAssetAmountForSpread}
          setQuoteAssetAmountForVanilla={setQuoteAssetAmountForVanilla}
          setQuoteAssetAmountForSpread={setQuoteAssetAmountForSpread}
          handleInputFocus={handleInputFocus}
        />
      ) : (
        <OptionPreviewTradeInputPayForSell
          optionStrategy={optionStrategy}
          collateralAssetForVanilla={collateralAssetForVanilla}
          collateralAssetForSpread={collateralAssetForSpread}
          collateralAssetAmountForVanilla={collateralAssetAmountForVanilla}
          collateralAssetAmountForSpread={collateralAssetAmountForSpread}
          setCollateralAssetAmountForVanilla={setCollateralAssetAmountForVanilla}
          setCollateralAssetAmountForSpread={setCollateralAssetAmountForSpread}
          handleInputFocus={handleInputFocus}
        />
      )}
    </div>
  );
}

export default OptionPreviewTradeInput;

interface OptionPreviewTradeInputSizeProps {
  optionStrategy: OptionStrategy;
  sizeForVanilla: string;
  sizeForSpread: string;
  setSizeForVanilla: (size: string) => void;
  setSizeForSpread: (size: string) => void;
  availableSizeForVanilla: number;
  availableSizeForSpread: number;
  handleInputFocus: (inputType: FocusedInput) => void;
}

function OptionPreviewTradeInputSize({
  optionStrategy,
  sizeForVanilla,
  sizeForSpread,
  setSizeForVanilla,
  setSizeForSpread,
  availableSizeForVanilla,
  availableSizeForSpread,
  handleInputFocus,
}: OptionPreviewTradeInputSizeProps) {
  return (
    <div className="flex flex-col w-full h-full">
      <div className="flex flex-row justify-between items-center h-[16px]">
        <p className="text-[13px] text-grayb3 font-semibold leading-[16px]">Option Size</p>
        <WithTooltip
          tooltipContent={
            <p className={twJoin("leading-[0.85rem] text-[12px] font-[600]")}>
              Max Amount OLPs allowed for traders to open positions depending on free liquidity.
            </p>
          }
          tooltipClassName={twJoin("w-[260px] h-fit")}
          className={twJoin("w-fit")}
        >
          <p className={twJoin("w-full text-[11px] text-grayb3 font-medium leading-[14px]")}>
            <span className="border-b-[1px] border-dashed border-b-greenc1">{`${advancedFormatNumber(
              optionStrategy === "Vanilla" ? availableSizeForVanilla : availableSizeForSpread,
              4,
              ""
            )} Available`}</span>
          </p>
        </WithTooltip>
      </div>

      <div className="h-[12px]" />

      <div className="flex flex-row items-center justify-between pl-[18px] pr-[12px] py-[6px] bg-black17 rounded-[6px] border-[1px] border-black29">
        <input
          value={optionStrategy === "Vanilla" ? sizeForVanilla : sizeForSpread}
          placeholder="0"
          className={twJoin(
            "w-[230px]",
            "text-[16px] text-greene6 font-semibold bg-transparent leading-[28px]",
            "focus:outline-none",
            "placeholder:text-[16px] placeholder-gray80 placeholder:font-semibold"
          )}
          onChange={(e) => {
            if (e.target.value.includes(" ")) return;
            if (isNaN(Number(e.target.value))) return;
            if (e.target.value === "") {
              setSizeForVanilla("0");
              setSizeForSpread("0");

              return;
            }

            setSizeForVanilla(e.target.value.replace(/^0+(?=\d)/, ""));
            setSizeForSpread(e.target.value.replace(/^0+(?=\d)/, ""));
          }}
          onFocus={() => handleInputFocus("size")}
        />
        <div className="flex flex-row items-center ml-[6px]">
          <p className="text-[14px] text-gray80 font-semibold leading-[28px]">Contracts</p>
        </div>
      </div>
    </div>
  );
}

interface OptionPreviewTradeInputPayForBuyProps {
  optionStrategy: OptionStrategy;
  quoteAsset: NetworkQuoteAsset<SupportedChains>;
  setQuoteAsset: (quoteAsset: NetworkQuoteAsset<SupportedChains>) => void;
  quoteAssetAmountForVanilla: string;
  quoteAssetAmountForSpread: string;
  setQuoteAssetAmountForVanilla: (amount: string) => void;
  setQuoteAssetAmountForSpread: (amount: string) => void;
  handleInputFocus: (inputType: FocusedInput) => void;
}

function OptionPreviewTradeInputPayForBuy({
  optionStrategy,
  quoteAsset,
  setQuoteAsset,
  quoteAssetAmountForVanilla,
  quoteAssetAmountForSpread,
  setQuoteAssetAmountForVanilla,
  setQuoteAssetAmountForSpread,
  handleInputFocus,
}: OptionPreviewTradeInputPayForBuyProps) {
  const { balance: quoteAssetBalanceForVanilla } = useQuoteAssetInfo(quoteAsset, quoteAssetAmountForVanilla);
  const { balance: quoteAssetBalanceForSpread } = useQuoteAssetInfo(quoteAsset, quoteAssetAmountForSpread);

  const quoteAssetBalance =
    optionStrategy === "Vanilla" ? quoteAssetBalanceForVanilla : quoteAssetBalanceForSpread;

  return (
    <div className="flex flex-col w-full h-full">
      <div className="flex flex-row justify-between items-center h-[16px]">
        <p className="text-[13px] text-grayb3 font-semibold leading-[16px]">You Pay</p>
        <div className="flex flex-row justify-end">
          <p className="text-[11px] text-grayb3 font-medium leading-[16px]">
            {advancedFormatNumber(Number(quoteAssetBalance), 4, "")}
          </p>
          <div className="w-[8px]" />
          <div
            className={twJoin(
              "cursor-pointer",
              "flex flex-row justify-center items-center",
              "text-[11px] text-greene6 font-bold",
              "hover:text-whitef5 active:opacity-30 active:scale-95"
            )}
            onClick={() => {
              const newValue = handleMaxValue(quoteAssetBalance);
              if (isNaN(Number(newValue))) return;

              setQuoteAssetAmountForVanilla(newValue);
              setQuoteAssetAmountForSpread(newValue);
              handleInputFocus("pay");
            }}
          >
            MAX
          </div>
        </div>
      </div>

      <div className="h-[12px]" />

      <div className="flex flex-row justify-center items-center pl-[18px] pr-[6px] py-[6px] bg-black17 rounded-[6px] border-[1px] border-black29">
        <input
          value={optionStrategy === "Vanilla" ? quoteAssetAmountForVanilla : quoteAssetAmountForSpread}
          placeholder="0"
          className={twJoin(
            "w-full",
            "text-[16px] text-greene6 font-semibold bg-transparent leading-[28px]",
            "focus:outline-none",
            "placeholder:text-[16px] placeholder-gray80 placeholder:font-semibold"
          )}
          onChange={(e) => {
            if (e.target.value.includes(" ")) return;
            if (isNaN(Number(e.target.value))) return;
            if (e.target.value === "") {
              setQuoteAssetAmountForVanilla("0");
              setQuoteAssetAmountForSpread("0");
              return;
            }

            setQuoteAssetAmountForVanilla(e.target.value.replace(/^0+(?=\d)/, ""));
            setQuoteAssetAmountForSpread(e.target.value.replace(/^0+(?=\d)/, ""));
          }}
          onFocus={() => handleInputFocus("pay")}
        />
        <QuoteAssetSelector quoteAsset={quoteAsset} setQuoteAsset={setQuoteAsset} />
      </div>
    </div>
  );
}

interface OptionPreviewTradeInputPayForSellProps {
  optionStrategy: OptionStrategy;
  collateralAssetForVanilla: NetworkQuoteAsset<SupportedChains>;
  collateralAssetForSpread: NetworkQuoteAsset<SupportedChains>;
  collateralAssetAmountForVanilla: string;
  collateralAssetAmountForSpread: string;
  setCollateralAssetAmountForVanilla: (amount: string) => void;
  setCollateralAssetAmountForSpread: (amount: string) => void;
  handleInputFocus: (inputType: FocusedInput) => void;
}

function OptionPreviewTradeInputPayForSell({
  optionStrategy,
  collateralAssetForVanilla,
  collateralAssetForSpread,
  collateralAssetAmountForVanilla,
  collateralAssetAmountForSpread,
  setCollateralAssetAmountForVanilla,
  setCollateralAssetAmountForSpread,
  handleInputFocus,
}: OptionPreviewTradeInputPayForSellProps) {
  const { chain } = useAppSelector(state => state.network) as NetworkState;

  const { balance: collateralAssetBalanceForVanilla } = useQuoteAssetInfo(
    collateralAssetForVanilla,
    collateralAssetAmountForVanilla
  );
  const { balance: collateralAssetBalanceForSpread } = useQuoteAssetInfo(
    collateralAssetForSpread,
    collateralAssetAmountForSpread
  );

  const collateralAssetBalance =
    optionStrategy === "Vanilla" ? collateralAssetBalanceForVanilla : collateralAssetBalanceForSpread;

  return (
    <div className="flex flex-col w-full h-full">
      <div className="flex flex-row justify-between items-center h-[16px]">
        <p className="text-[13px] text-grayb3 font-semibold leading-[16px]">Collateral</p>
        <div className="flex flex-row justify-end">
          <p className="text-[11px] text-grayb3 font-medium leading-[16px]">
            {advancedFormatNumber(Number(collateralAssetBalance), 4, "")}
          </p>
          <div className="w-[8px]" />
          <div
            className={twJoin(
              "cursor-not-allowed",
              "flex flex-row justify-center items-center",
              "text-[11px] text-gray80 font-bold"
            )}
            onClick={() => {
              return;
              const newValue = handleMaxValue(collateralAssetBalance);
              if (isNaN(Number(newValue))) return;

              setCollateralAssetAmountForVanilla(newValue);
              setCollateralAssetAmountForSpread(newValue);
              handleInputFocus("pay");
            }}
          >
            MAX
          </div>
        </div>
      </div>

      <div className="h-[12px]" />

      <div className="flex flex-row items-center justify-between pl-[18px] pr-[12px] py-[6px] bg-black17 rounded-[6px] border-[1px] border-black29">
        <input
          value={
            optionStrategy === "Vanilla" ? collateralAssetAmountForVanilla : collateralAssetAmountForSpread
          }
          placeholder="0"
          readOnly
          className={twJoin(
            "w-[230px]",
            "text-[16px] text-grayb3 font-semibold bg-transparent leading-[28px]",
            "focus:outline-none cursor-default",
            "placeholder:text-[16px] placeholder-gray80 placeholder:font-semibold"
          )}
          onChange={(e) => {
            return;
            if (e.target.value.includes(" ")) return;
            if (isNaN(Number(e.target.value))) return;
            if (e.target.value === "") {
              setCollateralAssetAmountForVanilla("0");
              setCollateralAssetAmountForSpread("0");
              return;
            }

            setCollateralAssetAmountForVanilla(e.target.value.replace(/^0+(?=\d)/, ""));
            setCollateralAssetAmountForSpread(e.target.value.replace(/^0+(?=\d)/, ""));
          }}
          onFocus={() => handleInputFocus("pay")}
        />
        <div className="flex flex-row items-center gap-[8px] ml-[6px]">
          <img
            className="w-[18px] h-[18px]"
            src={
              QA_TICKER_TO_IMG[chain][
                optionStrategy === "Vanilla"
                  ? (collateralAssetForVanilla as keyof (typeof QA_TICKER_TO_IMG)[typeof chain])
                  : (collateralAssetForSpread as keyof (typeof QA_TICKER_TO_IMG)[typeof chain])
              ]
            }
          />
          <p className="text-[14px] text-gray80 font-semibold leading-[28px]">
            {optionStrategy === "Vanilla" ? collateralAssetForVanilla : collateralAssetForSpread}
          </p>
        </div>
      </div>
    </div>
  );
}
