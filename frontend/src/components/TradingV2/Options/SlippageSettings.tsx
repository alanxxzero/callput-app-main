import React, { useState } from "react";
import { twJoin } from "tailwind-merge";

const SLIPPAGE_DEFAULT_VALUES = [3, 5, 10];
const DEFAULT_SLIPPAGE = 5;

interface SlippageSettingsProps {
  slippage: number;
  setSlippage: (value: number) => void;
}

function SlippageSettings({ slippage, setSlippage }: SlippageSettingsProps) {
  const [slippageInputValue, setSlippageInputValue] = useState<string>("");

  const handleDefaultButtonClick = (value: number) => {
    setSlippageInputValue("");
    setSlippage(value);
  };

  const handleCustomInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    // Reject spaces
    if (inputValue.includes(" ")) return;
    
    // Reject non-numeric inputs
    if (isNaN(Number(inputValue))) return;
    
    // Reset to default if input is empty
    if (inputValue === "") {
      setSlippageInputValue("");
      setSlippage(DEFAULT_SLIPPAGE);
      return;
    }

    // Remove leading zeros
    const cleanedValue = inputValue.replace(/^0+(?=\d)/, "");
    
    // Cap at 100%
    if (Number(cleanedValue) >= 100) {
      setSlippageInputValue("100");
      setSlippage(100);
      return;
    }

    setSlippageInputValue(cleanedValue);
    setSlippage(Number(cleanedValue));
  };

  return (
    <div className="flex flex-col w-full gap-[24px]">
      <p className="text-[13px] text-grayb3 font-semibold leading-normal">
        Slippage Tolerance Setting
      </p>
      
      <div className="flex flex-row justify-between items-center h-fit">
        {/* Default value buttons */}
        <div className="flex flex-row justify-between items-center w-[153px] h-[32px] bg-black17">
          {SLIPPAGE_DEFAULT_VALUES.map((value) => (
            <button
              key={value}
              className={twJoin(
                "w-[48px] h-full text-[12px] text-gray80 text-center font-semibold leading-[12px]",
                slippage === value && "text-greene6 font-bold bg-black29 rounded-[6px]"
              )}
              onClick={() => handleDefaultButtonClick(value)}
            >
              {value}%
            </button>
          ))}
        </div>
        
        {/* Custom value input */}
        <div
          className={twJoin(
            "flex flex-row justify-between items-center gap-[8px]",
            "w-[135px] h-[32px] px-[12px] py-[8px] rounded-[4px]",
            "bg-black17 border-[1px] border-black29"
          )}
        >
          <input
            value={slippageInputValue}
            placeholder="Custom"
            className={twJoin(
              "w-full h-full",
              "text-[12px] text-greene6 font-medium bg-transparent",
              "focus:outline-none",
              "placeholder:text-[12px] placeholder:text-greene6"
            )}
            onChange={handleCustomInputChange}
          />
          <p className="text-[12px] text-gray80 font-semibold leading-[16px]">%</p>
        </div>
      </div>
      
      {/* Information section */}
      <div className="flex flex-row h-[88px] gap-[16px]">
        <div className="w-[3px] h-full bg-black33 rounded-[2px]" />
        <div className="flex flex-col gap-[8px] h-full">
          <p className="h-[13px] text-[11px] text-grayb3 font-medium leading-normal">
            Why this number?
          </p>
          <div className="flex flex-col w-[285px] text-[10px] text-gray52 font-medium leading-[13px]">
            <p className="h-[39px]">
              Moby calculates real-time prices based on Synchronized Liquidity Engine (SLE). Accordingly,
              prices may be updated during trade execution.
            </p>
            <p className="h-[26px]">
              The configured tolerance is set to facilitate trade execution, even in volatile markets.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SlippageSettings;
