import WithTooltip from '@/components/Common/WithTooltip'
import React from 'react'
import { twMerge, twJoin } from 'tailwind-merge'

import QuestionMark from '@/assets/questionmark-tooltip.svg?react';

type Props = {
  
}

const ImmediateWithdrawTitle = ({  }: Props) => {
  return (
    <div
      className={twJoin(
        "flex items-center justify-center",
        "w-full",
        "relative"
      )}
    >
      <span>Immediate</span>
      <WithTooltip
        tooltipContent={(
          <div
            className={twJoin(
              "dt:w-[336px] w-[260px]",
              "break-all text-left",
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
                Immediate withdrawal is available at any time. However, only the LP assets, excluding those used as collateral for options strategies, can be withdrawn.
              </li>
              <li
                className={twJoin(

                )}
              >
                The collateral will remain in the vault and be redistributed accordingly.
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

export default ImmediateWithdrawTitle