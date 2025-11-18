import { twJoin } from "tailwind-merge";

import LogoMobyGrey from "@assets/logo-moby-grey.svg";
import { MOBY_DISCORD_URL, MOBY_DOCS_URL, MOBY_EMAIL_URL, MOBY_MEDIUM_URL, MOBY_TELEGRAM_URL, MOBY_TWITTER_URL } from "@/utils/urls";
import { SupportedChains } from "@/networks/constants";
import { DASHBOARD_URL } from "@/networks/configs";

interface FootBarProps {
  chain: SupportedChains
}


const FootBar: React.FC<FootBarProps> = ({chain}) => {
  return (
    <div className={twJoin(
      "flex flex-row justify-center items-center",
      "w-full h-[64px] bg-black17"
    )}>
      <div className={twJoin(
        "flex flex-row justify-between items-center",
        "w-[1328px] max-w-[1328px] h-full px-[24px]"
      )}>
        <img className="w-[27x] h-[20px] min-w-[27px] min-h-[20px]" src={LogoMobyGrey}/>
        <div className="flex flex-row justify-start items-center gap-[10px]">        
          <p
            className={twJoin(
              "cursor-pointer text-[14px] text-gray98 font-semibold",
              "hover:text-primaryc1 active:text-opacity-50 active:scale-95"
            )}
            onClick={() => window.open(DASHBOARD_URL[chain], "_blank")}
          >Dashboard</p>
          <div className="w-[2px] h-[2px] bg-gray98 rounded-full" />
          <p
            className={twJoin(
              "cursor-pointer text-[14px] text-gray98 font-semibold",
              "hover:text-primaryc1 active:text-opacity-50 active:scale-95"
            )}
            onClick={() => window.open(MOBY_DOCS_URL, "_blank")}
          >Docs</p>
          <div className="w-[2px] h-[2px] bg-gray98 rounded-full" />
          <p
            className={twJoin(
              "cursor-pointer text-[14px] text-gray98 font-semibold",
              "hover:text-primaryc1 active:text-opacity-50 active:scale-95"
            )}
            onClick={() => window.open(MOBY_TWITTER_URL, "_blank")}
          >Twitter</p>
          <div className="w-[2px] h-[2px] bg-gray98 rounded-full" />
          <p
            className={twJoin(
              "cursor-pointer text-[14px] text-gray98 font-semibold",
              "hover:text-primaryc1 active:text-opacity-50 active:scale-95"
            )}
            onClick={() => window.open(MOBY_TELEGRAM_URL, "_blank")}
          >Telegram</p>
          <div className="w-[2px] h-[2px] bg-gray98 rounded-full" />
          <p
            className={twJoin(
              "cursor-pointer text-[14px] text-gray98 font-semibold",
              "hover:text-primaryc1 active:text-opacity-50 active:scale-95"
            )}
            onClick={() => window.open(MOBY_DISCORD_URL, "_blank")}
          >Discord</p>
          <div className="w-[2px] h-[2px] bg-gray98 rounded-full" />
          <p
            className={twJoin(
              "cursor-pointer text-[14px] text-gray98 font-semibold",
              "hover:text-primaryc1 active:text-opacity-50 active:scale-95"
            )}
            onClick={() => window.open(MOBY_MEDIUM_URL, "_blank")}
          >Blog</p>
          <div className="w-[2px] h-[2px] bg-gray98 rounded-full" />
          <p
            className={twJoin(
              "cursor-pointer text-[14px] text-gray98 font-semibold",
              "hover:text-primaryc1 active:text-opacity-50 active:scale-95"
            )}
            onClick={() => window.open(MOBY_EMAIL_URL, "_blank")}
          >Email</p>
          <p className="ml-[14px] text-[13px] text-gray52">© Moby. All rights reserved.</p>

        </div>
      </div>
    </div>
  );
}

export default FootBar;
