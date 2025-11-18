import { HistoryFilterType } from "@/utils/types";
import ReusableDropdown, { DropdownOption } from "@/components/Common/ReusuableDropdown";

interface HistoryFilterTypeSelectorProps {
  historyFilterType: HistoryFilterType;
  setHistoryFilterType: (type: HistoryFilterType) => void;
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  setCurrentPage: (page: number) => void;
}

function HistoryFilterTypeSelector({
  historyFilterType,
  setHistoryFilterType,
  isOpen,
  onOpenChange,
  setCurrentPage,
}: HistoryFilterTypeSelectorProps) {
  const historyFilterOptions: DropdownOption<HistoryFilterType>[] = [
    {
      value: "All Types",
      icon: "",
    },
    {
      value: "Open",
      icon: "",
    },
    {
      value: "Close",
      icon: "",
    },
    {
      value: "Settle",
      icon: "",
    },
    {
      value: "Transfer",
      icon: "",
    },
  ];

  const handleOptionSelect = (option: HistoryFilterType) => {
    setHistoryFilterType(option);
    setCurrentPage(1);
  };

  return (
    <ReusableDropdown
      options={historyFilterOptions}
      selectedOption={historyFilterType}
      onOptionSelect={handleOptionSelect}
      width="84px"
      height="24px"
      dropdownWidth="180px"
      buttonClassName={`bg-gray3233 hover:bg-green4647 ${isOpen ? "bg-green4647" : ""}`}
      textClassName="text-whitef5 text-[11px] font-semibold leading-[16px]"
      dropdownClassName="top-[36px] left-0"
      isOpen={isOpen}
      onOpenChange={onOpenChange}
    />
  );
}

export default HistoryFilterTypeSelector;
