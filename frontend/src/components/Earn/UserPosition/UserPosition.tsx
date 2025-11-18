import React, { useEffect, useState } from "react";
import { twJoin } from "tailwind-merge";

import DepositWithdraw from "./DepositWithdraw";
import BalanceGrid from "./BalanceGrid";
import { useDovStakedInfo } from "@/hooks/dov";
import { useObservableState } from "observable-hooks";
import { dovVaultQueueItems$ } from "@/streams/dov";
import UserVaultQueue from "./UserVaultQueue";

type Props = {
  vaultInfo: any;
}

const UserPosition: React.FC<Props> = ({ vaultInfo }) => {
  const [activeTab, setActiveTab] = useState<string>("deposit");
  const { stakingTokenBalance, collateralTokenBalance, shareBalance } = useDovStakedInfo(vaultInfo)
  const dovVaultQueueItems = useObservableState(dovVaultQueueItems$)

  const isDeposit = activeTab === "deposit"

  const items = isDeposit 
    ? dovVaultQueueItems?.deposits 
    : dovVaultQueueItems?.withdrawals

  const itemCount = items?.length
  const hasItem = items && itemCount != 0

  return (
    <section
      className={twJoin([
        "flex flex-col w-full",
        "dt:rounded-[10px] dt:border-2 dt:border-solid dt:border-[#282828]",
        "bg-black1a",
        "pb-[28px]",
      ])}
    >
      <BalanceGrid
        stakingTokenBalance={stakingTokenBalance.parsed}
        collateralTokenBalance={collateralTokenBalance.parsed}
        stakingTokenBalanceUSD={stakingTokenBalance.inUSD}
        collateralTokenBalanceUSD={collateralTokenBalance.inUSD}
      />
      {hasItem && (
        <div
          className={twJoin(
            "mt-[20px]",
            "px-[20px]",
            "dt:px-[28px] dt:my-[24px]",
          )}
        >
          <UserVaultQueue 
            vaultInfo={vaultInfo}
            isDeposit={isDeposit}
            deposits={dovVaultQueueItems?.deposits} 
            withdrawals={dovVaultQueueItems?.withdrawals} 
          />
        </div>
      )}
      <hr className={twJoin(
        "border-t border-[4px] border-[#0A0A0A] mt-[20px] mb-[20px]",
        "dt:border-black24 dt:border-[2px] dt:mb-[28px]"
      )} />

      <DepositWithdraw
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        vaultInfo={vaultInfo}
        shareBalance={shareBalance.parsed}
      />
    </section>
  );
};

export default UserPosition;
