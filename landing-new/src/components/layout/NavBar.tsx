import React, { useEffect, useLayoutEffect, useState } from "react";
import Button from "../common/Button";
import LogoMoby from "../../assets/images/logo-moby.png";
import { MOBY_URLS } from "../../shared/constants/urls";
import { twJoin } from "tailwind-merge";
import { Social, SOCIALS } from "../../shared/constants/socials";

import IconHamburger from "../../assets/images/icon-hamburger.png";
import IconDocs from "../../assets/images/icon-docs.png";
import IconDashboard from "../../assets/images/icon-dashboard.png";

const MENU_ITEMS: Social[] = [
  {
    name: "Docs",
    imgSrc: IconDocs,
    url: MOBY_URLS.DOCS,
    ariaLabel: "Docs",
  },
  ...SOCIALS,
];

const HAMBURGER_MENU_ITEMS = [
  {
    name: "Dashboard",
    imgSrc: IconDashboard,
    url: MOBY_URLS.DASHBOARD,
    ariaLabel: "Dashboard",
  },
  ...MENU_ITEMS,
];

interface HamburgerItemProps {
  index: number;
  name: string;
  imgSrc: string;
  url: string;
  closeMenu: () => void;
}

interface HamburgerMenuProps {
  isOpenMenu: boolean;
  touchStartY: number | undefined;
  closeMenu: () => void;
  setTouchStartY: (value: number | undefined) => void;
}

const HamburgerMenuItem: React.FC<HamburgerItemProps> = ({ index, name, url, imgSrc, closeMenu }) => {
  return (
    <div
      className={twJoin("py-[15px]", index > 0 ? "border-t-[1px] border-t-gray29" : "")}
      onClick={() => {
        window.open(url, "_blank");
        closeMenu();
      }}
    >
      <div className="flex flex-row justify-start items-center gap-[20px] w-full mx-auto">
        <img className="w-[32px]" src={imgSrc} />
        <p className="text-left-16-500-24 text-grayD9">{name}</p>
      </div>
    </div>
  );
};

const HamburgerMenu: React.FC<HamburgerMenuProps> = ({
  isOpenMenu,
  touchStartY,
  closeMenu,
  setTouchStartY,
}) => {
  return (
    <div
      className={twJoin(
        "fixed top-0 bottom-0 left-0 w-full",
        "flex flex-col justify-end",
        "transition-all duration-[300ms] ease-linear",
        "bg-[rgb(10,10,10,0.9)] backdrop-blur-[2px]",
        isOpenMenu ? "opacity-100 z-[200] delay-[100ms]" : "opacity-0 -z-[1] pointer-events-none"
      )}
      onClick={closeMenu}
      onTouchStart={(e) => {
        setTouchStartY(e.touches?.[0]?.clientY);
      }}
      onTouchEnd={(e) => {
        if (typeof touchStartY === "number" && e.changedTouches?.[0]?.clientY > touchStartY) {
          closeMenu();
        }
      }}
    >
      <div
        className={twJoin(
          "relative overflow-hidden",
          "pt-[22px] pb-[33px] rounded-t-[16px] bg-black",
          "border-t-[1px] border-t-gray2C",
          "transition-all duration-[300ms] ease-linear",
          isOpenMenu ? "translate-y-0 delay-[150ms]" : "translate-y-full"
        )}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <div className="relative z-[2] px-[28px] overflow-auto h-full">
          {HAMBURGER_MENU_ITEMS.map((item, index) => (
            <HamburgerMenuItem
              key={index}
              index={index}
              name={item.name}
              imgSrc={item.imgSrc}
              url={item.url}
              closeMenu={closeMenu}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const NavBar: React.FC = () => {
  const [isOpenMenu, setIsOpenMenu] = useState(false);
  const [touchStartY, setTouchStartY] = useState<number>();

  const closeMenu = () => {
    setIsOpenMenu(false);
    setTouchStartY(undefined);
  };

  const resetBodyStyle = () => {
    document.body.classList.remove("fixed-body");
    document.body.style.top = "";
  };

  useLayoutEffect(() => {
    if (isOpenMenu) {
      document.body.style.top = `-${window.scrollY}px`;
      document.body.classList.add("fixed-body");

      return;
    }

    const scrollY = Math.abs(parseInt(document.body?.style?.top || "0", 10));
    resetBodyStyle();
    window.scrollTo(0, scrollY);
  }, [isOpenMenu]);

  useEffect(() => {
    return () => {
      resetBodyStyle();
    };
  }, []);

  const handleClickLogo = () => {
    window.location.href = MOBY_URLS.HOME;
  };

  const handleLaunchApp = () => {
    window.open(MOBY_URLS.APP, "_blank");
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 custom-navbar shadow-md z-50">
        <div className={twJoin("max-w-7xl px-[12px]", "lg:max-w-[1512px] lg:mx-auto")}>
          <div className="flex justify-between h-[60px] items-center">
            {/* 로고/타이틀 */}
            <div className="flex-shrink-0 flex items-center cursor-pointer" onClick={handleClickLogo}>
              <img src={LogoMoby} alt="Logo" className="w-[108px]" />
            </div>

            <div className={twJoin("hidden flex-shrink-0 flex-row gap-[30px]", "lg:flex")}>
              {MENU_ITEMS.map((item) => (
                <div
                  key={item.name}
                  className="flex-shrink-0 flex flex-row justify-center items-center gap-[6px] cursor-pointer"
                  onClick={() => {
                    window.open(item.url, "_blank");
                  }}
                >
                  <img src={item.imgSrc} alt={item.name} className="w-[28px]" />
                  <p className="text-left-15-600-28 text-grayB3">{item.name}</p>
                </div>
              ))}
            </div>

            <div className="flex-shrink-0 flex flex-row gap-[10px]">
              <Button
                label="Launch App"
                width="124px"
                height="36px"
                onClick={handleLaunchApp}
                className="text-black0A"
              />
              <img
                src={IconHamburger}
                alt="Menu"
                className={twJoin("cursor-pointer w-[36px]", "lg:hidden")}
                onClick={() => setIsOpenMenu(!isOpenMenu)}
              />
            </div>
          </div>
        </div>
      </nav>

      <HamburgerMenu
        isOpenMenu={isOpenMenu}
        touchStartY={touchStartY}
        closeMenu={closeMenu}
        setTouchStartY={setTouchStartY}
      />
    </>
  );
};

export default NavBar;
