import React, { useEffect, useState } from "react";
import { twJoin } from "tailwind-merge";
import AmountInput from '../../Common/AmountInput';
import WithTooltip from "@/components/Common/WithTooltip";
import DashedText from "@/components/Common/DashedText";
import Tab from "@/components/Common/Tab";
import Button from "@/components/Common/Button";
import { depositDOV, previewDeposit, zapInDOV } from "@/utils/contract.dov";
import { getContractAddress, writeApproveERC20 } from "@/utils/contract";
import { addQueueItem, dovVaultQueueItems$, getVaultQueueEventLogs, updateBalance$ } from "@/streams/dov";
import BigNumber from "bignumber.js";
import { MaxUint256 } from "ethers";
import ZapTitle from "./ZapTitle";
import { useDOVDepositFormInfo } from "@/hooks/dov";
import { useAccount } from "wagmi";
import { DOV_ASSET_INFO, DOV_TICKER_TO_DECIMAL } from "@/utils/assets";
import DovAssetDropDown from "@/components/Common/DovAssetDropDown";
import { network$ } from "@/streams/store";

type Props = {
  selectedAssetAddress: `0x${string}`;

  amount: string;
  selectedAsset: any;
  setAmount: (...args: any[]) => void;
  selectAsset: (...args: any[]) => void;

  vaultInfo: any
}

const DepositPart = ({ 
  selectedAssetAddress,
  vaultInfo,
  setAmount,
  amount,
  selectAsset,
  selectedAsset,
}: Props) => {

  const { address } = useAccount()
  const [depositType, setDepositType] = useState<"standard" | "zap">("standard")
  const [isLoading, setLoading] = useState(false)

  const depositTabs = [
    {
      key: "deposit",
      title: "Deposit",
      isActive: depositType === "standard",
      activeClassName: "text-whitee6",
      onClick: () => {
        selectAsset(vaultInfo?.stakingToken?.symbol)
        setDepositType("standard")
        setAmount("")
      }
    },
    {
      key: "zap",
      title: <ZapTitle />,
      isActive: depositType === "zap",
      activeClassName: "text-whitee6",
      onClick: () => {
        selectAsset(vaultInfo?.tokenIngredients[0].symbol)
        setDepositType("zap")
        setAmount("")
      }
    },
  ]

  const { isInTrading, canDeposit, needApprove, balance, estimatedShares } = useDOVDepositFormInfo(vaultInfo, selectedAsset, selectedAssetAddress, amount)

  const ingredientTokenList = [
    ...vaultInfo.tokenIngredients.map((item: any) => {
      return {
        ...item,
        address: getContractAddress(item.symbol, network$.value),
      }
    }),
    // DOV_ASSET_INFO["BERA"],
  ]

  const successMessage = isInTrading 
    ? {
        title: "Deposit Successful",
        message: "The deposited LP will be deployed in the vault starting from the next epoch after the current epoch concludes.",
        duration: 1000 * 6,
      }
    : {
        title: "Deposit Successful",
        message: "",
        duration: 1000 * 3,
      }

  const receiveTitle = isInTrading 
    ? "Estimated Shares"
    : "You Receive"

  return (
    <>
      <Tab tabs={depositTabs} />
      {depositType == "zap" 
        ? (
          <AmountInput
            className={twJoin(
              "mb-[16px] dt:mb-[18px]",
            )}
            balance={balance.parsed}
            amount={amount}
            setAmount={setAmount}
            selectedAsset={selectedAsset}
            selectAsset={selectAsset}
            dropdownList={ingredientTokenList}
          />
        )
        : (
          <AmountInput
            className={twJoin(
              "mb-[16px] dt:mb-[18px]",
            )}
            balance={balance.parsed}
            amount={amount}
            setAmount={setAmount}
            selectedAsset={selectedAsset}
            selectAsset={selectAsset}
          />
        )
      }
      <div
        className={twJoin([
          "flex justify-between",
          "mx-[20px] mb-[6px]",
          "text-[13px] leading-none font-[600]",
          "dt:text-[14px]"
        ])}
      >
        {depositType == "zap" 
          ? (
            <WithTooltip
              tooltipContent={(
                <div
                  className={twJoin(
                    "dt:w-[336px] w-[260px]",
                    "break-all"
                  )}
                >
                  <ul
                    className={twJoin(
                      "list-disc",
                      "pl-[10px]",
                    )}
                  >
                    <li
                      className={twJoin(
                      )}
                    >
                      The final quantity may vary due to slippage and trading conditions on the BERAHUB.
                    </li>
                    <li
                      className={twJoin(

                      )}
                    >
                      A 0.005% Moby fee applies for using the Zap In function
                    </li>
                  </ul>
                </div>
              )}
            >
              <DashedText
                className={twJoin(
                  "text-gray80",
                )}
              >
                {receiveTitle}
              </DashedText>
            </WithTooltip>
          )
          : <p className="text-gray80 mb-[4px]">{receiveTitle}</p>
        }
        <p className="text-whitee0 mb-[4px] font-plex-mono">{estimatedShares} Shares</p>
      </div>
        
      <div
        className={twJoin([
          "flex justify-between",
          "mx-[20px]",
          "text-[13px] leading-none font-[600]",
          "dt:text-[14px]"
        ])}
      >
        <WithTooltip
          tooltipContent={(
            <div
              className={twJoin(
                "dt:w-[336px] w-[250px]",
                "break-all"
              )}
            >
              A 5% management fee is applied to facilitate auto-compounding and the purchase of Infrared’s governance tokens to enhance returns. This fee is charged on the generated Infrared interest, not the principal.
            </div>
          )}
        >
          <DashedText
            className={twJoin(
              "text-gray80",
            )}
          >
            Management Fee
          </DashedText>
        </WithTooltip>
        <p className="text-gray80 font-plex-mono font-[600]">5% of interest</p>
      </div>

      <Button
        color={"green"}
        className={twJoin([
          "mt-[24px]",
          "w-full h-[48px]",
          "text-[16px] font-bold text-center",
          "rounded",
        ])}
        name={
          amount == "0"
            ? "Enter Amount to Deposit"
            : needApprove 
              ? "Approve" 
              : "Deposit"
        }
        disabled={!canDeposit || isLoading}
        onClick={async () => {

          if (depositType == "standard") {

            setLoading(true)

            if (needApprove) {
              await writeApproveERC20(vaultInfo?.stakingToken?.address, vaultInfo.contractAddress, BigInt(new BigNumber(amount).multipliedBy(10 ** vaultInfo.stakingToken.decimal).toString()))
              updateBalance$.next(true)
              setLoading(false)
              return
            }

            const receipt = await depositDOV(
              vaultInfo.contractAddress, 
              new BigNumber(amount).multipliedBy(10 ** vaultInfo.stakingToken.decimal).toString(),
              address as `0x${string}`,
              successMessage
            )

            const queueItem = getVaultQueueEventLogs(receipt)
            addQueueItem(queueItem, true)

            setAmount("")
            updateBalance$.next(true)
            setLoading(false)
          }

          if (depositType == "zap") {
            setLoading(true)

            if (needApprove) {
              await writeApproveERC20(selectedAssetAddress, vaultInfo.contractAddress, BigInt(new BigNumber(amount).multipliedBy(10 ** DOV_TICKER_TO_DECIMAL[selectedAsset]).toString()))
              updateBalance$.next(true)
              setLoading(false)
              return
            }

            const receipt = await zapInDOV(
              vaultInfo.contractAddress, 
              selectedAssetAddress, 
              new BigNumber(amount).multipliedBy(10 ** DOV_TICKER_TO_DECIMAL[selectedAsset]).toString(),
              address as `0x${string}`,
              successMessage
            )

            const queueItem = getVaultQueueEventLogs(receipt)
            addQueueItem(queueItem, true)

            setAmount("")
            updateBalance$.next(true)
            setLoading(false)
          }
        }}
      />

      <p
        className={twJoin(
          "text-[12px] text-[#666666] font-[600] leading-[15px]",
          "mt-[24px]"
        )}
      >
        Shares are allocated based on the pool balance at the time of deposit and represent a proportional claim on both the deposited LP and the underlying collateral. They are not equivalent to the LP amount.
      </p>
    </>
  )
}

export default DepositPart