import { OptionDirection } from "@/utils/types";
import IconCallActive from "@assets/trading-v2/icon-call-active.png";
import IconCallInactive from "@assets/trading-v2/icon-call-inactive.png";
import IconPutActive from "@assets/trading-v2/icon-put-active.png";
import IconPutInactive from "@assets/trading-v2/icon-put-inactive.png";
import { twJoin } from "tailwind-merge";

interface OptionDirectionSelectorProps {
  selectedOptionDirection: OptionDirection;
  setSelectedOptionDirection: (optionDirection: OptionDirection) => void;
}

function OptionDirectionSelector({
  selectedOptionDirection,
  setSelectedOptionDirection,
}: OptionDirectionSelectorProps) {
  const optionDirections: OptionDirection[] = ["Call", "Put"];

  return (
    <div className="flex flex-row items-center gap-[4px]">
      {optionDirections.map((optionDirection) => (
        <OptionDirectionButton
          key={optionDirection}
          optionDirection={optionDirection}
          isSelected={optionDirection === selectedOptionDirection}
          setSelectedOptionDirection={setSelectedOptionDirection}
        />
      ))}
    </div>
  );
}

export default OptionDirectionSelector;

interface OptionDirectionButtonProps {
  optionDirection: OptionDirection;
  isSelected: boolean;
  setSelectedOptionDirection: (optionDirection: OptionDirection) => void;
}

function OptionDirectionButton({
  optionDirection,
  isSelected,
  setSelectedOptionDirection,
}: OptionDirectionButtonProps) {
  return (
    <button
      className={twJoin(
        "cursor-pointer flex flex-row items-center justify-between",
        "w-[96px] h-[36px] px-[14px] rounded-[6px]",
        "text-[13px] text-grayb3 font-semibold",
        "hover:bg-black1f",
        "active:bg-transparent active:opacity-80 active:scale-95",
        isSelected && "bg-black29"
      )}
      onClick={() => setSelectedOptionDirection(optionDirection)}
    >
      <p
        className={twJoin(
          isSelected && optionDirection === "Call" && "text-[13px] text-green63 font-bold",
          isSelected && optionDirection === "Put" && "text-[13px] text-redff33 font-bold"
        )}
      >
        {optionDirection}
      </p>
      <img
        src={getOptionIconSource(isSelected, optionDirection)}
        alt={optionDirection}
        className="w-[24px] h-[24px]"
      />
    </button>
  );
}

function getOptionIconSource(isSelected: boolean, direction: OptionDirection) {
  if (isSelected) {
    return direction === "Call" ? IconCallActive : IconPutActive;
  } else {
    return direction === "Call" ? IconCallInactive : IconPutInactive;
  }
}
