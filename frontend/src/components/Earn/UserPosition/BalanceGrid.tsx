import React from 'react'
import { twMerge, twJoin } from 'tailwind-merge'

import BalanceInfo from "./BalanceInfo";
import DashedText from "@/components/Common/DashedText";
import WithTooltip from "@/components/Common/WithTooltip";
import { DOV_ASSET_INFO } from "@/utils/assets";
import { advancedFormatNumber } from "@/utils/helper";
import BigNumber from 'bignumber.js';

type Props = {
  stakingTokenBalance: string;
  collateralTokenBalance: string;
  stakingTokenBalanceUSD: number;
  collateralTokenBalanceUSD: number;
}

const BalanceGrid = ({ 
  stakingTokenBalance,
  collateralTokenBalance,
  stakingTokenBalanceUSD,
  collateralTokenBalanceUSD,
}: Props) => {

  const totalBalanceUSD = new BigNumber(stakingTokenBalanceUSD)
    .plus(collateralTokenBalanceUSD)
    .toNumber()

  return (
    <>
    
    <div
        className={twJoin(
          "flex items-center",
          "mb-[24px]",
          "pt-[20px] px-[20px]",
          "dt:pt-[28px] dt:px-[28px]",
        )}
      >
        <p
          className={twJoin([
            "text-[20px] font-semibold text-greenE6",
          ])}
        >
          My Position
        </p>
        <span
          className={twJoin(
            "text-[20px] font-semibold text-whitee0",
            "ml-[10px]",
          )}
        >
          {advancedFormatNumber(totalBalanceUSD, 2, '$')}
        </span>
      </div>

      <div
        className={twJoin(
          "grid grid-cols-[1fr,1fr]",
          "dt:px-[28px]",
          "px-[20px]",
        )}
      >
        <BalanceInfo
          label={(
            <WithTooltip
              tooltipContent={(
                <div
                  className={twJoin(
                    "w-[300px] whitespace-pre-line",
                  )}
                >
                  Assets deposited in BERAHUB and Infrared. Rewards are continuously converted into LP tokens and reinvested.
                </div>
              )}
            >
              <DashedText>
                LP Balance
              </DashedText>
            </WithTooltip>
          )}
          amount={advancedFormatNumber(Number(stakingTokenBalance), 4, "", true)}
          value={advancedFormatNumber(stakingTokenBalanceUSD, 2, '$')}
        />
        <BalanceInfo
          tokenIcon={DOV_ASSET_INFO["USDC"].src}
          label={(
            <WithTooltip
              tooltipContent={(
                <div
                  className={twJoin(
                    "dt:w-[336px] w-[260px]",
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
                      Assets designated as collateral for options strategies are converted into USDC to facilitate execution.
                    </li>
                    <li
                      className={twJoin(

                      )}
                    >
                      Collateral balance is updated once daily, incorporating profits and losses at the close of each epoch.
                    </li>
                  </ul>
                </div>
              )}
            >
              <DashedText>
                Collateral Balance
              </DashedText>
            </WithTooltip>
          )}
          amount={advancedFormatNumber(Number(collateralTokenBalance), 4, "", true)}
        />
      </div>
    </>
  )
}

export default BalanceGrid