import { BehaviorSubject, forkJoin, map, switchMap, tap } from 'rxjs'
import { fromFetch } from 'rxjs/fetch'

import { isSameAddress } from '@/utils/misc'
import { getContractAddress } from '@/utils/contract'
import { network$ } from './store'
import { dovTokenPrices$ } from './dov'
import { DOV_TICKER_TO_DECIMAL } from '@/utils/assets'
import { getDovInfo, getStakingToken } from '@/constants/constants.dov'
import { uniq } from 'lodash'
import { API_QUERY_BASE_URL } from '@/networks/apis'
import { SupportedChains } from '@/networks/constants'
import { getRpcUrlFromNetworkConfigs } from '@/networks/helpers'
import { Ticker } from '@/enums/enums.appSlice'

const BERAHUB_SUBGRAPH_URL = "https://api.berachain.com"
const BERA_SUBGRAPH_URL = "https://api.goldsky.com/api/public/project_clq1h5ct0g4a201x18tfte5iv/subgraphs/bex-subgraph/mainnet-v1.0.2/gn"

// deprecated
const BERPS_SUBGRAPH_URL = "https://api.goldsky.com/api/public/project_clq1h5ct0g4a201x18tfte5iv/subgraphs/bgt-subgraph/v1000000/gn"
const BERPS_API_URL = "https://bartio-berps.berachain.com/historical-rewards?count_back=3&resolution=1d"
const INFRARED_API_URL = API_QUERY_BASE_URL[SupportedChains["Berachain Mainnet"]] + "?method=infraredVaults"

// DOV token prices API
export const getDovTokenPrices$ = () => {
  const dovInfo = getDovInfo()

  const addressIn = uniq(
    [
      ...Object.values(dovInfo).map(({ stakingToken }: any) => stakingToken.address),
      ...Object.values(dovInfo).flatMap(({ tokenIngredients }: any) => tokenIngredients.map(({ address }: any) => address))
    ]
  )

  return fromFetch(BERA_SUBGRAPH_URL, {
    method: "POST",
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      "operationName": "getTokenPrices",
      "query": `query getTokenPrices {
        tokens(where: { address_in: [${addressIn.map(address => `"${address}"`)}] }) {
          address
          symbol
          decimals
          name
          latestUSDPrice
        }
      }`
    }),
    selector: (response) => response.json()
  }).pipe(
    map((response) => {

      return response?.data?.tokens.reduce((acc: any, { address, latestUSDPrice }: any) => {

        acc[address] = Number(latestUSDPrice)
        return acc
      }, {})
    }),
    tap((data) => {

      dovTokenPrices$.next(data)

      localStorage.setItem('dovTokenPrices', JSON.stringify(data))
    })
  )
}

// BERAHUB API
export const getBexPoolAPR$ = () => {
  return fromFetch(BERAHUB_SUBGRAPH_URL, {
    method: "POST",
    headers: {
      'Content-Type': 'application/json'
    },
    
    body: JSON.stringify({
      "operationName":"GetPools",
      "variables":{ "chain": "BERACHAIN", "first": 100, "orderBy": "totalLiquidity", "orderDirection": "desc", "skip": 0 },
      "query": "query GetPools($textSearch: String, $first: Int, $userAddress: String, $chain: [GqlChain!]!, $orderBy: GqlPoolOrderBy, $skip: Int, $orderDirection: GqlPoolOrderDirection) {\n  poolGetPools(\n    textSearch: $textSearch\n    first: $first\n    orderBy: $orderBy\n    orderDirection: $orderDirection\n    skip: $skip\n    where: {userAddress: $userAddress, chainIn: $chain}\n  ) {\n    ...MinimalPoolInList\n    __typename\n  }\n  count: poolGetPoolsCount(\n    textSearch: $textSearch\n    where: {userAddress: $userAddress, chainIn: $chain}\n  )\n}\n\nfragment MinimalPoolInList on GqlPoolMinimal {\n  id\n  name\n  address\n  factory\n  tokens: allTokens {\n    address\n    symbol\n    name\n    decimals\n    __typename\n  }\n  address\n  protocolVersion\n  type\n  dynamicData {\n    ...DynamicData\n    __typename\n  }\n  userBalance {\n    ...UserBalance\n    __typename\n  }\n  rewardVault {\n    ...RewardVault\n    __typename\n  }\n  __typename\n}\n\nfragment DynamicData on GqlPoolDynamicData {\n  totalShares\n  fees24h\n  volume24h\n  swapFee\n  isInRecoveryMode\n  isPaused\n  totalLiquidity\n  aprItems {\n    apr\n    type\n    id\n    __typename\n  }\n  __typename\n}\n\nfragment UserBalance on GqlPoolUserBalance {\n  totalBalanceUsd\n  walletBalance\n  walletBalanceUsd\n  __typename\n}\n\nfragment RewardVault on GqlRewardVault {\n  dynamicData {\n    activeIncentivesValueUsd\n    apr\n    bgtCapturePercentage\n    allTimeReceivedBGTAmount\n    __typename\n  }\n  isVaultWhitelisted\n  vaultAddress\n  stakingTokenAddress\n  __typename\n}"
    }),
    selector: (response) => response.json()
  }).pipe(
    map((response: any) => {

      return response?.data?.poolGetPools.reduce((acc: any, { address, dynamicData, rewardVault }: any) => {
        const baseAprSum = dynamicData.aprItems.reduce((acc: number, { apr }: any) => {
          return acc + (Number(apr) * 100)
        }, 0)

        // need to exclude bgtAPR, because we use infrared instead
        // const rewardApr = Number(rewardVault?.dynamicData?.apr) * 100
        // const aprSum = baseAprSum + rewardApr

        const aprSum = baseAprSum

        acc[address] = aprSum

        return acc
      }, {})
    })
  )
}

// BERPS API (not used)
const getBHONEYTVL$ = () => {
  const network = network$.value;
  const rpcUrl = getRpcUrlFromNetworkConfigs(network);

  return fromFetch(rpcUrl, {
    method: "POST",
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({"jsonrpc":"2.0","id":1,"method":"eth_call","params":[{"data":"0x20124bce","to":"0x1306D3c36eC7E38dd2c128fBe3097C2C2449af64"},"latest"]}),
    selector: (response) => response.json()
  }).pipe(
    map((response) => {
      return response.result / 10 ** DOV_TICKER_TO_DECIMAL.SHARE
    })
  ) 
}

const getBerpsBaseAPR$ = () => {
  return fromFetch(BERPS_API_URL, {
    selector: (response) => response.json()
  }).pipe(
    map((response) => {
      return Number(response?.result?.apr.slice(0, -1))
    })
  )
}

const getBeraPrice$ = () => {

  return fromFetch(BERPS_SUBGRAPH_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      "operationName": "GetTokenHoneyPrice",
      "variables": {
        "id": "0x7507c1dc16935b82698e4c63f2746a2fcf994df8"
      },
      "query": "query GetTokenHoneyPrice($id: String) {\n  tokenInformation(id: $id) {\n    id\n    usdValue\n    __typename\n  }\n}"
    }),
    selector: (response) => response.json()
  }).pipe(
    map((response) => {
      return response?.data?.tokenInformation?.usdValue || 0
    })
  )
}

const getBeraCuttingboardInfo$ = () => {
  const network = network$.value

  return fromFetch(BERPS_SUBGRAPH_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      "operationName": "getGlobalCuttingBoard",
      "variables": { },
      "query": "query getGlobalCuttingBoard {\n  globalCuttingBoardWeights {\n    id\n    amount\n    vault {\n      id\n      stakingToken {\n        id\n        __typename\n      }\n      __typename\n    }\n    __typename\n  }\n  globalInfo(id: \"global\") {\n    totalBgtStaked\n    rewardRate\n    baseRewardRate\n    __typename\n  }\n}"
    }),
    selector: (response) => response.json()
  }).pipe(
    map((response) => {

      const totalRewardRate = response?.data?.globalInfo?.rewardRate || 0 + response?.data?.globalInfo?.baseRewardRate || 0
      const totalBgtStaked = response?.data?.globalInfo?.totalBgtStaked || 0
      const bHoneyWeightAmount = response?.data?.globalCuttingBoardWeights?.find((o: any) => isSameAddress(o.vault.stakingToken.id, getContractAddress("BHONEY", network as "Berachain Mainnet")))?.amount || 0

      return {
        totalRewardRate,
        totalBgtStaked,
        bHoneyWeightAmount,
      }
    })
  )
}

export const getBerpsAPY$ = () => {

  return forkJoin([
    getBHONEYTVL$(),
    getBeraPrice$(),
    getBeraCuttingboardInfo$(),
    getBerpsBaseAPR$(),
  ]).pipe(
    map(([bHONEYTVL, beraPrice, cuttingboardInfo, baseAPR]) => {
      const { totalRewardRate, totalBgtStaked, bHoneyWeightAmount } = cuttingboardInfo

      const vaultShare = bHoneyWeightAmount / totalBgtStaked

      const blockTime = 4

      let annualization = (86400 / blockTime) * 365

      // 5. TVL
      let tvl = bHONEYTVL

      // Final calculation
      let rewardAPR = vaultShare * totalRewardRate * annualization * beraPrice / tvl

      return (baseAPR + rewardAPR) * 100
    })
  )
}

// INFRARED API
// @dev: infrared doesn't support to provider stakingToken, so we need to map the vault address to the stakingToken
const vaultAddressToStakingToken: Record<string, any> = {
  "0xe2d8941dfb85435419d90397b09d18024ebeef2c": getDovInfo()["WBERA-HONEY"].stakingToken,
  "0x1419515d3703d8f2cc72fa6a341685e4f8e7e8e1": getDovInfo()["USDC.e-HONEY"].stakingToken,
  "0xbbb228b0d7d83f86e23a5ef3b1007d0100581613": getDovInfo()["BYUSD-HONEY"].stakingToken,
}

export const getInfraredAPR$ = () => {
  return fromFetch(INFRARED_API_URL, {
    selector: (response) => response.json()
  }).pipe(
    map(({ vaults }: any) => {

      return vaults.reduce((acc: any, vault: any) => {

        const vaultAddress = vault?.address
        const stakeToken = vaultAddressToStakingToken[vaultAddress]

        if (!stakeToken) return acc

        const apr = Number(vault?.apr || 0) * 100

        return {
          ...acc,
          [stakeToken.address]: apr
        }
        
      }, {})
    })
  )
}