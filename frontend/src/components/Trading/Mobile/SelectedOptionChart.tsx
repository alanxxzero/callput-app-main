import React, { useEffect, useState } from "react";
import { IOptionDetail } from "@/interfaces/interfaces.marketSlice";
import {
  getDaysToLeft,
  getDefaultChartHoverPoint,
} from "@/utils/misc";
import {
  ChartData,
  GroupedPosition,
  OptionDirection,
  OrderSide,
} from "@/utils/types";
import {
  BEP_POINT_BOUNDARY_COMBO_MAX_RATIO,
  BEP_POINT_BOUNDARY_COMBO_MIN_RATIO,
  BEP_POINT_BOUNDARY_NAKED_MAX_RATIO,
  BEP_POINT_BOUNDARY_NAKED_MIN_RATIO,
} from "@/utils/constants";
import { calculateChartRange, generateChartData } from "@/utils/charts";
import { initialOptionDetail } from "@/constants/constants.slices";
import { useAppSelector } from "@/store/hooks";
import LabelAndValue from "./LabelAndValue";
import { advancedFormatNumber, formatNumber } from "@/utils/helper";
import { twJoin } from "tailwind-merge";
import { UA_TICKER_TO_TICKER_INTERVAL } from "@/networks/assets";
import { NetworkState } from "@/networks/types";
import { UnderlyingAsset } from "@moby/shared";

interface SelectedOptionChartProps {
  selectedUnderlyingAsset: UnderlyingAsset;
  selectedOptionDirection: OptionDirection;
  selectedExpiry: number;
  selectedOption: IOptionDetail;
  selectedOrderSide: OrderSide;
  pairedOption: IOptionDetail;
  executionPrice: number;
  executionPriceAtComboMode: number;
  size: string;
  sizeAtComboMode: string;
}

const SelectedOptionChart: React.FC<SelectedOptionChartProps> = ({
  selectedUnderlyingAsset,
  selectedOptionDirection,
  selectedExpiry,
  selectedOption,
  selectedOrderSide,
  pairedOption,
  executionPrice,
  executionPriceAtComboMode,
  size,
  sizeAtComboMode,
}) => {
  const { chain } = useAppSelector(state => state.network) as NetworkState;

  const isComboMode = useAppSelector(
    (state: any) => state.selectedOption.isComboMode
  );

  const [chart, setChart] = useState<ChartData>({
    list: [],
    dataMinX: 0,
    dataMaxX: 0,
    dataMinY: 0,
    dataMaxY: 0,
    tickInterval: UA_TICKER_TO_TICKER_INTERVAL[chain][selectedUnderlyingAsset],
    bepPoints: [],
  });
  const [boundary, setBoundary] = useState({
    dataMinX: 0,
    dataMaxX: 0,
    dataMinY: 0,
    dataMaxY: 0,
  });
  const [isUnavailableToDraw, setIsUnavailableToDraw] = useState(true);
  const [pnl, setPnl] = useState(0);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPricel] = useState(0);

  useEffect(() => {
    const _pairedOption = pairedOption ? pairedOption : initialOptionDetail;

    const executionPrice =
      selectedOrderSide === "Buy"
        ? selectedOption.markPrice * (1 + selectedOption.riskPremiumRateForBuy)
        : selectedOption.markPrice *
          (1 - selectedOption.riskPremiumRateForSell);

    const pairedExecutionPrice =
      selectedOrderSide === "Buy"
        ? _pairedOption.markPrice * (1 - _pairedOption.riskPremiumRateForSell)
        : _pairedOption.markPrice * (1 + _pairedOption.riskPremiumRateForBuy);

    const chartDataList = isComboMode
      ? [
          getChartData({
            expiry: selectedExpiry,
            positions: [
              {
                underlyingAsset: selectedUnderlyingAsset,
                strikePrice: String(selectedOption.strikePrice),
                isCall: selectedOptionDirection === "Call",
                isBuy: selectedOrderSide === "Buy",
                qty: "1",
                orderPrice: String(executionPrice) || "0",
                currentIv: selectedOption.markIv || 0,
              },
              {
                underlyingAsset: selectedUnderlyingAsset,
                strikePrice: String(_pairedOption.strikePrice),
                isCall: selectedOptionDirection === "Call",
                isBuy: selectedOrderSide !== "Buy",
                qty: "1",
                orderPrice: String(pairedExecutionPrice) || "0",
                currentIv: _pairedOption.markIv || 0,
              },
            ],
          }),
        ]
      : [
          getChartData({
            expiry: selectedExpiry,
            positions: [
              {
                underlyingAsset: selectedUnderlyingAsset,
                strikePrice: String(selectedOption.strikePrice),
                isCall: selectedOptionDirection === "Call",
                isBuy: selectedOrderSide === "Buy",
                qty: "1",
                orderPrice: String(executionPrice) || "0",
                currentIv: selectedOption.markIv || 0,
              },
            ],
          }),
        ];

    const flattenedChartData = chartDataList.map(({ chart }) => [chart]).flat();
    setChart(flattenedChartData[0]);

    const dataBoundary = getDataBoundary(flattenedChartData);
    setBoundary(dataBoundary);
    const isUnAvailableToDraw = chartDataList.every(
      ({ chart }) => chart.list.length === 0
    );
    setIsUnavailableToDraw(isUnAvailableToDraw);
  }, [
    selectedOption,
    pairedOption,
    executionPrice,
    executionPriceAtComboMode,
    isComboMode,
  ]);

  const getChartData = ({ expiry, positions }: GroupedPosition) => {
    // Strike Price 기준 최대 값(10배)과 최소 값(0.1배)을 구함
    // 여러 포지션이 존재하는 경우 그 중에 가장 큰 값과 작은 값을 구함
    let { underlyingMaxPrice, underlyingMinPrice } =
      calculateChartRange(positions);
    // 차트 그리기 위한 Raw 데이터 생성
    const chartDataRaw = positions.map(
      ({ strikePrice, isCall, isBuy, qty, orderPrice, currentIv }) => {
        return {
          strikePrice,
          isCall: isCall,
          isBuy: isBuy,
          qty: isBuy ? String(qty) : String(-qty),
          orderPrice: orderPrice,
          fromTime: expiry - 1,
          expiry: expiry,
          volatility: currentIv / 100,
          assetPriceMin: underlyingMinPrice,
          assetPriceMax: underlyingMaxPrice,
        };
      }
    );

    // @DEV: search bepPoints with large boundary
    const { bepPoints } = generateChartData(
      chartDataRaw,
      underlyingMinPrice,
      underlyingMaxPrice,
      UA_TICKER_TO_TICKER_INTERVAL[chain][selectedUnderlyingAsset]
    );

    if (bepPoints.length === 0) {
      return {
        chart: {
          list: [],
          dataMinX: 0,
          dataMaxX: 0,
          dataMinY: 0,
          dataMaxY: 0,
          tickInterval: UA_TICKER_TO_TICKER_INTERVAL[chain][selectedUnderlyingAsset],
          bepPoints: [],
        },
      };
    }

    const bepPoint = bepPoints[0];
    // const centerPoint = getChartCenterPoint(bepPoint, selectedOption.strikePrice);
    const daysToLeft = getDaysToLeft(String(selectedOption.instrument));

    const boundaryMinRatio = isComboMode ? BEP_POINT_BOUNDARY_COMBO_MIN_RATIO : BEP_POINT_BOUNDARY_NAKED_MIN_RATIO
    const boundaryMaxRatio = isComboMode ? BEP_POINT_BOUNDARY_COMBO_MAX_RATIO : BEP_POINT_BOUNDARY_NAKED_MAX_RATIO
    
    // If bep points are found, recalculate the underlyingMinPrice and underlyingMaxPrice
    underlyingMinPrice = bepPoint * (1 - boundaryMinRatio) * (1 - daysToLeft / 150)
    underlyingMaxPrice = bepPoint * (1 + boundaryMaxRatio) * (1 + daysToLeft / 150)

    const truncatedMin = Math.floor(underlyingMinPrice / 10) * 10;
    const truncatedMax = Math.floor(underlyingMaxPrice / 10) * 10;

    setMinPrice(underlyingMinPrice);
    setMaxPricel(underlyingMaxPrice);

    return {
      chart: generateChartData(
        chartDataRaw,
        truncatedMin,
        truncatedMax,
        UA_TICKER_TO_TICKER_INTERVAL[chain][selectedUnderlyingAsset]
      ),
    };
  };

  const getDataBoundary = (chartList: any) => {
    const dataMinX = Math.min(
      ...chartList.map(({ dataMinX }: any) => dataMinX)
    );
    const dataMaxX = Math.max(
      ...chartList.map(({ dataMaxX }: any) => dataMaxX)
    );
    const dataMinY = Math.min(
      ...chartList.map(({ dataMinY }: any) => dataMinY)
    );
    const dataMaxY = Math.max(
      ...chartList.map(({ dataMaxY }: any) => dataMaxY)
    );

    return {
      dataMinX,
      dataMaxX,
      dataMinY,
      dataMaxY,
    };
  };

  useEffect(() => {
    const { y: yData } = getDefaultChartHoverPoint(
      chart.list,
      chart.bepPoints[0],
      getDaysToLeft(String(selectedOption.instrument)),
      selectedOptionDirection === "Call",
      selectedOrderSide === "Buy"
    );
    const optionSize = isComboMode ? sizeAtComboMode : size;
    setPnl(optionSize === "" ? yData : yData * Number(optionSize));
  }, []);

  const calculateMaxProfit = (
    bepPoints: number,
    minPrice: number,
    maxPrice: number
  ) => {
    if (bepPoints === 0) return "$0";
    if (selectedOptionDirection === "Call") {
      return formatNumber(bepPoints - minPrice, 2, true);
    } else {
      return formatNumber(maxPrice - bepPoints, 2, true);
    }
  };
  const calculateLossProfit = (
    bepPoints: number,
    minPrice: number,
    maxPrice: number
  ) => {
    if (bepPoints === 0) return "$0";
    if (selectedOptionDirection === "Call") {
      if (selectedOrderSide === "Buy") {
        return formatNumber(bepPoints - minPrice, 2, true);
      } else {
        return formatNumber(maxPrice - bepPoints, 2, true);
      }
    } else {
      if (selectedOrderSide === "Buy") {
        return formatNumber(maxPrice - bepPoints, 2, true);
      } else {
        return formatNumber(bepPoints - minPrice, 2, true);
      }
    }
  };

  return (
    <div className={twJoin("flex flex-row flex-wrap gap-y-5")}>
      <LabelAndValue
        label="Potential P&L"
        value={pnl ? advancedFormatNumber(pnl, 2, "$") : "$0.00"}
      />
      <LabelAndValue
        label="Breakeven"
        value={`$${formatNumber(Number(chart.bepPoints), 1, true)}`}
      />

      {selectedOrderSide === "Buy" && Number(chart.bepPoints) !== 0 ? (
        <LabelAndValue label="Max Profit" value="Unlimited" />
      ) : (
        <>
          <LabelAndValue
            label="Max Profit"
            value={`$${calculateMaxProfit(
              Number(chart.bepPoints),
              minPrice,
              maxPrice
            )}`}
          />
        </>
      )}

      <LabelAndValue
        label="Max Loss"
        value={`-${calculateLossProfit(
          Number(chart.bepPoints),
          minPrice,
          maxPrice
        )}`}
      />
    </div>
  );
};

export default SelectedOptionChart;
