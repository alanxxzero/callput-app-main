import React from 'react'
import { twJoin } from 'tailwind-merge'
import PoolArchitecture from './PoolArchitecture'
import PoolComposition from './PoolComposition'
import PoolAttributes from './PoolAttributes'
import { OlpKey } from '@/utils/enums'
import PerformanceChart from './PerformanceChart'
import RevenueChart from './RevenueChart'

type Props = {
  olpKey: OlpKey
  olpDetailData: any
}

const OLPDetailParts: React.FC<Props> = ({ olpKey, olpDetailData }) => {
  return (
    <div 
      className={twJoin(
        "flex flex-col gap-[4px]",
      )}
    >
      <PoolArchitecture />
      <div
        className='w-full'
      >
        <PerformanceChart data={olpDetailData} olpKey={olpKey} />
        <RevenueChart data={olpDetailData} olpKey={olpKey} />
        <div
          className={twJoin(
            "grid grid-cols-[1fr,1fr] gap-[4px]"
          )}
        >
          <PoolComposition olpKey={olpKey} />
          <PoolAttributes />
        </div>
      </div>
    </div>
  )
}

export default OLPDetailParts