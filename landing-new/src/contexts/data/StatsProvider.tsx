import { ReactNode, useEffect, useRef, useState } from "react";
import { StatsContext, StatsData } from "./StatsContext";

import { API_URLS } from "../../shared/constants/urls";
import { BN } from "../../utils/bignumber";
import { STATS_DATA } from "../../shared/constants/data";
import { safeNumber } from "../../utils/formatters";

async function fetchAndDecompress(url: string) {
  const response = await fetch(url);
  const blob = await response.blob();

  // DecompressionStream API를 사용하여 gzip 해제
  const ds = new DecompressionStream("gzip");
  const decompressedStream = blob.stream().pipeThrough(ds);
  const decompressedBlob = await new Response(decompressedStream).blob();

  // 압축해제된 데이터를 JSON으로 파싱
  const text = await decompressedBlob.text();
  return JSON.parse(text);
}

export const StatsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const [data, setData] = useState<StatsData>(STATS_DATA);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refetch = async () => {
    try {
      setIsLoading(true);

      const [
        volumeDataArb,
        tradeDataArb,
        revenueDataArb,
        protocolNetRevenueArb,
        volumeDataBera,
        tradeDataBera,
        revenueDataBera,
        protocolNetRevenueBera,
      ] = await Promise.all([
        // Arb
        fetch(API_URLS.VOLUME_DATA_ARB).then((res) => res.json()),
        fetchAndDecompress(API_URLS.TRADE_DATA_ARB),
        fetch(API_URLS.REVENUE_DATA_ARB).then((res) => res.json()),
        fetch(API_URLS.PROTOCOL_NET_REVENUE_ARB).then((res) => res.json()),

        // Bera
        fetch(API_URLS.VOLUME_DATA_BERA).then((res) => res.json()),
        fetchAndDecompress(API_URLS.TRADE_DATA_BERA),
        fetch(API_URLS.REVENUE_DATA_BERA).then((res) => res.json()),
        fetch(API_URLS.PROTOCOL_NET_REVENUE_BERA).then((res) => res.json()),
      ]);

      setData((prevData) => ({
        ...prevData,
        totalTradingVolume: {
          ...prevData.totalTradingVolume,
          value: new BN(safeNumber(volumeDataArb.result.total_notional_volume))
            .plus(new BN(safeNumber(volumeDataBera.result.total_notional_volume)))
            .toNumber(),
        },
        dailyTradingVolume: {
          ...prevData.dailyTradingVolume,
          value: new BN(safeNumber(volumeDataArb.result.daily_notional_volume))
            .plus(new BN(safeNumber(volumeDataBera.result.daily_notional_volume)))
            .toNumber(),
        },
        totalContracts: {
          ...prevData.totalContracts,
          assets: {
            BTC: {
              ...prevData.totalContracts.assets.BTC,
              value: new BN(tradeDataArb.totalBtcSize).plus(new BN(tradeDataBera.totalBtcSize)).toNumber(),
            },
            ETH: {
              ...prevData.totalContracts.assets.ETH,
              value: new BN(tradeDataArb.totalEthSize).plus(new BN(tradeDataBera.totalEthSize)).toNumber(),
            },
          },
        },
        totalTransactionVolume: {
          ...prevData.totalTransactionVolume,
          value: new BN(revenueDataArb.result.total_premium_volume)
            .plus(new BN(revenueDataArb.result.total_fee_volume))
            .plus(new BN(revenueDataBera.result.total_premium_volume))
            .plus(new BN(revenueDataBera.result.total_fee_volume))
            .toNumber(),
        },
        protocolNetRevenue: {
          ...prevData.protocolNetRevenue,
          value: new BN(protocolNetRevenueArb.result.total_fee_usd)
            .plus(new BN(protocolNetRevenueArb.result.total_risk_premium_usd))
            .plus(new BN(protocolNetRevenueBera.result.total_fee_usd))
            .plus(new BN(protocolNetRevenueBera.result.total_risk_premium_usd))
            .toNumber(),
        },
      }));
    } catch (error) {
      console.log("Error fetching stats", error);
      setError(error as Error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refetch();
    intervalRef.current = setInterval(refetch, 60 * 1000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        if (!intervalRef.current) {
          intervalRef.current = setInterval(refetch, 60 * 1000);
          refetch();
        }
      } else {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return (
    <StatsContext.Provider value={{ data, isLoading, error, refetch }}>{children}</StatsContext.Provider>
  );
};
