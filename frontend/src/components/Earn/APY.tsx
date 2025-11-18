import React from 'react'
import { twMerge, twJoin } from 'tailwind-merge'

import IconBex from '@/assets/ico-bex.svg'
import IconBerps from '@/assets/ico-berps.svg'
import IconInfrared from '@/assets/ico-infrared.svg'
import IconMoby from '@/assets/ico-moby.svg'
import IconMobyPoint from '@/assets/ico-mobypoint.svg'
import IconBeranode from '@/assets/ico-beranode.svg'
import WithTooltip from '../Common/WithTooltip'
import { advancedFormatBigNumber, advancedFormatNumber } from '@/utils/helper'

const iconMap: any = {
  BERAHUB: IconBex,
  BERPS: IconBerps,
  INFRARED: IconInfrared,
  MOBY: IconMoby,
  // MOBYPOINT: IconMobyPoint,
  BERANODE: IconBeranode,
}

type Props = {
  valueClassName?: string;
  apyIngredients: any[];
}

const APY = ({ valueClassName, apyIngredients }: Props) => {

  if (!apyIngredients) return <>...</>

  const apySum = apyIngredients?.reduce((acc, cur) => {
    if (typeof cur.apy != "number") return acc

    return acc + cur.apy
  }, 0) || 0
  
  return (
    <div
      className={twJoin(
        "flex items-center",
      )}
    >
      <WithTooltip
        tooltipClassName={twJoin(
          "w-[260px]",
          "px-[12px] py-[10px]",
          "bg-black1f",
          "shadow-[0px_0px_8px_0px_rgba(10,10,10,0.72)]",
          "border border-[rgba(224,224,224,0.10)] rounded-[4px]",
        )}
        tooltipContent={(
          <div
            className={twJoin(
              "flex flex-col",
            )}
          >
            {apyIngredients?.map(({ key, title, apy }, idx) => {

              const isAPYNumber = !isNaN(Number(apy))

              return (
                <div
                  key={key}
                  className={twJoin(
                    "flex justify-between items-center",
                    idx == apyIngredients.length - 1 ? "" : "mb-[4px]"
                  )}
                >
                  <div
                    className={twJoin(
                      "flex items-center",
                    )}
                  >
                    <img
                      className={twJoin(
                        "w-[16px] h-[16px]",
                        "mr-[6px]",
                      )}
                      src={iconMap[key]} 
                    />
                    <span
                      className={twJoin(
                        "text-[12px] text-gray80 font-[600]",
                      )}
                    >
                      {title}
                    </span>
                  </div>
                  <span
                    className={twJoin(
                      "text-[12px] font-[600]",
                      isAPYNumber ? "text-green63" : "text-whitee0",
                    )}
                  >
                    {advancedFormatNumber(apy, 2)}{isAPYNumber ? "% APY" : ""}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      >
        <span
          className={twMerge(
            twJoin(
              "text-[22px] text-green63 underline decoration-dashed underline-offset-4",
            ),
            valueClassName,
          )}
        >
          {apySum 
            ? `${advancedFormatBigNumber(apySum)}%`
            : "..."
          }
        </span>
      </WithTooltip>
      <div
        className={twJoin(
          "flex items-center",
          "bg-black29",
          "rounded-[12px]",
          "h-[20px] p-[2px]",
          "ml-[6px]",
        )}
      >
        {apyIngredients?.map(({ key }) => {
          return (
            <img
              key={key}
              className={twJoin(
                "w-[16px] h-[16px]",
              )}
              src={iconMap[key]} 
            />
          )
        })}
      </div>
    </div>
  )
}

export default APY