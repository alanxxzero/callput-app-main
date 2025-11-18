import { twJoin } from "tailwind-merge";
import DisplayWithTooltip from "../DisplayWithToolTip";

function PositionHistoryTableHead() {
  return (
    <div
      className={twJoin(
        "sticky top-0 h-[40px] bg-black0a",
        "px-[12px] py-[8px]",
        "border-t-[1px] border-t-[#292929]"
      )}
    >
      <div className="flex w-full gap-[12px] text-gray80 text-[13px] font-medium leading-[24px]">
        <div className="w-[128px] min-w-[128px]">
          <p className="w-full">Type / Time</p>
        </div>
        <div className="w-[72px] min-w-[72px]">
          <p className="w-full">UA Price</p>
        </div>
        <div className="w-[208px] min-w-[208px]">
          <p className="w-full">Instrument</p>
        </div>
        <div className="w-full min-w-[108px] max-w-[200px] text-right">
          <p className="w-full">Option Size</p>
        </div>
        <div className="w-full min-w-[108px] max-w-[200px] text-right">
          <p className="w-full">Collateral</p>
        </div>
        <div className="w-full min-w-[82px] max-w-[94px] text-right">
          <p className="w-full">Avg. Price</p>
        </div>
        <div className="flex flex-row justify-end w-full min-w-[82px] max-w-[94px]">
          <DisplayWithTooltip
            title="Settle Payoff"
            description="When settling Buy (Sell) positions, the amount that trader received from (paid to) Moby."
            textAlign="right"
            tooltipClassName="w-[290px]"
          />
        </div>
        <div className="w-full min-w-[108px] max-w-[200px] text-right">
          <p className="w-full">P&L (ROI)</p>
        </div>
        <div className="flex flex-row justify-end w-full min-w-[108px] max-w-[200px]">
          <DisplayWithTooltip
            title="Cashflow"
            description="Amount paid or received for the options traded."
            textAlign="right"
            tooltipClassName="w-[285px]"
          />
        </div>
        <div className="w-full min-w-[74px] max-w-[126px] text-right">
          <p className="w-full">Actions</p>
        </div>
      </div>
    </div>
  );
}

export default PositionHistoryTableHead;
