import { ChartData, GroupedPosition, OptionDirection, OptionStrategy, OrderSide } from "@/utils/types";
import hash from "object-hash";
import { IOptionDetail } from "@/interfaces/interfaces.marketSlice";
import { useEffect, useState } from "react";
import { UnderlyingAsset } from "@moby/shared";
import { NetworkState } from "@/networks/types";
import { useAppSelector } from "@/store/hooks";
import { UA_TICKER_TO_TICKER_INTERVAL } from "@/networks/assets";
import { useDebouncedEffect } from "@/hooks/common";
import { calculateChartRange, generateChartData } from "@/utils/charts";
import { getDaysToLeft } from "@/utils/misc";
import {
  BEP_POINT_BOUNDARY_COMBO_MAX_RATIO,
  BEP_POINT_BOUNDARY_COMBO_MIN_RATIO,
  BEP_POINT_BOUNDARY_NAKED_MAX_RATIO,
  BEP_POINT_BOUNDARY_NAKED_MIN_RATIO,
} from "@/utils/constants";
import Canvas from "@/components/Trading/Canvas";

interface ProfitSimulationProps {
  selectedOption: IOptionDetail;
  underlyingAsset: UnderlyingAsset;
  expiry: number;
  optionDirection: OptionDirection;
  orderSide: OrderSide;
  optionStrategy: OptionStrategy;
  underlyingFutures: number;
  selectedOptionPair: IOptionDetail;
  size: string;
  executionPrice: number;
}

function ProfitSimulation({
  selectedOption,
  underlyingAsset,
  expiry,
  optionDirection,
  orderSide,
  optionStrategy,
  underlyingFutures,
  selectedOptionPair,
  size,
  executionPrice,
}: ProfitSimulationProps) {
  const { chain } = useAppSelector(state => state.network) as NetworkState;

  const [chart, setChart] = useState<ChartData>({
    list: [],
    dataMinX: 0,
    dataMaxX: 0,
    dataMinY: 0,
    dataMaxY: 0,
    tickInterval: UA_TICKER_TO_TICKER_INTERVAL[chain][underlyingAsset],
    bepPoints: [],
  });

  const [isChartSet, setIsChartSet] = useState(false);

  const [boundary, setBoundary] = useState({
    dataMinX: 0,
    dataMaxX: 0,
    dataMinY: 0,
    dataMaxY: 0,
  });

  const [isUnavailableToDraw, setIsUnavailableToDraw] = useState(true);

  useDebouncedEffect(() => {
    if (isChartSet) return;

    const executionPrice =
      orderSide === "Buy"
        ? selectedOption.markPrice * (1 + selectedOption.riskPremiumRateForBuy)
        : selectedOption.markPrice * (1 - selectedOption.riskPremiumRateForSell);

    const pairedExecutionPrice =
      orderSide === "Buy"
        ? selectedOptionPair.markPrice * (1 - selectedOptionPair.riskPremiumRateForSell)
        : selectedOptionPair.markPrice * (1 + selectedOptionPair.riskPremiumRateForBuy);

    const chartDataList =
      optionStrategy === "Vanilla"
        ? [
            getChartData({
              expiry: expiry,
              positions: [
                {
                  underlyingAsset: underlyingAsset,
                  strikePrice: String(selectedOption.strikePrice),
                  isCall: optionDirection === "Call",
                  isBuy: orderSide === "Buy",
                  qty: "1",
                  orderPrice: String(executionPrice) || "0",
                  currentIv: selectedOption.markIv || 0,
                },
              ],
            }),
          ]
        : [
            getChartData({
              expiry: expiry,
              positions: [
                {
                  underlyingAsset: underlyingAsset,
                  strikePrice: String(selectedOption.strikePrice),
                  isCall: optionDirection === "Call",
                  isBuy: orderSide === "Buy",
                  qty: "1",
                  orderPrice: String(executionPrice) || "0",
                  currentIv: selectedOption.markIv || 0,
                },
                {
                  underlyingAsset: underlyingAsset,
                  strikePrice: String(selectedOptionPair.strikePrice),
                  isCall: optionDirection === "Call",
                  isBuy: orderSide !== "Buy",
                  qty: "1",
                  orderPrice: String(pairedExecutionPrice) || "0",
                  currentIv: selectedOptionPair.markIv || 0,
                },
              ],
            }),
          ];

    const flattenedChartData = chartDataList.map(({ chart }) => [chart]).flat();
    setChart(flattenedChartData[0]);

    const dataBoundary = getDataBoundary(flattenedChartData);
    setBoundary(dataBoundary);

    const isUnAvailableToDraw = chartDataList.every(({ chart }) => chart.list.length === 0);
    setIsUnavailableToDraw(isUnAvailableToDraw);

    setIsChartSet(true);
  }, [isChartSet]);

  useEffect(() => {
    setIsChartSet(false);
  }, [selectedOption, selectedOptionPair, orderSide, optionStrategy]);

  const getChartData = ({ expiry, positions }: GroupedPosition) => {
    // Strike Price 기준 최대 값(10배)과 최소 값(0.1배)을 구함
    // 여러 포지션이 존재하는 경우 그 중에 가장 큰 값과 작은 값을 구함
    let { underlyingMaxPrice, underlyingMinPrice } = calculateChartRange(positions);

    // 차트 그리기 위한 Raw 데이터 생성
    const chartDataRaw = positions.map(({ strikePrice, isCall, isBuy, qty, orderPrice, currentIv }) => {
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
    });

    // @DEV: search bepPoints with large boundary
    const { bepPoints } = generateChartData(
      chartDataRaw,
      underlyingMinPrice,
      underlyingMaxPrice,
      UA_TICKER_TO_TICKER_INTERVAL[chain][underlyingAsset]
    );

    if (bepPoints.length === 0) {
      return {
        chart: {
          list: [],
          dataMinX: 0,
          dataMaxX: 0,
          dataMinY: 0,
          dataMaxY: 0,
          tickInterval: UA_TICKER_TO_TICKER_INTERVAL[chain][underlyingAsset],
          bepPoints: [],
        },
      };
    }

    const bepPoint = bepPoints[0];
    // const centerPoint = getChartCenterPoint(bepPoint, selectedOption.strikePrice)
    const daysToLeft = getDaysToLeft(String(selectedOption.instrument));

    const boundaryMinRatio =
      optionStrategy === "Vanilla" ? BEP_POINT_BOUNDARY_NAKED_MIN_RATIO : BEP_POINT_BOUNDARY_COMBO_MIN_RATIO;
    const boundaryMaxRatio =
      optionStrategy === "Vanilla" ? BEP_POINT_BOUNDARY_NAKED_MAX_RATIO : BEP_POINT_BOUNDARY_COMBO_MAX_RATIO;

    // If bep points are found, recalculate the underlyingMinPrice and underlyingMaxPrice
    underlyingMinPrice = bepPoint * (1 - boundaryMinRatio) * (1 - daysToLeft / 60);
    underlyingMaxPrice = bepPoint * (1 + boundaryMaxRatio) * (1 + daysToLeft / 60);

    const truncatedMin = Math.floor(underlyingMinPrice / 10) * 10;
    const truncatedMax = Math.floor(underlyingMaxPrice / 10) * 10;

    return {
      chart: generateChartData(
        chartDataRaw,
        truncatedMin,
        truncatedMax,
        UA_TICKER_TO_TICKER_INTERVAL[chain][underlyingAsset]
      ),
    };
  };

  const getDataBoundary = (chartList: any) => {
    let dataMinX = Math.min(...chartList.map(({ dataMinX }: any) => dataMinX));
    let dataMaxX = Math.max(...chartList.map(({ dataMaxX }: any) => dataMaxX));
    let dataMinY = Math.min(...chartList.map(({ dataMinY }: any) => dataMinY));
    let dataMaxY = Math.max(...chartList.map(({ dataMaxY }: any) => dataMaxY));

    return {
      dataMinX,
      dataMaxX,
      dataMinY,
      dataMaxY,
    };
  };

  const chartDataUniqueID = hash(chart.list.flat());

  return (
    <div className="flex-1 flex flex-col justify-center gap-[38px]">
      <Canvas
        underlyingFutures={underlyingFutures}
        optionPrice={executionPrice}
        optionSize={size}
        chartDataPoints={chart.list}
        chartDataUniqueID={chartDataUniqueID}
        dataMinX={boundary.dataMinX}
        dataMaxX={boundary.dataMaxX}
        dataMinY={boundary.dataMinY}
        dataMaxY={boundary.dataMaxY}
        tickInterval={UA_TICKER_TO_TICKER_INTERVAL[chain][underlyingAsset]}
        bepPoints={chart.bepPoints}
        isUnavailableToDraw={isUnavailableToDraw}
        daysToExpiry={getDaysToLeft(String(selectedOption.instrument))}
        selectedOptionName={String(selectedOption?.instrument)}
        selectedOptionDirection={optionDirection}
        selectedOrderSide={orderSide}
        canvasWidth={304}
        canvasHeight={142}
        chartStartX={0}
        chartStartY={25}
        chartWidth={304}
        chartHeight={142 - 30}
      />

      {optionStrategy === "Spread" && (
        <div className="flex flex-row items-center h-[39px] gap-[16px]">
          <div className="w-[3px] h-full rounded-[2px] bg-black33" />
          <div className="w-[284px] h-[39px] text-[10px] text-gray52 font-semibold leading-[13px]">
            <p>You can purchase options at a discounted price.</p>
            <p>
              If the price of the underlying asset moves outside a specific range, the maximum profit may be
              limited.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfitSimulation;
