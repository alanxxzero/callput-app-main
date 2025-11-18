import React from 'react'
import { twMerge, twJoin } from 'tailwind-merge'
import { advancedFormatNumber } from "@/utils/helper"
import APY from './APY';
import AssetAllocation from './AssetAllocation'

import BTCIcon from '@/assets/icon-symbol-bitcoin.svg'
import BigNumber from 'bignumber.js';

type Props = {
  apyIngredients: any[];
  tvl: string;
  strategy: string;
  underlying: string;
  price: string;
  assetAllocations: any[];
  className?: string;
  labelClassName?: string;
}

const underylingIconMap: any = {
  "BTC": BTCIcon,
  // "ETH": ETHIcon,
}

const Item = ({ label, value, className, labelClassName, valueClassName }: any) => {
  return (
    <div
      className={twMerge(
        twJoin(
          "flex flex-col",
        ),
        className,
      )}
    >
      <p
        className={twMerge(
          twJoin(
            "text-gray80 font-[600]",
            "mb-[6px]",
            "text-[12px]",
            "dt:text-[13px]"
          ),
          labelClassName,
        )}
      >
        {label}
      </p>
      <div
        className={
          twMerge(
            twJoin(
              "font-[600] text-whitee0",
              "dt:text-[15px]",
              "text-[13px]",
            ),
            valueClassName,
          )}
      >
        {value}
      </div>
    </div>
  )
}

const VaultBody = ({ 
  tvl,
  strategy,
  underlying,
  price,
  assetAllocations,
  apyIngredients,
}: Props) => {
  return (
    <div 
      className={twJoin(
        "flex flex-col",
      )}
    >
      <div
        className={twJoin(
          "grid grid-cols-[1fr,132px] gap-x-[24px]",
          "mb-[24px]",
          "dt:gap-x-[36px]",
        )}
      >
        <Item 
          label="Total Projected Yield (APY)" 
          value={(
            <APY
              valueClassName={twJoin(
                "dt:font-graphie dt:text-[20px]" ,
                "font-plex-mono text-[17px]",
              )}
              apyIngredients={apyIngredients} 
            />
          )} 
        />
        <Item 
          label="TVL" 
          value={advancedFormatNumber(BigNumber(tvl).toNumber(), 0, "$")}
          valueClassName={twJoin(
            "text-[17px] font-[600]",
            "dt:font-graphie dt:text-[20px]",
            "font-plex-mono",
          )}
        />
      </div>
      <div
        className={twJoin(
          "grid grid-cols-[128px,1fr] gap-x-[24px]",
          "mb-[24px]",
        )}
      >
        <Item 
          label="Strategy" 
          value={strategy}
          valueClassName={twJoin(
            "dt:font-graphie",
            "font-plex-mono",
          )}
        />
        <Item 
          label="Underlying" 
          value={(
            <div
              className={twJoin(
                "flex items-center",
              )}
            >
              <img
                className={twJoin(
                  "w-[18px] h-[18px]",
                  "mr-[4px]"
                )}
                src={underylingIconMap[underlying]} 
              />
              {underlying}
            </div>
          )} 
          valueClassName={twJoin(
            "dt:font-graphie",
            "font-plex-mono",
          )}
        />
      </div>
      <div>
        <Item
          labelClassName={twJoin(
            "mb-[10px]",
          )}
          label="Asset Allocation" 
          value={<AssetAllocation assetAllocations={assetAllocations} />} 
        />
      </div>
    </div>
  )
}

export default VaultBody