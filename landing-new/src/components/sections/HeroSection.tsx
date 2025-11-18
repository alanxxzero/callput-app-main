import React from "react";
import Button from "../common/Button";
import { MOBY_URLS } from "../../shared/constants/urls";
import { twJoin } from "tailwind-merge";

import VideoBgHero from "../../assets/videos/bg-hero.mp4";
import LogoArbitrum from "../../assets/images/logo-arbitrum.png";
import LogoBerachain from "../../assets/images/logo-berachain.png";
import LogoArbitrumFoundation from "../../assets/images/logo-arbitrum-foundation.png";
import TagLineSlider from "../common/TagLineSlider";

const HeroHeading: React.FC = () => {
  return (
    <div className="flex flex-col gap-[12px] px-[18px]">
      {/* For PC */}
      <h1 className={twJoin("hidden title-40-center-700-normal", "lg:block")}>
        The Most Liquid Options DEX
        <br />
        Unlocking a Next-Gen Derivatives Market
      </h1>
      {/* For Mobile */}
      <h1 className={twJoin("title-24 text-whiteF5", "lg:hidden")}>
        The Most Liquid Options DEX Unlocking a Next-Gen Derivatives Market
      </h1>
      <p className={twJoin("subtitle-16 mt-[12px]", "lg:mt-[20px] lg:text-[20px]")}>
        Unbeatable Pricing with Superior Capital Efficiency and Composability
      </p>
    </div>
  );
};

const HeroSection: React.FC = () => {
  const handleStartTrading = () => {
    window.open(MOBY_URLS.APP, "_blank");
  };

  return (
    <section
      className={twJoin(
        "relative h-fit w-full px-[12px] pt-[72px] pb-[96px] overflow-hidden",
        "lg:px-0 lg:pt-[160px] lg:pb-[182px]"
      )}
    >
      {/* 배경 비디오 */}
      <div className={twJoin("absolute bottom-[-43px] right-[0px] w-full h-[304px]", "lg:h-[100%]")}>
        <video className="object-cover w-full h-full" autoPlay loop muted playsInline>
          <source src={VideoBgHero} type="video/mp4" />
        </video>
        {/* 비디오 위에 오버레이 효과 */}
        <div className="absolute inset-0 bg-black opacity-20"></div>
      </div>

      {/* 슬로건 텍스트 */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full ">
        <HeroHeading />

        <TagLineSlider
          tagLines={[
            <div
              className={twJoin(
                "flex flex-col h-[64px] mt-[24px] px-[18px]",
                "lg:flex-row lg:h-fit lg:mt-[36px]"
              )}
            >
              <p className={twJoin("text-14", "lg:text-[16px]")}>Built on</p>
              <div className={twJoin("flex flex-row items-center", "lg:ml-[18px]")}>
                <img src={LogoBerachain} alt="LogoBerachain" className="h-[24px]" />
                <img src={LogoArbitrum} alt="LogoArbitrum" className="ml-[18px] h-[32px]" />
              </div>
            </div>,
            <div
              className={twJoin(
                "flex flex-col h-[64px] mt-[24px] px-[18px]",
                "lg:flex-row lg:h-fit lg:mt-[36px]"
              )}
            >
              <p className={twJoin("text-14", "lg:text-[16px]")}>Backed by</p>
              <div className={twJoin("flex flex-row items-center", "lg:ml-[18px]")}>
                <img src={LogoArbitrumFoundation} alt="LogoArbitrumFoundation" className="h-[24px]" />
              </div>
            </div>,
          ]}
          interval={2000}
        />

        <Button
          label="Start Trading"
          width="172px"
          height="50px"
          onClick={handleStartTrading}
          className="flex-shrink-0 bg-transparent text-greenE6 mx-[18px] mt-[48px]"
        />
      </div>
    </section>
  );
};

export default HeroSection;
