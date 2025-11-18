import WithTooltip from "@/components/Common/WithTooltip";
import { UnderlyingAsset } from "@moby/shared";
import { useAppSelector } from "@/store/hooks";
import { formatDateDDMmmYYYY } from "@/utils/helper";
import { useEffect, useState } from "react";
import { twJoin } from "tailwind-merge";

interface ExpirySelectorProps {
  selectedUnderlyingAsset: UnderlyingAsset;
  selectedExpiry: number;
  setSelectedExpiry: (expiry: number) => void;
}

const THIRTY_MINUTES_IN_SECONDS = 30 * 60;

function ExpirySelector({ selectedUnderlyingAsset, selectedExpiry, setSelectedExpiry }: ExpirySelectorProps) {
  const [expiries, setExpiries] = useState<number[]>([]);

  const market = useAppSelector((state: any) => state.market.market);

  useEffect(() => {
    const currentDate = new Date().getTime() / 1000;
    const validExpiries = market[selectedUnderlyingAsset].expiries.filter(
      (expiry: number): boolean => expiry > currentDate
    );

    if (validExpiries.length === 0) return;

    setExpiries(validExpiries);

    const defaultExpiry = validExpiries.find(
      (expiry: number) => expiry > currentDate + THIRTY_MINUTES_IN_SECONDS
    );
    const timeToSelectedExpiry = selectedExpiry - currentDate;
    const isSelectedExpiryInThirtyMinutes = timeToSelectedExpiry < THIRTY_MINUTES_IN_SECONDS;

    if (selectedExpiry === 0 || !validExpiries.includes(selectedExpiry) || isSelectedExpiryInThirtyMinutes) {
      setSelectedExpiry(defaultExpiry);
      return;
    }
  }, [market, selectedExpiry]);

  return (
    <div className="flex flex-row items-center gap-[4px]">
      {expiries.map((expiry) => (
        <ExpiryButton
          key={expiry}
          expiry={expiry}
          isSelected={expiry === selectedExpiry}
          onClick={() => setSelectedExpiry(expiry)}
        />
      ))}
    </div>
  );
}

export default ExpirySelector;
interface ExpiryButtonProps {
  expiry: number;
  isSelected: boolean;
  onClick: () => void;
}

function ExpiryButton({ expiry, isSelected, onClick }: ExpiryButtonProps) {
  const currentDate = new Date().getTime() / 1000;
  const timeToExpiry = expiry - currentDate;
  const isExpiryInThirtyMinutes = timeToExpiry < THIRTY_MINUTES_IN_SECONDS;

  if (isExpiryInThirtyMinutes) {
    return (
      <div className={twJoin("flex flex-row items-center", "w-fit h-[48px] px-[12px] rounded-[6px]")}>
        <WithTooltip
          tooltipContent={
            <p className={twJoin("leading-[0.85rem] text-[12px] font-[600]")}>
              To ensure OLP’s stable operation, positions with options expiring within 30 minutes cannot be
              opened or closed.
            </p>
          }
          tooltipClassName={twJoin("w-[280px] h-fit")}
          className={twJoin("w-fit")}
        >
          <p className={twJoin("w-full text-[13px] text-[#b3b3b3] font-inter font-semibold opacity-30")}>
            {formatDateDDMmmYYYY(expiry.toString())}
          </p>
        </WithTooltip>
      </div>
    );
  }

  return (
    <button
      className={twJoin(
        "cursor-pointer flex flex-row items-center",
        "w-fit h-[48px] px-[12px] rounded-[6px]",
        "text-[13px] text-[#b3b3b3] font-inter font-semibold",
        "hover:bg-black1f hover:text-[#f5f5f5]",
        "active:bg-transparent active:opacity-80 active:scale-95",
        isSelected && "bg-black29"
      )}
      onClick={onClick}
    >
      <p className={twJoin(isSelected && "text-[#f5f5f5] font-bold")}>
        {formatDateDDMmmYYYY(expiry.toString())}
      </p>
    </button>
  );
}
