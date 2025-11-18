import { useUAPriceChangeRate } from "@/hooks/market";
import { useHasPosition } from "@/hooks/user";
import { UA_INFO } from "@/networks/assets";
import { SupportedChains } from "@/networks/constants";
import { FuturesAssetIndexMap, NormalizedFuturesAsset, UnderlyingAsset } from "@moby/shared";
import { useAppSelector } from "@/store/hooks";
import { advancedFormatNumber } from "@/utils/helper";
import { twJoin } from "tailwind-merge";
import IconArrowPriceDown from "@assets/icon-arrow-price-down.svg";
import IconArrowPriceUp from "@assets/icon-arrow-price-up.svg";

interface AssetSelectorProps {
  selectedUnderlyingAsset: UnderlyingAsset;
  setSelectedUnderlyingAsset: (underlyingAsset: UnderlyingAsset) => void;
  chain: SupportedChains;
}

function AssetSelector({ selectedUnderlyingAsset, setSelectedUnderlyingAsset, chain }: AssetSelectorProps) {
  const futuresAssetIndexMap = useAppSelector((state: any) => state.market.futuresAssetIndexMap) as FuturesAssetIndexMap;

  return (
    <div className="flex flex-row items-center gap-[4px]">
      {Object.keys(UA_INFO[chain]).map((asset) => (
        <AssetButton
          key={asset}
          asset={asset as UnderlyingAsset}
          chain={chain}
          isSelected={asset === selectedUnderlyingAsset}
          futuresPrice={futuresAssetIndexMap[asset as NormalizedFuturesAsset]}
          onSelect={() => setSelectedUnderlyingAsset(asset as UnderlyingAsset)}
        />
      ))}
    </div>
  );
}

export default AssetSelector;

interface AssetButtonProps {
  asset: UnderlyingAsset;
  chain: SupportedChains;
  isSelected: boolean;
  futuresPrice: number;
  onSelect: () => void;
}

function AssetButton({ asset, chain, isSelected, futuresPrice, onSelect }: AssetButtonProps) {
  const assetInfo = UA_INFO[chain][asset];
  const hasPositionInAsset = useHasPosition();

  const { diff, changeRate } = useUAPriceChangeRate({
    futuresPrice,
    underlyingAsset: asset,
  });

  return (
    <button
      className={twJoin(
        "cursor-pointer flex flex-row items-center",
        "h-[48px] px-[16px] py-[7px] rounded-[6px]",
        "active:bg-black1f active:opacity-80 active:scale-95",
        isSelected && ["bg-black29"],
        !isSelected && "hover:bg-white/10"
      )}
      onClick={onSelect}
    >
      <AssetIcon src={assetInfo.src} showPositionIndicator={!isSelected && hasPositionInAsset[asset]} />
      <AssetInfo
        symbol={assetInfo.symbol}
        isSelected={isSelected}
        futuresPrice={futuresPrice}
        diff={diff}
        changeRate={changeRate}
      />
    </button>
  );
}

function AssetIcon({ src, showPositionIndicator }: { src: string; showPositionIndicator: boolean }) {
  return (
    <div className="relative">
      <img src={src} className="w-[24px] h-[24px]" />
      {showPositionIndicator && (
        <div
          className={twJoin(
            "absolute top-[-1px] right-[-2px]",
            "w-[9px] h-[9px] bg-[#F74143] rounded-full",
            "border-[1px] border-black29"
          )}
        />
      )}
    </div>
  );
}

function AssetInfo({
  symbol,
  isSelected,
  futuresPrice,
  diff,
  changeRate,
}: {
  symbol: string;
  isSelected: boolean;
  futuresPrice: number;
  diff: number;
  changeRate: number;
}) {
  return (
    <div className="flex flex-col items-baseline ml-[10px]">
      <p
        className={twJoin(
          "h-[20px] text-[15px]",
          isSelected ? "font-bold text-[#f5f5f5]" : "font-semibold text-[#b3b3b3]"
        )}
      >
        {symbol} Options
      </p>
      <div className={twJoin("flex items-center h-[14px]")}>
        <div className="text-gray80 text-[11px] font-semibold">
          {advancedFormatNumber(futuresPrice, 2, "$")}
        </div>
        <PriceChangeIndicator diff={diff} changeRate={changeRate} />
      </div>
    </div>
  );
}

function PriceChangeIndicator({ diff, changeRate }: { diff: number; changeRate: number }) {
  return (
    <div className="flex flex-row items-center ml-[2px]">
      {diff === 0 ? (
        <p></p>
      ) : diff > 0 ? (
        <img src={IconArrowPriceUp} className="w-[10px] h-[10px]" />
      ) : (
        <img src={IconArrowPriceDown} className="w-[10px] h-[10px]" />
      )}

      <div
        className={twJoin(
          diff === 0 ? "text-gray80" : diff > 0 ? "text-[#63E073]" : "text-[#E03F3F]",
          "flex flex-row justify-center items-center ml-[2px]",
          "text-[11px] font-semibold"
        )}
      >
        {advancedFormatNumber(changeRate, 2)}%
      </div>
    </div>
  );
}
