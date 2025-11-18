import React from 'react'
import { twMerge, twJoin } from 'tailwind-merge'
import Button from '../Common/Button'
import VaultHeader from './VaultHeader'
import VaultBody from './VaultBody'

import { getDovInfo } from '@/constants/constants.dov';

type Props = {
  title: string;
  images: React.ReactNode[];
  tags: string[];
  apyIngredients: any[];
  tvl: string;
  strategy: string;
  underlying: string;
  price: string;
  assetAllocations: any[];
  selectVault: any;
  hasStaking: boolean;
}

const Vault = ({ 
  title, 
  tags, 
  images,
  apyIngredients,
  tvl,
  strategy,
  underlying,
  price,
  assetAllocations,
  selectVault,
  hasStaking,
}: Props) => {
  return (
    <div
      className={twJoin(
        "flex flex-col",
        "h-[430px]",
        "p-[20px]",
        "bg-black1a",
        "rounded-[10px]",
        "dt:p-[28px]"
      )}
    >
      <VaultHeader 
        hasStaking={hasStaking}
        title={title} 
        tags={tags}
        images={images}
      />
      <VaultBody
        apyIngredients={apyIngredients}
        tvl={tvl}
        strategy={strategy}
        underlying={underlying}
        price={price}
        assetAllocations={assetAllocations}
      />
      <Button 
        name="View Details"
        color="orangef793"
        className={twJoin(
          "mt-auto",
          "h-[40px]",
        )}
        onClick={() => selectVault(getDovInfo()[title].contractAddress)}
      >
      </Button>
    </div>
  )
}

export default Vault