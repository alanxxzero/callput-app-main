import { OlpKey } from '@/utils/enums';
import React, { useEffect, useRef, useState } from 'react'
import { twJoin, twMerge } from 'tailwind-merge'


type Item = {
  value: string;
  label: string;
  textColor: string;
  hoverColor: string;
}

type ToggleButtonProps = {
  id: string;
  size: string;
  shape: string;
  items: Item[];
  selectedItem: string;
  setSelectedItem: (value: any) => void;
  firstItemSelectedImgSrc?: string;
  firstItemNotSelectedImgSrc?: string;
  secondItemSelectedImgSrc?: string;
  secondItemNotSelectedImgSrc?: string;
  className?: string;
  imgClassName?: string;
  isDeprecated?: boolean;
}

const buttonSize: {[key: string]: string} = {
  stretch: "w-full h-[44px]",
  large: "w-[264px] h-[44px]", 
  medium: "w-[156px] h-[44px]",
  small: "w-[155px] h-[34px]"
}

const buttonShape: {[key: string]: string} = {
  square: "rounded-[6px]",
  round: "rounded-[16px]"
}

const ToggleButton: React.FC<ToggleButtonProps> = ({
  id,
  size,
  shape,
  items,
  selectedItem,
  setSelectedItem,
  firstItemSelectedImgSrc,
  firstItemNotSelectedImgSrc,
  secondItemSelectedImgSrc,
  secondItemNotSelectedImgSrc,
  className,
  imgClassName,
  isDeprecated
}) => {
  const sizeClass = buttonSize[size];
  const shapeClass = buttonShape[shape];

  if (isDeprecated) {
    return (
      <div className={twMerge(
        twJoin(`flex p-[4px] bg-black17 text-gray80 ${sizeClass} ${shapeClass}`),
        className,
      )}>
        <div 
          className={twJoin(
            `cursor-not-allowed group flex-1 flex justify-center items-center ${shapeClass}`
          )}
        >
          <label htmlFor={items[0].value} className={twJoin(
            "cursor-not-allowed font-bold",
            size === "small" ? "text-[12px] font-semibold" : "text-[15px] font-normal opacity-30"
            )}>
            {items[0].label}
          </label>
        </div>
  
        <div 
          className={twJoin(
            `group cursor-pointer flex-1 flex justify-center items-center ${shapeClass} ${items[1].hoverColor}`,
            `${selectedItem === items[1].value && `${items[1].textColor} bg-black26`}`,
            "active:bg-black24 active:opacity-80 active:scale-95"
          )}
          onClick={() => setSelectedItem(items[1].value)}
        >
          <label htmlFor={items[1].value} className={twJoin(
            "cursor-pointer",
            size === "small" ? "text-[12px] font-semibold" : "text-[15px] font-bold"
            )}>
            {items[1].label}
          </label>
          { selectedItem === items[1].value && (<img className={imgClassName} src={secondItemSelectedImgSrc} />) }
          { selectedItem !== items[1].value && (
            <>
              <img className={twJoin("hidden group-hover:block", imgClassName)} src={secondItemSelectedImgSrc} />
              <img className={twJoin("block group-hover:hidden", imgClassName)} src={secondItemNotSelectedImgSrc} />
            </>
          )}
        </div>
  
      </div>
  
    )
  }


  return (
    <div className={twMerge(
      twJoin(`flex p-[4px] bg-[#0A0A0A] text-gray80 ${sizeClass} ${shapeClass}`),
      className,
    )}>
      <div 
        className={twJoin(
          `group cursor-pointer flex-1 flex justify-center items-center ${shapeClass} ${items[0].hoverColor}`,
          `${selectedItem === items[0].value && `${items[0].textColor} bg-black26`}`,
          "active:bg-black24 active:opacity-80 active:scale-95"
        )}
        onClick={() => setSelectedItem(items[0].value)}
      >
        <label htmlFor={items[0].value} className={twJoin(
          "cursor-pointer font-bold",
          size === "small" ? "text-[12px] font-semibold" : "text-[15px] font-bold"
          )}>
          {items[0].label}
        </label>
        { selectedItem === items[0].value && (<img className={imgClassName} src={firstItemSelectedImgSrc} />) }
        { selectedItem !== items[0].value && (
          <>
            <img className={twJoin("hidden group-hover:block", imgClassName)} src={firstItemSelectedImgSrc} />
            <img className={twJoin("block group-hover:hidden", imgClassName)} src={firstItemNotSelectedImgSrc} />
          </>
        )}
      </div>

      <div 
        className={twJoin(
          `group cursor-pointer flex-1 flex justify-center items-center ${shapeClass} ${items[1].hoverColor}`,
          `${selectedItem === items[1].value && `${items[1].textColor} bg-black26`}`,
          "active:bg-black24 active:opacity-80 active:scale-95"
        )}
        onClick={() => setSelectedItem(items[1].value)}
      >
        <label htmlFor={items[1].value} className={twJoin(
          "cursor-pointer",
          size === "small" ? "text-[12px] font-semibold" : "text-[15px] font-bold"
          )}>
          {items[1].label}
        </label>
        { selectedItem === items[1].value && (<img className={imgClassName} src={secondItemSelectedImgSrc} />) }
        { selectedItem !== items[1].value && (
          <>
            <img className={twJoin("hidden group-hover:block", imgClassName)} src={secondItemSelectedImgSrc} />
            <img className={twJoin("block group-hover:hidden", imgClassName)} src={secondItemNotSelectedImgSrc} />
          </>
        )}
      </div>

    </div>

  )
}

export default ToggleButton