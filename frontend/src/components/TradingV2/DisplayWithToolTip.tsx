import { twJoin } from "tailwind-merge";
import WithTooltip from "../Common/WithTooltip";

interface DisplayWithTooltipProps {
  title: string;
  description: string;
  tooltipClassName?: string;
  className?: string;
  textAlign?: "left" | "right" | "center";
}

function DisplayWithTooltip({
  title,
  description,
  tooltipClassName = "",
  className = "",
  textAlign = "left",
}: DisplayWithTooltipProps) {
  const textAlignClass =
    textAlign === "left" ? "text-left" : textAlign === "right" ? "text-right" : "text-center";

  return (
    <WithTooltip
      tooltipContent={<p className={twJoin("leading-[0.85rem] text-[12px] font-[600]")}>{description}</p>}
      tooltipClassName={twJoin("h-fit top-full", tooltipClassName)}
      className={twJoin("w-fit", className)}
    >
      <p className={twJoin("w-full", textAlignClass)}>
        <span className="border-b-[1px] border-dashed border-b-greenc1">{title}</span>
      </p>
    </WithTooltip>
  );
}

export default DisplayWithTooltip;
