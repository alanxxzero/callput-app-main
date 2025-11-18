import Button from "@/components/Common/Button";
import DesktopOnly from "@/components/Common/DesktopOnly";
import MobileOnly from "@/components/Common/MobileOnly";
import React from "react";
import { twJoin } from "tailwind-merge";

const RisksSection: React.FC = () => {
  return (
    <section 
      className={twJoin(
        "flex flex-col dt:px-[28px] dt:mt-[24px] w-full",
        "text-[14px] font-semibold leading-[40px] text-gray80",
        "px-[20px]"
      )}
    >
      <DesktopOnly>
        <h2 className="self-start text-[18px] text-[#B3B3B3] mb-[8px]">Risks</h2>
      </DesktopOnly>
      <p 
        className="mt-[8px] text-[14px] font-[600] leading-[18px] text-gray80"
      >
        Principal Risk : Moby allocates only a small portion of assets for option strategies. However, if a daily option is executed, losses may be realized from the collateral deployed.
      </p>
      <p className="mt-[8px] text-[14px] font-[600] leading-[18px] text-gray80">
        Smart Contract Risk : Interacting with smart contracts carries inherent risks. While the protocols integrated with Moby utilize audited code, users are advised to exercise caution and only commit funds they can afford to lose.
      </p>
      <DesktopOnly>
        <div 
          className="self-start text-[#B3B3B3] underline cursor-pointer mt-[2px]"
          onClick={() => {
            window.open("https://docs.moby.trade/need-more-info/resource-library/terms-and-conditions", "_blank")
          }}
        >
          Learn more...
        </div>
      </DesktopOnly>
      <MobileOnly>
        <Button
            name="Learn More"
            color=""
            className={twJoin(
              "mt-[24px]",
              "h-[40px]",
              "text-gray80 border border-gray80",
            )}
            onClick={() => {
              window.open("https://docs.moby.trade/need-more-info/resource-library/terms-and-conditions", "_blank")
            }}
          />
      </MobileOnly>
    </section>
  );
};

export default RisksSection;
