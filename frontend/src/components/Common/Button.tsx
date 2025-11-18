import React from 'react'
import { twJoin, twMerge } from 'tailwind-merge'
import IconPopupArrow from "@/assets/icon-popup-arrow.png";

type ButtonProps = {
  name: string | JSX.Element;
  color: string;
  disabled?: boolean;
  isError?: boolean;
  onClick: () => void;
  className?: string;
  isLoading?: boolean;
  isMobile?: boolean;
  hasArrow?: boolean;
}

const buttonColor: {[key: string]: string} = {
  default: "bg-black33 text-greenc1 hover:bg-black29 active:opacity-80 active:scale-95",
  green: "bg-green4c text-black12 hover:bg-[#51b85e] active:bg-[#48a354] active:opacity-80 active:scale-95",
  red: "bg-redc7 text-black12 hover:bg-[#d64545] active:bg-[#b83b3b] active:opacity-80 active:scale-95",
  greenc1: "bg-greenc1 text-black12 active:opacity-80 active:scale-95",
  greene6: "bg-greene6 text-black12 active:opacity-80 active:scale-95",
  orangef793: "border border-orangef793 bg-transparent text-orangef793 hover:bg-orangef793 hover:text-black1f active:bg-orangef793 active:opacity-80 active:scale-95",
  transparent: "bg-transparent text-whitee6 hover:bg-black29 active:text-whitee6",
}

const Button: React.FC<ButtonProps> = ({
  name, 
  color, 
  disabled = false, 
  isError = false, 
  onClick,
  className = "",
  isLoading,
  isMobile,
  hasArrow = false,
}) => {
  const colorClass = isError
    ? isMobile
      ? "cursor-not-allowed bg-redE0 text-black0a12"
      : "cursor-not-allowed bg-[#332727] text-redc7"
    : disabled
      ? "cursor-not-allowed bg-[#242424] text-[#525252]"
      : buttonColor[color];
  
  const handleClick = () => {
    if (!disabled && !isError) {
      onClick();
    }
  };

  return (
    <button 
      className={twMerge(
        twJoin(
          "w-full h-full",
          "rounded-[6px] text-[15px] font-bold",
          "flex items-center justify-center",  // flex 컨테이너로 변경
          hasArrow && "gap-[10px]",  // arrow 유무에 따라 정렬 방식 변경
          `${colorClass}`,
        ),
        className,
      )}
      onClick={handleClick}
      disabled={disabled}
    >
      {isLoading ? (
        "..."
      ) : (
        <>
          <span>{name}</span>
          {hasArrow && <img className='w-[22px]' src={IconPopupArrow} />}
        </>
      )}
    </button>
  )
}

export default Button