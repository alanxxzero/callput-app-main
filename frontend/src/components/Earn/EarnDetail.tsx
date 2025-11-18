import React, { useEffect } from 'react'
import { twMerge, twJoin } from 'tailwind-merge'

import RewardsComponent from './rewards/RewardsComponent';
import VaultInfo from './VaultInfo/VaultInfo';
import UserPosition from './UserPosition/UserPosition';
import { useObservableState, useSubscription } from 'observable-hooks';
import { getDovAllowances$, getDovEpochInfos$, getDovStakedBalance$, getDovTokenBalances$, getDovVaultQueueItems$, updateBalance$ } from '@/streams/dov';
import { useAccount } from 'wagmi';
import { forkJoin, interval, merge, startWith } from 'rxjs';
import EarnDetailHeader from './EarnDetailHeader';
import DesktopOnly from '../Common/DesktopOnly';

type Props = {
  vaultInfo: any;
  aprMap: any;  
  selectVault: (...args: any[]) => void;
}

const interval$ = interval(1000 * 60).pipe(
  startWith(0)
)

const EarnDetail = ({ vaultInfo, selectVault, aprMap }: Props) => {
  const apyIngredients = aprMap[vaultInfo?.title]

  return (
    <>
      <div
        className={twJoin(
          "flex flex-col",
          "dt:w-[1216px] dt:max-w-[1216px] dt:min-w-[1216px] dt:min-h-screen",
          "w-full",
        )}
      >
        <EarnDetailHeader 
          selectVault={selectVault} 
          vaultInfo={vaultInfo}
          apyIngredients={apyIngredients}
        />
        <div
          className={twJoin(
            "grid gap-[25px]",
            "dt:grid-cols-[1fr,780px]",
          )}
        >
          <div
            className={twJoin(
              "flex flex-col items-center",
            )}
          >
            <UserPosition vaultInfo={vaultInfo} />
            <DesktopOnly>
              <RewardsComponent apyIngredients={apyIngredients} />
            </DesktopOnly>
          </div>
          <DesktopOnly>
            <VaultInfo vaultInfo={vaultInfo} aprMap={aprMap} />
          </DesktopOnly>
        </div>
      </div>
    </>
  )
}

export default EarnDetail