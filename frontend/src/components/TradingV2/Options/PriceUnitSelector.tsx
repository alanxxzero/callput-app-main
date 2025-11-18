import { UnderlyingAsset } from "@moby/shared";
import { PriceUnit } from "@/utils/types";
import { twJoin } from "tailwind-merge";
import IconBTCSelected from "@assets/trading-v2/icon-btc-selected.png";
import IconBTCInactive from "@assets/trading-v2/icon-btc-unselected.png";
import IconETHSelected from "@assets/trading-v2/icon-eth-selected.png";
import IconETHInactive from "@assets/trading-v2/icon-eth-unselected.png";
import IconUSDSelcted from "@assets/trading-v2/icon-usd-selected.png";
import IconUSDInactive from "@assets/trading-v2/icon-usd-unselected.png";
import { useEffect } from "react";

interface PriceUnitSelectorProps {
  selectedUnderlyingAsset: UnderlyingAsset;
  selectedPriceUnit: PriceUnit;
  setSelectedPriceUnit: (priceUnit: PriceUnit) => void;
}

function PriceUnitSelector({
  selectedUnderlyingAsset,
  selectedPriceUnit,
  setSelectedPriceUnit,
}: PriceUnitSelectorProps) {
  const priceUnits: PriceUnit[] = [selectedUnderlyingAsset, "USD"];

  useEffect(() => {
    if (selectedPriceUnit !== "USD" && selectedPriceUnit !== selectedUnderlyingAsset) {
      setSelectedPriceUnit(selectedUnderlyingAsset);
    }
  }, [selectedUnderlyingAsset]);

  return (
    <div className="flex flex-row items-center gap-[4px]">
      {priceUnits.map((priceUnit) => (
        <PriceUnitButton
          key={priceUnit}
          priceUnit={priceUnit}
          isSelected={priceUnit === selectedPriceUnit}
          onClick={() => setSelectedPriceUnit(priceUnit)}
        />
      ))}
    </div>
  );
}

export default PriceUnitSelector;

interface PriceUnitButtonProps {
  priceUnit: PriceUnit;
  isSelected: boolean;
  onClick: () => void;
}

function PriceUnitButton({ priceUnit, isSelected, onClick }: PriceUnitButtonProps) {
  return (
    <button
      className={twJoin(
        "cursor-pointer flex flex-row items-center justify-between",
        "w-[36px] h-[36px] p-[6px] rounded-[6px]",
        "text-[13px] text-grayb3 font-semibold",
        "hover:bg-black1f",
        "active:bg-transparent active:opacity-80 active:scale-95",
        isSelected && "bg-black29"
      )}
      onClick={onClick}
    >
      <img
        src={getPriceUnitIconSource(isSelected, priceUnit)}
        alt={priceUnit}
        className="w-[24px] h-[24px]"
      />
    </button>
  );
}

function getPriceUnitIconSource(isSelected: boolean, priceUnit: PriceUnit) {
  if (priceUnit === "BTC") {
    return isSelected ? IconBTCSelected : IconBTCInactive;
  } else if (priceUnit === "ETH") {
    return isSelected ? IconETHSelected : IconETHInactive;
  } else if (priceUnit === "USD") {
    return isSelected ? IconUSDSelcted : IconUSDInactive;
  }
}
