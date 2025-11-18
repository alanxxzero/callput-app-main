import { UnderlyingAssetWithAll } from "@moby/shared";
import { twJoin } from "tailwind-merge";
import IconBTCSelected from "@assets/trading-v2/icon-btc-selected.png";
import IconBTCInactive from "@assets/trading-v2/icon-btc-unselected.png";
import IconETHSelected from "@assets/trading-v2/icon-eth-selected.png";
import IconETHInactive from "@assets/trading-v2/icon-eth-unselected.png";

interface PositionStatisticsAssetSelectorProps {
  underlyingAsset: UnderlyingAssetWithAll;
  setUnderlyingAsset: (underlyingAsset: UnderlyingAssetWithAll) => void;
  setCurrentPage: (page: number) => void;
}

function PositionStatisticsAssetSelector({
  underlyingAsset,
  setUnderlyingAsset,
  setCurrentPage,
}: PositionStatisticsAssetSelectorProps) {
  const selectableUnderlyingAssets: UnderlyingAssetWithAll[] = ["ALL", "BTC", "ETH"];

  return (
    <div className="flex flex-row items-center gap-[4px]">
      {selectableUnderlyingAssets.map((selectableUnderlyingAsset) => (
        <UnderlyingAssetButton
          key={selectableUnderlyingAsset}
          underlyingAsset={selectableUnderlyingAsset}
          isSelected={selectableUnderlyingAsset === underlyingAsset}
          onClick={() => {
            setUnderlyingAsset(selectableUnderlyingAsset);
            setCurrentPage(1);
          }}
        />
      ))}
    </div>
  );
}

export default PositionStatisticsAssetSelector;

interface UnderlyingAssetButtonProps {
  underlyingAsset: UnderlyingAssetWithAll;
  isSelected: boolean;
  onClick: () => void;
}

function UnderlyingAssetButton({ underlyingAsset, isSelected, onClick }: UnderlyingAssetButtonProps) {
  const underlyingAssetIcon = getUnderlyingAssetIconSource(isSelected, underlyingAsset);

  return (
    <button
      className={twJoin(
        "cursor-pointer flex flex-row items-center justify-center",
        "w-[36px] h-[36px] p-[6px] rounded-[6px]",
        "text-[13px] text-grayb3 font-semibold",
        "hover:bg-black1f",
        "active:bg-transparent active:opacity-80 active:scale-95",
        isSelected && "bg-black29"
      )}
      onClick={onClick}
    >
      {underlyingAssetIcon ? (
        <img src={underlyingAssetIcon} alt={underlyingAsset} className="w-[24px] h-[24px]" />
      ) : (
        <div className={twJoin("text-[13px]", isSelected && "text-greene6 font-bold")}>All</div>
      )}
    </button>
  );
}

function getUnderlyingAssetIconSource(isSelected: boolean, underlyingAsset: UnderlyingAssetWithAll) {
  if (underlyingAsset === "ALL") return undefined;
  if (underlyingAsset === "BTC") {
    return isSelected ? IconBTCSelected : IconBTCInactive;
  } else if (underlyingAsset === "ETH") {
    return isSelected ? IconETHSelected : IconETHInactive;
  }
}
