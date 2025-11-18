import { OptionDirection, OrderSide } from "@/utils/types";
import { twJoin } from "tailwind-merge";
import { ModalContext } from "@/components/Common/ModalContext";
import { useContext } from "react";
import MobySimpleGuidePopup from "@/components/Common/MobySimpleGuidePopup";

interface OptionPreviewDefaultProps {
  selectedExpiry: number;
  selectedOptionDirection: OptionDirection;
  selectedOrderSide: OrderSide;
}

const SEVEN_DAYS_IN_SECONDS = 7 * 24 * 60 * 60;

const OPTION_DESCRIPTIONS = {
  CallBuy: {
    title: "Call Buy",
    description:
      "Buy a call to gain exposure to potential price increases. If the market price exceeds the strike at expiration, you can exercise the option or sell it for a profit.",
  },
  CallSell: {
    title: "Call Sell",
    description:
      "Sell a call to collect a premium, with the obligation to sell the asset if the price surpasses the strike at expiration. Requires risk management to limit potential losses.",
  },
  PutBuy: {
    title: "Put Buy",
    description:
      "Buy a put to hedge against price declines or profit from downside movement. If the price falls below the strike at expiration, you can exercise the option or sell it for a profit.",
  },
  PutSell: {
    title: "Put Sell",
    description:
      "Sell a put to earn a premium, with the obligation to buy the asset if the price drops below the strike at expiration. Requires risk management to limit potential losses.",
  },
} as const;

const EXPIRY_DESCRIPTIONS = {
  short: {
    title: "Short-term Expiry (< 7d)",
    description:
      "Short-Term Options offer higher leverage and volatility, making them ideal for quick trades.",
  },
  mid: {
    title: "Mid-term Expiry (> 7d)",
    description:
      "Mid-Term Options provide more stable exposure with slower time decay, making them well-suited for strategic positioning.",
  },
} as const;

function OptionPreviewDefault({
  selectedExpiry,
  selectedOptionDirection,
  selectedOrderSide,
}: OptionPreviewDefaultProps) {
  const { openModal } = useContext(ModalContext);

  const { title: optionTitle, description: optionDescription } = getOptionDescription(
    selectedOptionDirection,
    selectedOrderSide
  );
  const { title: expiryTitle, description: expiryDescription } = getExpiryDescription(selectedExpiry);

  const handleLearnMoreClick = () => {
    openModal(<MobySimpleGuidePopup />, {
      modalClassName: ["backdrop-blur-none", "bg-[#121212] bg-opacity-80"],
    });
  };

  return (
    <div
      className={twJoin(
        "flex flex-col min-w-[384px] max-w-[384px] min-h-[828px]",
        "p-[28px] bg-black0a border-l-[1px] border-[#333333]"
      )}
    >
      <div className="flex flex-col gap-[18px] w-full h-[120px] p-[20px] rounded-[4px] bg-black17">
        <p className="text-[#f5f5f5] text-[18px] font-bold leading-normal">Trade Options</p>
        <p className="text-grayb3 text-[14px] font-medium leading-[20px]">
          Buy/sell options by choosing call/put, strike price and expiry.
        </p>
      </div>

      <div className="h-[48px]" />

      <div className="flex flex-col gap-[18px]">
        <p className="h-[22px] text-[#E6FC8D] text-[18px] font-bold leading-normal">
          Seamless Options, Anytime
        </p>
        <div className="flex flex-col gap-[8px] text-grayb3 text-[14px] font-medium leading-[20px]">
          <p className="h-[80px]">
            Moby Option is a European-style contract, exercisable only at expiration, while allowing traders
            to buy and sell at prevailing market prices anytime before expiry.
          </p>
          <p className="h-[40px]">
            Backed by continuous liquidity, Moby ensures seamless and immediate execution at all times.
          </p>
        </div>
      </div>

      <div className="h-[24px]" />

      <div className="flex flex-col gap-[8px]">
        <p className="h-[20px] text-[#D9D9D9] text-[14px] font-semibold leading-[20px]">{optionTitle}</p>
        <p className="text-grayb3 text-[14px] font-medium leading-[20px]">{optionDescription}</p>
      </div>

      <div className="h-[24px]" />

      <div className="flex flex-col gap-[8px]">
        <p className="h-[20px] text-[#D9D9D9] text-[14px] font-semibold leading-[20px]">{expiryTitle}</p>
        <p className="text-grayb3 text-[14px] font-medium leading-[20px]">{expiryDescription}</p>
      </div>

      <div className="h-[24px]" />

      <div
        className="cursor-pointer flex flex-row items-center justify-center w-[328px] h-[36px] px-[20px] py-[10px] rounded-[6px] bg-black29"
        onClick={handleLearnMoreClick}
      >
        <p className="text-[#E6FC8D] text-[13px] font-medium leading-[16px]">
          Learn more from the Moby Simple Guide
        </p>
      </div>
    </div>
  );
}

export default OptionPreviewDefault;

const getOptionDescription = (selectedOptionDirection: OptionDirection, selectedOrderSide: OrderSide) => {
  const key = `${selectedOptionDirection}${selectedOrderSide}` as const;
  return OPTION_DESCRIPTIONS[key] || { title: "", description: "" };
};

const getExpiryDescription = (selectedExpiry: number) => {
  const currentDate = new Date().getTime() / 1000;
  const isShortTerm = selectedExpiry < currentDate + SEVEN_DAYS_IN_SECONDS;
  return isShortTerm ? EXPIRY_DESCRIPTIONS.short : EXPIRY_DESCRIPTIONS.mid;
};
