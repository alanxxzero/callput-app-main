import { OptionStrategy } from "@/utils/types";
import IconCbSelected from "@/assets/trading-v2/icon-cb-selected.png";
import IconCbUnselected from "@/assets/trading-v2/icon-cb-unselected.png";
import { twJoin } from "tailwind-merge";

interface OptionStrategySelectorProps {
  selectedOptionStrategy: OptionStrategy;
  setSelectedOptionStrategy: (optionStrategy: OptionStrategy) => void;
}

function OptionStrategySelector({
  selectedOptionStrategy,
  setSelectedOptionStrategy,
}: OptionStrategySelectorProps) {
  const isSpreadSelected = selectedOptionStrategy === "Spread";

  const handleToggle = () => {
    setSelectedOptionStrategy(isSpreadSelected ? "Vanilla" : "Spread");
  };

  return (
    <label
      onClick={handleToggle}
      className={twJoin(
        "cursor-pointer flex flex-row items-center gap-[8px] p-[8px]",
        "active:opacity-80 active:scale-95"
      )}
    >
      <img className="w-[16px]" src={isSpreadSelected ? IconCbSelected : IconCbUnselected} />
      <p className="text-[13px] text-[#f5f5f5] font-semibold leading-3">Spread</p>
    </label>
  );
}

export default OptionStrategySelector;
