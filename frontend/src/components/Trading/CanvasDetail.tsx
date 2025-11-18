import { advancedFormatNumber, formatNumber } from "@/utils/helper";
import { twJoin } from "tailwind-merge";

interface CanvasDetailProps {
  x: number,
  y: number,
  expectedPnl: number,
  expectedRoi: number,
  assetPrice: number,
  change: number,
  pnl: number,
}

const CanvasDetail: React.FC<CanvasDetailProps> = ({
  x,
  y,
  expectedPnl,
  expectedRoi,
  assetPrice,
  change,
  pnl
}) => {
  return (
    <div
      style={{
        left: (x - 205) > 0 ? (x - 173) : (x + 10),
        bottom: y - 43,
      }}
      className={twJoin(
        "flex flex-col items-baseline",
        "absolute",
        "min-w-[163px] h-[61px]",
        "bg-[#262626] bg-opacity-60 backdrop-blur-[2px]",
        "p-[8px]",
        "border-[1px] rounded-[3px] border-[rgba(254,254,254,0.1)] shadow-[0px 2px 6px rgba(0,0,0,0.12)]",
      )}
    >
      <div className="flex flex-col justify-between w-full h-full text-[11px] text-gray80 font-semibold">
        <div className="flex flex-row justify-between items-center h-[13px]">
          <p>Expected P&L</p>
          <p className={twJoin(
            expectedPnl > 0 ? "text-green63" : expectedPnl < 0 ? "text-redff33" : "text-whitee0",
          )}>{pnl ? advancedFormatNumber(expectedPnl, 2, "$") : "$0.00"}</p>
        </div>
        <div className="flex flex-row justify-between items-center h-[13px]">
          <p>Expected ROI</p>
          <p className={twJoin(
            expectedRoi > 0 ? "text-green63" : expectedRoi < 0 ? "text-redff33" : "text-whitee0",
          )}>{pnl ? `${advancedFormatNumber(expectedRoi, 2)}%` : "0.00%"}</p>
        </div>
        <div className="flex flex-row justify-between items-center h-[13px]">
          <p>Asset Price</p>
          <p>{formatNumber(assetPrice, 0, true)}</p>
        </div>
      </div>
    </div>
  );
};

export default CanvasDetail;
