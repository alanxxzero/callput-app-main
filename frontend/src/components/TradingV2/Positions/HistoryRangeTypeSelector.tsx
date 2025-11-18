import { HistoryRangeType } from "@/utils/types";
import ReusableDropdown, { DropdownOption } from "@/components/Common/ReusuableDropdown";
import { calculateTimestampByHistoryRange } from "../utils/calculations";

interface HistoryRangeTypeSelectorProps {
  historyRangeType: HistoryRangeType;
  setHistoryRangeType: (type: HistoryRangeType) => void;
  setSelectedHistoryTimestamp: (timestamp: number) => void;
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  setCurrentPage: (page: number) => void;
}

function HistoryRangeTypeSelector({
  historyRangeType,
  setHistoryRangeType,
  setSelectedHistoryTimestamp,
  isOpen,
  onOpenChange,
  setCurrentPage,
}: HistoryRangeTypeSelectorProps) {
  const historyRangeOptions: DropdownOption<HistoryRangeType>[] = [
    {
      value: "1 Day",
      icon: "",
    },
    {
      value: "1 Week",
      icon: "",
    },
    {
      value: "1 Month",
      icon: "",
    },
    {
      value: "3 Months",
      icon: "",
    },
    {
      value: "6 Months",
      icon: "",
    },
  ];

  const handleSelectRange = (range: HistoryRangeType) => {
    setHistoryRangeType(range);
    setSelectedHistoryTimestamp(calculateTimestampByHistoryRange(range));
    setCurrentPage(1);
  };

  return (
    <ReusableDropdown
      options={historyRangeOptions}
      selectedOption={historyRangeType}
      onOptionSelect={handleSelectRange}
      width="84px"
      height="24px"
      dropdownWidth="180px"
      buttonClassName={`bg-gray3233 hover:bg-green4647 ${isOpen ? "bg-green4647" : ""}`}
      textClassName="text-whitef5 text-[11px] font-semibold leading-[16px]"
      dropdownClassName="top-[36px] right-[-6px]"
      isOpen={isOpen}
      onOpenChange={onOpenChange}
    />
  );
}

export default HistoryRangeTypeSelector;
