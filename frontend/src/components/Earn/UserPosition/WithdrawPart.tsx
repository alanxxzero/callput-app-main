import React, { useContext, useEffect, useState } from "react";
import { twJoin } from "tailwind-merge";
import AmountInput from '../../Common/AmountInput';
import Tab from "@/components/Common/Tab";
import Button from "@/components/Common/Button";
import { withdrawDOV } from "@/utils/contract.dov";
import { addQueueItem, getVaultQueueEventLogs, updateBalance$ } from "@/streams/dov";


import { DOV_ASSET_INFO } from "@/utils/assets";
import BigNumber from "bignumber.js";
import StandardWithdrawTitle from "./StandardWithdrawTitle";
import ImmediateWithdrawTitle from "./ImmediateWithdrawTitle";
import { useDOVWithdrawFormInfo } from "@/hooks/dov";
import { Ticker } from "@/enums/enums.appSlice";
import { advancedFormatNumber } from "@/utils/helper";
import { useAccount } from "wagmi";
import { ModalContext } from "@/components/Common/ModalContext";
import DovWithdrawalModal from "./DovWithdrawalModal";

type Props = {
  vaultInfo: any;
  selectedAssetAddress: string;
  shareBalance: string;
  setAmount: (...args: any[]) => void;
  amount: string;
  selectAsset: (...args: any[]) => void;
  selectedAsset: any;
}

const WithdrawPart = ({ 
  vaultInfo,
  shareBalance,
  setAmount,
  amount,
  selectAsset,
  selectedAsset,
}: Props) => {

  const { openModal, closeModal } = useContext(ModalContext);

  const { address } = useAccount()
  const [withdrawType, setWithdrawType] = useState<"standard" | "immediate">("standard")
  const [isLoading, setLoading] = useState(false)

  const { isInTrading, withdrawableAmount, isWithdrawableEpoch } = useDOVWithdrawFormInfo(vaultInfo, selectedAsset, shareBalance, amount)

  const isAmountExceed = new BigNumber(shareBalance).lt(amount)

  const disabled = !amount || 
    isAmountExceed
    || isLoading
    // standard withdraw is only available when not trading and withdrawable epoch, 
    // if not, it goes to vault queue
    || (withdrawType == "standard" && !isInTrading && !isWithdrawableEpoch) 
    || (withdrawType == "immediate" && !isInTrading) // immediate withdraw is only available when in trading
    || (withdrawType == "immediate" && !isWithdrawableEpoch) // immediate withdraw is only available when in withdrawable epoch

  const withdrawTabs = [
    {
      key: "standard",
      title: <StandardWithdrawTitle />,
      isActive: withdrawType === "standard",
      activeClassName: "text-whitee6",
      onClick: () => {
        selectAsset(DOV_ASSET_INFO.SHARE.symbol)
        setWithdrawType("standard")
      }
    },
    {
      key: "immediate",
      title: <ImmediateWithdrawTitle />,
      isActive: withdrawType === "immediate",
      activeClassName: "text-whitee6",
      onClick: () => {
        selectAsset(DOV_ASSET_INFO.SHARE.symbol)
        setWithdrawType("immediate")
      }
    },
  ]

  const successMessage = isInTrading 
    ? {
        title: "Withdraw Successful",
        message: "Withdrawn Share will be processed during the withdrawable epoch.",
        duration: 1000 * 6,
      }
    : {
        title: "Withdraw Successful",
        message: "",
        duration: 1000 * 3,
      }

  return (
    <>
      <Tab
        className={twJoin(
          "",
        )}
        tabs={withdrawTabs}
      />

      <div
        className={twJoin(
          "mb-[24px]",
        )}
      >
        <AmountInput
          className={twJoin(
            "mb-[18px]",
          )}
          balance={shareBalance}
          amount={amount}
          setAmount={setAmount}
          selectedAsset={selectedAsset}
          selectAsset={selectAsset}
        />
      </div>

      <div
        className={twJoin([
          "flex flex-col",
          "mx-[20px] mb-[20px]",
          "text-[14px] leading-none",
        ])}
      >
        <div
          className={twJoin(
            "flex items-center justify-between",
            "h-[18px] mb-[6px]",
          )}
        >
          <div
            className={twJoin(
              "text-gray80 text-[13px] font-[600]",
              "dt:text-[14px]"
            )}
          >Returning LP Tokens</div>
          <div
            className={twJoin(
              "flex items-center text-whitee0 mb-[4px] font-plex-mono",
              "text-[13px] dt:text-[14px]",
            )}
          >
            {advancedFormatNumber(Number(withdrawableAmount.stakingToken), 6, "", true)}
            {DOV_ASSET_INFO[vaultInfo.stakingToken.symbol]?.src 
              ? <img src={DOV_ASSET_INFO[vaultInfo.stakingToken.symbol]?.src} alt="" className="w-[20px] h-[20px] ml-[8px]" />
              : DOV_ASSET_INFO[vaultInfo.stakingToken.symbol]?.srcList?.map((src, idx) => {
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
          </div>

        </div>

        {withdrawType == "standard" && (
          <div
            className={twJoin(
              "flex justify-between items-center",
            )}
          >
            <span
              className={twJoin(
                "text-gray80 text-[13px] font-[600]",
                "dt:text-[14px]"
              )}
            >Returning Collateral</span>
            <div
              className={twJoin(
                "flex items-center text-whitee0 mb-[4px] font-plex-mono",
                "text-[13px] dt:text-[14px]",
              )}
            >
              {advancedFormatNumber(Number(withdrawableAmount.collateralToken), 6, "", true)}
              <img src={DOV_ASSET_INFO[Ticker.DovAsset.USDC]?.src} alt="" className="w-[20px] h-[20px] ml-[8px]" />
            </div>
          </div>
        )}
      </div>
      
      <Button
        color="red"
        className={twJoin([
          "w-full h-[48px]",
          "text-[16px] font-bold text-center",
          "rounded",
        ])}
        disabled={disabled}
        name={"Withdraw"}
        onClick={async () => {

          if (withdrawType == "immediate") {
            await withdrawDOV(
              vaultInfo.contractAddress, 
              new BigNumber(amount).multipliedBy(10 ** vaultInfo.stakingToken.decimal).toString(), 
              true,
              address as `0x${string}`
            )

            updateBalance$.next(true)
            setLoading(false)
            setAmount("")
            return
          }

          // standard withdrawable time
          if (!isInTrading) {
            await withdrawDOV(
              vaultInfo.contractAddress, 
              new BigNumber(amount).multipliedBy(10 ** vaultInfo.stakingToken.decimal).toString(), 
              false,
              address as `0x${string}`
            )

            updateBalance$.next(true)
            setLoading(false)
            setAmount("")
            return
          }

          // withdraw to vault queue
          openModal(
            <DovWithdrawalModal
              address={address as `0x${string}`}
              vaultInfo={vaultInfo}
              setLoading={setLoading}
              closeModal={closeModal}
              amount={amount}
              setAmount={setAmount}
              successMessage={successMessage}
            />,
            {
              modalClassName: [
                "backdrop-blur-none",
                "bg-[#121212] bg-opacity-80",
              ]
            }
          )
        }}
      />

      <p
        className={twJoin(
          "text-[12px] text-[#666666] font-[600] leading-[15px]",
          "mt-[24px]"
        )}
      >
        Users can initiate withdrawals after 2 epochs have passed since the last deposit. This ensures options premium earnings are distributed fairly among participants.
      </p>
    </>
  )
}

export default WithdrawPart
