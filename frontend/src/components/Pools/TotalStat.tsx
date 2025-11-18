import { useOLPTotalStat } from '@/hooks/olp'
import { OlpKey } from '@/utils/enums'
import { advancedFormatNumber } from '@/utils/helper'
import { twMerge, twJoin } from 'tailwind-merge'
import WithTooltip from '../Common/WithTooltip'

type Props = {
  olpKey: OlpKey
  olpDetailData: any
}

const StatItem = ({ label, value }: any) => {
  return (
    <div
      className={twJoin(
        
      )}
    >
      <div
        className={twJoin(
          "text-[13px] text-greene6 font-[600]",
          "mb-[4px]"
        )}
      >
        {label}
      </div>
      <div
        className={twJoin(
          "text-[20px] font-[600] text-whitee0",
        )}
      >
        {value}
      </div>
    </div>
  )
}

const TotalStat = ({ olpKey, olpDetailData }: Props) => {
  const { tvl } = useOLPTotalStat({ olpKey })

  const revenueData = olpDetailData?.[30]?.revenue || {}

  const revenue7day = Object
    .entries(revenueData)
    .slice(0, 7)
    .reduce((acc, [date, val]: any) => {
      return acc + val.fees + val.risk_premium
    }, 0)

  return (
    <div 
      className={twJoin(
        "w-full h-[100px]",
        "border border-[rgba(250,255,230,0.2)] rounded-[6px]",
        "px-[24px] py-[28px]",
        "bg-[radial-gradient(56.26%_76.56%_at_83%_94.53%,#252918_0%,#181A13_100%)]",
      )}
    >
      <div
        className={twJoin(
          "grid grid-cols-[1fr,1fr]",
        )}
      >
        <StatItem label="Total Value Locked" value={advancedFormatNumber(tvl, 0, "$", true)} />
        {(
          <StatItem 
            label={(
              <WithTooltip
                tooltipClassName={
                  twJoin(
                    "flex items-center w-[240px] px-[12px] py-[6px]",
                  )
                }
                tooltipContent={(
                  <div
                    className={twJoin(
                      "break-words text-left text-[12px]",
                    )}
                  >
                    Net Revenue = Risk Premium + Fees
                  </div>
                )}
              >
              7-Day <span className="border-b-[1px] border-dashed border-b-greenc1 ml-[2px]">Net Revenue</span>
            </WithTooltip>
            )}
            value={advancedFormatNumber(revenue7day, 0, "$", true)}
          />
        )}
      </div>
    </div>
  )
}

export default TotalStat