import React from "react";

import VideoIconCore1 from "../../assets/videos/icon-core-1.mp4";
import VideoIconCore2 from "../../assets/videos/icon-core-2.mp4";
import VideoIconCore3 from "../../assets/videos/icon-core-3.mp4";
import Button from "../common/Button";
import { twJoin } from "tailwind-merge";
import { MOBY_URLS } from "../../shared/constants/urls";

interface CoreInfraItem {
  title: string;
  description: string;
  videoSrc: string;
}

const coreInfras: CoreInfraItem[] = [
  {
    title: "Synchronized Liquidity Engine",
    description: "Optimizes pricing accuracy and delivers the narrowest spreads using real-time market data",
    videoSrc: VideoIconCore1,
  },
  {
    title: "Unparalleled Liquidity Layer",
    description:
      "24/7 providing deep liquidity through capital efficiency while offering better spreads than CEXs",
    videoSrc: VideoIconCore2,
  },
  {
    title: "Risk Premium Mechanism",
    description: "Manages LP risk through Dynamic Spread risk management while delivering High APR",
    videoSrc: VideoIconCore3,
  },
];

const CoreInfraSection: React.FC = () => {
  const handleLearnMore = () => {
    window.open(MOBY_URLS.DOCS, "_blank");
  };

  return (
    <section
      className={twJoin(
        "relative h-fit w-full px-[12px] py-[72px] overflow-hidden",
        "lg:px-0 lg:pt-[120px] lg:pb-[144px]"
      )}
    >
      <div className="relative z-10 flex flex-col items-center justify-center h-full">
        <div className="flex flex-col justify-between px-[18px]">
          <h1 className={twJoin("title-24", "lg:text-[32px]")}>Core Infrastructure</h1>
        </div>

        <div
          className={twJoin(
            "flex flex-col justify-center gap-[64px] w-full mt-[60px] px-[18px]",
            "lg:flex-row lg:gap-[28px] lg:mt-[36px]"
          )}
        >
          {coreInfras.map((item, index) => (
            <div
              key={index}
              className={twJoin(
                "flex flex-col items-center justify-center gap-[12px]",
                "lg:w-[408px] lg:h-[357px] lg:border-[1px] lg:border-gray29 lg:p-[48px] lg:pt-[24px]"
              )}
            >
              <video className="object-cover w-[160px] h-[160px]" autoPlay loop muted playsInline>
                <source src={item.videoSrc} type="video/mp4" />
              </video>
              <div className="flex flex-col gap-[8px]">
                <p className="title-18">{item.title}</p>
                <p className="text-center-15-500-21">{item.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className={twJoin("flex-shrink-0 mt-[72px] px-[18px]", "mt-[81px]")}>
          <Button
            label="Learn More on Moby Docs"
            width="227px"
            height="36px"
            onClick={handleLearnMore}
            className="bg-transparent text-greenE6"
          />
        </div>
      </div>
    </section>
  );
};

export default CoreInfraSection;
