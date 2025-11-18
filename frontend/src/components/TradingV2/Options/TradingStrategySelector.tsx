import { OptionDirection, OptionStrategy, OrderSide, PriceUnit } from "@/utils/types";
import OptionStrategySelector from "./OptionStrategySelector";
import OptionDirectionSelector from "./OptionDirectionSelector";
import OrderSideSelector from "./OrderSideSelector";
import PriceUnitSelector from "./PriceUnitSelector";
import ExpiryInfoDisplay from "./ExpiryInfoDisplay";
import { UnderlyingAsset } from "@moby/shared";

interface TradingStrategySelectorProps {
  selectedUnderlyingAsset: UnderlyingAsset;
  selectedExpiry: number;
  selectedOptionDirection: OptionDirection;
  setSelectedOptionDirection: (optionDirection: OptionDirection) => void;
  selectedOrderSide: OrderSide;
  setSelectedOrderSide: (orderSide: OrderSide) => void;
  selectedOptionStrategy: OptionStrategy;
  setSelectedOptionStrategy: (optionStrategy: OptionStrategy) => void;
  selectedPriceUnit: PriceUnit;
  setSelectedPriceUnit: (priceUnit: PriceUnit) => void;
  underlyingFutures: number;
}

function TradingStrategySelector({
  selectedUnderlyingAsset,
  selectedExpiry,
  selectedOptionDirection,
  setSelectedOptionDirection,
  selectedOrderSide,
  setSelectedOrderSide,
  selectedOptionStrategy,
  setSelectedOptionStrategy,
  selectedPriceUnit,
  setSelectedPriceUnit,
  underlyingFutures,
}: TradingStrategySelectorProps) {
  return (
    <div className="flex flex-row items-center justify-between bg-black17 h-[60px] p-[12px] border-t-[1px] border-t-[#292929]">
      <div className="flex flex-row items-center gap-[24px]">
        <OptionStrategySelector
          selectedOptionStrategy={selectedOptionStrategy}
          setSelectedOptionStrategy={setSelectedOptionStrategy}
        />
        <OptionDirectionSelector
          selectedOptionDirection={selectedOptionDirection}
          setSelectedOptionDirection={setSelectedOptionDirection}
        />
        <OrderSideSelector
          selectedOrderSide={selectedOrderSide}
          setSelectedOrderSide={setSelectedOrderSide}
        />
      </div>
      <div className="flex flex-row items-center gap-[36px]">
        <PriceUnitSelector
          selectedUnderlyingAsset={selectedUnderlyingAsset}
          selectedPriceUnit={selectedPriceUnit}
          setSelectedPriceUnit={setSelectedPriceUnit}
        />
        <ExpiryInfoDisplay selectedExpiry={selectedExpiry} underlyingFutures={underlyingFutures} />
      </div>
    </div>
  );
}

export default TradingStrategySelector;
