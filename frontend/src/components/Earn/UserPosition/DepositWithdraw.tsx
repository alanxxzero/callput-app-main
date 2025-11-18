import ToggleButton from "@/components/Common/ToggleButton";
import React, { useEffect, useState } from "react";
import { twJoin } from "tailwind-merge";
import { DOV_ASSET_INFO, DOV_TICKER_TO_DECIMAL } from "@/utils/assets";

import { getContractAddress } from "@/utils/contract";
import { network$ } from "@/streams/store";
import DepositPart from "./DepositPart";
import WithdrawPart from "./WithdrawPart";

type Props = {
  vaultInfo: any;
  shareBalance: string;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const items: any = [
  { 
    value: 'deposit', 
    label: 'Deposit', 
    textColor: 'text-green4c', 
    hoverColor: 'hover:!bg-black33 hover:!text-green4c' 
  },
  { 
    value: 'withdraw', 
    label: 'Withdraw', 
    textColor: 'text-redc7', 
    hoverColor: 'hover:!bg-black33 hover:!text-redc7',
  }
]

const DepositWithdraw: React.FC<Props> = ({ activeTab, setActiveTab, vaultInfo, shareBalance }) => {

  
  const [selectedAsset, selectAsset] = useState(vaultInfo?.stakingToken?.symbol);
  const [amount, setAmount] = useState<string>("")

  const selectedAssetAddress = getContractAddress(selectedAsset, network$.value)

  useEffect(() => {
    const defaultAsset = activeTab == "deposit" 
      ? vaultInfo?.stakingToken?.symbol
      : DOV_ASSET_INFO.SHARE.symbol

    // when tab changes, reset selected asset to default
    selectAsset(defaultAsset)
    setAmount("")

  }, [activeTab])

  const renderActiveTab = () => {
    if (activeTab == "deposit") {
      return (
        <DepositPart
          vaultInfo={vaultInfo}
          selectedAssetAddress={selectedAssetAddress}
          setAmount={setAmount}
          amount={amount}
          selectAsset={selectAsset}
          selectedAsset={selectedAsset}
        />
      )
    }

    // withdraw
    return (
      <WithdrawPart
        vaultInfo={vaultInfo}
        selectedAssetAddress={selectedAssetAddress}
        shareBalance={shareBalance}
        setAmount={setAmount}
        amount={amount}
        selectAsset={selectAsset}
        selectedAsset={selectedAsset}
      />
    )
  }

  return (
    <div className="px-[28px]">

      <ToggleButton
        className={twJoin(
          "mb-[20px]",
          "dt:mb-[24px] gap-[4px]",
        )}
        id="deposit-toggle"
        size="stretch"
        shape="square"
        items={items}
        selectedItem={activeTab}
        setSelectedItem={setActiveTab}
      />

      {renderActiveTab()}
    </div>
  );
};

export default DepositWithdraw;
