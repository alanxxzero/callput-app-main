import { HistoryFilterType, HistoryRangeType, PositionManagementMenu } from "@/utils/types";
import { useState } from "react";
import { twJoin } from "tailwind-merge";
import HistoryFilterTypeSelector from "./HistoryFilterTypeSelector";
import HistoryRangeTypeSelector from "./HistoryRangeTypeSelector";

interface PositionManagementMenuSelectorProps {
  selectedPositionManagementMenu: PositionManagementMenu;
  setSelectedPositionManagementMenu: (menu: PositionManagementMenu) => void;
  selectedHistoryFilterType: HistoryFilterType;
  setSelectedHistoryFilterType: (type: HistoryFilterType) => void;
  selectedHistoryRangeType: HistoryRangeType;
  setSelectedHistoryRangeType: (type: HistoryRangeType) => void;
  setSelectedHistoryTimestamp: (timestamp: number) => void;
  setCurrentPage: (page: number) => void;
}

function PositionManagementMenuSelector({
  selectedPositionManagementMenu,
  setSelectedPositionManagementMenu,
  selectedHistoryFilterType,
  setSelectedHistoryFilterType,
  selectedHistoryRangeType,
  setSelectedHistoryRangeType,
  setSelectedHistoryTimestamp,
  setCurrentPage,
}: PositionManagementMenuSelectorProps) {
  const [activeDropdown, setActiveDropdown] = useState<"filter" | "range" | null>(null);

  const handleFilterDropdownToggle = (isOpen: boolean) => {
    setActiveDropdown(isOpen ? "filter" : null);
  };

  const handleRangeDropdownToggle = (isOpen: boolean) => {
    setActiveDropdown(isOpen ? "range" : null);
  };

  return (
    <div className="flex flex-row items-center justify-between gap-[4px]">
      <div
        className={twJoin(
          "cursor-pointer flex flex-row items-center justify-center w-fit h-[36px] px-[14px] py-[6px]",
          "hover:bg-black1f hover:rounded-[6px] active:scale-95 active:opacity-30",
          selectedPositionManagementMenu === "Open Positions" && "bg-black29 rounded-[6px]"
        )}
        onClick={() => {
          setSelectedPositionManagementMenu("Open Positions");
          setCurrentPage(1);
        }}
      >
        <p
          className={twJoin(
            "h-[16px] text-grayb3 text-[13px] font-bold leading-[16px]",
            selectedPositionManagementMenu === "Open Positions" && "text-greene6"
          )}
        >
          Open Positions
        </p>
      </div>
      <div
        className={twJoin(
          "cursor-pointer flex flex-row items-center justify-center gap-[14px] w-fit h-[36px] py-[6px]",
          selectedPositionManagementMenu === "History" && "bg-black29 rounded-[6px] pl-[14px] pr-[6px]",
          selectedPositionManagementMenu !== "History" &&
            "px-[14px] hover:bg-black1f hover:rounded-[6px] active:scale-95 active:opacity-30"
        )}
        onClick={() => {
          setSelectedPositionManagementMenu("History");
          setCurrentPage(1);
        }}
      >
        <p
          className={twJoin(
            "h-[16px] text-grayb3 text-[13px] font-bold leading-[16px]",
            selectedPositionManagementMenu === "History" && "text-greene6"
          )}
        >
          History
        </p>
        {selectedPositionManagementMenu === "History" && (
          <div className="flex flex-row items-center justify-center gap-[6px]">
            <HistoryFilterTypeSelector
              historyFilterType={selectedHistoryFilterType}
              setHistoryFilterType={setSelectedHistoryFilterType}
              isOpen={activeDropdown === "filter"}
              onOpenChange={handleFilterDropdownToggle}
              setCurrentPage={setCurrentPage}
            />
            <HistoryRangeTypeSelector
              historyRangeType={selectedHistoryRangeType}
              setHistoryRangeType={setSelectedHistoryRangeType}
              setSelectedHistoryTimestamp={setSelectedHistoryTimestamp}
              isOpen={activeDropdown === "range"}
              onOpenChange={handleRangeDropdownToggle}
              setCurrentPage={setCurrentPage}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default PositionManagementMenuSelector;
