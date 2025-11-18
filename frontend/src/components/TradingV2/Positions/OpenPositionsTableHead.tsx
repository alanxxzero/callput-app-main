import { twJoin } from "tailwind-merge";
import DisplayWithTooltip from "../DisplayWithToolTip";

function OpenPositionsTableHead() {
  return (
    <div
      className={twJoin(
        "sticky top-0 h-[40px] bg-black0a",
        "px-[12px] py-[8px]",
        "border-t-[1px] border-t-[#292929]"
      )}
    >
      <div className="flex w-full gap-[12px] text-gray80 text-[13px] font-medium leading-[24px]">
        <div className="w-[208px] min-w-[208px]">
          <p className="w-full">Instrument</p>
        </div>
        <div className="w-full min-w-[114px] max-w-[128px] text-right">
          <p className="w-full">Option Size</p>
        </div>
        <div className="w-full min-w-[82px] max-w-[109px] text-right">
          <p className="w-full">Avg. Price</p>
        </div>
        <div className="w-full min-w-[82px] max-w-[109px] text-right">
          <p className="w-full">Price</p>
        </div>
        <div className="flex flex-row justify-end w-full min-w-[114px] max-w-[128px]">
          <DisplayWithTooltip
            title="P&L (ROI)"
            description="Profit or loss calculated as price difference (price - average price for buy, average price - price for sell) multiplied by size, with ROI expressed as (P&L/price × 100)."
            textAlign="right"
            tooltipClassName="w-[350px]"
          />
        </div>
        <div className="flex flex-row justify-end w-full min-w-[114px] max-w-[128px]">
          <DisplayWithTooltip
            title="Cashflow"
            description="Amount paid or received for the options traded."
            textAlign="right"
            tooltipClassName="w-[285px]"
          />
        </div>
        <div className="flex flex-row justify-end w-full min-w-[70px] max-w-[105px]">
          <DisplayWithTooltip
            title="Delta"
            description="Changes in options price due to $1 increase in underlying asset's price per quantity."
            textAlign="right"
            tooltipClassName="w-[280px]"
          />
        </div>
        <div className="flex flex-row justify-end w-full min-w-[70px] max-w-[105px]">
          <DisplayWithTooltip
            title="Gamma"
            description="Changes in Delta due to $1 increase in underlying asset's price per quantity."
            textAlign="right"
            tooltipClassName="w-[295px]"
          />
        </div>
        <div className="flex flex-row justify-end w-full min-w-[70px] max-w-[105px]">
          <DisplayWithTooltip
            title="Vega"
            description="Changes in options price due to 1% increase in underlying asset's IV per quantity."
            textAlign="right"
            tooltipClassName="w-[280px]"
          />
        </div>
        <div className="flex flex-row justify-end w-full min-w-[70px] max-w-[105px]">
          <DisplayWithTooltip
            title="Theta"
            description="Changes in options price per day closer to expiry per quantity."
            textAlign="right"
            tooltipClassName="w-[290px]"
          />
        </div>
        <div className="w-[138px] min-w-[138px] text-right">
          <p className="w-full">Actions</p>
        </div>
      </div>
    </div>
  );
}

export default OpenPositionsTableHead;
