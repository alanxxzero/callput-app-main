import { useState } from "react";
import OrderSummary from "./OrderSummary";
import ProfitSimulation from "./ProfitSimulation";
import SlippageSettings from "./SlippageSettings";
import ViewModeSelector, { ViewMode } from "./ViewModeSelector";
import { OptionDirection, OptionStrategy, OrderSide } from "@/utils/types";
import { IOptionDetail } from "@/interfaces/interfaces.marketSlice";
import { NetworkQuoteAsset, UnderlyingAsset } from "@moby/shared";
import { SupportedChains } from "@/networks/constants";

interface OptionPreviewTradeSummaryProps {
  selectedOption: IOptionDetail;
  underlyingAsset: UnderlyingAsset;
  expiry: number;
  optionDirection: OptionDirection;
  orderSide: OrderSide;
  optionStrategy: OptionStrategy;
  underlyingFutures: number;
  selectedOptionPair: IOptionDetail;
  markPriceForVanilla: number;
  markPriceForSpread: number;
  riskPremiumForVanilla: number;
  riskPremiumForSpread: number;
  executionPriceForVanilla: number;
  executionPriceForSpread: number;
  tradeFeeUsdForVanilla: number;
  tradeFeeUsdForSpread: number;
  quoteAsset: NetworkQuoteAsset<SupportedChains>;
  quoteAssetAmount: string;
  collateralAsset: NetworkQuoteAsset<SupportedChains>;
  collateralAssetAmount: string;
  size: string;
  executionPrice: number;
  slippage: number;
  setSlippage: (slippage: number) => void;
}

function OptionPreviewTradeSummary({
  selectedOption,
  underlyingAsset,
  expiry,
  optionDirection,
  orderSide,
  optionStrategy,
  underlyingFutures,
  selectedOptionPair,
  markPriceForVanilla,
  markPriceForSpread,
  riskPremiumForVanilla,
  riskPremiumForSpread,
  executionPriceForVanilla,
  executionPriceForSpread,
  tradeFeeUsdForVanilla,
  tradeFeeUsdForSpread,
  quoteAsset,
  quoteAssetAmount,
  collateralAsset,
  collateralAssetAmount,
  size,
  executionPrice,
  slippage,
  setSlippage,
}: OptionPreviewTradeSummaryProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("Order Summary");

  return (
    <div className="flex flex-col w-[384px] h-[322px] px-[20px] pt-[8px]">
      <ViewModeSelector viewMode={viewMode} setViewMode={setViewMode} />
      <div className="flex w-full min-h-[270px] p-[20px] bg-black17 rounded-b-[6px]">
        {viewMode === "Order Summary" && (
          <OrderSummary
            selectedOption={selectedOption}
            optionDirection={optionDirection}
            orderSide={orderSide}
            optionStrategy={optionStrategy}
            selectedOptionPair={selectedOptionPair}
            markPriceForVanilla={markPriceForVanilla}
            markPriceForSpread={markPriceForSpread}
            riskPremiumForVanilla={riskPremiumForVanilla}
            riskPremiumForSpread={riskPremiumForSpread}
            executionPriceForVanilla={executionPriceForVanilla}
            executionPriceForSpread={executionPriceForSpread}
            tradeFeeUsdForVanilla={tradeFeeUsdForVanilla}
            tradeFeeUsdForSpread={tradeFeeUsdForSpread}
            quoteAsset={quoteAsset}
            quoteAssetAmount={quoteAssetAmount}
            collateralAsset={collateralAsset}
            collateralAssetAmount={collateralAssetAmount}
            size={size}
          />
        )}
        {viewMode === "Profit Simulation" && (
          <ProfitSimulation
            selectedOption={selectedOption}
            underlyingAsset={underlyingAsset}
            expiry={expiry}
            optionDirection={optionDirection}
            orderSide={orderSide}
            optionStrategy={optionStrategy}
            underlyingFutures={underlyingFutures}
            selectedOptionPair={selectedOptionPair}
            size={size}
            executionPrice={executionPrice}
          />
        )}
        {viewMode === "Slippage Settings" && (
          <SlippageSettings slippage={slippage} setSlippage={setSlippage} />
        )}
      </div>
    </div>
  );
}

export default OptionPreviewTradeSummary;
