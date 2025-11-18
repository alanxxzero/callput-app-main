import WithTooltip from "@/components/Common/WithTooltip";
import { twJoin } from "tailwind-merge";

function OptionChainTableHead() {
  return (
    <div
      className={twJoin(
        "sticky top-0 z-10 h-[44px] bg-black0a",
        "px-[20px] py-[8px]",
        "border-t-[1px] border-t-[#292929]"
      )}
    >
      <div className="flex w-full gap-[18px] text-gray80 text-[13px] font-medium leading-[24px]">
        <div className="w-full min-w-[160px] max-w-[252px]">
          <DisplayWithTooltip
            title="Strike Price"
            description="The fixed price at which an option can be exercised to buy (call) or sell (put) the underlying asset."
          />
        </div>
        <div className="flex flex-row justify-end w-full min-w-[90px] max-w-[144px]">
          <DisplayWithTooltip
            title="Break Even"
            description="The underlying asset price at which profit begins after covering the option premium."
            textAlign="right"
          />
        </div>
        <div className="flex flex-row justify-end w-full min-w-[90px] max-w-[144px]">
          <DisplayWithTooltip
            title="To Break Even"
            description="The percentage price movement required in the underlying asset for the option to reach breakeven."
            textAlign="right"
          />
        </div>
        <div className="w-[18px] min-w-[18px] max-w-[18px]"></div>
        <div className="flex flex-row w-full min-w-[160px] max-w-[252px]">
          <DisplayWithTooltip
            title="Price"
            description="Option prices for traders, adjusted by subtracting (mark price - risk premium) or adding (mark price + risk premium), for selling and buying respectively."
          />
          <span className="mx-1"> / </span>
          <DisplayWithTooltip
            title="IV"
            description="The expected volatility of the underlying asset, adjusted by subtracting (market - bid) or adding (ask - market) divided by Vega, for selling and buying respectively."
          />
        </div>
        <div className="flex flex-row justify-end w-full min-w-[90px] max-w-[144px]">
          <DisplayWithTooltip
            title="24H Change"
            description="Represents the percentage change in price since 00:00 UTC, indicating the option's price movement over the past 24 hours."
            textAlign="right"
          />
        </div>
        <div className="w-[18px] min-w-[18px] max-w-[18px]"></div>
        <div className="w-full min-w-[90px] max-w-[144px]">
          <p className="w-full">
            <span>Volume</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default OptionChainTableHead;

interface DisplayWithTooltipProps {
  title: string;
  description: string;
  className?: string;
  textAlign?: "left" | "right" | "center";
}

function DisplayWithTooltip({
  title,
  description,
  className = "",
  textAlign = "left",
}: DisplayWithTooltipProps) {
  const textAlignClass =
    textAlign === "left" ? "text-left" : textAlign === "right" ? "text-right" : "text-center";

  return (
    <WithTooltip
      tooltipContent={<p className={twJoin("leading-[0.85rem] text-[12px] font-[600]")}>{description}</p>}
      tooltipClassName={twJoin("w-[300px] h-fit top-full")}
      className={twJoin("w-fit", className)}
    >
      <p className={twJoin("w-full", textAlignClass)}>
        <span className="border-b-[1px] border-dashed border-b-greenc1">{title}</span>
      </p>
    </WithTooltip>
  );
}
