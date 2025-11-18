import { useEffect, useRef, useState } from "react";
import { twJoin } from "tailwind-merge";

import { DOV_ASSET_INFO } from "@/utils/assets";

import IconSelectedZeroDteArrowUp from "@assets/icon-selected-zero-dte-arrow-up.svg";
import IconSelectedZeroDteArrowDown from "@assets/icon-selected-zero-dte-arrow-down.svg";
import { Ticker } from "@/enums/enums.appSlice";
import { useAppSelector } from "@/store/hooks";
import { getDovInfo } from "@/constants/constants.dov";


type ScaleType = "small" | "medium" | "large";

interface AssetDropDownProps {
  list: any;
  selectedAsset: any;
  selectAsset: (value: Ticker.DovAsset) => void;
}

const DovAssetDropDown: React.FC<AssetDropDownProps> = ({
  list,
  selectedAsset,
  selectAsset
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const dropDownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    document.body.addEventListener("click", event => {
      if (dropDownRef.current?.contains(event.target as Node)) return;
      setIsDropdownOpen(false);
    })
  }, []);

  return (
    <div className="relative">
      <div
        className={twJoin(
            "cursor-pointer flex flex-row justify-end items-center",
            "w-fit h-full rounded-[4px]",
            "bg-black17",
            "hover:bg-black1f active:bg-black1f active:opacity-80 active:scale-95",
            "pl-[12px] pr-[8px] gap-[9px]"
        )}
        ref={dropDownRef}
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
      >
        <p className={twJoin(
          "text-whitee0 font-semibold",
          "text-[16px]",
        )}>{selectedAsset}</p>
        <img
          className={twJoin(
            "cursor-pointer",
            "w-[18px] h-[18px] min-w-[18px] min-h-[18px]"
          )}
          src={!isDropdownOpen ? IconSelectedZeroDteArrowDown : IconSelectedZeroDteArrowUp}
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        />
      </div>
      {isDropdownOpen && (
        <div
          className={twJoin(
            "absolute top-[38px] right-0 z-10",
            "w-[216px] h-fit p-[4px] overflow-scroll scrollbar-hide",
            "bg-black1f rounded-[4px] shadow-[0px_0px_36px_0_rgba(10,10,10,0.72)]",
            "top-[38px] w-[216px]"
          )}
        > 
          { 
            list.map(({ name, symbol }: any) => {
              return (
                <button 
                  key={symbol}
                  className={twJoin(
                    "cursor-pointer flex flex-row items-center",
                    "w-full h-[36px] px-[6px]",
                    "text-whitee0",
                    "hover:bg-black29 hover:rounded-[3px] hover:text-greenc1",
                    "active:bg-black1f active:opacity-80 active:scale-95"
                  )}
                  type="submit"
                  onClick={() => {
                    selectAsset(symbol);
                  }}
                >
                  <div key={symbol} className="flex flex-row items-center">
                    {DOV_ASSET_INFO[symbol]?.src 
                      ? <img src={DOV_ASSET_INFO[symbol]?.src} alt="" className="w-[20px] h-[20px] ml-[8px]" />
                      : DOV_ASSET_INFO[symbol]?.srcList?.map((src, idx) => {
                        return (
                          <img 
                            className={twJoin(
                              "relative",
                              "w-[20px] h-[20px] ml-[8px]",
                              idx > 0 && "ml-[0px]",
                            )}
                            src={src} 
                          />
                        )
                      })
                    }
                    <p className={twJoin(
                      "pl-[10px] whitespace-nowrap font-semibold",
                      "text-[15px]"
                    )}>{name}</p>
                    <p className={twJoin(
                      "pl-[6px] whitespace-nowrap text-gray80 font-semibold",
                      "text-[13px]"
                    )}>{symbol}</p>
                  </div>
                </button>
              );
            })
          }
        </div>
      )}
    </div>
  );
};

export default DovAssetDropDown;