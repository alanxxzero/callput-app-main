import React from "react";
import OptionsStrategy from "./OptionsStrategy";
import RisksSection from "./RisksSection";
import { twJoin } from "tailwind-merge";
import Button from "@/components/Common/Button";
import ArchitectureItem from "./ArchitectureItem";

type Props = {
  vaultInfo: any,
  aprMap: any
}

const VaultInfo: React.FC<Props> = ({ vaultInfo, aprMap }) => {
  const apyIngredients = aprMap[vaultInfo.title]

  const apySum = apyIngredients?.reduce((acc: any, cur: any) => {
    if (typeof cur.apy != "number") return acc
    return acc + cur.apy
  }, 0) || 0

  const optionsApy = apyIngredients?.find((cur: any) => cur.key === "MOBY")?.apy || 0

  return (
    <article
      className={twJoin(
        "flex flex-col",
      )}
    >
      <section 
        className={twJoin(
          "flex flex-col w-full max-w-[780px] rounded-[12px] bg-black1f",
          "py-[36px] pb-[60px]",
        )}
      >
        <div
          className={twJoin(
            "px-[28px]",
          )}
        >
          <header
            className={twJoin(
              "flex items-center justify-between",
              "mb-[28px]",
            )}
          >
            <h1 
              className={twJoin(
                "text-[20px] font-semibold text-greene6",
              )}
            >
              Vaults Architecture
            </h1>
            <Button
              name="Learn More"
              color=""
              className={twJoin(
                "w-[128px]",
                "mt-auto",
                "h-[32px]",
                "text-greenc1 border border-greenc1",
              )}
              onClick={() => {
                window.open("https://docs.moby.trade/how-its-built/defi-options-vault/berachain-defi-options-vault/architecture", "_blank")
              }}
            >
            </Button>
          </header>
          <p className="self-center text-[14px] font-semibold leading-[20px] text-gray80 max-md:max-w-full">
            {vaultInfo.description}
          </p>
          <div className="mt-[24px]">
            <div className="flex gap-[16px]">
              <ArchitectureItem 
                title="Asset Allocation"
                imgSrc={vaultInfo.allocationImgSrc}
              />
              <ArchitectureItem 
                title="Architecture"
                imgSrc={vaultInfo.architectureImgSrc}
              />
            </div>
          </div>
        </div>
        <div className="flex mt-[40px] w-full bg-black12 min-h-[4px] max-md:max-w-full" />
        <OptionsStrategy
          strategy={vaultInfo.strategy}
          underlying={vaultInfo.underlying}
          apy={optionsApy}
        />
        <div className="flex mt-[40px] w-full bg-black12 min-h-[4px] max-md:max-w-full" />
        <RisksSection />
      </section>
    </article>
  );
};

export default VaultInfo;
