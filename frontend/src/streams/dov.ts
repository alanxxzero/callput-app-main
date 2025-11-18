import { aprMetadata, getDovInfo } from '@/constants/constants.dov'
import { BehaviorSubject, forkJoin, from, of, Subject, tap } from 'rxjs'
import { getDOVAllowances, getDovStakedBalance, getDOVStrategyAPR, getDovTokenBalance, getDOVTVL, getEpochInfos } from '@/utils/contract.dov'
import { getBerpsAPY$, getBexPoolAPR$, getInfraredAPR$ } from './dov.external'
import { network$ } from './store'
import { fromFetch } from 'rxjs/fetch'
import { isSameAddress } from '@/utils/misc'
import { getContractAddress } from '@/utils/contract'
import { Interface } from 'ethers'
import DovVaultQueueEventsABI from '../../../shared/abis/DovVaultQueueEvents.json'
import { uniqBy } from 'lodash'
import { API_QUERY_BASE_URL, VAULT_QUEUE_ITEMS_API } from '@/networks/apis'

// dov states
export const dovTokenPrices$ = new BehaviorSubject<any>(localStorage.getItem('dovTokenPrices')
  ? JSON.parse(localStorage.getItem('dovTokenPrices') || '{}') 
  : {}
)
export const dovTokenBalances$ = new BehaviorSubject<any>({})
export const dovStakedBalances$ = new BehaviorSubject<any>({})
export const dovAllowances$ = new BehaviorSubject<any>({})
export const dovEpochInfos$ = new BehaviorSubject<any>({})
export const dovStrategyAPRMap$ = new BehaviorSubject<any>({})
export const dovTVLMap$ = new BehaviorSubject<any>({})
export const dovAPRMap$ = new BehaviorSubject<any>(localStorage.getItem('dovAPRMap') 
  ? JSON.parse(localStorage.getItem('dovAPRMap') || '{}')
  : {}
)
export const dovVaultQueueItems$ = new BehaviorSubject<any>({})
export const dovVaultQueueHasMap$ = new BehaviorSubject<any>({})

// @ts-ignore
window.dovTokenBalances$ = dovTokenBalances$

export const updateBalance$ = new Subject()

export const getDOVTVL$ = () => {
  return from(getDOVTVL()).pipe(
    tap((data) => {
      dovTVLMap$.next(data)
    })
  )
}

export const getDovStrategyAPR$ = () => {
  return from(getDOVStrategyAPR())
}

export const getDOVAPR$ = () => {
  return forkJoin([
    getDovStrategyAPR$(), // MOBY Options Strategy
    getBexPoolAPR$(), // BERAHUB
    getInfraredAPR$(), // INFRARED
    // getBerpsAPY$(), // BERPS
  ]).pipe(
    tap(([strategyAPR, bexAPR, infraredAPY]: any) => {
      if (!infraredAPY) return

      const data: any = Object.values(getDovInfo()).reduce((acc: any, cur: any) => {

        // if (cur.tags.includes("BERPS")) {
        //     acc[cur.title] = {
        //       "BERPS": berpsAPY,
        //       "INFRARED": infraredAPY[cur.stakingToken.symbol],
        //       "MOBY": strategyAPR[cur.title],
        //       "MOBYPOINT": "Variable",
        //       "BERANODE": "Converting to LP",
        //     }
        // }

        if (cur.tags.includes("BERAHUB")) {
          acc[cur.title] = {
            "BERAHUB": bexAPR[cur.stakingToken.address] || 0,
            "INFRARED": infraredAPY[cur.stakingToken.address],
            "MOBY": strategyAPR[cur.title],
            // "MOBYPOINT": "Variable",
            "BERANODE": "Converting to LP",
          }
        }

        return acc

      }, {})

      const formatted = Object.entries(data).reduce((acc, [key, aprMap]: any) => {
        return {
          ...acc,
          [key]: Object.entries(aprMap).map(([key, value]) => {
            return { key, title: aprMetadata[key].title, apy: value }
          })
        }
      }, {})

      dovAPRMap$.next(formatted)

      localStorage.setItem('dovAPRMap', JSON.stringify(formatted))
    })
  )
}

export const getDovTokenBalances$ = (address: `0x${string}`) => {
  return from(getDovTokenBalance(address)).pipe(
    tap((data) => {
      dovTokenBalances$.next(data)
    })
  )
}

export const getDovStakedBalance$ = (address: `0x${string}`) => {
  return from(getDovStakedBalance(address)).pipe(
    tap((data) => {
      dovStakedBalances$.next(data)
    })
  )
}

export const getDovAllowances$ = (address: `0x${string}`) => {
  return from(getDOVAllowances(address)).pipe(
    tap((data) => {
      dovAllowances$.next(data)
    })
  )
}

export const getDovEpochInfos$ = (address: `0x${string}`) => {
  return from(getEpochInfos(address)).pipe(
    tap((data) => {
      dovEpochInfos$.next(data)
    })
  )
}

export const getDovVaultQueueItems$ = (address: `0x${string}`, vaultAddress: `0x${string}`) => {
  const network = network$.value

  if (!address) {
    dovVaultQueueItems$.next({})
    return of(false)
  }
  
  return fromFetch(`${VAULT_QUEUE_ITEMS_API[network]}&address=${address}&vaultAddress=${vaultAddress}`, {
    selector: (response) => response.json()
  }).pipe(
    tap((data) => {
      dovVaultQueueItems$.next(data)
    })
  )
}

export const hasDovVaultQueueItems$ = (address: `0x${string}`, vaultAddressList: `0x${string}`[]) => {
  const network = network$.value

  if (!address) {
    dovVaultQueueItems$.next({})
    return of(false)
  }
  
  return fromFetch(`${API_QUERY_BASE_URL[network]}`, {
    method: 'POST',
    body: JSON.stringify({ 
      method: "hasVaultQueueItems",
      address, 
      vaultAddressList 
    }),
    selector: (response) => response.json()
  }).pipe(
    tap((data) => {
      dovVaultQueueHasMap$.next(data)
    })
  )
}

export const getVaultQueueEventLogs = (receipt: any) => {
  if (!receipt.logs) return false

  const item = receipt
    .logs
    .filter(({ address }: any) => isSameAddress(address, getContractAddress("DOV_VAULT_QUEUE_EVENTS", network$.value as "Berachain Mainnet")))
    .map((log: any) => new Interface(DovVaultQueueEventsABI).parseLog(log))[0]

  if (!item) return false

  const [
    vaultAddress,
    vaultQueueAddress,
    index,
    actionType,
    user,
    amount,
    receiver,
  ] = item.args

  return {
    vaultAddress,
    vaultQueueAddress,
    index,
    actionType,
    user,
    amount,
    receiver,
  }
}

export const addQueueItem = (queueItem: any, isDeposit: boolean) => {
  if (!queueItem) return

  if (isDeposit) {
    // ensure unique index
    const newDeposits = uniqBy([...dovVaultQueueItems$?.value?.deposits, queueItem], 'index')
    dovVaultQueueItems$.next({ deposits: newDeposits, withdrawals: dovVaultQueueItems$?.value?.withdrawals })
  }

  if (!isDeposit) {
    // ensure unique index
    const newWithdrawals = uniqBy([...dovVaultQueueItems$?.value?.withdrawals, queueItem], 'index')
    dovVaultQueueItems$.next({ deposits: dovVaultQueueItems$?.value?.deposits, withdrawals: newWithdrawals })
  }
}

export const delQueueItem = (queueItem: any, isDeposit: boolean) => {
  if (!queueItem) return

  if (isDeposit) {
    const newDeposits = dovVaultQueueItems$?.value?.deposits?.filter((deposit: any) => deposit.index != queueItem.index)
    dovVaultQueueItems$.next({ deposits: newDeposits, withdrawals: dovVaultQueueItems$?.value?.withdrawals })
  }

  if (!isDeposit) {
    const newWithdrawals = dovVaultQueueItems$?.value?.withdrawals?.filter((withdrawal: any) => withdrawal.index != queueItem.index)
    dovVaultQueueItems$.next({ deposits: dovVaultQueueItems$?.value?.deposits, withdrawals: newWithdrawals })
  }
}