import { CountdownTimer } from "@/components/Common/CountdownTimer";
import WithTooltip from "@/components/Common/WithTooltip";
import { advancedFormatNumber } from "@/utils/helper";
import { twJoin } from "tailwind-merge";

interface ExpiryInfoDisplayProps {
  selectedExpiry: number;
  underlyingFutures: number;
}

function ExpiryInfoDisplay({
  selectedExpiry,
  underlyingFutures,
}: ExpiryInfoDisplayProps) {
  return (
    <div className="flex flex-col w-fit h-[36px] gap-[4px]">
      <div className="flex flex-row items-center justify-between h-[14px]">
        <div className="w-[100px] text-[11px] text-gray80 font-medium">
          <WithTooltip
            tooltipContent={
              <p className={twJoin("leading-[0.85rem] text-[12px] font-[600]")}>
                The forward price for the option's expiry used in the Black 76 model to
                calculate option mark prices.
              </p>
            }
            tooltipClassName={twJoin("w-[227px]")}
          >
            <span className="border-b-[1px] border-dashed border-b-greenc1">
              Underlying Futures
            </span>
          </WithTooltip>
        </div>
        <p className="w-[80px] text-[11px] text-right text-grayb3 font-medium font-ibm">
          {advancedFormatNumber(underlyingFutures, 2, "$")}
        </p>
      </div>
      <div className="flex flex-row items-center justify-between h-[14px]">
        <p className="w-[108px] text-[11px] text-gray80 font-medium">Time to Expiry</p>
        <p className="w-[84px] text-right">
          <CountdownTimer
            className="text-[11px] text-grayb3 font-medium font-ibm"
            targetTimestamp={selectedExpiry}
            compactFormat={false}
          />
        </p>
      </div>
    </div>
  );
}

export default ExpiryInfoDisplay;
