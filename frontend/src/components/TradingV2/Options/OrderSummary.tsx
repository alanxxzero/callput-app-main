import { IOptionDetail } from "@/interfaces/interfaces.marketSlice";
import { advancedFormatNumber } from "@/utils/helper";
import { OptionDirection, OptionStrategy, OrderSide } from "@/utils/types";
import { convertQuoteAssetToNormalizedSpotAsset, NetworkQuoteAsset, SpotAssetIndexMap } from "@moby/shared";
import { SupportedChains } from "@/networks/constants";
import { ReactNode } from "react";
import { useAppSelector } from "@/store/hooks";
import { BN } from "@/utils/bn";
import { twJoin } from "tailwind-merge";
import DisplayWithTooltip from "../DisplayWithToolTip";

interface OrderSummaryProps {
  selectedOption: IOptionDetail;
  optionDirection: OptionDirection;
  orderSide: OrderSide;
  optionStrategy: OptionStrategy;
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
}

function OrderSummary({
  selectedOption,
  optionDirection,
  orderSide,
  optionStrategy,
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
}: OrderSummaryProps) {
  const markPrice = optionStrategy === "Vanilla" ? markPriceForVanilla : markPriceForSpread;
  const riskPremium = optionStrategy === "Vanilla" ? riskPremiumForVanilla : riskPremiumForSpread;
  const executionPrice = optionStrategy === "Vanilla" ? executionPriceForVanilla : executionPriceForSpread;
  const subtotal = executionPrice * Number(size);
  const tradeFee = optionStrategy === "Vanilla" ? tradeFeeUsdForVanilla : tradeFeeUsdForSpread;

  const totalTitle = orderSide === "Buy" ? "Total Cost" : "Total Income";
  const totalValue = orderSide === "Buy" ? subtotal + tradeFee : subtotal - tradeFee;

  const spotAssetIndexMap = useAppSelector((state: any) => state.market.spotAssetIndexMap) as SpotAssetIndexMap;
  const normalizedCollateralAsset = convertQuoteAssetToNormalizedSpotAsset(collateralAsset, false);

  if (!normalizedCollateralAsset) return null;

  const collateralAssetSpotIndex = spotAssetIndexMap[normalizedCollateralAsset];
  const collateralAssetAmountInUsd = new BN(collateralAssetAmount)
    .multipliedBy(collateralAssetSpotIndex)
    .toNumber();

  const renderRiskPremiumDiffBadge = () => {
    const isRiskPremiumHigher =
      optionStrategy === "Vanilla"
        ? Math.abs(riskPremiumForVanilla) > Math.abs(riskPremiumForSpread)
        : Math.abs(riskPremiumForSpread) > Math.abs(riskPremiumForVanilla);

    let riskPremiumDiffInPercentage = 0;

    if (optionStrategy === "Vanilla" && riskPremiumForSpread !== 0) {
      riskPremiumDiffInPercentage =
        (Math.abs(riskPremiumForVanilla - riskPremiumForSpread) / riskPremiumForSpread) * 100;
    } else if (optionStrategy === "Spread" && riskPremiumForVanilla !== 0) {
      riskPremiumDiffInPercentage =
        (Math.abs(riskPremiumForSpread - riskPremiumForVanilla) / riskPremiumForVanilla) * 100;
    }

    if (orderSide === "Sell") riskPremiumDiffInPercentage = -riskPremiumDiffInPercentage;

    if (riskPremiumDiffInPercentage === 0) return null;
    if (size === "0") return null;

    return (
      <p
        className={twJoin(
          "text-[11px] font-semibold leading-[18px]",
          isRiskPremiumHigher ? "text-redff4d" : "text-greene6"
        )}
      >
        ({advancedFormatNumber(Math.abs(riskPremiumDiffInPercentage), 0)}%{" "}
        {isRiskPremiumHigher ? "Higher" : "Lower"})
      </p>
    );
  };

  return (
    <div className="flex flex-col w-full font-ibm">
      <div className="flex flex-row items-center h-[20px] font-inter gap-[6px] text-[12px] font-medium leading-[20px]">
        <p className={orderSide === "Buy" ? "text-green63" : "text-redff33"}>{orderSide}</p>
        <p className="text-grayb3">{selectedOption.instrument}</p>
        {optionStrategy === "Spread" && (
          <p
            className={twJoin(
              "h-[13px] text-[10px] text-gray80 font-medium leading-[12px]",
              optionDirection === "Call" ? "border-t-[1px] border-t-gray80" : "border-b-[1px] border-b-gray80"
            )}
          >
            {selectedOptionPair.strikePrice}
          </p>
        )}
      </div>

      <Divider />

      <SummarySection>
        <SummaryItem label="Mark Price" value={markPrice} />
        <div className="flex flex-row items-center justify-between h-[18px]">
          <div className="flex flex-row items-center gap-[4px]">
            <DisplayWithTooltip
              title="Risk Premium"
              description="The mechanism that penalizes trades adding to the platform’s Greeks exposure and rewards trades that reduce it."
              textAlign="right"
              tooltipClassName="w-[260px] font-graphie"
            />
            {renderRiskPremiumDiffBadge()}
          </div>
          <p>{advancedFormatNumber(riskPremium, 2, "$")}</p>
        </div>
        <SummaryItem label="Unit Price" value={executionPrice} />
      </SummarySection>

      <div className="h-[12px]" />

      <SummarySection>
        <SummaryItem label="Size" value={Number(size)} decimals={4} currency="" />
      </SummarySection>

      <Divider />

      <SummarySection>
        <SummaryItem label="Subtotal" value={subtotal} />
        <div className="flex flex-row items-center justify-between h-[18px]">
          <div className="flex flex-row items-center gap-[4px]">
            <DisplayWithTooltip
              title="Trade Fee"
              description="Trade Fee is 0.03% of the notional volume for all trades, except 0.06% for buying naked options, not exceeding 12.5% of execution price * size."
              textAlign="right"
              tooltipClassName="w-[350px] font-graphie"
            />
            {optionStrategy === "Spread" && (
              <p className="text-[11px] text-whitef5 font-semibold leading-[18px]">(50% Discount)</p>
            )}
          </div>
          <p>{advancedFormatNumber(tradeFee, 2, "$")}</p>
        </div>
      </SummarySection>

      <Divider />

      <SummarySection>
        <SummaryItem label={totalTitle} value={totalValue} />
      </SummarySection>

      <div className="h-[8px]" />

      {orderSide === "Sell" && (
        <SummarySection>
          <SummaryItem label="Required Collateral" value={collateralAssetAmountInUsd} />
        </SummarySection>
      )}
    </div>
  );
}

export default OrderSummary;

const Divider = () => (
  <>
    <div className="h-[7px]" />
    <div className="border-b-[1px] border-gray80 border-dashed" />
    <div className="h-[7px]" />
  </>
);

interface SummaryItemProps {
  label: string;
  value: number;
  format?: boolean;
  decimals?: number;
  currency?: string;
}

const SummaryItem = ({ label, value, format = true, decimals = 2, currency = "$" }: SummaryItemProps) => (
  <div className="flex flex-row items-center justify-between h-[18px]">
    <p>{label}</p>
    <p>{format ? advancedFormatNumber(value, decimals, currency) : value}</p>
  </div>
);

interface SummarySectionProps {
  children: ReactNode;
}

const SummarySection = ({ children }: SummarySectionProps) => (
  <div className="flex flex-col text-[11px] text-gray80 font-semibold leading-[18px]">{children}</div>
);
