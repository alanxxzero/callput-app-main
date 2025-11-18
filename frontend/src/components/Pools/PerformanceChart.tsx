import React, { useEffect, useRef, useState } from 'react'
import { twJoin } from 'tailwind-merge'

import ReactECharts from 'echarts-for-react'
import { DayRange, defaultOption } from './PerformanceChart.option'
import Selector from '../Common/Selector'
import { useOlpPerformanceChart, useOLPTotalStat } from '@/hooks/olp'
import { OlpKey } from '@/utils/enums'
import { advancedFormatNumber } from '@/utils/helper'

type Props = {
  olpKey: OlpKey
  data: any
  className?: string
}

const PerformanceChart: React.FC<Props> = ({ data, className, olpKey }) => {
  const { tvl } = useOLPTotalStat({ olpKey })
  const {
    detailData,
    setChartInstance,
    echartsRef,
    activeDayRange,
    setDayRange,
    getOptions,
  } = useOlpPerformanceChart({ data, defaultOption })

  const [priceChangeRate, setPriceChangeRate] = useState<number>(0)

  useEffect(() => {
    if (!detailData || !detailData.olpPerformance) return

    const olpPerformanceData = Object.entries(detailData?.olpPerformance || {})
      .filter(([date, value]: any) => !value.olp_price || value.olp_price !== 0)
      .map(([date, value]: any) => ({ date, ...value, }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    
    const firstPrice = olpPerformanceData[0].olp_price;
    const lastPrice = olpPerformanceData[olpPerformanceData.length - 1].olp_price;

    const priceChangeRate = ((lastPrice - firstPrice) / firstPrice) * 100;
    setPriceChangeRate(priceChangeRate)
  }, [detailData])

  return (
    <div 
      className={twJoin(
        "relative",
        "w-full h-[400px]",
        "mb-[4px]",
        "bg-black1a",
        className
      )}
    >
      <div
        className={twJoin(
          "flex items-center",
          "px-[28px] py-[32px]",
        )}
      >
        <div
          className={twJoin(
            "w-full",
            "flex items-center justify-between",
          )}
        >
          <div
            className={twJoin(
              "flex items-center mr-[20px]",
            )}
          >
            <span
              className={twJoin(
                "text-[20px] font-[600] text-greene6",
                "mr-[20px]",
              )}
            >
              OLP Token Performance
            </span>
            <Selector
              items={Object
                .values(DayRange)
                .map((dayKey) => {
                  return {
                    value: dayKey + "d",
                    onClick: () => setDayRange(dayKey),
                    isActive: activeDayRange === dayKey
                  }
              })}
            />
          </div>
        </div>

        <div
          className={twJoin(
            "flex flex-col",
            "w-[200px]",
          )}
        >
          <p
            className={twJoin(
              "text-[16px] font-[700] text-grayb3 leading-[18px] text-right"
            )}
          >
            {advancedFormatNumber(tvl, 0, "$", true)}
          </p>
          <p
            className={twJoin(
              "text-[13px] font-[600] leading-[18px] text-gray80 text-right"
            )}
          >
            OLP Total Value Locked
          </p>
        </div>

        <div
          className={twJoin(
            "flex flex-col",
            "min-w-[88px] w-[88px] ml-[12px]",
          )}
        >
          <p
            className={twJoin(
              "text-[16px] font-[700] leading-[18px] text-right",
              priceChangeRate > 0 ? "text-green63" : priceChangeRate < 0 ? "text-redE0" : "text-grayb3"
            )}
          >
            {priceChangeRate > 0
              ? `+${advancedFormatNumber(priceChangeRate, 2, "", true)}%`
              : priceChangeRate < 0
                ? `${advancedFormatNumber(priceChangeRate, 2, "", true)}%`
                : "0%"
            }
          </p>
          <p
            className={twJoin(
              "text-[13px] font-[600] leading-[18px] text-gray80 text-right"
            )}
          >
            {`${activeDayRange}d change`}
          </p>
        </div>
      </div>
      
      <ReactECharts
        ref={echartsRef}
        option={getOptions(detailData)}
        style={{ height: "300px", width: "100%" }}
        onChartReady={(instance) => {
          setChartInstance(instance);
        }}
      />
    </div>
  )
}

export default PerformanceChart