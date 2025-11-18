import WithTooltip from '@/components/Common/WithTooltip'
import React from 'react'
import { twMerge, twJoin } from 'tailwind-merge'

import QuestionMark from '@/assets/questionmark-tooltip.svg?react';

type Props = {
  
}

const ZapTitle = ({  }: Props) => {
  return (
    <div
      className={twJoin(
        "flex items-center justify-center",
        "w-full",
        "relative"
      )}
    >
      <span>Zap In</span>
      <WithTooltip
        tooltipContent={(
          <div
            className={twJoin(
              "dt:w-[320px] w-[240px]",
              "break-words text-left",
            )}
          >
            <p>Transactions are executed on integrated DeFi protocol and are subject to the protocol’s standard fees.</p>
          </div>
        )}
      >
        <QuestionMark
          className={twJoin(
            "absolute top-[50%] transform -translate-y-1/2 right-[-24px]",
          )}
        />
      </WithTooltip>
    </div>
  )
}

export default ZapTitle