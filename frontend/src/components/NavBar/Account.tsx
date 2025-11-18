import AccountInfo from "./AccountInfo";

import { twJoin } from "tailwind-merge";
import { useEffect, useRef, useState } from "react";

import { shortenAddress } from "@/utils/helper";
import { useAccount } from "wagmi";

import WalletIcon from "@assets/icon-wallet.svg";
import IconWalletArrowDown from "@assets/icon-wallet-arrow-down.svg";
import IconWalletArrowUp from "@assets/icon-wallet-arrow-up.svg";
import {useAppSelector} from "@/store/hooks.ts";

const Account: React.FC = () => {
  const { address, connector, isConnected } = useAccount();

  const accountInfoRef = useRef<HTMLDivElement>(null)

  const [isAccountInfoOpen, setIsAccountInfoOpen] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  useEffect(() => {
    const handleClick = (event: any) => {
      if (accountInfoRef.current?.contains(event.target)) {
        return;
      }
      
      setIsAccountInfoOpen(false);
      setIsCopied(false);
    }

    document.body.addEventListener("click", handleClick);

    return () => {
      document.body.removeEventListener("click", handleClick);
    }
  }, []);

  useEffect(() => {
    if (!isAccountInfoOpen) {
      setIsCopied(false);
    }
  }, [isAccountInfoOpen])

  return (
    <div className="flex flex-row items-center gap-[12px]">  
      <div ref={accountInfoRef} className="relative">
        <div
          className={twJoin(
            "cursor-pointer",
            "flex flex-row justify-between items-center gap-[8px]",
            "w-[149px] h-[36px] px-[10px] rounded-[4px] bg-black29",
            "text-[15px] font-semibold",
            "hover:bg-black33 active:bg-black1f active:opacity-50"
          )}
          onClick={() => setIsAccountInfoOpen(!isAccountInfoOpen)}
        >
          <div className="flex flex-row items-center gap-[8px]">
            <div
              className={twJoin(
                "text-whitee0"
              )}>
              {shortenAddress(address)}
            </div>

          </div>
          <img className="w-[17px] h-[17px]" src={isAccountInfoOpen ? IconWalletArrowUp : IconWalletArrowDown}/>
        </div>
        {isAccountInfoOpen && (
          <AccountInfo isCopied={isCopied} setIsCopied={setIsCopied} />
        )}
      </div>
    </div>
  )
}

export default Account;