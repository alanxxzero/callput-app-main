import { CONTRACT_ADDRESSES } from '@/networks/addresses'
import { BLOCK_EXPLORER } from '@/networks/apis'
import { VAULT_CREATED_AT } from '@/networks/configs'
import { NetworkState } from '@/networks/types'
import { useAppSelector } from '@/store/hooks'
import React from 'react'
import { twJoin, twMerge } from 'tailwind-merge'

type Props = {

}

const AttributeItem = ({ title, value, valueClassName, onClick }: any) => {
  return (
    <>
      <span 
        className={twJoin(
          "text-[13px] text-gray80 font-[600] leading-[20px]"
        )}
      >
        {title}
      </span>
      <span
        style={{
          textDecorationSkipInk: 'none',
        }}
        className={twMerge(
          twJoin(
            "text-[15px] text-gray80 font-[600] leading-[20px]",
            "text-right",
          ),
          valueClassName,
        )}
        onClick={onClick}
      >
        {value}
      </span>
    </>
  )
}

const PoolAttributes: React.FC<Props> = () => {
  const { chain } = useAppSelector(state => state.network) as NetworkState;

  const contractAddress = CONTRACT_ADDRESSES[chain].S_VAULT
  const vaultCreatedAt = VAULT_CREATED_AT[chain][contractAddress];

  return (
    <div 
      className={twJoin(
        "bg-black1a",
        "pt-[32px] px-[28px] pb-[40px]",
        "rounded-br-[10px]",
      )}
    >
      <p
        className={twJoin(
          "text-[20px] font-[600] text-grayb3 leading-[24px]",
          "mb-[28px]",
        )}
      >
        Pool Attributes
      </p>
      <div
        className={twJoin(
          "grid grid-cols-[1fr,1fr] justify-between gap-y-[8px]",
        )}
      >
        <AttributeItem title="Type" value="Weighted" />
        <AttributeItem 
          title="Contract Address" 
          value={contractAddress.slice(0, 6) + '...' + contractAddress.slice(-4)}
          onClick={() => {
            window.open(BLOCK_EXPLORER[chain] + '/address/' + contractAddress, "_blank")
          }}
          valueClassName="cursor-pointer underline"
        />
        <AttributeItem title="Creation Date" value={vaultCreatedAt} />
        <AttributeItem 
          title="Audited and Secured by" 
          value="Hacken, Omniscia, Pessimistic, Peckshield"
          onClick={() => {
            window.open("https://docs.moby.trade/how-its-driven/building-the-safest-defi-protocol/smart-contract-audit-and-real-time-security-monitoring", "_blank")
          }}
          valueClassName="cursor-pointer underline"
        />
      </div>
    </div>
  )
}

export default PoolAttributes