import React, { useState, useEffect } from "react";
import Button from "../common/Button";
import { MOBY_URLS } from "../../shared/constants/urls";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { useEmblaDotButton } from "../../hooks/useEmblaDotButton";
import { EmblaDotButton } from "../common/EmblaDotButton";
import { twJoin } from "tailwind-merge";
import { useDevice } from "../../hooks/useDevice";
import { convertExpiryDateToTimestamp, parseInstrument } from "../../utils/options";
import { CountdownTimer } from "../common/CountdownTimer";
import { ASSETS } from "../../shared/constants/assets";
import { UnderlyingAsset } from "../../shared/enums/assets";
import { advancedFormatNumber } from "../../utils/formatters";
import { useStats } from "../../hooks/useStats";
import { useLeaderBoard } from "../../hooks/useLeaderBoard";
import { HighestVolumeOption } from "../../contexts/data/LeaderBoardContext";
import { TopGainerOption } from "../../contexts/data/LeaderBoardContext";

type LeaderBoardButton = "topGainer" | "highestVolume";
type SlideItem = TopGainerOption | HighestVolumeOption;
type SlideData = SlideItem[][];

interface LeaderBoardHeaderProps {
  selectedButton: LeaderBoardButton;
}

interface LeaderBoardBodyProps {
  item: SlideItem;
  selectedButton: LeaderBoardButton;
  underlyingAsset: UnderlyingAsset;
  expiryDate: string;
}

// Props for the buttons component
interface ButtonsGroupProps {
  selectedButton: LeaderBoardButton;
  setSelectedButton: (button: LeaderBoardButton) => void;
  handleTradeNow: () => void;
}

const buttonStyles = {
  active: "bg-gray1F border-gray1F text-whiteF5",
  inactive: "bg-transparent border-none text-grayB3",
};

const EMBLA_OPTIONS = { loop: true };
const EMBLA_PLUGINS = [Autoplay({ delay: 5000, stopOnInteraction: false, stopOnMouseEnter: true })];

const ITEMS_PER_SLIDE_MOBILE = 5;
const ITEMS_PER_SLIDE_DESKTOP = 8;
const DISPLAY_LIMIT_MOBILE = 15;
const DISPLAY_LIMIT_DESKTOP = 16;

const ButtonsGroup: React.FC<ButtonsGroupProps> = ({ selectedButton, setSelectedButton, handleTradeNow }) => {
  return (
    <div
      className={twJoin(
        "flex flex-row justify-center items-center gap-[6px] w-full mt-[24px] px-[18px]",
        "lg:mt-[36px] lg:justify-between lg:px-0"
      )}
    >
      <div className="flex flex-row justify-center items-center gap-[6px]">
        <Button
          label="Top Gainer"
          width="125px"
          height="36px"
          onClick={() => setSelectedButton("topGainer")}
          className={twJoin(
            "flex-shrink-0",
            selectedButton === "topGainer" ? buttonStyles.active : buttonStyles.inactive
          )}
        />

        <Button
          label="Highest Volume"
          width="151px"
          height="36px"
          onClick={() => setSelectedButton("highestVolume")}
          className={twJoin(
            "flex-shrink-0",
            selectedButton === "highestVolume" ? buttonStyles.active : buttonStyles.inactive
          )}
        />
      </div>
      <Button
        label="Trade Now"
        width="115px"
        height="36px"
        onClick={handleTradeNow}
        className={twJoin("hidden flex-shrink-0 px-[18px] text-black0A", "lg:flex")}
      />
    </div>
  );
};

const LeaderBoardHeader: React.FC<LeaderBoardHeaderProps> = ({ selectedButton }) => {
  return (
    <div
      className={twJoin(
        "flex flex-row justify-between items-center h-[32px] py-[8px]",
        "lg:h-[56px] lg:px-[8px]"
      )}
    >
      {/* Mobile Header */}
      <div className={twJoin("text-12 text-left", "lg:hidden")}>Options / Time to Expiry</div>
      <div className={twJoin("text-12 text-right", "lg:hidden")}>
        {selectedButton === "topGainer" ? "24H Change / Price" : "24H Volume / Price"}
      </div>

      {/* Desktop Header */}
      <div className={twJoin("hidden w-full text-15-500-24 text-left text-gray80", "lg:block")}>Options</div>
      <div className={twJoin("hidden min-w-[240px] text-15-500-24 text-right text-gray80", "lg:block")}>
        Price
      </div>
      <div className={twJoin("hidden min-w-[240px] text-15-500-24 text-right text-gray80", "lg:block")}>
        {selectedButton === "topGainer" ? "24H Change" : "24H Volume"}
      </div>
      <div className={twJoin("hidden min-w-[240px] text-15-500-24 text-right text-gray80", "lg:block")}>
        Time to Expiry
      </div>
    </div>
  );
};

const LeaderBoardBodyMobile: React.FC<LeaderBoardBodyProps> = ({
  item,
  selectedButton,
  underlyingAsset,
  expiryDate,
}) => {
  return (
    <>
      <div className="min-w-[227px]">
        <div className="flex flex-row items-center gap-[10px]">
          <img src={ASSETS[underlyingAsset].imgSrc} className="w-[24px] h-[24px]" />
          <div>
            <div className="IBM-text-13-500-20 text-left text-whiteF5">{item.instrument}</div>
            <div className="IBM-text-12-500-normal text-left text-grayB3">
              <CountdownTimer targetTimestamp={convertExpiryDateToTimestamp(expiryDate)} />
            </div>
          </div>
        </div>
      </div>
      <div className="min-w-[124px]">
        {selectedButton === "topGainer" && (
          <div
            className={twJoin(
              "IBM-text-13-600-20 text-right",
              Number((item as TopGainerOption).priceDiffPercentage) > 0
                ? "text-green63"
                : Number((item as TopGainerOption).priceDiffPercentage) < 0
                ? "text-redFF"
                : "text-grayB3"
            )}
          >
            {`${advancedFormatNumber(Number((item as TopGainerOption).priceDiffPercentage), 2, "")}%`}
          </div>
        )}
        {selectedButton === "highestVolume" && (
          <div className="IBM-text-13-600-20 text-right text-whiteF5">
            {`${advancedFormatNumber(Number((item as HighestVolumeOption).volume), 0, "$")}`}
          </div>
        )}
        <div className="IBM-text-12-500-16 text-right text-whiteF5">
          {advancedFormatNumber(Number(item.currentPrice), 2, "$")}
        </div>
      </div>
    </>
  );
};

const LeaderBoardBodyDesktop: React.FC<LeaderBoardBodyProps> = ({
  item,
  selectedButton,
  underlyingAsset,
  expiryDate,
}) => {
  return (
    <>
      {/* Column 1: Options */}
      <div className="flex flex-row items-center gap-[10px] w-full">
        <img src={ASSETS[underlyingAsset].imgSrc} className="w-[24px] h-[24px]" />
        <div className="IBM-text-15-500-24 text-left text-whiteF5">{item.instrument}</div>
      </div>

      {/* Column 2: Price */}
      <div className="IBM-text-15-500-24 text-right text-whiteF5 min-w-[240px]">
        {advancedFormatNumber(Number(item.currentPrice), 2, "$")}
      </div>

      {/* Column 3: 24H Change or Volume */}
      {selectedButton === "topGainer" ? (
        <div
          className={twJoin(
            "IBM-text-15-500-24 text-right min-w-[240px]",
            Number((item as TopGainerOption).priceDiffPercentage) > 0
              ? "text-green63"
              : Number((item as TopGainerOption).priceDiffPercentage) < 0
              ? "text-redFF"
              : "text-grayB3"
          )}
        >
          {`${advancedFormatNumber(Number((item as TopGainerOption).priceDiffPercentage), 2, "")}%`}
        </div>
      ) : (
        <div className="IBM-text-15-500-24 text-right text-whiteF5 min-w-[240px]">
          {`${advancedFormatNumber(Number((item as HighestVolumeOption).volume), 0, "$")}`}
        </div>
      )}

      {/* Column 4: Time to Expiry */}
      <div className="IBM-text-15-500-24 text-right text-whiteF5 min-w-[240px]">
        <CountdownTimer targetTimestamp={convertExpiryDateToTimestamp(expiryDate)} />
      </div>
    </>
  );
};

const LeaderBoardSection: React.FC = () => {
  const { isMobile } = useDevice();
  const { data: statsData } = useStats();
  const { data: leaderBoardData } = useLeaderBoard();

  const [selectedButton, setSelectedButton] = useState<LeaderBoardButton>("topGainer");
  const [emblaRef, emblaApi] = useEmblaCarousel(EMBLA_OPTIONS, EMBLA_PLUGINS);
  const { selectedIndex, scrollSnaps, onDotButtonClick } = useEmblaDotButton(emblaApi);

  const [slides, setSlides] = useState<SlideData>([]);

  useEffect(() => {
    const itemsPerSlide = isMobile ? ITEMS_PER_SLIDE_MOBILE : ITEMS_PER_SLIDE_DESKTOP;
    const displayLimit = isMobile ? DISPLAY_LIMIT_MOBILE : DISPLAY_LIMIT_DESKTOP;

    const fullData =
      selectedButton === "topGainer"
        ? leaderBoardData.topGainerOptions
        : leaderBoardData.highestVolumeOptions;
    const filteredData = fullData.slice(0, displayLimit);

    const slidesData = filteredData.reduce<SlideData>((acc, item, index) => {
      const slideIndex = Math.floor(index / itemsPerSlide);
      if (!acc[slideIndex]) {
        acc[slideIndex] = [];
      }
      acc[slideIndex].push(item);
      return acc;
    }, []);

    setSlides(slidesData);
  }, [leaderBoardData, selectedButton, isMobile]);

  const handleTradeNow = () => {
    window.open(MOBY_URLS.APP, "_blank");
  };

  return (
    <section
      className={twJoin(
        "relative h-fit w-full px-[12px] py-[72px] overflow-hidden",
        "lg:max-w-[1280px] lg:mx-auto lg:px-0 lg:py-[144px]"
      )}
    >
      <div className="relative z-10 flex flex-col items-center justify-center w-fullh-full">
        <div
          className={twJoin(
            "flex flex-col items-center gap-[4px] w-full px-[18px]",
            "lg:items-start lg:gap-[8px] lg:px-0"
          )}
        >
          <h1 className={twJoin("title-24", "lg:text-[32px]")}>Options Market Standouts</h1>
          <div
            className={twJoin("flex flex-col IBM-text-15-600-22 text-center text-greenE6", "lg:text-[20px]")}
          >
            <p>24H Volume : {advancedFormatNumber(statsData?.dailyTradingVolume.value || 0, 2, "$")}</p>
          </div>
        </div>

        {/* Button Group Component */}
        <ButtonsGroup
          selectedButton={selectedButton}
          setSelectedButton={setSelectedButton}
          handleTradeNow={handleTradeNow}
        />

        {/* Table Area */}
        <div
          className={twJoin(
            "flex flex-col w-full mt-[32px] overflow-hidden",
            "lg:bg-gray17 lg:px-[20px] lg:pb-[14px] lg:rounded-t-[6px] lg:rounded-b-[6px]"
          )}
        >
          {/* Table Header */}
          <LeaderBoardHeader selectedButton={selectedButton} />

          <div className="divider-horizontal"></div>

          {/* Table Body */}
          <div
            className={twJoin("overflow-hidden min-h-[305px]", "lg:mt-[6px] lg:min-h-[342px]")}
            ref={emblaRef}
          >
            <div className="flex">
              {slides.map((slideItems, slideIndex) => (
                <div className="flex-[0_0_100%]" key={slideIndex}>
                  {slideItems.map((item, index) => {
                    const parsedInstrument = parseInstrument(item.instrument);
                    const underlyingAsset = parsedInstrument.underlyingAsset as UnderlyingAsset;
                    const expiryDate = parsedInstrument.expiryDate;

                    return (
                      <div
                        key={index}
                        className={twJoin(
                          "flex flex-row justify-between items-center py-[12px] border-b border-gray29",
                          "lg:border-none lg:h-[36px] lg:px-[8px] lg:my-[6px] lg:hover:bg-gray29 lg:hover:cursor-pointer lg:hover:rounded-[6px]"
                        )}
                      >
                        {/* Mobile Layout (hidden on desktop) */}
                        <div
                          className={twJoin("flex flex-row justify-between items-center w-full", "lg:hidden")}
                        >
                          <LeaderBoardBodyMobile
                            item={item}
                            selectedButton={selectedButton}
                            underlyingAsset={underlyingAsset}
                            expiryDate={expiryDate}
                          />
                        </div>

                        {/* Desktop Layout (hidden on mobile) */}
                        <div className={twJoin("hidden", "lg:contents")}>
                          <LeaderBoardBodyDesktop
                            item={item}
                            selectedButton={selectedButton}
                            underlyingAsset={underlyingAsset}
                            expiryDate={expiryDate}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        <Button
          label="Trade Now"
          width="115px"
          height="36px"
          onClick={handleTradeNow}
          className={twJoin("flex-shrink-0 mt-[38px] px-[18px] text-black0A", "lg:hidden")}
        />

        <div className={twJoin("flex-shrink-0 mt-[24px] px-[18px] py-[4px]", "lg:mt-[28px]")}>
          <div className="flex flex-row justify-center items-center gap-[16px] py-[8px]">
            {scrollSnaps.map((_, index) => (
              <EmblaDotButton
                key={index}
                onClick={() => onDotButtonClick(index)}
                className={twJoin("custom-dot", selectedIndex === index ? "custom-dot-selected" : "")}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default LeaderBoardSection;
