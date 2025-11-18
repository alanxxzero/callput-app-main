import { twJoin } from "tailwind-merge";
import IconConfigActive from "@/assets/trading-v2/icon-config-active.png";
import IconConfigInactive from "@/assets/trading-v2/icon-config-inactive.png";
import { useEffect, useRef } from "react";

export type ViewMode = "Order Summary" | "Profit Simulation" | "Slippage Settings";

function ViewModeSelector({
  viewMode,
  setViewMode,
}: {
  viewMode: ViewMode;
  setViewMode: (viewMode: ViewMode) => void;
}) {
  const indicatorRef = useRef<HTMLDivElement>(null);
  const orderSummaryRef = useRef<HTMLButtonElement>(null);
  const profitSimulationRef = useRef<HTMLButtonElement>(null);
  const slippageSettingsRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    let activeRef: React.RefObject<HTMLButtonElement>;

    switch (viewMode) {
      case "Order Summary":
        activeRef = orderSummaryRef;
        break;
      case "Profit Simulation":
        activeRef = profitSimulationRef;
        break;
      case "Slippage Settings":
        activeRef = slippageSettingsRef;
        break;
    }

    if (activeRef.current && indicatorRef.current) {
      indicatorRef.current.style.width = `${activeRef.current.offsetWidth}px`;
      indicatorRef.current.style.transform = `translateX(${activeRef.current.offsetLeft}px)`;
    }
  }, [viewMode]);

  return (
    <div className="flex flex-row relative">
      <TabButton
        isActive={viewMode === "Order Summary"}
        onClick={() => setViewMode("Order Summary")}
        label="Order Summary"
        width="w-[151px]"
        buttonRef={orderSummaryRef}
      />

      <TabButton
        isActive={viewMode === "Profit Simulation"}
        onClick={() => setViewMode("Profit Simulation")}
        label="Profit Simulation"
        width="w-[151px]"
        buttonRef={profitSimulationRef}
      />

      <TabButton
        isActive={viewMode === "Slippage Settings"}
        onClick={() => setViewMode("Slippage Settings")}
        label="Slip"
        width="w-[42px]"
        buttonRef={slippageSettingsRef}
        iconActive={IconConfigActive}
        iconInactive={IconConfigInactive}
      />

      {/* Animated bottom border indicator */}
      <div className="absolute bottom-0 w-full h-[2px] bg-black33" />
      <div
        ref={indicatorRef}
        className="absolute bottom-0 h-[2px] bg-gray80 transition-all duration-300 ease-in-out"
      />
    </div>
  );
}

export default ViewModeSelector;

const TabButton = ({
  isActive,
  onClick,
  label,
  width,
  buttonRef,
  iconActive,
  iconInactive,
}: {
  isActive: boolean;
  onClick: () => void;
  label: string;
  width: string;
  buttonRef: React.RefObject<HTMLButtonElement>;
  iconActive?: string;
  iconInactive?: string;
}) => (
  <button
    ref={buttonRef}
    className={twJoin(
      "flex flex-row items-center justify-center h-[44px]",
      width,
      "text-[13px] text-gray80 font-medium leading-[40px]",
      "hover:text-whitef5 active:opacity-30 active:scale-95",
      isActive && "text-grayb3 font-semibold"
    )}
    onClick={onClick}
  >
    {iconActive ? (
      <img src={isActive ? iconActive : iconInactive} className="w-[16px] h-[16px]" />
    ) : (
      <p>{label}</p>
    )}
  </button>
);