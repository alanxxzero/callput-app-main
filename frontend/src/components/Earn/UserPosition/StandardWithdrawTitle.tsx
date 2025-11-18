import WithTooltip from '@/components/Common/WithTooltip'
import React from 'react'
import { twMerge, twJoin } from 'tailwind-merge'

import QuestionMark from '@/assets/questionmark-tooltip.svg?react';

type Props = {
  
}

const StandardWithdrawTitle = ({  }: Props) => {
  return (
    <div
      className={twJoin(
        "flex items-center justify-center",
        "w-full",
        "relative"
      )}
    >
      <span>Standard</span>
      <WithTooltip
        tooltipContent={(
          <div
            className={twJoin(
              "dt:w-[400px] w-[210px]",
              "break-words text-left",
            )}
          >
            <ul
              className={twJoin(
                "list-disc",
                "pl-[10px]",
              )}
            >
              <li
                className={twJoin(
                )}
              >
                Standard withdrawal is available daily between 08:00 - 09:30 UTC, following the settlement of the day’s options strategy at 08:00 UTC
              </li>
              <li
                className={twJoin(

                )}
              >
                If settlement is not completed, standard withdrawals will be temporarily disabled and promptly activated upon completion
              </li>
            </ul>
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

export default StandardWithdrawTitle