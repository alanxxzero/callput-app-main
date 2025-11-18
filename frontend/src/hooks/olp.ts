import BigNumber from 'bignumber.js'
import { useAccount } from 'wagmi'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { writeHandleRewards } from '@/utils/contract'
import { OlpKey } from '@/utils/enums'
import { loadBalance } from '@/store/slices/UserSlice'
import { useEffect, useRef, useState } from 'react'
import { DayRange } from '@/components/Pools/PerformanceChart.option'
import dayjs from 'dayjs'
import { Tab } from '@/components/Pools/RevenueChart.option'
import { NetworkState } from '@/networks/types'
import { FuturesAssetIndexMap, SpotAssetIndexMap } from '@moby/shared'

BigNumber.config({
  EXPONENTIAL_AT: 1000,
  DECIMAL_PLACES: 80,
})

export const useMyOLPData = ({ olpKey }: any) => {  
  const { address } = useAccount()
  
  const dispatch = useAppDispatch()

  const { chain } = useAppSelector(state => state.network) as NetworkState;
  const userData = useAppSelector((state: any) => state.user)
  const userBalance = userData.balance

  const futuresAssetIndexMap = useAppSelector((state: any) => state.market.futuresAssetIndexMap) as FuturesAssetIndexMap;
  const olpMetricsData = useAppSelector((state: any) => state.app.olpMetrics)
  
  const [loading, setLoading] = useState(true)

  const [stakedOlp, setStakedOlp] = useState<string>("0")
  const [claimable, setClaimable] = useState<string>("0")
  const [olpPrice, setOlpPrice] = useState<string>("0")
  const [isButtonLoading, setIsButtonLoading] = useState<boolean>(false)

  const handleRewards = async () => {
    setIsButtonLoading(true)
    
    const result = await writeHandleRewards(olpKey as OlpKey, chain)

    if (result && address) {
      dispatch(loadBalance({ chain, address }))
    }

    setIsButtonLoading(false)
  }

  useEffect(() => {
    if (!address) return setLoading(false)

    setClaimable(userBalance.claimableReward[olpKey]);
    setStakedOlp(new BigNumber(userBalance.olpToken[olpKey]).toString())
    setOlpPrice(new BigNumber(olpMetricsData[olpKey].price).dividedBy(10 ** 30).toString());
    setLoading(false)

  }, [userBalance, olpMetricsData, claimable])

  useEffect(() => {
    if (!address) {
      // Reset the state
      setClaimable("0");
      setStakedOlp("0")
      setOlpPrice("0");
      setLoading(false)
    }
  }, [address])

  const stakedOlpUsd = new BigNumber(stakedOlp).multipliedBy(olpPrice).toNumber()
  const claimableUsd = new BigNumber(claimable).multipliedBy(futuresAssetIndexMap.eth).toNumber()

  return {
    loading,
    stakedOlp,
    stakedOlpUsd,
    claimable,
    claimableUsd,
    isButtonLoading,
    handleRewards,
  }
}

export const useOLPTotalStat = ({ olpKey }: any) => {
  const { isBerachain } = useAppSelector(state => state.network) as NetworkState;

  const [tvlComposition, setTVLComposition] = useState({ wbtc: "0", weth: "0", usdc: "0", honey: "0" })
  
  const spotAssetIndexMap = useAppSelector((state: any) => state.market.spotAssetIndexMap) as SpotAssetIndexMap;
  const olpStats = useAppSelector((state: any) => state.market.olpStats);

  // Calculate TVL
  useEffect(() => {
    if (!spotAssetIndexMap) return

    const data = { wbtc: "0", weth: "0", usdc: "0", honey: "0" }

    const olpAssetAmounts = olpStats[olpKey].assetAmounts

    data.wbtc = new BigNumber(olpAssetAmounts.wbtc.depositedAmount).multipliedBy(spotAssetIndexMap.btc).toString()
    data.weth = new BigNumber(olpAssetAmounts.weth.depositedAmount).multipliedBy(spotAssetIndexMap.eth).toString()
    data.usdc = new BigNumber(olpAssetAmounts.usdc.depositedAmount).multipliedBy(spotAssetIndexMap.usdc).toString()

    if (isBerachain) {
      data.honey = new BigNumber(olpAssetAmounts.honey.depositedAmount).multipliedBy(spotAssetIndexMap.honey).toString()
    }

    setTVLComposition(data)
  }, [spotAssetIndexMap, olpStats])

  const tvl = new BigNumber(tvlComposition.wbtc)
      .plus(tvlComposition.weth)
      .plus(tvlComposition.usdc)
      .plus(tvlComposition.honey)
      .toNumber()

  return { 
    tvl, 
    tvlComposition,
  }
}

export const useOlpPerformanceChart = ({ data, defaultOption }: any) => {
  const [chartInstance, setChartInstance] = useState<any>(null);
  const echartsRef = useRef<any>(null)
  const [activeDayRange, setDayRange] = useState<DayRange>(DayRange.D30)

  const detailData = data[activeDayRange] || {}

  const olpPerformanceData = Object.entries(detailData?.olpPerformance || {})
      .map(([date, value]: any) => ({ date, ...value, }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  const getOptions = (data: any) => {

    if (Object.keys(data).length === 0) return {}
    
    const yMin = 0.9

    const totalPoints = olpPerformanceData.length

    return {
      ...defaultOption,
      xAxis: {
        ...defaultOption.xAxis,
        axisLabel: {
          textStyle: {
            fontSize: "12px",
          },
          interval: (index: number) => {

            return (
              index === Math.floor(totalPoints / 3) ||
              index === Math.floor(totalPoints * 2 / 3)
            );
          }
        },
        data: olpPerformanceData?.map((item: any) => dayjs(item.date).format('DD MMM')),
      },
      yAxis: {
        ...defaultOption.yAxis,
        min: yMin,
      },
      series: [
        {
          ...defaultOption.series[0],
          data: olpPerformanceData?.map((item: any) => item.total_value_per_olp)
        },
        {
          ...defaultOption.series[1],
          data: olpPerformanceData?.map((item: any) => item.olp_price)
        }
      ]
    }
  }

  useEffect(() => {
    if (chartInstance) {
      chartInstance.setOption(getOptions(detailData));
    }
  }, [detailData])

  return {
    detailData,
    setChartInstance,
    echartsRef,
    activeDayRange,
    setDayRange,
    getOptions,
  }
}

export const useRevenueChart = ({ data, defaultOption }: any) => {
  const [chartInstance, setChartInstance] = useState<any>(null);
  const echartsRef = useRef<any>(null)
  const [activeDayRange, setDayRange] = useState<DayRange>(DayRange.D30)
  const [activeTab, setActiveTab] = useState<Tab>(Tab.Volume)
  
  const detailData = data[activeDayRange] || {}

  const revenueData = Object.entries(detailData?.revenue || {})
    .map(([date, value]: any) => ({ date, ...value }))
    .sort((a, b) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime()
    })

  const getTotalValue = () => {

    if (activeTab == Tab.PNL) {
      return revenueData[revenueData.length - 1][`pnl_${activeDayRange}d`] || 0
    }

    return revenueData.reduce((acc: any, item: any) => {  
        if (activeTab === Tab.Volume) return acc + Number(item?.notional_volume)

        return acc + Number(item?.fees) + Number(item?.risk_premium)
      }, 0)
  }

  const getBarWidth = () => {
    if (activeDayRange === DayRange.D30) return 18
    if (activeDayRange === DayRange.D60) return 8
    return 3
  }

  const getOptions = (data: any) => {
    if (Object.keys(data).length === 0) return {}

    return {
      ...defaultOption,
      xAxis: {
        ...defaultOption.xAxis,
        axisLabel: {
          textStyle: {
            fontSize: "12px",
          }
        },
        data: revenueData?.map((item: any) => dayjs(item.date).format('DD MMM')),
      },
      yAxis: {
        ...defaultOption.yAxis,
      },
      series: [
        {
          ...defaultOption.series[0],
          barWidth: getBarWidth(),
          data: revenueData?.map((item: any) => {

            if (activeTab === Tab.Volume) {
              return Number(item.notional_volume)
            }

            if (activeTab === Tab.PNL) {
              return Number(item.pnl)
            }

            return Number(item.fees) + Number(item.risk_premium)
          })
        }
      ]
    }
  }

  useEffect(() => {
    if (chartInstance) {
      chartInstance.setOption(getOptions(detailData));
    }
  }, [detailData])

  return {
    detailData,
    setChartInstance,
    echartsRef,
    activeDayRange,
    setDayRange,
    activeTab,
    setActiveTab,
    getOptions,
    getTotalValue,
  }
}