import { advancedFormatNumber } from "@/utils/helper";
import { OptionDirection, OptionStrategy, OrderSide } from "@/utils/types";
import { twJoin } from "tailwind-merge";
import IconSparkle from "@/assets/trading-v2/icon-sparkle.png";
import IconRadioSel from "@/assets/trading-v2/icon-radio-sel.png";
import IconRadioUnsel from "@/assets/trading-v2/icon-radio-unsel.png";
import { getBaseQuoteAssetImage } from "../utils/options";
import { SpotAssetIndexMap, UnderlyingAsset } from "@moby/shared";
import { NetworkState } from "@/networks/types";
import { SupportedChains } from "@/networks/constants";
import { useEffect, useState } from "react";
import { IOptionDetail } from "@/interfaces/interfaces.marketSlice";
import { useAppSelector } from "@/store/hooks";

interface OptionPreviewStrategySelectorProps {
  selectedOption: IOptionDetail;
  underlyingAsset: UnderlyingAsset;
  optionDirection: OptionDirection;
  orderSide: OrderSide;
  optionStrategy: OptionStrategy;
  setOptionStrategy: (optionStrategy: OptionStrategy) => void;
  selectedOptionPair: IOptionDetail;
  underlyingFutures: number;
}

function OptionPreviewStrategySelector({
  selectedOption,
  underlyingAsset,
  optionDirection,
  orderSide,
  optionStrategy,
  setOptionStrategy,
  selectedOptionPair,
  underlyingFutures,
}: OptionPreviewStrategySelectorProps) {
  const [collateralAmountForVanilla, setCollateralAmountForVanilla] = useState<number>(0);
  const [collateralAmountForSpread, setCollateralAmountForSpread] = useState<number>(0);
  const [markPriceAmountForVanilla, setMarkPriceAmountForVanilla] = useState<number>(0);
  const [markPriceAmountForSpread, setMarkPriceAmountForSpread] = useState<number>(0);
  const [leverageForVanilla, setLeverageForVanilla] = useState<number>(0);
  const [leverageForSpread, setLeverageForSpread] = useState<number>(0);

  const { chain } = useAppSelector(state => state.network) as NetworkState;
  const spotAssetIndexMap = useAppSelector((state: any) => state.market.spotAssetIndexMap) as SpotAssetIndexMap;

  useEffect(() => {
    if (!selectedOption.optionId || selectedOption.optionId === "") {
      setCollateralAmountForVanilla(0);
      setMarkPriceAmountForVanilla(0);
      setLeverageForVanilla(0);
      return;
    }

    if (optionDirection === "Call") {
      setCollateralAmountForVanilla(1);
    } else {
      const collateralAmount = selectedOption.strikePrice / spotAssetIndexMap.usdc;
      setCollateralAmountForVanilla(collateralAmount);
    }

    const markPrice = selectedOption.markPrice;
    const markPriceAmount = markPrice / spotAssetIndexMap.usdc;
    setMarkPriceAmountForVanilla(markPriceAmount);

    setLeverageForVanilla(underlyingFutures / markPrice);
  }, [selectedOption, orderSide, underlyingFutures]);

  useEffect(() => {
    if (!selectedOptionPair.optionId || selectedOptionPair.optionId === "") {
      setCollateralAmountForSpread(0);
      setMarkPriceAmountForSpread(0);
      setLeverageForSpread(0);
      return;
    }

    const collateralValue = Math.abs(selectedOption.strikePrice - selectedOptionPair.strikePrice);
    const collateralAmountForSpread = collateralValue / spotAssetIndexMap.usdc;
    setCollateralAmountForSpread(collateralAmountForSpread);

    const markPriceAtComboMode = selectedOption.markPrice - selectedOptionPair.markPrice;
    const markPriceAmountAtComboMode = markPriceAtComboMode / spotAssetIndexMap.usdc;
    setMarkPriceAmountForSpread(markPriceAmountAtComboMode);

    setLeverageForSpread(underlyingFutures / markPriceAtComboMode);
  }, [selectedOptionPair]);

  return (
    <div className="flex flex-row gap-[12px] w-[384px] h-[133px] px-[12px] pt-[8px] pb-[12px]">
      <StrategyButton
        underlyingAsset={underlyingAsset}
        optionDirection={optionDirection}
        orderSide={orderSide}
        chain={chain}
        optionStrategy={"Spread"}
        isSelected={optionStrategy === "Spread"}
        label={`${optionDirection} Spread`}
        leverage={leverageForSpread}
        price={markPriceAmountForSpread}
        collateral={collateralAmountForSpread}
        onClick={() => {
          setOptionStrategy("Spread");
        }}
        showSparkle={optionStrategy === "Spread"}
      />
      <StrategyButton
        underlyingAsset={underlyingAsset}
        optionDirection={optionDirection}
        orderSide={orderSide}
        chain={chain}
        optionStrategy={"Vanilla"}
        isSelected={optionStrategy === "Vanilla"}
        label={optionDirection}
        leverage={leverageForVanilla}
        price={markPriceAmountForVanilla}
        collateral={collateralAmountForVanilla}
        onClick={() => {
          setOptionStrategy("Vanilla");
        }}
      />
    </div>
  );
}

export default OptionPreviewStrategySelector;

interface StrategyButtonProps {
  underlyingAsset: UnderlyingAsset;
  optionDirection: OptionDirection;
  orderSide: OrderSide;
  chain: SupportedChains;
  optionStrategy: OptionStrategy;
  isSelected: boolean;
  label: string;
  leverage: number;
  price: number;
  collateral: number;
  onClick: () => void;
  showSparkle?: boolean;
}

function StrategyButton({
  underlyingAsset,
  optionDirection,
  orderSide,
  chain,
  optionStrategy,
  isSelected,
  label,
  leverage,
  price,
  collateral,
  onClick,
  showSparkle = false,
}: StrategyButtonProps) {
  return (
    <div className="flex flex-col gap-[6px]">
      <div className="w-[174px] h-[17px]">
        {showSparkle && (
          <div className="flex flex-row items-center gap-[4px]">
            <img src={IconSparkle} className="w-[12px] h-[12px]" />
            <p className="text-[11px] text-purple-gradient font-bold leading-[17px]">
              {orderSide === "Buy" ? "Pay less Premium" : "Deposit less Collateral"}
            </p>
          </div>
        )}
      </div>
      <button
        className={twJoin(
          "w-[174px] h-[90px] p-[1px] rounded-[6px]",
          "hover:bg-whitef5 active:opacity-30 active:scale-95",
          !isSelected && "bg-black29",
          !isSelected && optionStrategy === "Vanilla" && "hover:bg-whitef5",
          !isSelected &&
            optionStrategy === "Spread" &&
            "hover:bg-gradient-to-r hover:from-purpleba76 hover:to-purple4d5d",
          isSelected && optionStrategy === "Vanilla" && "bg-whitef5",
          isSelected && optionStrategy === "Spread" && "bg-gradient-to-r from-purpleba76 to-purple4d5d "
        )}
        onClick={onClick}
      >
        <div
          className={twJoin(
            "flex flex-col px-[16px] py-[14px] rounded-[6px]",
            isSelected ? "bg-black1f" : "bg-black0a"
          )}
        >
          <div className="flex flex-row items-center gap-[10px]">
            <img src={isSelected ? IconRadioSel : IconRadioUnsel} className="w-[16px] h-[16px]" />
            <p className="h-[16px] text-[13px] text-whitef5 font-bold leading-[14px]">{label}</p>
          </div>
          <div className="h-[8px]" />
          <div className="flex flex-row items-center justify-between">
            <p className="h-[18px] text-[11px] text-gray80 font-medium leading-[18px]">Leverage</p>
            <p
              className={twJoin(
                "h-[18px] text-[11px] font-medium font-ibm leading-[18px]",
                isSelected
                  ? optionStrategy === "Vanilla"
                    ? "text-whitef5 font-semibold"
                    : "text-yellow-gradient font-semibold"
                  : "text-grayb3 font-medium"
              )}
            >
              {advancedFormatNumber(leverage, 0, "")}x
            </p>
          </div>
          <div className="flex flex-row items-center justify-between">
            <p className="h-[18px] text-[11px] text-gray80 font-medium leading-[18px]">
              {orderSide === "Buy" ? "Price" : "Collateral"}
            </p>
            <div className="flex flex-row items-center gap-[4px]">
              <img
                src={getBaseQuoteAssetImage(
                  underlyingAsset,
                  optionDirection,
                  orderSide,
                  optionStrategy,
                  chain
                )}
                className="w-[18px] h-[18px]"
              />
              <p
                className={twJoin(
                  "h-[18px] text-[11px] text-grayb3 font-medium font-ibm leading-[18px]",
                  isSelected
                    ? optionStrategy === "Vanilla"
                      ? "text-whitef5 font-semibold"
                      : "text-blue-gradient font-semibold"
                    : "text-grayb3 font-medium"
                )}
              >
                {advancedFormatNumber(orderSide === "Buy" ? price : collateral, 2, "")}
              </p>
            </div>
          </div>
        </div>
      </button>
    </div>
  );
}
