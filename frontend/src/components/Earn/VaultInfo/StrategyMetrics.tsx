import DashedText from "@/components/Common/DashedText";
import WithTooltip from "@/components/Common/WithTooltip";
import { strategies } from "@/constants/constants.dov";
import { useAppSelector } from "@/store/hooks";
import { advancedFormatNumber } from "@/utils/helper";
import React from "react";
import { twJoin } from "tailwind-merge";
import TimeToExpiry from "./TimeToExpiry";
import { isEmpty } from "lodash";
import { UA_INFO } from "@/networks/assets";
import { get0DTEActiveInstruments, getTargetStrikePricesText } from "@/utils/dov"
import { NetworkState } from "@/networks/types";
import { NormalizedSpotAsset, SpotAssetIndexMap } from "@moby/shared";

type Props = {
  strategy: string,
  underlying: string,
  apy: number,
}

const MetricItem = ({ title, value }: { title: string | React.ReactNode, value: string | React.ReactNode }) => {
  return (
    <div
      className={twJoin(
        "flex flex-col",
      )}
    >
      <div
        className={twJoin(
          "text-[13px] font-[600] text-gray80",
          "mb-[10px]",
        )}
      >
        {title}
      </div>
      <span
        className={twJoin(
          "text-[15px] font-[600] text-whitee0",
        )}
      >
        {value}
      </span>
    </div>
  )
}

const StrategyMetrics: React.FC<Props> = ({ strategy, underlying, apy }) => {
  const { chain } = useAppSelector(state => state.network) as NetworkState;
  const spotAssetIndexMap = useAppSelector((state: any) => state.market.spotAssetIndexMap) as SpotAssetIndexMap;
  const market = useAppSelector((state: any) => state.market.market);

  const activeInstruments = get0DTEActiveInstruments(market)

  if (!activeInstruments || isEmpty(activeInstruments)) return <></>

  const targetStrikePricesText = getTargetStrikePricesText({ 
    strategy,
    activeInstruments, 
    spotPrice: spotAssetIndexMap[underlying as NormalizedSpotAsset] 
  })

  return (
    <div
      className={twJoin(
        "grid",
        "border-black33",
        "w-full",
        "grid-cols-[1fr,1fr] gap-y-[12px] gap-x-[8px]",
        "dt:grid-cols-[1fr,1fr,1fr,1fr] dt:border-l-[3px] dt:gap-[16px] dt:pl-[24px]",
      )}
    >
      <MetricItem 
        title="Underlying Asset" 
        value={(
          <div
            className={twJoin(
              "flex items-center",
              "text-[15px] font-[600] text-whitee0",
            )}
          >
            <img
              className={twJoin(
                "mr-[4px]",
              )}
              src={UA_INFO[chain][underlying as keyof typeof UA_INFO[typeof chain]].src} 
            />
            {underlying}
          </div>
        )} 
      />
      <MetricItem title="Current Price" value={advancedFormatNumber(spotAssetIndexMap[underlying as NormalizedSpotAsset], 2, "$")} />
      <MetricItem 
        title="Composition" 
        value={
          strategies[strategy].composition.map((item: any, idx: number) => {
            if (idx == strategies[strategy].composition.length - 1) {
              return <span key={idx}>{item}</span>
            }

            return <span key={idx}>{item}<br/></span>
          })
        }
      />
      <MetricItem 
        title={(
          <WithTooltip
            tooltipContent={(

              <div
                className={twJoin(
                  "dt:w-[336px] w-[200px]",
                )}
              >
                <p>Options Strike price is the optimal sell point determined by Moby's internal calculation mechanisms. It continuously adjusts throughout the epoch.</p>
              </div>
            )}
          >
            <DashedText
              className={twJoin(
                "text-gray80",
              )}
            >
              Strike Prices
            </DashedText>
          </WithTooltip>
        )}
        value={targetStrikePricesText}
      />
      <MetricItem title="Epoch" value="1 day" />
      <MetricItem title="Time to Expiry" value={<TimeToExpiry />} />
      <MetricItem 
        title={(
          <WithTooltip
            tooltipContent={(
              <div
                className={twJoin(
                  "dt:w-[336px] w-[200px]",
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
                    The performance fee is applied to premiums earned only when the strategy generates a profit. If the strategy is unprofitable, no fees are charged.
                  </li>
                  <li
                    className={twJoin(

                    )}
                  >
                    The fees are deposited into the Treasury and will be used to safeguard Vault funds in the event of extreme scenarios.
                  </li>
                </ul>
              </div>
            )}
          >
            <DashedText
              className={twJoin(
                "text-gray80",
              )}
            >
              Performance Fee
            </DashedText>
          </WithTooltip>
        )} 
        value="8%" 
      />
      <MetricItem 
        title={(
          <WithTooltip
            tooltipContent={(
              <div
                className={twJoin(
                  "dt:w-[336px] w-[200px]",
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
                    Average 7 days APY of Options Strategy
                  </li>
                  <li
                    className={twJoin(

                    )}
                  >
                    Calculated by getting the average of the past 7 days’ annualized performance (in-the-money weeks excl.)
                  </li>
                </ul>
              </div>
            )}
          >
            <DashedText
              className={twJoin(
                "text-gray80",
              )}
            >
              Projected Yield (APY)
            </DashedText>
          </WithTooltip>
        )}
        value={
          advancedFormatNumber(apy, 0) + "%"
        }
      />

    </div>
  )
}

export default StrategyMetrics;
