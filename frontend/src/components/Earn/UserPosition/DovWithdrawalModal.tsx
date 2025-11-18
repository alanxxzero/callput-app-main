import Button from '@/components/Common/Button'
import { addQueueItem, getVaultQueueEventLogs, updateBalance$ } from '@/streams/dov'
import { withdrawDOV } from '@/utils/contract.dov'
import BigNumber from 'bignumber.js'
import React from 'react'
import { twJoin } from 'tailwind-merge'

type Props = {
  address: `0x${string}`
  vaultInfo: any
  setLoading: (loading: boolean) => void
  closeModal: () => void
  amount: string
  setAmount: (amount: string) => void
  successMessage: any
}

const DovWithdrawalModal: React.FC<Props> = ({
  address,
  vaultInfo,
  setLoading,
  closeModal,
  amount,
  setAmount,
  successMessage,
}) => {
  return (
    <div
      className={twJoin(
        "p-[24px]",
        "border-[#333333]",
        "rounded-[6px]",
        "dt:w-[540px] dt:bg-black1f dt:border",
      )}
    >
      <p
        className={twJoin(
          "text-[18px] text-greene6 font-[700]",
          "mb-[18px]",
        )}
      >
        Withdrawal
      </p>
      <p
        className={twJoin(
          "text-[14px] text-[#B3B3B3] font-[600]",
          "mb-[8px]"
        )}
      >
        When a withdrawal is initiated during an active epoch, it enters the queue and will be automatically processed at the next available Standard withdrawal time.
      </p>
      <p
        className={twJoin(
          "text-[14px] text-[#B3B3B3] font-[600]",
          "mb-[8px]"
        )}
      >
        If the user has not reached the withdrawable epoch, the withdrawal will be executed at the earliest eligible epoch based on the last deposit timestamp.
      </p>

      <div
        className={twJoin(
          "flex flex-col-reverse",
          "mt-[36px]",
          "dt:flex-row dt:justify-between"
        )}
      >
        <Button 
          name="Close" 
          color="transparent"
          className="h-[48px]" 
          onClick={() => closeModal()} 
        />
        <Button 
          name="Withdraw" 
          color="red" 
          className="h-[48px] bg-[#F33]"
          onClick={async() => {
            setLoading(true)

            const receipt = await withdrawDOV(
              vaultInfo.contractAddress, 
              new BigNumber(amount).multipliedBy(10 ** vaultInfo.stakingToken.decimal).toString(),
              false,
              address as `0x${string}`,
              successMessage
            )
  
            const queueItem = getVaultQueueEventLogs(receipt)
            addQueueItem(queueItem, false)
  
            updateBalance$.next(true)
            setLoading(false)
            setAmount("")

            closeModal()
          }} 
        />
      </div>
    </div>
  )
}

export default DovWithdrawalModal