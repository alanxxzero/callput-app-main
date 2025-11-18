import React from "react";
import { twJoin } from "tailwind-merge";
import { SOCIALS } from "../../shared/constants/socials";
import { FOOTBAR_PRODUCTS } from "../../shared/constants/footbar";
import { FOOTBAR_ABOUT } from "../../shared/constants/footbar";

import LogoMoby from "../../assets/images/logo-moby.png";
import { MOBY_URLS } from "../../shared/constants/urls";

const exportSiteMap = () => {
  return (
    <div className="flex flex-row justify-center items-stretch gap-[80px]">
      <div className="flex flex-col gap-[12px]">
        <p className="h-[20px] text-13 text-gray80">Products</p>
        <div className={twJoin("flex flex-col gap-[4px]", "lg:gap-[5px]")}>
          {FOOTBAR_PRODUCTS.map((item) => (
            <p
              key={item.name}
              className={twJoin(
                "cursor-pointer h-[24px] text-left-15-600-24 text-grayD9 text-left",
                "lg:h-[20px] lg:text-[14px]"
              )}
              onClick={() => window.open(item.url, "_blank")}
            >
              {item.name}
            </p>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-[12px]">
        <p className="h-[20px] text-13 text-gray80">About</p>
        <div className={twJoin("flex flex-col gap-[4px]", "lg:gap-[5px]")}>
          {FOOTBAR_ABOUT.map((item) => (
            <p
              key={item.name}
              className={twJoin(
                "cursor-pointer h-[24px] text-left-15-600-24 text-grayD9",
                "lg:h-[20px] lg:text-[14px]"
              )}
              onClick={() => window.open(item.url, "_blank")}
            >
              {item.name}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
};

const exportSocials = () => {
  return (
    <div className="flex flex-row items-center gap-[16px]">
      {SOCIALS.map((social) => (
        <div
          key={social.name}
          className={twJoin(
            "flex items-center justify-center w-[48px] h-[48px] custom-card-social",
            "lg:w-[40px] lg:h-[40px]"
          )}
          onClick={() => window.open(social.url, "_blank")}
        >
          <img
            src={social.imgSrc}
            alt={social.name}
            className={twJoin("w-[32px] h-[32px]", "lg:w-[28px] lg:h-[28px]")}
          />
        </div>
      ))}
    </div>
  );
};

const FootBar: React.FC = () => {
  const handleClickLogo = () => {
    window.location.href = MOBY_URLS.HOME;
  };

  return (
    <footer
      className={twJoin(
        "h-fit w-full px-[12px] py-[40px] overflow-hidden",
        "lg:max-w-[1280px] lg:mx-auto lg:px-0 lg:pt-[36px] lg:pb-[72px]"
      )}
    >
      <div
        className={twJoin(
          "relative z-10 flex flex-col items-center justify-center gap-[56px]",
          "lg:flex-row lg:justify-between"
        )}
      >
        <div
          className={twJoin(
            "flex flex-row items-center justify-center w-full order-1",
            "lg:items-stretch lg:w-fit lg:h-[156px] lg:order-2"
          )}
        >
          {exportSiteMap()}
        </div>
        <div
          className={twJoin(
            "flex flex-col items-center justify-between gap-[54px] w-full order-2",
            "lg:w-fit lg:h-[156px] lg:items-start lg:gap-0 lg:order-1"
          )}
        >
          <div className="lg:flex lg:flex-col lg:gap-[24px]">
            <div
              className={twJoin("hidden cursor-pointer flex-shrink-0 items-center", "lg:flex")}
              onClick={handleClickLogo}
            >
              <img src={LogoMoby} alt="Logo" className="w-[108px]" />
            </div>
            <div className="flex-shrink-0">{exportSocials()}</div>
          </div>
          <div className="flex flex-row items-center justify-center">
            <p className="text-13">© Moby. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FootBar;
