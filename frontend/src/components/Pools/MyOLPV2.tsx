import React, { useContext, useEffect, useState } from 'react'
import { twJoin } from 'tailwind-merge'
import BigNumber from 'bignumber.js'

import Button from '../Common/Button'
import OlpInfo from './OLPInfo'
import { useMyOLPData } from '@/hooks/olp'
import { advancedFormatNumber } from '@/utils/helper'

import EthRewardIcon from '@/assets/eth-reward.svg'
import QuestionMark from '@/assets/questionmark.svg'
import { ModalContext } from '../Common/ModalContext'

type Props = {
  olpKey: string
}

const StatusItem = ({ title, value, inUSD }: any) => {
  return (
    <div
      className={twJoin(
        "flex flex-col"
      )}
    >
      <div
        className={twJoin(
          "text-[14px] font-[600] leading-[18px] text-greene6 mb-[10px]"
        )}
      >
        {title}
      </div>
      <div
        className={twJoin(
          "text-[16px] font-[600] leading-[18px] text-whitee6 mb-[4px]"
        )}
      >
        {value}
      </div>
      <div
        className={twJoin(
          "text-[13px] font-[600] text-gray80 leading-[18px]"
        )}
      >
        {inUSD}
      </div>
    </div>
  )
}

const MyOLPV2: React.FC<Props> = ({ olpKey }) => {

  const { openModal, closeModal } = useContext(ModalContext)

  const {
    stakedOlp,
    stakedOlpUsd,
    claimable,
    claimableUsd,
    isButtonLoading,
    handleRewards,
  } = useMyOLPData({ olpKey })

  const isButtonDisabled = BigNumber(claimable).lt(0.0001) && claimableUsd < 0.01;

  return (
    <div 
      className={twJoin(
        "flex flex-col",
        "p-[28px]",
        "border-b-[2px] border-solid border-[#282828]"
      )}
    >
      <div
        className={twJoin(
          "flex items-center",
          "text-[20px] font-[600] text-greene6 mb-[24px] leading-[20px]",
        )}
      >
        <span>My Options LP</span>
      </div>
      <div
        className="grid grid-cols-[1fr,1fr] gap-[36px]"
      >
        <StatusItem 
          title="Staked" 
          value={advancedFormatNumber(Number(stakedOlp), 4, "", true)} 
          inUSD={advancedFormatNumber(stakedOlpUsd, 2, "$", true)} 
        />
        <StatusItem 
          title="Rewards" 
          value={(
            <div
              className={twJoin(
                "flex items-center"
              )}
            >
              <img className='mr-[4px]' src={EthRewardIcon} />
              {advancedFormatNumber(Number(claimable), 4, "", true)}
            </div>
          )} 
          inUSD={advancedFormatNumber(claimableUsd, 2, "$", true)} 
        />
      </div>
      <Button
        className="w-full h-[48px] mt-[24px]"
        name="Claim"
        color="greenc1"
        disabled={isButtonDisabled}
        isLoading={isButtonLoading}
        onClick={async () => {
          await handleRewards()
        }}
    />
    </div>
  )
}

export default MyOLPV2