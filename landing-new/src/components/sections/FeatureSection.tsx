import React from "react";

import ImgFeature1 from "../../assets/images/features/img-feature-1.png";
import ImgFeature2 from "../../assets/images/features/img-feature-2.png";
import ImgFeature3 from "../../assets/images/features/img-feature-3.png";
import ImgFeature4 from "../../assets/images/features/img-feature-4.png";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { useEmblaDotButton } from "../../hooks/useEmblaDotButton";
import { EmblaDotButton } from "../common/EmblaDotButton";
import { twJoin } from "tailwind-merge";

const EMBLA_OPTIONS = { loop: true };
const EMBLA_PLUGINS = [Autoplay({ delay: 7000, stopOnInteraction: false, stopOnMouseEnter: true })];

interface FeatureItem {
  title: string;
  description: string;
  imgSrc: string;
}

const features: FeatureItem[][] = [
  [
    {
      title: "Options Trading",
      description:
        "Deep liquidity and exceptionally tight spreads, engineered to create an optimal trading environment for both retail and institutional traders",
      imgSrc: ImgFeature1,
    },
  ],
  [
    {
      title: "Social 0DTE",
      description:
        "Predict price movements with simple charts, while high-leverage options up to 1,000X amplify returns without the risk of liquidation",
      imgSrc: ImgFeature2,
    },
  ],
  [
    {
      title: "Options Liquidity Pool",
      description:
        "Takes counterparty positions to generate high earnings while ensuring exceptional safety through automated risk management",
      imgSrc: ImgFeature3,
    },
  ],
  [
    {
      title: "Structured Product Vault",
      description:
        "Leverages Berachain's PoL to maximize yield through reward aggregation and algorithmic options trading, integrating LST/LRT and RWA",
      imgSrc: ImgFeature4,
    },
  ],
];

const FeatureSlide: React.FC<{ item: FeatureItem }> = ({ item }) => {
  return (
    <div
      className={twJoin(
        "flex flex-col items-center gap-[36px]",
        "lg:flex-row lg:justify-center lg:gap-[68px]"
      )}
    >
      <div className={twJoin("flex flex-row justify-center items-center order-1", "lg:order-2")}>
        <img src={item.imgSrc} alt={item.title} className="lg:w-[672px] lg:h-[484px]" />
      </div>
      <div
        className={twJoin(
          "flex flex-col items-center gap-[12px] order-2",
          "lg:items-start lg:gap-[13px] lg:w-[540px] lg:h-[215px] lg:order-1"
        )}
      >
        <p className={twJoin("title-20-600-normal text-greenE6", "lg:text-[28px] lg:text-left")}>
          {item.title}
        </p>
        <p
          className={twJoin(
            "text-center-15-400-20 text-whiteF5",
            "lg:text-[20px] lg:text-left lg:leading-[28px]"
          )}
        >
          {item.description}
        </p>
      </div>
    </div>
  );
};

const DotButtons: React.FC<{
  scrollSnaps: number[];
  selectedIndex: number;
  onDotButtonClick: (index: number) => void;
  className?: string;
}> = ({ scrollSnaps, selectedIndex, onDotButtonClick, className }) => {
  return (
    <div className={className}>
      <div
        className={twJoin(
          "flex flex-row items-center gap-[16px] py-[8px]",
          "lg:w-full lg:max-w-[1280px] lg:mx-auto"
        )}
      >
        {scrollSnaps.map((_, index) => (
          <EmblaDotButton
            key={index}
            onClick={() => onDotButtonClick(index)}
            className={twJoin("custom-dot", selectedIndex === index ? "custom-dot-selected" : "")}
          />
        ))}
      </div>
    </div>
  );
};

const FeatureSection: React.FC = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel(EMBLA_OPTIONS, EMBLA_PLUGINS);
  const { selectedIndex, scrollSnaps, onDotButtonClick } = useEmblaDotButton(emblaApi);
  return (
    <section
      className={twJoin(
        "relative h-fit w-full px-[12px] py-[72px] overflow-hidden",
        "lg:px-0 lg:pt-[108px] lg:pb-[120px]"
      )}
    >
      <div className="relative z-10 flex flex-col items-center justify-center h-full">
        <div className="flex flex-col justify-between px-[18px]">
          <h1 className={twJoin("title-24", "lg:text-[32px]")}>Options for Everyone</h1>
        </div>

        <div
          className={twJoin("flex flex-col w-full mt-[72px] overflow-hidden", "lg:relative lg:mt-[117px]")}
        >
          <DotButtons
            scrollSnaps={scrollSnaps}
            selectedIndex={selectedIndex}
            onDotButtonClick={onDotButtonClick}
            className={twJoin("hidden z-20 absolute bottom-34 flex-shrink-0 mt-[24px]", "lg:flex lg:w-full")}
          />
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex">
              {features.map((slideItems, slideIndex) => (
                <div className="flex-[0_0_100%]" key={slideIndex}>
                  {slideItems.map((item, index) => (
                    <FeatureSlide key={index} item={item} />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        <DotButtons
          scrollSnaps={scrollSnaps}
          selectedIndex={selectedIndex}
          onDotButtonClick={onDotButtonClick}
          className={twJoin("flex-shrink-0 mt-[24px] px-[18px]", "lg:hidden")}
        />
      </div>
    </section>
  );
};

export default FeatureSection;
