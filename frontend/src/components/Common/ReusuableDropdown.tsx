import { useEffect, useRef, useState } from "react";
import { twJoin } from "tailwind-merge";
import IconDropdownDownGray from "@assets/icon-dropdown-down-gray.svg";
import IconDropdownDownGreen from "@assets/trading-v2/icon-dropdown-down-green.png";
import IconDropdownUpGreen from "@assets/trading-v2/icon-dropdown-up-green.png";
import IconDropdownSel from "@assets/trading-v2/icon-dropbox-sel.png";

export interface DropdownOption<T extends string> {
  value: T;
  icon?: string;
}

interface ReusableDropdownProps<T extends string> {
  options: DropdownOption<T>[];
  selectedOption: T;
  onOptionSelect: (option: T) => void;
  width: string;
  height: string;
  dropdownWidth: string;
  buttonClassName?: string;
  iconClassName?: string;
  textClassName?: string;
  dropdownClassName?: string;
  dropdownItemClassName?: string;
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
}

function ReusableDropdown<T extends string>({
  options,
  selectedOption,
  onOptionSelect,
  width,
  height,
  dropdownWidth,
  buttonClassName = "bg-transparent hover:bg-black1f",
  iconClassName = "w-[20px] h-[20px]",
  textClassName = "text-whitef5 text-[14px] font-semibold leading-[28px]",
  dropdownClassName = "top-[46px] right-[-6px]",
  dropdownItemClassName = "h-[28px]",
  isOpen,
  onOpenChange,
}: ReusableDropdownProps<T>) {
  const [internalOpen, setInternalOpen] = useState(false);
  const dropDownRef = useRef<HTMLDivElement>(null);

  const isDropdownOpen = isOpen !== undefined ? isOpen : internalOpen;
  const selectedOptionObj = options.find((opt) => opt.value === selectedOption) || options[0];

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (dropDownRef.current?.contains(event.target as Node)) return;

      if (onOpenChange) {
        onOpenChange(false);
      } else {
        setInternalOpen(false);
      }
    };

    document.body.addEventListener("click", handleOutsideClick);

    return () => {
      document.body.removeEventListener("click", handleOutsideClick);
    };
  }, [onOpenChange]);

  const toggleDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newState = !isDropdownOpen;

    if (onOpenChange) {
      onOpenChange(newState);
    } else {
      setInternalOpen(newState);
    }
  };

  const renderDropdownIcon = () => {
    if (isDropdownOpen) {
      return (
        <img
          className="cursor-pointer w-[18px] h-[18px]"
          src={IconDropdownUpGreen}
          onClick={toggleDropdown}
        />
      );
    }

    return (
      <div className="relative cursor-pointer w-[18px] h-[18px]" onClick={toggleDropdown}>
        <img className="absolute inset-0 block group-hover:hidden w-full h-full" src={IconDropdownDownGray} />
        <img
          className="absolute inset-0 hidden group-hover:block w-full h-full"
          src={IconDropdownDownGreen}
        />
      </div>
    );
  };

  return (
    <div className="relative">
      <div
        className={twJoin(
          "group",
          "cursor-pointer flex flex-row justify-between items-center gap-[8px]",
          "rounded-[2px] pl-[8px] pr-[2px]",
          "active:opacity-30 active:scale-95 active:bg-transparent",
          buttonClassName
        )}
        style={{ width, height }}
        ref={dropDownRef}
        onClick={toggleDropdown}
      >
        {selectedOptionObj.icon && <img className={iconClassName} src={selectedOptionObj.icon} />}
        <p className={twJoin(textClassName, "w-fit text-whitef5 font-semibold leading-[16px]")}>
          {selectedOption}
        </p>
        {renderDropdownIcon()}
      </div>
      {isDropdownOpen && (
        <div
          className={twJoin(
            "absolute z-10",
            "py-[4px]",
            "bg-black1f rounded-[2px] border-[1px] border-black33 shadow-[0px_0px_36px_0_rgba(10,10,10,0.72)]",
            dropdownClassName
          )}
          style={{ width: dropdownWidth }}
        >
          {options.map((option) => (
            <button
              key={option.value}
              className={twJoin(
                "cursor-pointer flex flex-row items-center",
                "w-full px-[10px]",
                "text-whitef5",
                "hover:bg-black29 hover:text-greene6",
                dropdownItemClassName
              )}
              type="submit"
              onClick={(e) => {
                e.stopPropagation();
                onOptionSelect(option.value);

                if (onOpenChange) {
                  onOpenChange(false);
                } else {
                  setInternalOpen(false);
                }
              }}
            >
              <div className="flex flex-row items-center justify-between w-full">
                <div className="flex flex-row items-center gap-[8px]">
                  {option.icon && <img className={iconClassName} src={option.icon} />}
                  <p className="whitespace-nowrap text-[11px] font-semibold leading-[20px]">{option.value}</p>
                </div>
                {selectedOption === option.value && <img className="w-[18px]" src={IconDropdownSel} />}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default ReusableDropdown;
