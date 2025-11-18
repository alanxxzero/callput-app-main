import * as PIXI from 'pixi.js'

import { ChartDataPoint, OrderSide } from "@/utils/types"
import { useContext, useEffect, useRef, useState } from "react"
import { twJoin } from "tailwind-merge"
import CanvasDetail from "./CanvasDetail"
import LabelAndValue from "./LabelAndValue"
import { advancedFormatNumber, formatNumber } from "@/utils/helper"
import { ModalContext } from "../Common/ModalContext"
import { dataToCanvasPosition, getDefaultChartHoverPoint } from "@/utils/misc"
import { drawCircle, drawLine, drawText } from "@/utils/charts"

type DrawLineArg = {
  width: number
  color?: number
  dynamicColor?: boolean
  paths: ChartDataPoint[]
  type?: string
  adjustFunction?: (path: ChartDataPoint) => ChartDataPoint
  callback?: (...args: any[]) => void

  status?: string
}


interface CanvasProps {
  underlyingFutures: number
  optionPrice: number
  optionSize: string
  chartDataPoints: ChartDataPoint[]
  chartDataUniqueID: string
  dataMinX: number
  dataMaxX: number
  dataMinY: number
  dataMaxY: number
  tickInterval: number
  bepPoints: number[]
  isUnavailableToDraw: boolean
  selectedOptionName: string
  selectedOptionDirection: string
  selectedOrderSide: OrderSide
  daysToExpiry: number
  canvasWidth: number
  canvasHeight: number
  chartStartX: number
  chartStartY: number
  chartWidth: number
  chartHeight: number
}

const Canvas: React.FC<CanvasProps> = ({
  underlyingFutures,
  optionPrice,
  optionSize,
  chartDataPoints,
  chartDataUniqueID,
  dataMinX,
  dataMaxX,
  dataMinY,
  dataMaxY,
  tickInterval,
  bepPoints,
  isUnavailableToDraw,
  selectedOptionName,
  selectedOptionDirection,
  selectedOrderSide,
  daysToExpiry,
  canvasWidth,
  canvasHeight,
  chartStartX,
  chartStartY,
  chartWidth,
  chartHeight,
}) => {
  const { isModalOpen } = useContext(ModalContext);

  // new Bloc in Position Manager
  const [detail, setDetail] = useState<any>(null);
  const [app, setApp] = useState<PIXI.Application | null>(null);
  const [chartContainer, setChartContainer] = useState<PIXI.Container | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);

  const initChart = () => {
    if (app === null || chartContainer === null) return;
    if (containerRef.current) containerRef.current.appendChild(app.view as any)

    chartContainer.interactive = true
    chartContainer.position.set(chartStartX, canvasHeight - chartStartY)
    chartContainer.scale.set(1, -1)
    chartContainer.hitArea = new PIXI.Rectangle(0, 0, chartWidth, chartHeight)

    chartContainer.on('pointermove', handlePointerMove);
    chartContainer.on('pointerout', handlePointerOut);

    app.stage.addChild(chartContainer)
  }

  const destroyChart = () => {
    if (app === null || chartContainer === null) return;
    if (app?.view?.parentNode) app.view.parentNode.removeChild(app.view) 

    chartContainer.off('pointermove', handlePointerMove)
    chartContainer.off('pointerout', handlePointerOut)

    chartContainer.interactive = false
    chartContainer.removeChildren()
    chartContainer.destroy({ children: true, texture: true, baseTexture: true })

    app.stage.removeChild(chartContainer)
    app.stop()
    app.destroy(true)
  }
  
  const drawChart = () => {
    if (isUnavailableToDraw) return;

    const xRatio = chartWidth / (dataMaxX - dataMinX);
    const yRatio = chartHeight / (dataMaxY - dataMinY);

    drawLine({
      width: 2,
      adjustFunction: ([x, y]: ChartDataPoint) => {
        const adjustedX = (x - dataMinX) * xRatio;
        const adjustedY = (y - dataMinY) * yRatio;
        return [adjustedX, adjustedY] as ChartDataPoint;
      },
      paths: chartDataPoints,
      color: 0xffffff,
      dynamicColor: true,
      callback: addStage,
    })
  };

  const drawBep = () => {
    if (isUnavailableToDraw) {
      drawLine({
        width: 1,
        color: 0x292929,
        paths: [
          [0, 0],
          [chartWidth, 0],
        ] as ChartDataPoint[],
        callback: addStage
      })
      drawText({
        text: "Loss",
        color: 0xFF3333,
        x: 0,
        y: -10,
        callback: addStage
      })
      drawText({
        text: 'Profit',
        color: 0x63E073,
        x: chartWidth - 25,
        y: -10,
        callback: addStage
      })
      drawText({
        text: "BEP",
        color: 0xF5F5F5,
        x: chartWidth / 2,
        y: -10,
        callback: addStage
      })
    };

    const xRatio = chartWidth / (dataMaxX - dataMinX)
    const yRatio = chartHeight / (dataMaxY - dataMinY)

    bepPoints.forEach((x, idx) => {
      const adjustedX = (x - dataMinX) * xRatio
      const adjustedY = (0 - dataMinY) * yRatio

      // horizontal line
      if (idx == 0) {
        drawLine({
          width: 1,
          color: 0x292929,
          paths: [
            [0, adjustedY],
            [chartWidth, adjustedY],
          ] as ChartDataPoint[],
          callback: addStage
        })
      }

      // PNL이 플러스에서 마이너스, 마이너스에서 플러스로 바뀌는 지점
      // 만약 플러스에서 마이너스가 되었다면 그 지점은 Profit에서 Loss로
      // 마이너스에서 플러스가 되었다면 그 지점은 Loss에서 Profit로
      const foundPoint = chartDataPoints.find(([_x, _y]) => {
        return _x > x;
      });

      if (foundPoint) {
        // bepAfterPointX: X축 기준 BEP가 되는 Asset Price
        // bepAfterPointY: Y축 기준 BEP가 되는 PnL
        const [bepAfterPointX, bepAfterPointY] = foundPoint;

        if (bepAfterPointY > 0) { // Loss -> Profit
          drawText({
            text: "Loss",
            color: 0xFF3333,
            x: 0,
            y: adjustedY -5,
            callback: addStage
          })
          drawText({
            text: 'Profit',
            color: 0x63E073,
            x: chartWidth - 28,
            y: adjustedY -5,
            callback: addStage
          })
        } else { // Profit -> Loss
          drawText({
            text: "Loss",
            color: 0xFF3333,
            x: chartWidth - 28,
            y: adjustedY -5,
            callback: addStage
          })
          drawText({
            text: 'Profit',
            color: 0x63E073,
            x: 0,
            y: adjustedY -5 ,
            callback: addStage
          })
        }

        drawText({
          text: "BEP",
          color: 0xF5F5F5,
          x: adjustedX - 8,
          y: adjustedY -5,
          callback: addStage
        })

        drawText({
          text: `${advancedFormatNumber(Number(bepPoints), 0, "$")}`,
          color: 0xffffff,
          x: adjustedX - 23,
          y: adjustedY - 18,
          callback: addStage,
          alpha: 1
        })

        drawCircle({
          width: 1,
          color: 0xffffff,
          radius: 4,
          fill: 0xffffff,
          x: adjustedX,
          y: adjustedY,
          callback: addStage
        })
      }
    })
  }

  // 그림 그린 후 스테이지에 추가하는 콜백 함수
  const addStage = (graphic: any) => {
    if (chartContainer === null) return;
    chartContainer.addChild(graphic)
  }

  const draw = () => {
    drawChart();
    drawBep();
  }
  
  useEffect(() => {
    const appInstance = new PIXI.Application({
      width: canvasWidth,
      height: canvasHeight,
      antialias: true,
      autoDensity: true,
      resolution: 2,
      backgroundColor: "#171717"
    })
    setApp(appInstance)
    
    const chartContainerInstance = new PIXI.Container();
    setChartContainer(chartContainerInstance)

    initChart();
    draw();

    return () => {
      setApp(null)
      setChartContainer(null)
      destroyChart();
    }
  }, [chartDataUniqueID, isModalOpen])

  const [chartDataID, setChartDataID] = useState("")
  const [pointerX, setPointerX] = useState(0);
  const [pointerY, setPointerY] = useState(0);  

  // default point
  useEffect(() => {
    const bepPoint = bepPoints[0]
    if (chartDataPoints.length == 0) return

    const { x: xData, y: yData } = getDefaultChartHoverPoint(
      chartDataPoints,
      bepPoint,
      daysToExpiry,
      selectedOptionDirection === 'Call',
      selectedOrderSide === 'Buy',
    )

    const _chartDataID = chartDataPoints.reduce((acc, [x, y]) => acc += `${x}${y}`, "")

    if (_chartDataID === chartDataID) return

    setChartDataID(_chartDataID)

    const { xPos, yPos } = dataToCanvasPosition({
      chartWidth,
      chartHeight,
      chartStartX,
      chartStartY,
      dataMinX,
      dataMinY,
      dataMaxX,
      dataMaxY,
      xData,
      yData,
    })
    
    setPointerX(xPos)
    setPointerY(yPos)
    setDetail({
      x: xPos,
      y: yPos,
      assetPrice: xData,
      change: ((xData / underlyingFutures) - 1) * 100,
      pnl: yData
    })

  }, [])

  const handlePointerOut = (e: any) => {
    setPointerX(0)
    setPointerY(0)
    setDetail(null)
  }

  const handlePointerMove = (e: any) => {
    if (isModalOpen) return
    if (!chartDataPoints) return;
    if (chartDataPoints.length === 0) return;

    const tick = chartWidth / chartDataPoints.length;
    const tickIndex = Math.floor((e.data.global.x - chartStartX) / tick);

    const xData = chartDataPoints[tickIndex][0]
    const yData = chartDataPoints[tickIndex][1]

    const { xPos, yPos } = dataToCanvasPosition({
      chartWidth,
      chartHeight,
      chartStartX,
      chartStartY,
      dataMinX,
      dataMinY,
      dataMaxX,
      dataMaxY,
      xData,
      yData,
    })

    const yExpiryData = chartDataPoints[tickIndex][1]

    setPointerX(xPos)
    setPointerY(yPos)
        
    setDetail({
      x: xPos,
      y: yPos,
      assetPrice: xData,
      change: ((xData / underlyingFutures) - 1) * 100,
      pnl: yExpiryData
    })
  }

  const getDetailStyle = () => {
    return {
      left: pointerX,
      top: chartStartY,
      height: chartHeight
    }
  }

  if (isModalOpen) return null

  const pnl = (optionSize === "")
    ? detail?.pnl
    : detail?.pnl * Number(optionSize)

  const roi = (optionSize === "")
    ? pnl / optionPrice * 100
    : Number(optionSize) === 0
      ? 0
      : pnl / (optionPrice * Number(optionSize)) * 100

  return (
    <div className="flex flex-col">
      {/* <div
        className={twJoin(
          "flex flex-col",
          "px-[28px]",
        )}
      >
        <LabelAndValue 
          label="Potential P&L" 
          value={detail?.pnl ? advancedFormatNumber(pnl, 2, "$") : "$0.00"}
          valueClassName={twJoin(
            "text-[14px] font-[600]",
            pnl > 0 ? "text-green63" : pnl < 0 ? "text-redff33" : "text-whitee0",
          )}
        />
        <LabelAndValue 
          label="Potential ROI" 
          value={detail?.pnl ? `${advancedFormatNumber(roi, 2) + "%"}` : "0.00%"} 
          valueClassName={twJoin(
            "text-[14px] font-[600]",
            pnl > 0 ? "text-green63" : pnl < 0 ? "text-redff33" : "text-whitee0",
          )}
        />
      </div> */}
      <div
        ref={containerRef}
        className={twJoin(
          "flex",
          "relative"
        )}
      >
        {detail && (
          <>
            <div
              style={getDetailStyle()}
              className={twJoin(
                "absolute",
                "w-[1px]",
                "bg-[#404347]",
              )}
            />
            <div
              style={{
                left: pointerX - 4,
                bottom: pointerY - 4,
              }}
              className={twJoin(
                "absolute",
                "w-[8px] h-[8px]",
                "rounded-full",
                detail.pnl > 0
                  ? "bg-green4c"
                  : "bg-redc7",
              )}
            />
            <CanvasDetail
              x={detail.x}
              y={detail.y}
              expectedPnl={pnl}
              expectedRoi={roi}
              assetPrice={detail.assetPrice}
              change={detail.change}
              pnl={detail.pnl}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default Canvas;
