import { IOptionDetail } from "@/interfaces/interfaces.marketSlice";
import { advancedFormatNumber, calculateEstimatedIV } from "@/utils/helper";
import { OptionDirection, OptionStrategy, OrderSide, PriceUnit } from "@/utils/types";
import { useMemo } from "react";
import { twJoin } from "tailwind-merge";
import {
  calculateBreakEvenPointV2,
  calculateBidAskPrice,
} from "../utils/calculations";
import { SpotAssetIndexMap, UnderlyingAsset, VolatilityScore } from "@moby/shared";
import { useAppSelector } from "@/store/hooks";
import { MIN_MARK_PRICE_FOR_BUY_POSITION } from "@/constants/constants.position";
import { NetworkState } from "@/networks/types";
import Tippy from "@tippyjs/react";

interface OptionChainTableBodyRowProps {
  option: IOptionDetail;
  selectedOption: IOptionDetail;
  handleOptionSelection: (option: IOptionDetail) => void;
  orderSideForSelectedOption: OrderSide | null;
  optionStrategyForSelectedOption: OptionStrategy | null;
  selectedUnderlyingAsset: UnderlyingAsset;
  selectedOptionDirection: OptionDirection;
  selectedOrderSide: OrderSide;
  selectedOptionStrategy: OptionStrategy;
  selectedPriceUnit: PriceUnit;
  underlyingFutures: number;
  extractedOptions: { [key: string]: IOptionDetail };
  maxVolume: number;
  optionPair: IOptionDetail;
}

const MIN_VOLUME_BAR_WIDTH = 3;
const PERCENTAGE_MULTIPLIER = 100;

function OptionChainTableBodyRow({
  option,
  selectedOption,
  handleOptionSelection,
  orderSideForSelectedOption,
  optionStrategyForSelectedOption,
  selectedUnderlyingAsset,
  selectedOptionDirection,
  selectedOrderSide,
  selectedOptionStrategy,
  selectedPriceUnit,
  underlyingFutures,
  extractedOptions,
  maxVolume,
  optionPair,
}: OptionChainTableBodyRowProps) {
  if (!option.instrument) return null;

  const { chain } = useAppSelector((state) => state.network) as NetworkState;
  const olpStats = useAppSelector((state: any) => state.market.olpStats);
  const spotAssetIndexMap = useAppSelector((state: any) => state.market.spotAssetIndexMap) as SpotAssetIndexMap;
  const volatilityScore = useAppSelector((state: any) => state.market.volatilityScore) as VolatilityScore;

  const underlyingAssetSpotIndex = spotAssetIndexMap[selectedUnderlyingAsset];
  const underlyingAssetVolatilityScore = volatilityScore[selectedUnderlyingAsset];

  const bidAskPrice = useMemo(() => {
    return calculateBidAskPrice(
      selectedOrderSide,
      selectedOptionStrategy,
      option,
      optionPair,
      chain,
      olpStats,
      underlyingFutures,
      underlyingAssetSpotIndex,
      underlyingAssetVolatilityScore
    );
  }, [option, selectedOrderSide, selectedOptionStrategy, optionPair, chain, olpStats, underlyingFutures, underlyingAssetSpotIndex, underlyingAssetVolatilityScore]);

  const price = useMemo(() => {
    if (selectedPriceUnit === "USD") {
      return bidAskPrice;
    }
    return underlyingFutures ? bidAskPrice / underlyingFutures : 0;
  }, [bidAskPrice, selectedPriceUnit, underlyingFutures]);

  const iv = useMemo(() => {
    let markIv = 0;
    let markPrice = 0;
    let vega = 0;

    switch (selectedOptionStrategy) {
      case "Vanilla":
        markIv = option.markIv;
        markPrice = option.markPrice;
        vega = option.vega;
        break;
      case "Spread":
        markIv = (option.markIv + optionPair.markIv) / 2;
        markPrice = Math.abs(option.markPrice - optionPair.markPrice);
        vega = (option.vega + optionPair.vega) / 2;
        break;
    }

    return calculateEstimatedIV(markIv, markPrice, bidAskPrice, vega, selectedOrderSide === "Buy");
  }, [bidAskPrice, option, selectedOrderSide, optionPair, selectedOptionStrategy]);

  // const bep = useMemo(() => {
  //   const { expiry } = parseInstrument(option.instrument || "");
  //   return calculateBreakEvenPoint({
  //     expiry: expiry,
  //     orderSide: selectedOrderSide,
  //     options: [option, optionPair],
  //     tickerInterval: UA_TICKER_TO_TICKER_INTERVAL[chain][selectedUnderlyingAsset],
  //   });
  // }, [selectedOrderSide, option, optionPair]);

  const bepV2 = useMemo(() => {
    return calculateBreakEvenPointV2({
      orderSide: selectedOrderSide,
      optionStrategy: selectedOptionStrategy,
      options: [option, optionPair],
    });
  }, [selectedOrderSide, selectedOptionStrategy, option, optionPair]);

  const toBep = useMemo(() => {
    if (!underlyingFutures) return 0;
    return ((bepV2 - underlyingFutures) / underlyingFutures) * PERCENTAGE_MULTIPLIER;
  }, [bepV2, underlyingFutures]);

  const priceChange24h = useMemo(() => {
    const extractedOption = extractedOptions[option.instrument || ""];
    const extractedOptionPair = extractedOptions[optionPair.instrument || ""];

    if (!extractedOption) return 0;
    if (selectedOptionStrategy === "Spread" && !extractedOptionPair) return 0;

    const previousPrice = calculateBidAskPrice(
      selectedOrderSide,
      selectedOptionStrategy,
      extractedOption,
      extractedOptionPair,
      chain,
      olpStats,
      underlyingFutures,
      underlyingAssetSpotIndex,
      underlyingAssetVolatilityScore
    );

    if (!previousPrice) return 0;
    return ((bidAskPrice - previousPrice) / previousPrice) * PERCENTAGE_MULTIPLIER;
  }, [
    selectedOrderSide,
    extractedOptions,
    bidAskPrice,
    option,
    optionPair,
    selectedOptionStrategy,
    chain,
    olpStats,
    underlyingFutures,
    underlyingAssetSpotIndex,
    underlyingAssetVolatilityScore,
  ]);

  const volumeBarWidth = useMemo(() => {
    if (!option.volume || !maxVolume) return 1;
    return Math.max((option.volume / maxVolume) * PERCENTAGE_MULTIPLIER, MIN_VOLUME_BAR_WIDTH);
  }, [option.volume, maxVolume]);

  const isSelected =
    option.instrument === selectedOption.instrument &&
    selectedOrderSide === orderSideForSelectedOption &&
    selectedOptionStrategy === optionStrategyForSelectedOption;

  return (
    <div
      className={twJoin(
        "flex flex-row items-center w-full px-[20px] py-[12px] gap-[18px]",
        "text-[13px] text-[#f5f5f5] font-ibm font-semibold leading-[24px]",
        "hover:bg-black17"
      )}
    >
      {/* Strike Price */}
      <StrikePriceDisplay
        strikePrice={option.strikePrice}
        optionDirection={selectedOptionDirection}
        optionStrategy={selectedOptionStrategy}
        optionPair={optionPair}
      />

      {/* Break Even */}
      <BreakEvenDisplay price={bepV2} />

      {/* To Break Even */}
      <ChangePercentageDisplay value={toBep} />

      {/* Spacer */}
      <div className="w-[18px] min-w-[18px] max-w-[18px]"></div>

      {/* Price & IV */}
      <BuySellButton
        option={option}
        bidAskPrice={bidAskPrice}
        price={price}
        iv={iv}
        orderSide={selectedOrderSide}
        selectedPriceUnit={selectedPriceUnit}
        isSelected={isSelected}
        handleOptionSelection={handleOptionSelection}
      />

      {/* 24H Change */}
      <ChangePercentageDisplay value={priceChange24h} showColor={true} />

      {/* Spacer */}
      <div className="w-[18px] min-w-[18px] max-w-[18px]"></div>

      {/* Volume */}
      <VolumeDisplay volume={option.volume} volumeBarWidth={volumeBarWidth} />
    </div>
  );
}

export default OptionChainTableBodyRow;

function StrikePriceDisplay({
  strikePrice,
  optionDirection,
  optionStrategy,
  optionPair,
}: {
  strikePrice: number;
  optionDirection: OptionDirection;
  optionStrategy: OptionStrategy;
  optionPair: IOptionDetail;
}) {
  return (
    <div className="flex flex-row items-center gap-[6px] w-full min-w-[160px] max-w-[252px]">
      <p className="">
        {advancedFormatNumber(strikePrice, 0, "")} <span className="text-[13px]">{optionDirection}</span>
      </p>
      {optionStrategy === "Spread" && (
        <p
          className={twJoin(
            "h-[14px] text-[11px] text-gray80 font-medium leading-[13px]",
            optionDirection === "Call" ? "border-t-[1px] border-t-gray80" : "border-b-[1px] border-b-gray80"
          )}
        >
          {optionPair.strikePrice}
        </p>
      )}
    </div>
  );
}

function BreakEvenDisplay({ price }: { price: number }) {
  return (
    <div className="w-full min-w-[90px] max-w-[144px] text-right">
      <p className="">{advancedFormatNumber(price, 0, "$")}</p>
    </div>
  );
}

function ChangePercentageDisplay({ value, showColor = false }: { value: number; showColor?: boolean }) {
  const sign = value >= 0 ? "+" : "-";
  const absValue = Math.abs(value);

  let textColor = "text-[#f5f5f5]"; // 기본 색상

  if (showColor) {
    if (value > 0) {
      textColor = "text-green63"; // 초록색
    } else if (value < 0) {
      textColor = "text-redff33"; // 빨간색
    }
  }

  return (
    <div className="w-full min-w-[90px] max-w-[144px] text-right">
      <div className="flex flex-row items-center justify-end">
        <p className={textColor}>{sign}</p>
        <p className={textColor}>{advancedFormatNumber(absValue, 2, "")}%</p>
      </div>
    </div>
  );
}

function BuySellButton({
  option,
  bidAskPrice,
  price,
  iv,
  orderSide,
  selectedPriceUnit,
  isSelected,
  handleOptionSelection,
}: {
  option: IOptionDetail;
  bidAskPrice: number;
  price: number;
  iv: number;
  orderSide: OrderSide;
  selectedPriceUnit: PriceUnit;
  isSelected: boolean;
  handleOptionSelection: (option: IOptionDetail) => void;
}) {
  const isBuy = orderSide === "Buy";

  const minMarkPriceForBuy =
    MIN_MARK_PRICE_FOR_BUY_POSITION[option.instrument?.split("-")[0] as UnderlyingAsset];

  const isAvailable = bidAskPrice >= minMarkPriceForBuy;

  const baseStyles = {
    container: twJoin(
      "group cursor-pointer",
      "flex flex-row items-center justify-between",
      "w-full h-[44px] rounded-[6px]",
      "px-[18px] py-[6px] active:scale-95 active:opacity-30",
      isSelected ? (isBuy ? "bg-green63" : "bg-redff33") : "bg-[#292929]",
      !isSelected && "hover:bg-black33",
      !isAvailable && "!cursor-not-allowed !opacity-30 active:!scale-100"
    ),
    price: twJoin(
      "h-[18px] font-semibold leading-[18px]",
      isSelected ? "!text-black17 !font-bold" : isBuy ? "text-redff33" : "text-green63"
    ),
    iv: twJoin(
      "h-[14px] text-[11px] font-medium leading-[14px]",
      isSelected ? "!text-black17 !font-bold" : "text-[#f5f5f5]"
    ),
    orderSide: twJoin(
      "text-gray52 font-semibold leading-[18px]",
      isSelected ? "!text-black17 !font-bold" : "",
      !isSelected && (isBuy ? "group-hover:!text-green63" : "group-hover:!text-redff33")
    ),
  };

  const BuyEnableContent = () => {
    return (
      <div
        className={twJoin(
          "w-[184px] h-[40px] px-[12px] py-[6px] bottom-[40px] -left-[12px]",
          "bg-black1f rounded-[4px] border-[1px] border-[rgba(224,224,224,.1)] shadow-[0_0_8px_0_rgba(10,10,10,.72)]",
          isAvailable ? "hidden" : "block"
        )}
      >
        <p className="text-[12px] text-gray80 font-semibold leading-[0.75rem]">{`Option Price is less than minimum order price, $${minMarkPriceForBuy}`}</p>
      </div>
    );
  };

  return (
    <Tippy content={<BuyEnableContent />} animation={false} offset={[120, -50]} hideOnClick={false}>
      <div className="w-full min-w-[160px] max-w-[252px]">
        <div
          className={baseStyles.container}
          onClick={(e) => {
            if (!isAvailable) return;
            handleOptionSelection(option);
          }}
        >
          <div className="flex flex-col items-start justify-start">
            <p className={baseStyles.price}>
              {advancedFormatNumber(
                price,
                selectedPriceUnit === "USD" ? 2 : 4,
                selectedPriceUnit === "USD" ? "$" : ""
              )}
            </p>
            <p className={baseStyles.iv}>{advancedFormatNumber(iv * 100, 2, "")}%</p>
          </div>
          <div className="flex flex-row items-center justify-center">
            <p className={baseStyles.orderSide}>{orderSide}</p>
          </div>
        </div>
      </div>
    </Tippy>
  );
}

function VolumeDisplay({ volume, volumeBarWidth }: { volume: number; volumeBarWidth: number }) {
  return (
    <div className="w-full min-w-[90px] max-w-[144px]">
      <div className="h-[6px] bg-[#E6FC8D] bg-opacity-40" style={{ width: `${volumeBarWidth}%` }} />
      <p className="h-[14px] text-[11px] text-gray80 font-normal">
        {advancedFormatNumber(volume / 1000, 2, "$")}K
      </p>
    </div>
  );
}
