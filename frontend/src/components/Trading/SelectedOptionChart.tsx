import React, { useEffect, useState } from 'react'
import hash from 'object-hash'
import Canvas from './Canvas'
import { IOptionDetail } from '@/interfaces/interfaces.marketSlice'
import { getDaysToLeft } from '@/utils/misc'
import { ChartData, GroupedPosition, OptionDirection, OrderSide } from '@/utils/types'
import { BEP_POINT_BOUNDARY_COMBO_MAX_RATIO, BEP_POINT_BOUNDARY_COMBO_MIN_RATIO, BEP_POINT_BOUNDARY_NAKED_MAX_RATIO, BEP_POINT_BOUNDARY_NAKED_MIN_RATIO } from '@/utils/constants'
import { calculateChartRange, generateChartData } from '@/utils/charts'

import { useDebouncedEffect } from '@/hooks/common'
import { UA_TICKER_TO_TICKER_INTERVAL } from '@/networks/assets'
import { UnderlyingAsset } from '@moby/shared'
import { useAppSelector } from '@/store/hooks'
import { NetworkState } from '@/networks/types'

interface SelectedOptionChart {
  isComboMode: boolean,
  underlyingFutures: number,
  selectedUnderlyingAsset: UnderlyingAsset,
  selectedOptionDirection: OptionDirection;
  selectedExpiry: number;
  selectedOption: IOptionDetail;
  selectedOrderSide: OrderSide;
  pairedOption: IOptionDetail;
  executionPrice: number,
  executionPriceAtComboMode: number,
  size: string,
  sizeAtComboMode: string,
  isChartSet: boolean,
  setIsChartSet: React.Dispatch<React.SetStateAction<boolean>>,
}

const SelectedOptionChart: React.FC<SelectedOptionChart> = ({
  isComboMode,
  underlyingFutures,
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
  isChartSet,
  setIsChartSet
}) => {
  const { chain } = useAppSelector(state => state.network) as NetworkState;

  const [chart, setChart] = useState<ChartData>(
    {
      list: [],
      dataMinX: 0,
      dataMaxX: 0,
      dataMinY: 0,
      dataMaxY: 0,
      tickInterval: UA_TICKER_TO_TICKER_INTERVAL[chain][selectedUnderlyingAsset],
      bepPoints: [],
    }
  );
  const [boundary, setBoundary] = useState({
    dataMinX: 0,
    dataMaxX: 0,
    dataMinY: 0,
    dataMaxY: 0,
  });
  const [isUnavailableToDraw, setIsUnavailableToDraw] = useState(true);

  useDebouncedEffect(() => {
    if (isChartSet) return;

    const executionPrice = selectedOrderSide === "Buy"
      ? selectedOption.markPrice * (1 + selectedOption.riskPremiumRateForBuy)
      : selectedOption.markPrice * (1 - selectedOption.riskPremiumRateForSell)

    const pairedExecutionPrice = selectedOrderSide === "Buy"
      ? pairedOption.markPrice * (1 - pairedOption.riskPremiumRateForSell)
      : pairedOption.markPrice * (1 + pairedOption.riskPremiumRateForBuy)

    const chartDataList = isComboMode 
      ? [getChartData({
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
                strikePrice: String(pairedOption.strikePrice),
                isCall: selectedOptionDirection === "Call",
                isBuy: selectedOrderSide !== "Buy",
                qty: "1",
                orderPrice: String(pairedExecutionPrice) || "0",
                currentIv: pairedOption.markIv || 0,
              }
            ]
          })]
      : [getChartData({
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
          ]
        })]

    const flattenedChartData = chartDataList
      .map(({ chart }) => [chart])
      .flat()
    setChart(flattenedChartData[0]);

    const dataBoundary = getDataBoundary(flattenedChartData)
    setBoundary(dataBoundary);
  
    const isUnAvailableToDraw = chartDataList.every(({ chart }) => chart.list.length === 0)
    setIsUnavailableToDraw(isUnAvailableToDraw);

    setIsChartSet(true);
  }, [selectedOption, pairedOption, executionPrice,  executionPriceAtComboMode, isComboMode], 5)

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
      }
    })

    // @DEV: search bepPoints with large boundary
    const { bepPoints } = generateChartData(
      chartDataRaw,
      underlyingMinPrice,
      underlyingMaxPrice,
      UA_TICKER_TO_TICKER_INTERVAL[chain][selectedUnderlyingAsset]
    )

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
        }
      };
    }

    const bepPoint = bepPoints[0]
    // const centerPoint = getChartCenterPoint(bepPoint, selectedOption.strikePrice)
    const daysToLeft = getDaysToLeft(String(selectedOption.instrument))

    const boundaryMinRatio = isComboMode ? BEP_POINT_BOUNDARY_COMBO_MIN_RATIO : BEP_POINT_BOUNDARY_NAKED_MIN_RATIO
    const boundaryMaxRatio = isComboMode ? BEP_POINT_BOUNDARY_COMBO_MAX_RATIO : BEP_POINT_BOUNDARY_NAKED_MAX_RATIO

    // If bep points are found, recalculate the underlyingMinPrice and underlyingMaxPrice
    underlyingMinPrice = bepPoint * (1 - boundaryMinRatio) * (1 - daysToLeft / 60)
    underlyingMaxPrice = bepPoint * (1 + boundaryMaxRatio) * (1 + daysToLeft / 60)

    const truncatedMin = Math.floor(underlyingMinPrice / 10) * 10
    const truncatedMax = Math.floor(underlyingMaxPrice / 10) * 10

    return {
      chart: 
        generateChartData(
          chartDataRaw,
          truncatedMin,
          truncatedMax,
          UA_TICKER_TO_TICKER_INTERVAL[chain][selectedUnderlyingAsset]
        )};
  }

  const getDataBoundary = (chartList: any) => {
    let dataMinX = Math.min(...chartList.map(({ dataMinX }: any) => dataMinX))
    let dataMaxX = Math.max(...chartList.map(({ dataMaxX }: any) => dataMaxX))
    let dataMinY = Math.min(...chartList.map(({ dataMinY }: any) => dataMinY))
    let dataMaxY = Math.max(...chartList.map(({ dataMaxY }: any) => dataMaxY))

    return {
      dataMinX,
      dataMaxX,
      dataMinY,
      dataMaxY,
    }
  }

  const chartDataUniqueID = hash(chart.list.flat())

  return (
    <div className="flex-1 flex flex-col justify-center gap-[12px] overflow-hidden">
        <Canvas
          underlyingFutures={underlyingFutures}
          optionPrice={isComboMode ? executionPriceAtComboMode : executionPrice}
          optionSize={isComboMode ? sizeAtComboMode : size}
          chartDataPoints={chart.list}
          chartDataUniqueID={chartDataUniqueID}
          dataMinX={boundary.dataMinX}
          dataMaxX={boundary.dataMaxX}
          dataMinY={boundary.dataMinY}
          dataMaxY={boundary.dataMaxY}
          tickInterval={UA_TICKER_TO_TICKER_INTERVAL[chain][selectedUnderlyingAsset]}
          bepPoints={chart.bepPoints}
          isUnavailableToDraw={isUnavailableToDraw}
          daysToExpiry={getDaysToLeft(String(selectedOption.instrument))}
          selectedOptionName={String(selectedOption?.instrument)}
          selectedOptionDirection={selectedOptionDirection}
          selectedOrderSide={selectedOrderSide}
          canvasWidth={400}
          canvasHeight={170}
          chartStartX={30}
          chartStartY={30}
          chartWidth={350}
          chartHeight={110}
        />

        {isComboMode && (
          <div className="flex flex-row items-center justify-between mx-[28px] h-[40px]">
            <div className="w-[3px] h-full rounded-[2px] bg-black33" />
            <p className="w-[324px] h-[39px] text-[11px] text-gray52 font-semibold leading-[0.8rem]">You can purchase options at a discounted price. However, in this case, if the price of the underlying asset moves outside a specific range, the maximum profit may be limited.</p>
          </div>
        )}
      </div>
  )
}

export default SelectedOptionChart