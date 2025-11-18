import React, { useEffect } from 'react'
import { twMerge, twJoin } from 'tailwind-merge'
import { useObservableState } from 'observable-hooks'

import { useAppSelector } from '@/store/hooks'
import { dovAPRMap$, dovStakedBalances$, dovTVLMap$, dovVaultQueueHasMap$, dovVaultQueueItems$ } from '@/streams/dov'
import { getDovInfo } from '@/constants/constants.dov'
import Vault from './Vault'
import TotalStat from './TotalStat'

type Props = {
  selectVault: any;
  spot: any;
  tvlMap: any;
  aprMap: any;
}

const EarnLanding = ({ selectVault, spot, tvlMap, aprMap }: Props) => {
  const dovStakedBalances = useObservableState(dovStakedBalances$)
  const dovVaultQueueHasMap = useObservableState(dovVaultQueueHasMap$)

  return (
    <>
      <div
        className={twJoin(
          "flex flex-col",
          "dt:w-[1280px] dt:max-w-[1280px] dt:min-w-[1280px] dt:min-h-screen dt:pt-[48px]",
        )}
      >
        <div
          className={twJoin(
            "grid gap-x-[25px]",
            "dt:grid-cols-[auto,410px] dt:mb-[48px] dt:px-0",
            "mb-[36px] px-[12px]",
          )}
        >
          <div 
            className={twJoin(
              "flex flex-col",
              "dt:w-[712px]",
            )}
          >
            <p
              className={twJoin(
                "dt:text-[32px] font-[700] leading-[28px]",
                "dt:mb-[8px]",
                "text-[24px]",
                "mb-[12px]",
              )}
            >
              Berachain Structued Product Vaults
            </p>
            <p
              className={twJoin(
                "dt:text-[14px] dt:font-[600] dt:text-gray80 dt:leading-auto",
                "text-[13px] font-[500] text-grayb3 leading-[18px]",
              )}
            >
              Moby's structured product vault, leverage Proof of Liquidity (PoL) on Berachain, offers sustainable, high-yield strategies. SPV enhances returns through short-term options trading while managing and automatically reinvesting rewards from DeFi protocols and nodes.
            </p>
          </div>
          <TotalStat tvlMap={tvlMap} />
        </div>
        <div
          className={twJoin(
            "grid gap-[20px]",
            "dt:grid-cols-[1fr,1fr,1fr] dt:gap-[25px]",
          )}
        >
          {Object.values(getDovInfo()).map((info: any, idx) => {

            const { title, tags, tokenImages, assetAllocations, strategy, underlying, contractAddress } = info
            const stakedBalance = dovStakedBalances[title]
            const hasStaking = (stakedBalance && stakedBalance.shareBalance != 0) || dovVaultQueueHasMap[contractAddress]

            const isLastIdx = idx === Object.values(getDovInfo()).length - 1

            return (
              <>
                <Vault
                  key={title}
                  hasStaking={hasStaking}
                  title={title}
                  tags={tags}
                  images={tokenImages}
                  apyIngredients={aprMap[title]}
                  tvl={tvlMap[title]}
                  strategy={strategy}
                  underlying={underlying}
                  price={spot[underlying]}
                  assetAllocations={assetAllocations}
                  selectVault={selectVault}
                />
                {isLastIdx && (
                  <div className="h-[20px]"></div>
                )}
              </>
            )
          })}
        </div>
      </div>
    </>
  )
}

export default EarnLanding