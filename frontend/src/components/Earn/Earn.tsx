import { useEffect, useState } from "react";
import { twJoin } from "tailwind-merge";
import { forkJoin, interval, merge, startWith, switchMap } from "rxjs";
import { useObservableState, useSubscription } from "observable-hooks";
import EarnLanding from "./EarnLanding";
import EarnDetail from "./EarnDetail";
import {
  dovAllowances$,
  dovAPRMap$,
  dovStakedBalances$,
  dovTokenBalances$,
  dovTVLMap$,
  dovVaultQueueHasMap$,
  dovVaultQueueItems$,
  getDovAllowances$,
  getDOVAPR$,
  getDovEpochInfos$,
  getDovStakedBalance$,
  getDovTokenBalances$,
  getDOVTVL$,
  getDovVaultQueueItems$,
  hasDovVaultQueueItems$,
  updateBalance$,
} from "@/streams/dov";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getDovInfo } from "@/constants/constants.dov";
import { isSameAddress } from "@/utils/misc";
import { useAppSelector } from "@/store/hooks";
import { useDOVGlobalData } from "@/hooks/dov";
import { disconnect$ } from "@/streams/store";
import { useAccount } from "wagmi";
import { NetworkState } from "@/networks/types";
import { NormalizedSpotAsset } from "@moby/shared";

type Props = {
  announcementsLen?: number;
};

const interval$ = interval(1000 * 60).pipe(startWith(0))

const Earn: React.FC<Props> = ({ announcementsLen }) => {
  const { address } = useAccount();
  const { isBerachain } = useAppSelector(state => state.network) as NetworkState;
  const navigate = useNavigate();

  const { isMobile } = useAppSelector((state: any) => state.device);

  const [searchParams] = useSearchParams();
  const [topPadding, setTopPadding] = useState(0);
  const { tvlMap, aprMap, spot } = useDOVGlobalData();

  const selectedVaultAddress: any = searchParams.get('v') || ""

  useEffect(() => {
    setTopPadding((announcementsLen || 0) * 46 + 46);
  }, [announcementsLen, isMobile]);

  useSubscription(merge(updateBalance$, interval$), () => {
    if (!address) return;

    const vaultAddressList = [
      ...new Set(Object.values(getDovInfo()).map(({ contractAddress }: any) => contractAddress)),
    ];

    forkJoin([
      getDovTokenBalances$(address as `0x${string}`),
      getDovStakedBalance$(address as `0x${string}`),
      getDovAllowances$(address as `0x${string}`),
      getDovEpochInfos$(address as `0x${string}`),
      hasDovVaultQueueItems$(address as `0x${string}`, vaultAddressList),
    ]).subscribe();
  });

  useEffect(() => {
    if (!address || !selectedVaultAddress) return;
    getDovVaultQueueItems$(address as `0x${string}`, selectedVaultAddress).subscribe();
    updateBalance$.next(true);
  }, [address, selectedVaultAddress]);

  useSubscription(
    merge(updateBalance$, interval$),
    () => {
      if (!address) return

      const vaultAddressList = [
        ...new Set(Object.values(getDovInfo()).map(({ contractAddress }: any) => contractAddress))
      ]

      forkJoin([
        getDovTokenBalances$(address as `0x${string}`),
        getDovStakedBalance$(address as `0x${string}`),
        getDovAllowances$(address as `0x${string}`),
        getDovEpochInfos$(address as `0x${string}`),
        hasDovVaultQueueItems$(address as `0x${string}`, vaultAddressList)
      ]).subscribe()
  })

  useEffect(() => {
    if (!address || !selectedVaultAddress) return
    getDovVaultQueueItems$(address as `0x${string}`, selectedVaultAddress).subscribe()
    updateBalance$.next(true)
  }, [address, selectedVaultAddress])

  // when disconnected, reset all dov states
  useSubscription(disconnect$, () => {
    dovTokenBalances$.next({});
    dovStakedBalances$.next({});
    dovAllowances$.next({});
    dovVaultQueueItems$.next({});
    dovVaultQueueHasMap$.next({});
  });

  if (!isBerachain) {
    navigate("/");
    return <></>;
  }

  const selectVault = (vaultAddress: `0x${string}` | null) => {
    if (!vaultAddress) return navigate("");
    navigate(`?v=${vaultAddress}`);
  };

  const _vaultInfo: any = Object.values(getDovInfo()).find(({ contractAddress }: any) =>
    isSameAddress(contractAddress, selectedVaultAddress)
  );

  const selectedVaultInfo = selectedVaultAddress 
    ? { 
        ..._vaultInfo,
        tvl: tvlMap?.[_vaultInfo.title],
        price: spot?.[_vaultInfo.underlying as NormalizedSpotAsset],
      }
    : null

  return (
    <div
      style={{
        paddingTop: isMobile ? "12px" : `${topPadding + 42}px`,
      }}
      className={twJoin(
        "relative",
        "flex flex-row justify-center items-center",
        "pb-[72px] w-full h-full",
        "bg-[#0A0A0A]"
      )}
    >
      {selectedVaultInfo ? (
        <EarnDetail vaultInfo={selectedVaultInfo} aprMap={aprMap} selectVault={selectVault} />
      ) : (
        <EarnLanding selectVault={selectVault} spot={spot} tvlMap={tvlMap} aprMap={aprMap} />
      )}
    </div>
  );
};

export default Earn;
