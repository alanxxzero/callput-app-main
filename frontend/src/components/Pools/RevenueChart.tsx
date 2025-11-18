import React, { useEffect, useRef, useState } from 'react'
import { twJoin } from 'tailwind-merge'

import ReactECharts from 'echarts-for-react'
import { DayRange, defaultOption, Tab } from './RevenueChart.option'
import Selector from '../Common/Selector'
import { useRevenueChart } from '@/hooks/olp'
import { OlpKey } from '@/utils/enums'
import { advancedFormatNumber } from '@/utils/helper'

type Props = {
  olpKey: OlpKey
  className?: string
  data: any
}

const RevenueChart: React.FC<Props> = ({ className, olpKey, data }) => {
  const {
    detailData,
    setChartInstance,
    echartsRef,
    activeDayRange,
    activeTab,
    setActiveTab,
    setDayRange,
    getOptions,
    getTotalValue,
  } = useRevenueChart({ data, defaultOption })

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
              Revenue
            </span>
            <Selector
              className={twJoin(
                "w-[220px]"
              )}
              items={Object
                  .values(Tab)
                  .map((tabTitle) => {
                return {
                  value: tabTitle,
                  onClick: () => setActiveTab(tabTitle),
                  isActive: activeTab === tabTitle
                }
              })}
            />
            <Selector
              items={Object.values(DayRange).map((dayKey) => {
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
            "flex flex-col w-[200px]",
          )}
        >
          <p
            className={twJoin(
              "text-[16px] font-[700] text-grayb3 leading-[18px] text-right"
            )}
          >
            {advancedFormatNumber(getTotalValue(), 0, "$", true)}
          </p>
          <p
            className={twJoin(
              "relative",
              "text-[13px] font-[600] leading-[18px] text-gray80 text-right"
            )}
          >
            {activeDayRange}d {activeTab}
            {activeTab == Tab.PNL && (
              <p
                className={twJoin(
                  "absolute right-0 bottom-[-20px]",
                  "w-[242px]",
                  "text-[12px] text-gray80 font-[600] leading-[14px] text-right"
                )}
              >
                * Options not been settled or closed excluded
              </p>
            )}
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

export default RevenueChart