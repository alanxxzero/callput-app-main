import Wallet from "./Wallet";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { twJoin } from "tailwind-merge";
import { useAppSelector } from "@/store/hooks";
import { advancedFormatNumber, formatNumber } from "@/utils/helper";

import IconExternal from "@assets/icon-external.svg";
import IconExternalSelected from "@assets/icon-external-selected.svg";
import IconMoreUnOpened from "@assets/icon-more-unopened.svg";
import IconMoreOpened from "@assets/icon-more-opened.svg";
import IconBadgeNew from "@assets/icon-badge-new.svg";

import LogoMobyBeta from '@assets/beramoby-logo-beta.svg'
import { MENU_ITEMS, SOCIALS } from "@/networks/configs";
import { NetworkState } from "@/networks/types";


interface NavBarItemProps {
  name: string | JSX.Element;
  url: string;
  isExternal: boolean
  isNew: boolean;
  isDisabled: boolean;
  onActive: (node: HTMLDivElement) => void;
}

interface SocialMenuItemProps {
  social: any;
  onClick: () => void;
}

const NavBarItem: React.FC<NavBarItemProps> = ({ name, url, isExternal, isNew, isDisabled, onActive }) => {
  const location = useLocation();
  const isActive = location.pathname === url || (location.pathname === "/" && url === "/trading");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isActive && ref.current) {
      onActive(ref.current);
    }
  }, [isActive, onActive]);

  const linkClasses = isDisabled
    ? "flex items-center h-full px-[16px] text-[17px] text-[#989995] text-opacity-30 cursor-not-allowed"
    : isActive
      ? "flex items-center h-full px-[16px] text-[17px] text-primaryc1 font-bold"
      : "flex items-center h-full px-[16px] text-[17px] text-gray98 font-semibold hover:text-whitee0 active:text-[#E6FC8D] active:opacity-80 active:scale-95";

  const content = (
    <div className="group flex flex-row h-[72px] justify-center items-center gap-[6px]">
      <div>{name}</div>
      {isNew && <img className="w-[34px] h-[16px]" src={IconBadgeNew}/>}
      {isExternal && <img className="block group-hover:hidden w-[10px] h-[10px]" src={IconExternal} />}
      {isExternal && <img className="hidden group-hover:block w-[10px] h-[10px]" src={IconExternalSelected} />}
    </div>
  );

  // if (name == "Boyco") {
  //   return (
  //     <div ref={ref}>
  //       <Link to={url} className={linkClasses}>
  //         <div className="relative group w-fit">
  //           <img
  //             className={twJoin(
  //               "min-w-[160px] w-[160px] h-[72px]",
  //               "cursor-pointer",
  //             )}
  //             src={BoycoIcon} 
  //           />
  //         </div>
  //       </Link>
  //     </div>
  //   );
  // }
  
  if (isDisabled) {
    return (
      <div ref={ref} className="relative group w-fit">
        <p className={linkClasses}>{name}</p>
        <div className={twJoin(
          "w-max h-[40px] z-40",
          "absolute hidden px-[16px] py-[8px] top-[34px] left-1/2 transform -translate-x-1/2",
          "bg-black1f rounded-[4px] border-[1px] border-[rgba(224,224,224,.1)] shadow-[0_0_8px_0_rgba(10,10,10,.72)]",
          "group-hover:block"
        )}>
          <p className="text-[14px] text-grayb3 font-semibold">Coming soon</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={ref}>
      {isExternal ? (
        <a href={url} className={linkClasses} target="_blank" rel="noopener noreferrer">
          {content}
        </a>
      ) : (
        <Link to={url} className={linkClasses}>
          {content}
        </Link>
      )}
    </div>
  );
};


const SocialMenuItem: React.FC<SocialMenuItemProps> = ({ social, onClick }) => {
  return (
    <button
      key={social.id}
      className={twJoin(
        "group/social flex flex-row justify-start items-center gap-3 w-full h-9 px-2",
        "text-gray98 font-semibold",
        "hover:bg-black29 hover:rounded-[3px] hover:text-whitee0"
      )}
      type="button"
      onClick={onClick}
    >
      <div className="w-6 h-6 relative">
        <img 
          src={social.iconSrc} 
          className="absolute w-6 h-6 group-hove/social:opacity-0 transition-opacity"
          alt={`${social.name} icon`}
        />
        <img 
          src={social.iconSrcSelected} 
          className="absolute w-6 h-6 opacity-0 group-hover/social:opacity-100 transition-opacity"
          alt={`${social.name} selected icon`}
        />
      </div>
      <span>{social.name}</span>
    </button>
  );
};

function NavBar() {
  const navigate = useNavigate();
  const volumeData = useAppSelector((state: any) => state.user.volume);
  const { chain } = useAppSelector(state => state.network) as NetworkState;

  const moreRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [totalNotionalVolume, setTotalNotionalVolume] = useState("0");
  const [indicatorStyle, setIndicatorStyle] = useState({left: 0, width: 0});
  const [isMoreOpened, setIsMoreOpened] = useState<boolean>(false);

  const olpApr = useAppSelector((state: any) => state.app.olpApr);

  const handleMouseEnter = () => {
    setIsMoreOpened(true);
  };

  const handleMouseLeave = (e: React.MouseEvent) => {
    // Check if the mouse is moving to the dropdown
    if (moreRef.current && dropdownRef.current) {
      let shouldClose = true;
      const moreRect = moreRef.current.getBoundingClientRect();
      const dropdownRect = dropdownRef.current.getBoundingClientRect();

      if (
        e.clientX >= moreRect.left &&
        e.clientX <= moreRect.right &&
        e.clientY >= moreRect.top &&
        e.clientY <= moreRect.bottom
      ) {
        shouldClose = false;
      }

      if (
        e.clientX >= dropdownRect.left &&
        e.clientX <= dropdownRect.right &&
        e.clientY >= dropdownRect.top &&
        e.clientY <= dropdownRect.bottom
      ) {
        shouldClose = false;
      }

      setIsMoreOpened(!shouldClose);
    }
  }

  useEffect(() => {
    setTotalNotionalVolume(volumeData.totalNotionalVolume);
  }, [volumeData])

  const handleActive = useCallback((menuItemElement: HTMLDivElement) => {
    const { left, width } = menuItemElement.getBoundingClientRect();
    const parentRect = menuItemElement.parentElement?.getBoundingClientRect();
  
    if (parentRect) {
      const marginLeft = parseFloat(window.getComputedStyle(menuItemElement).marginLeft);
      const relativeLeft = left - parentRect.left - marginLeft;
      const totalWidth = width + marginLeft;
      setIndicatorStyle({ left: relativeLeft, width: totalWidth });
    }
  }, []);

  const getNavbarName = (item: any) => {
    const isPool = item.name === "Pool"
    const poolAPR = formatNumber((olpApr?.sOlp?.feeApr + olpApr?.sOlp?.riskPremiumApr) * 100, 1, true)

    if (isPool) {
      return (
        <div
          className={twJoin(
            "flex items-center"
          )}
        >
          {item.name} 
          <span
            className={twJoin(
              "flex items-center justify-center",
              "min-w-[48px] h-[18px] text-center text-black17 text-[14px] font-[700] bg-gradient-to-r from-[#F7931A] to-[#FF581B]",
              "rounded-[3px]",
              "ml-[6px]"
            )}
          >
            {poolAPR == "0" 
              ? ""
              : `${poolAPR.replace('<', '')}%`
            }
          </span>
        </div>
      )
    }
    
    return item.name
  }

  return (
    <div className={twJoin(
      "z-40 fixed top-0 left-0 right-0 flex flex-row justify-between items-center h-[72px] bg-black0a",
      "text-white pl-[24px] pr-[24px] border-b-[1px] border-b-black29")}>
      <div className="flex flex-row items-center h-[72px] gap-[24px]">
        <div className="flex flex-row justify-center items-center gap-[9px]">
          <img
            className="cursor-pointer w-[134px] h-[28px] min-w-[134px] min-h-[28px]"
            src={LogoMobyBeta}
            onClick={() => {
              navigate("/");
            }}
          />
        </div>
        <div className="relative flex flex-row justify-center items-center h-full">
          {MENU_ITEMS[chain].map((item) => (
            <NavBarItem
              key={item.id} 
              name={getNavbarName(item)} 
              url={item.url} 
              isExternal={item.isExternal} 
              isNew={item.isNew} 
              isDisabled={item.isDisabled} 
              onActive={handleActive} 
            />
          ))}
          <div className="absolute h-[3px] bg-primaryc1 bottom-0 transition-all duration-300" style={indicatorStyle} />
          <div
            className="relative group flex flex-row justify-center items-center h-[72px] px-[16px]"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <div
              className="cursor-pointer flex flex-row justify-between items-center"
              ref={moreRef}
            >
              <p
                className={twJoin(
                  "flex items-center h-full text-[17px] text-gray98 font-semibold",
                  "group-hover:text-whitee0"
                )}
              >More</p>
              <img className="ml-[6px] w-[18px] h-[18px]" src={isMoreOpened ? IconMoreOpened : IconMoreUnOpened} />
            </div>
            {isMoreOpened && (
              <div
                className={twJoin(
                  "absolute top-[60px] -left-[24px] w-[216px] h-[224px]",
                  "flex flex-col",
                  "bg-black1f rounded-[4px] shadow-[0px_0px_24px_0px_rgba(10,10,10,0.36) p-[4px]"
                )}
                ref={dropdownRef}
                onMouseEnter={handleMouseEnter}

              >
                {SOCIALS[chain].map((social: any) => {
                  return (
                    <SocialMenuItem
                      key={social.id}
                      social={social}
                      onClick={() => {
                        window.open(social.url, "_blank");
                      }}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className={twJoin("flex flex-row items-center")}>
        <div className="w-fit">
          <p className="text-[11px] text-gray80 font-bold">Trading Vol.</p>
          <p className="text-[12px] font-bold">{advancedFormatNumber(Number(totalNotionalVolume), 0, "$")}</p>
        </div>
        <Wallet />
      </div>
    </div>
  );
}

export default NavBar;