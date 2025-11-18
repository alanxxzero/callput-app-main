import { delQueueItem, dovVaultQueueItems$, getVaultQueueEventLogs, updateBalance$ } from '@/streams/dov'
import { DOV_TICKER_TO_DECIMAL } from '@/utils/assets'
import { cancelQueueItem } from '@/utils/contract.dov'
import { advancedFormatNumber } from '@/utils/helper'
import BigNumber from 'bignumber.js'
import React, { useState } from 'react'
import { twJoin } from 'tailwind-merge'

import DropdownUpIcon from '@assets/icon-dropdown-up-gray.svg'
import DropdownDownIcon from '@assets/icon-dropdown-down-gray.svg'

type Props = {
  isDeposit: boolean
  vaultInfo: any
  deposits: any
  withdrawals: any
}

const UserVaultQueue: React.FC<Props> = ({ isDeposit, vaultInfo, deposits, withdrawals }) => {
  const [isOpen, setOpen] = useState(false)

  const stakingTokenDecimal = vaultInfo?.stakingToken?.decimal

  const items = isDeposit 
    ? deposits 
    : withdrawals

  const itemCount = items?.length

  return (
    <div 
      className={twJoin("")}
    >
      <div
        className={twJoin(
          "flex justify-between items-center",
          "h-[34px]",
          "px-[12px] py-[8px]",
          "bg-black29",
          "rounded-[6px]",
          isOpen && "rounded-b-none",
          "cursor-pointer",
        )}
        onClick={() => setOpen(!isOpen)}
      >
        <div
          className={twJoin(
            "flex items-center",
          )}
        >
          <span
            className={twJoin(
              "flex",
              "w-[20px] h-[18px]",
              "text-[12px] font-[700] text-[#F5F5F5]",
              "px-[6px]",
              "rounded-[10px] bg-[#FF3333]",
              "mr-[10px]",
            )}
          >
            {itemCount}
          </span>
          <span
            className={twJoin(
              "text-[13px] font-[600] leading-[18px] text-[#F7931A]",
            )}
          >
            Queued {isDeposit ? "Deposit" : "Withdrawal"}
          </span>
        </div>
        {isOpen 
          ? <img className="w-[18px] h-[18px]" src={DropdownUpIcon} />
          : <img className="w-[18px] h-[18px]" src={DropdownDownIcon} />
        }
      </div>

      {isOpen && (
        <div
          className={twJoin(
            "py-[12px] px-[12px]",
            "bg-black29",
            "rounded-b-[6px]",
          )}
        >
          <div
            className={twJoin(
              "grid justify-between",
              isDeposit 
                ? "grid-cols-[56px,1fr]" 
                : "grid-cols-[56px,175px,61px]",
              "border-b border-gray52 pb-[4px]",
              "text-[13px] font-[600] leading-[22px] text-gray80",
            )}
          >
            <span className="pl-[4px]">No.</span>
            <span 
              className={twJoin("text-right")}
            >
              {isDeposit ? "LP Amount" : "Share Amount"}
            </span>
          </div>
          {items?.map((item: any, idx: number) => {
              // staking token decimal == share decimal
              const parsedAmount = advancedFormatNumber(new BigNumber(item.amount).div(10 ** stakingTokenDecimal).toNumber(), 4, "", true)

              return (
                <div 
                  key={item.id}
                  className={twJoin(
                    "grid justify-between",
                    isDeposit 
                      ? "grid-cols-[1fr,1fr]"
                      : "grid-cols-[1fr,1fr,61px]",
                    "pt-[4px]",
                    "gap-[18px]",
                    "text-[13px] font-[600] leading-[22px] text-[#B3B3B3]",
                    "h-[22px] mb-[2px]",
                  )}
                >
                  <span className="pl-[4px]">{idx + 1}</span>
                  <span className={twJoin("text-right")}>{parsedAmount}</span>
                  {!isDeposit && (
                    <div
                      className={twJoin(
                        "flex items-center",
                        "text-right",
                        "h-[22px]",
                        "bg-[#333333] text-[#FF3333]",
                        "px-[12px] py-[4px]",
                        "rounded-[12px]",
                        "cursor-pointer",
                        "hover:bg-black29 active:opacity-80 active:scale-95",
                      )}
                      onClick={async () => {
                        const receipt = await cancelQueueItem(vaultInfo?.vaultQueueAddress, item.index)
                        const queueItem = getVaultQueueEventLogs(receipt)
                        delQueueItem(queueItem, isDeposit)

                        updateBalance$.next(true)
                      }}
                    >
                      Cancel
                    </div>
                  )}
                </div>
              )
            })}

            {isDeposit && (
              <div
                className={twJoin(
                  "text-[12px] font-[600] leading-[16px] text-gray80",
                  "px-[20px] pt-[8px]",
                  "mt-[12px]",
                  "border-t border-gray52",
                )}
              >
                <p
                  className={twJoin(
                    "list-item",
                  )}
                >
                  Upon deposit completion in the next epoch, LP and collateral will be reflected in My Position
                </p>
              </div>
            )}

            {!isDeposit && (
                <div
                className={twJoin(
                  "text-[12px] font-[600] leading-[16px] text-gray80",
                  "px-[20px] pt-[8px]",
                  "mt-[12px]",
                  "border-t border-gray52",
                )}
              >
                <p
                  className={twJoin(
                    "list-item",
                  )}
                >
                  Cancellations can be made at any time.
                </p>
                <p
                  className={twJoin(
                    "list-item",
                  )}
                >
                  The final withdrawal amount is subject to change based on option settlement results.
                </p>
              </div>
            )}
        </div>
      )}
    </div>
  )
}

export default UserVaultQueue