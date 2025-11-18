import { Ticker } from "@/enums/enums.appSlice"
import { useAppSelector } from "@/store/hooks"
import { dovAllowances$, dovAPRMap$, dovEpochInfos$, dovStakedBalances$, dovTokenBalances$, dovTokenPrices$, dovTVLMap$, getDOVAPR$, getDOVTVL$ } from "@/streams/dov"
import { getDovTokenPrices$ } from "@/streams/dov.external"
import { DOV_TICKER_TO_DECIMAL } from "@/utils/assets"
import { previewDeposit, previewRedeemMultiAssets, queryJoin } from "@/utils/contract.dov"
import { advancedFormatNumber } from "@/utils/helper"
import { isSameAddress } from "@/utils/misc"
import { SpotAssetIndexMap } from "@moby/shared"
import BigNumber from "bignumber.js"
import { useObservableState, useSubscription } from "observable-hooks"
import { useEffect, useMemo, useState } from "react"
import { forkJoin, from, interval, map, of, startWith, switchMap } from "rxjs"

export const useDOVGlobalData = () => {
  const interval$ = useMemo(() => interval(1000 * 30).pipe(
    startWith(0)
  ), [])

  const spotAssetIndexMap = useAppSelector((state: any) => state.market.spotAssetIndexMap) as SpotAssetIndexMap;
  const tvlMap = useObservableState(dovTVLMap$)
  const aprMap = useObservableState(dovAPRMap$)

  useSubscription(interval$, () => {
    forkJoin([
      getDovTokenPrices$(),
      getDOVAPR$(),
      getDOVTVL$(),
    ]).subscribe()
  })

  return {
    tvlMap,
    spot: spotAssetIndexMap,
    aprMap,
  }
}

export const useDovStakedInfo = (vaultInfo: any) => {

  useObservableState(dovStakedBalances$)
  useObservableState(dovTokenPrices$)
  // pure balance
  const dovStakedBalance = dovStakedBalances$.value[vaultInfo.title]
  const { shareBalance, stakingTokenBalance, collateralTokenBalance } = dovStakedBalance || {
    shareBalance: 0,
    stakingTokenBalance: 0,
    collateralTokenBalance: 0,
  }

  // decimal parsed
  const stakingTokenBalanceParsed = new BigNumber(stakingTokenBalance).div(10 ** vaultInfo.stakingToken.decimal).toString()
  const collateralTokenBalanceParsed = new BigNumber(collateralTokenBalance).div(10 ** DOV_TICKER_TO_DECIMAL[Ticker.DovAsset.USDC]).toString()
  const shareBalanceParsed = new BigNumber(shareBalance).div(10 ** DOV_TICKER_TO_DECIMAL[Ticker.DovAsset.SHARE]).toString()

  // inUSD
  const stakingTokenBalanceUSD = new BigNumber(stakingTokenBalanceParsed)
    .multipliedBy(dovTokenPrices$.value[vaultInfo.stakingToken.address])
    .toNumber()

  const collateralTokenBalanceUSD = new BigNumber(collateralTokenBalanceParsed).toNumber()

  // staked balances
  return {
    shareBalance: {
      raw: shareBalance,
      parsed: shareBalanceParsed,
    },
    stakingTokenBalance: { 
      raw: stakingTokenBalance,
      parsed: stakingTokenBalanceParsed,
      inUSD: stakingTokenBalanceUSD,
    },
    collateralTokenBalance: {
      raw: collateralTokenBalance,
      parsed: collateralTokenBalanceParsed,
      inUSD: collateralTokenBalanceUSD,
    }
  }
}

export const useDOVDepositFormInfo = (
  vaultInfo: any, 
  selectedAsset: string, 
  selectedAssetAddress: string, 
  amount: string,
) => {
  useObservableState(dovEpochInfos$)

  const [estimatedShares, setEstimatedShares] = useState<string>("0")
  
  const epochInfo = dovEpochInfos$.value?.[vaultInfo.title]

  // allowances
  useObservableState(dovAllowances$)
  const allowances = dovAllowances$.value[vaultInfo.title]
  const tokenAllowance = allowances?.[selectedAssetAddress]

  const needApprove = new BigNumber(amount)
    .multipliedBy(10 ** DOV_TICKER_TO_DECIMAL[selectedAsset])
    .gt(tokenAllowance)

  // balance
  const tokenBalance = useObservableState(dovTokenBalances$)

  const balance = tokenBalance?.[selectedAssetAddress]
  const balanceParsed = new BigNumber(balance)
    .div(10 ** DOV_TICKER_TO_DECIMAL[selectedAsset])
    .toString()

  // validation
  const canDeposit = Number(amount) != 0 && new BigNumber(balanceParsed).gte(amount)

  // estimated shares
  useEffect(() => {
    const amountPure = new BigNumber(amount || 0)
      .multipliedBy(10 ** DOV_TICKER_TO_DECIMAL[selectedAsset])
      .toString()

    const base$ = (isSameAddress(selectedAssetAddress, vaultInfo.stakingToken.address) || amountPure == "0")
      ? of(amountPure)
      : from(queryJoin(vaultInfo.stakingToken.address, selectedAssetAddress, amountPure)).pipe(
          map((result: any) => result[0])
        )

    const subscription = base$.pipe(
      switchMap((result: any) => {

        // Only 97% of the deposit will be used to buy shares
        return previewDeposit(
          vaultInfo.contractAddress, 
          new BigNumber(result).multipliedBy(0.97).toFixed(0)
        )
      })
    ).subscribe((result: any) => {


      const parsedShare = new BigNumber(result)
          .div(10 ** 18)
          .toString()

        setEstimatedShares(advancedFormatNumber(Number(parsedShare), 2))
    })

    return () => {
      subscription.unsubscribe()
    }

  }, [amount, vaultInfo.contractAddress, selectedAsset])

  return {
    epochInfo,
    estimatedShares,
    needApprove,
    canDeposit,
    isInTrading: epochInfo?.epochStage == 1,
    balance: {
      raw: balance,
      parsed: balanceParsed,
    },
  }
}

export const useDOVWithdrawFormInfo = (
  vaultInfo: any, 
  selectedAsset: string, 
  shareBalance: string,
  amount: string
) => {

  useObservableState(dovEpochInfos$)

  const [withdrawableAmount, setWithdrawableAmount] = useState({
    stakingToken: "0",
    collateralToken: "0",
  })

  const epochInfo = dovEpochInfos$.value?.[vaultInfo.title]

  const epochDiff = epochInfo?.epochNum 
    ? epochInfo.epochNum - epochInfo.lastDepositedEpoch
    : 0

  // validation
  const isWithdrawableEpoch = epochDiff > 2
  
  // const canWithdraw = new BigNumber(amount).gt(0) && new BigNumber(shareBalance).gte(amount) 

  // estimated shares
  useEffect(() => {
    const amountPure = new BigNumber(amount || 0)
      .multipliedBy(10 ** DOV_TICKER_TO_DECIMAL[selectedAsset])
      .toString()

    from(previewRedeemMultiAssets(vaultInfo.contractAddress, amountPure)).subscribe((result: any) => {

      const stakingTokenAmount = new BigNumber(result[0])
        .div(10 ** vaultInfo.stakingToken.decimal)
        .toString()
      
      const collatealTokenAmount = new BigNumber(result[1])
        .div(10 ** DOV_TICKER_TO_DECIMAL[Ticker.DovAsset.USDC])
        .toString()

      setWithdrawableAmount({
        stakingToken: stakingTokenAmount,
        collateralToken: collatealTokenAmount,
      })
    })

  }, [amount, vaultInfo.contractAddress, selectedAsset])

  return {
    isInTrading: epochInfo?.epochStage == 1,
    epochInfo,
    withdrawableAmount,
    isWithdrawableEpoch,
  }
}