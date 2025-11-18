import { dovTVLMap$ } from '@/streams/dov'
import { advancedFormatNumber } from '@/utils/helper'
import { useObservableState } from 'observable-hooks'
import React from 'react'
import { twMerge, twJoin } from 'tailwind-merge'

type Props = {
  tvlMap: any
}

const StatItem = ({ label, value }: any) => {
  return (
    <div
      className={twJoin(
        
      )}
    >
      <div
        className={twJoin(
          "text-[12px] text-greene6 font-[600]",
          "mb-[4px]",
          "dt:text-[13px]"
        )}
      >
        {label}
      </div>
      <div
        className={twJoin(
          "text-[15px] font-[600] text-whitee0",
          "dt:text-[20px] dt:font-graphie",
          "font-plex-mono"
        )}
      >
        {value}
      </div>
    </div>
  )
}

const TotalStat = ({ tvlMap }: Props) => {

  const totalTVL = Object.values(tvlMap).reduce<number>((acc, cur) => {
    return acc + Number(cur)
  }, 0)

  return (
    <div 
      className={twJoin(
        "dt:w-full dt:h-[100px] dt:px-[24px] dt:py-[28px]",
        "dt:bg-[radial-gradient(56.26%_76.56%_at_83%_94.53%,#252918_0%,#181A13_100%)]",
        "dt:border dt:border-[rgba(250,255,230,0.2)] dt:rounded-[6px]",
        "dt:mt-0",
        "w-full h-[42px]",
        "mt-[24px]"
      )}
    >
      <div
        className={twJoin(
          // "grid grid-cols-[1fr,1fr]",
          "grid grid-cols-[1fr]",
        )}
      >
        <StatItem 
          label="Total Value Locked" 
          value={advancedFormatNumber(totalTVL, 2, '$')} 
        />
        {/* <StatItem label="Total Volume of Trades" value="-" /> */}
      </div>
    </div>
  )
}

export default TotalStat