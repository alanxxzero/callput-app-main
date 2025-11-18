import OptionTradingPanel from "@/components/TradingV2/Options/OptionTradingPanel";
import PositionManagementPanel from "@/components/TradingV2/Positions/PositionManagementPanel";
import { useEffect, useState } from "react";
import { twJoin } from "tailwind-merge";

interface TradingProps {
  announcementsLen: number;
}

function TradingV2({ announcementsLen }: TradingProps) {
  const [topPadding, setTopPadding] = useState(0);

  useEffect(() => {
    setTopPadding(announcementsLen * 46 + 46);
  }, [announcementsLen]);

  return (
    <div
      style={{ paddingTop: `${topPadding}px` }}
      className={twJoin("flex flex-row justify-center items-center", "w-full h-full")}
    >
      <div
        className={twJoin(
          "flex flex-col",
          "w-full min-w-[1280px] max-w-[1512px] min-h-screen",
          "pt-[26px]",
          "border-x-[1px] border-[#292929]"
        )}
      >
        <OptionTradingPanel />
        <PositionManagementPanel />
      </div>
    </div>
  );
}

export default TradingV2;
