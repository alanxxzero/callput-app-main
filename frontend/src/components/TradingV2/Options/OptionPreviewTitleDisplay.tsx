import { IMarketSlice, IOptionDetail } from "@/interfaces/interfaces.marketSlice";
import { UnderlyingAsset } from "@moby/shared";
import { advancedFormatNumber } from "@/utils/helper";
import { OptionDirection, OrderSide, OptionStrategy } from "@/utils/types";
import { useEffect, useRef, useState } from "react";
import { twJoin } from "tailwind-merge";
import IconSelectedOptionArrowUp from "@assets/icon-selected-option-arrow-up.svg";
import IconSelectedOptionArrowDown from "@assets/icon-selected-option-arrow-down.svg";
import IconDropboxSel from "@assets/trading-v2/icon-dropbox-sel.png";
import { findOptionPairs, getBestOptionPair, getGreeks } from "../utils/options";
import { useAppSelector } from "@/store/hooks";
import { Strategy } from "@moby/shared";

interface OptionPreviewTitleDisplayProps {
  selectedOption: IOptionDetail;
  underlyingAsset: UnderlyingAsset;
  expiry: number;
  optionDirection: OptionDirection;
  orderSide: OrderSide;
  optionStrategy: OptionStrategy;
  selectedOptionPair: IOptionDetail;
  setSelectedOptionPair: (optionPair: IOptionDetail) => void;
  strategy: Strategy;
}

function OptionPreviewTitleDisplay({
  selectedOption,
  underlyingAsset,
  expiry,
  optionDirection,
  orderSide,
  optionStrategy,
  selectedOptionPair,
  setSelectedOptionPair,
  strategy,
}: OptionPreviewTitleDisplayProps) {
  const [optionList, setOptionList] = useState<IOptionDetail[]>([]);
  const [optionPairList, setOptionPairList] = useState<IOptionDetail[]>([]);
  const [isOptionPairListOpen, setIsOptionPairListOpen] = useState<boolean>(false);

  const optionPairListRef = useRef<HTMLDivElement>(null);

  const marketData = useAppSelector((state: any) => state.market) as IMarketSlice;
  const market = marketData.market;

  // 동일한 만기일의 모든 옵션 목록 설정
  useEffect(() => {
    if (expiry === 0) return setOptionList([]);

    const marketExpiries = market[underlyingAsset].expiries;

    if (marketExpiries.length === 0) return setOptionList([]);
    if (!marketExpiries.includes(expiry)) return setOptionList([]);

    const targetOptions =
      optionDirection === "Call"
        ? market[underlyingAsset].options[expiry].call
        : market[underlyingAsset].options[expiry].put;

    const filteredTargetOptions = targetOptions.filter((option: IOptionDetail) => option.isOptionAvailable);

    setOptionList(filteredTargetOptions);
  }, [market, underlyingAsset, expiry, optionDirection]);

  useEffect(() => {
    const optionPairList = findOptionPairs(orderSide, selectedOption, optionList);
    setOptionPairList(optionPairList);

    const isCurrentOptionPairValid = optionPairList.some(
      (option) => option.optionId === selectedOptionPair.optionId
    );

    if (!isCurrentOptionPairValid) {
      const bestOptionPair = getBestOptionPair(orderSide, selectedOption, optionPairList);
      setSelectedOptionPair(bestOptionPair);
    }
  }, [optionList, orderSide]);

  useEffect(() => {
    const optionPairList = findOptionPairs(orderSide, selectedOption, optionList);
    setOptionPairList(optionPairList);

    const bestOptionPair = getBestOptionPair(orderSide, selectedOption, optionPairList);
    setSelectedOptionPair(bestOptionPair);
  }, [selectedOption]);

  useEffect(() => {
    const handleOptionPairListClick = (event: MouseEvent) => {
      if (optionPairListRef.current?.contains(event.target as Node)) return;
      setIsOptionPairListOpen(false);
    };

    document.body.addEventListener("click", handleOptionPairListClick);
    return () => document.body.removeEventListener("click", handleOptionPairListClick);
  }, []);

  const handleOptionPairSelect = (option: IOptionDetail) => {
    setSelectedOptionPair(option);
    setIsOptionPairListOpen(false);
  };

  const greeks = getGreeks({
    strategy,
    size: 1,
    mainOption: selectedOption,
    pairedOption: selectedOptionPair,
  });

  return (
    <div className="flex flex-col w-[384px] h-[133px] px-[20px] pt-[12px] pb-[16px]">
      <div className="flex flex-col gap-[4px]">
        <OptionDisplay
          orderSide={orderSide}
          optionDirection={optionDirection}
          optionStrategy={optionStrategy}
        />
        <div className="flex flex-row gap-[6px] h-[27px]">
          <p className="text-[18px] font-bold font-ibm">{selectedOption.instrument}</p>
          {optionStrategy === "Spread" && (
            <div ref={optionPairListRef}>
              <OptionPairSelector
                isOpen={isOptionPairListOpen}
                onToggle={() => setIsOptionPairListOpen(!isOptionPairListOpen)}
                selectedOptionPair={selectedOptionPair}
                optionPairList={optionPairList}
                onSelect={handleOptionPairSelect}
                optionDirection={optionDirection}
              />
            </div>
          )}
        </div>
      </div>

      <div className="h-[16px]" />
      <div className="flex flex-row gap-[16px] w-full h-[34px] mt-[16px]">
        <GreekValueDisplay label="Delta" value={greeks.delta} />
        <GreekValueDisplay label="Gamma" value={greeks.gamma} width="89px" decimalPlaces={6} />
        <GreekValueDisplay label="Vega" value={greeks.vega} />
        <GreekValueDisplay label="Theta" value={greeks.theta} />
      </div>
    </div>
  );
}

export default OptionPreviewTitleDisplay;

const OptionDisplay = ({
  orderSide,
  optionDirection,
  optionStrategy,
}: {
  orderSide: OrderSide;
  optionDirection: OptionDirection;
  optionStrategy: OptionStrategy;
}) => (
  <div className="flex flex-row gap-[8px] items-center h-fit">
    <p
      className={twJoin(
        "h-[22px] text-[18px] font-bold leading-normal",
        `${orderSide === "Buy" ? "text-green63" : "text-redc7"}`
      )}
    >
      {orderSide} {optionDirection} {optionStrategy === "Spread" && "Spread"}
    </p>
  </div>
);

const OptionPairSelector = ({
  isOpen,
  onToggle,
  selectedOptionPair,
  optionPairList,
  onSelect,
  optionDirection,
}: {
  isOpen: boolean;
  onToggle: () => void;
  selectedOptionPair: IOptionDetail;
  optionPairList: IOptionDetail[];
  onSelect: (option: IOptionDetail) => void;
  optionDirection: OptionDirection;
}) => (
  <div className="relative">
    <div
      className={twJoin(
        "cursor-pointer flex flex-row items-center justify-center",
        "w-fit h-[27px] pl-[6px] rounded-[4px] bg-black17",
        "hover:bg-black1f active:bg-transparent active:opacity-30 active:scale-95"
      )}
      onClick={onToggle}
    >
      <p
        className={twJoin(
          "text-[13px] text-gray80 font-semibold font-ibm leading-[18px]",
          optionDirection === "Call" ? "border-t-[1.4px] border-t-gray80" : "border-b-[1.4px] border-b-gray80"
        )}
      >
        {"$" + advancedFormatNumber(selectedOptionPair.strikePrice, 0, "")}
      </p>
      {isOpen ? (
        <img src={IconSelectedOptionArrowUp} alt="Close dropdown" />
      ) : (
        <img src={IconSelectedOptionArrowDown} alt="Open dropdown" />
      )}
    </div>
    {isOpen && (
      <div
        className={twJoin(
          "absolute z-10 top-[35px] left-0",
          "min-w-[96px] h-fit py-[4px] rounded-[2px] bg-black1f",
          "border-[1px] border-black33 shadow-[0_0_8px_0_rgba(10,10,10,.72)]"
        )}
      >
        {optionPairList.map((option) => {
          const isSelected = option.instrument === selectedOptionPair.instrument;
          return (
            <div
              key={option.instrument}
              className={twJoin(
                "cursor-pointer flex flex-row items-center",
                "w-full h-[28px] px-[10px] py-[6px]",
                "text-[11px] text-[#f5f5f5] font-semibold leading-[16px]",
                "hover:bg-black29 hover:text-[#e6fc8d]"
              )}
              onClick={() => onSelect(option)}
            >
              <p>{"$" + advancedFormatNumber(option.strikePrice, 0, "")}</p>
              <div className="w-[12px]" />
              {isSelected && <img src={IconDropboxSel} className="w-[16px] h-[16px]" alt="Selected" />}
            </div>
          );
        })}
      </div>
    )}
  </div>
);

const GreekValueDisplay = ({
  label,
  value,
  width = "73px",
  decimalPlaces = 2,
}: {
  label: string;
  value: number;
  width?: string;
  decimalPlaces?: number;
}) => (
  <div className={`flex flex-col gap-[2px] w-[${width}] h-[14px]`}>
    <p className="text-[11px] text-gray80 font-semibold leading-[14px]">{label}</p>
    <p className="text-[12px] text-grayb3 font-semibold font-ibm leading-[14px]">
      {advancedFormatNumber(value, decimalPlaces, "")}
    </p>
  </div>
);
