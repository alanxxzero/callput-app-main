import React from 'react'
import { twJoin } from 'tailwind-merge'
import TotalStat from './TotalStat'
import { OlpKey } from '@/utils/enums'

type Props = {
  olpKey: OlpKey
  olpDetailData: any
}

const PoolsHeader: React.FC<Props> = ({ olpKey, olpDetailData }) => {
  return (
    <div 
      className={twJoin(
        "grid grid-cols-[1fr,442px] gap-[68px]",
      )}
    >
      <div
        className={twJoin(
          "flex flex-col"
        )}
      >
        <p
          className={twJoin(
            "text-[32px] font-[700] text-whitee0 mb-[12px] leading-[32px]"
          )}
        >
          Options Liquidity Pool
        </p>
        <p
          className={twJoin(
            "text-[16px] font-[400] leading-[20px] text-gray80"
          )}
        >
          Moby's Options Liquidity Pool (OLP) utilizes an advanced automated market-making strategy to generate revenue from trading fees, risk premiums, and user PnL, all while maintaining robust safety measures.
        </p>
      </div>
      <TotalStat olpKey={olpKey} olpDetailData={olpDetailData} />
    </div>
  )
}

export default PoolsHeader