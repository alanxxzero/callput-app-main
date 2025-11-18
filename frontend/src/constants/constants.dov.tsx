import React from 'react'

import HoneySymbol from '@/assets/icon-symbol-honey.svg?react';
import UsdcSymbol from '@/assets/icon-symbol-usdc.svg?react';
import WbtcSymbol from '@/assets/icon-symbol-wbtc.svg?react';
import BeraSymbol from '@/assets/icon-symbol-bera.svg?react';
import ByusdSymbol from '@/assets/icon-symbol-byusd.svg?react';

import BerpAllocationImage from '@/assets/dov-allocation-berps.svg';
import BexAllocationImage from '@/assets/dov-allocation-bex.svg';
import BerpArchitectureImage from '@/assets/dov-architecture-berps.svg';
import BexArchitectureImage from '@/assets/dov-architecture-bex.svg';
import IronCondorStrategyImage from '@/assets/dov-strategy-iron-condor.svg';

import IconBex from '@/assets/ico-bex.svg'
import IconBerps from '@/assets/ico-berps.svg'
import IconInfrared from '@/assets/ico-infrared.svg'
import IconMoby from '@/assets/ico-moby.svg'
import IconMobyPoint from '@/assets/ico-mobypoint.svg'
import IconBeranode from '@/assets/ico-beranode.svg'
import { DOV_ASSET_INFO, DOV_TICKER_TO_DECIMAL } from '@/utils/assets';
import { Ticker } from '@/enums/enums.appSlice';
import { getContractAddress } from '@/utils/contract';
import { network$ } from '@/streams/store';
import { extendTokenIngredients } from '@/utils/dov';
import { twJoin } from 'tailwind-merge';

export const getStakingToken = (dovAsset: Ticker.DovAsset) => {
  return {
    ...DOV_ASSET_INFO[dovAsset],
    address: getContractAddress(dovAsset as any, network$.value),
    decimal: DOV_TICKER_TO_DECIMAL[dovAsset],
  }
}

export const getDovInfo: any = () => ({
  "WBERA-HONEY": {
    title: "WBERA-HONEY",
    contractAddress: getContractAddress('DOV_WBERA_HONEY', network$.value as "Berachain Mainnet"),
    vaultQueueAddress: getContractAddress('DOV_VAULT_QUEUE_WBERA_HONEY', network$.value as "Berachain Mainnet"),
    stakingToken: getStakingToken(Ticker.DovAsset['WBERA-HONEY LP']),
    tokenIngredients: extendTokenIngredients([
      DOV_ASSET_INFO[Ticker.DovAsset.WBERA],
      DOV_ASSET_INFO[Ticker.DovAsset.HONEY],
    ]),
    tags: ["Autofarm", "BERAHUB", "INFRARED"],
    tokenImages: [
      <BeraSymbol className="dt:w-[40px] dt:h-[40px] w-[32px] h-[32px]" />,
      <HoneySymbol className="dt:w-[40px] dt:h-[40px] w-[32px] h-[32px]" />
    ],
    assetAllocations: [
      { title: "BeraHub+Infrared", ratio: 98 },
      { title: "Moby", ratio: 2 },
    ],
    strategy: "Iron Condor",
    underlying: "BTC",
    allocationImgSrc: BexAllocationImage,
    architectureImgSrc: BexArchitectureImage,
    description: `Assets deposited in Vault are automatically compounded on BeraHub and Infrared. A small portion of the assets is allocated to execute options strategies within Moby.`,
  },
  "USDC.e-HONEY": {
    title: "USDC.e-HONEY",
    contractAddress: getContractAddress('DOV_USDC_HONEY', network$.value as "Berachain Mainnet"),
    vaultQueueAddress: getContractAddress('DOV_VAULT_QUEUE_USDC_HONEY', network$.value as "Berachain Mainnet"),
    stakingToken: getStakingToken(Ticker.DovAsset['USDC.e-HONEY LP']),
    tokenIngredients: extendTokenIngredients([
      DOV_ASSET_INFO[Ticker.DovAsset.USDC],
      DOV_ASSET_INFO[Ticker.DovAsset.HONEY],
    ]),
    tags: ["Autofarm", "BERAHUB", "INFRARED"],
    tokenImages: [
      <UsdcSymbol className="w-[40px] h-[40px]" />,
      <HoneySymbol className="w-[40px] h-[40px]" />
    ],
    assetAllocations: [
      { title: "BeraHub+Infrared", ratio: 98 },
      { title: "Moby", ratio: 2 },
    ],
    strategy: "Iron Condor",
    underlying: "BTC",
    allocationImgSrc: BexAllocationImage,
    architectureImgSrc: BexArchitectureImage,
    description: `Assets deposited in Vault are automatically compounded on BeraHub and Infrared. A small portion of the assets is allocated to execute options strategies within Moby.`,
  },
  "BYUSD-HONEY": {
    title: "BYUSD-HONEY",
    contractAddress: getContractAddress('DOV_BYUSD_HONEY', network$.value as "Berachain Mainnet"),
    vaultQueueAddress: getContractAddress('DOV_VAULT_QUEUE_BYUSD_HONEY', network$.value as "Berachain Mainnet"),
    stakingToken: getStakingToken(Ticker.DovAsset['BYUSD-HONEY LP']),
    tokenIngredients: extendTokenIngredients([
      DOV_ASSET_INFO[Ticker.DovAsset.BYUSD],
      DOV_ASSET_INFO[Ticker.DovAsset.HONEY],
    ]),
    tags: ["Autofarm", "BERAHUB", "INFRARED"],
    tokenImages: [
      <ByusdSymbol className="w-[40px] h-[40px]" />,
      <HoneySymbol className="w-[40px] h-[40px]" />
    ],
    assetAllocations: [
      { title: "BeraHub+Infrared", ratio: 98 },
      { title: "Moby", ratio: 2 },
    ],
    strategy: "Iron Condor",
    underlying: "BTC",
    allocationImgSrc: BexAllocationImage,
    architectureImgSrc: BexArchitectureImage,
    description: `Assets deposited in Vault are automatically compounded on BeraHub and Infrared. A small portion of the assets is allocated to execute options strategies within Moby.`,
  }
})

export const aprMetadata: any = {
  "BERAHUB": {
    title: "BeraHub LP Yield",
    description: "Trading fees generated on BERAHUB are automatically allocated to the LP, enhancing its value.",
    iconSrc: IconBex,
  },
  "BERPS": {
    title: "BERPS LP Yield",
    description: "Trading fees generated on BERPS are automatically allocated to the LP, enhancing its value.",
    iconSrc: IconBerps,
  },
  "INFRARED": {
    title: "Infrared Rewards",
    description: "Allocated iBGT reward is automatically converted into LP and continuously compounded for optimal returns.",
    iconSrc: IconInfrared,
  },
  "MOBY": {
    title: "Moby Options Yield",
    description: "Automated BTC-based Iron Condor strategy is optimized to generate USDC yield, with typical annual returns ranging between 10-20%.",
    iconSrc: IconMoby,
  },
  // "MOBYPOINT": {
  //   title: "Moby Points",
  //   description: "Points are distributed as rewards for providing liquidity into Moby.",
  //   iconSrc: IconMobyPoint,
  // },
  "BERANODE": {
    title: "Node Incentives",
    description: "Node incentives & bribes allocated to the pool are automatically converted into LP, enhancing its value.",
    iconSrc: IconBeranode,
  },
}

export const strategies: any = {
  "Iron Condor": {
    title: "Iron Condor",
    description: (
      <>
        <p className="text-[14px] font-semibold leading-[20px] text-gray80 max-md:max-w-full">
          Iron Condor’s strategy generates profits in low-volatility, sideways markets. <br />
          It consists of 2 option pairs: <br />
          <div
            className={twJoin(
              "flex"
            )}
          >
            <span className='mr-[4px]'>1.</span> A bought put OTM paired with a sold put closer to the money<br />
          </div>
          <div
            className={twJoin(
              "flex"
            )}
          >
            <span className='mr-[4px]'>2.</span> A bought call OTM paired with a sold call closer to the money<br />
          </div>
        </p>
        <p className="mt-[12px] text-[14px] font-semibold leading-[20px] text-gray80 max-md:max-w-full">
          Based on our mechanism, options are sold at optimal points and executed within Moby. Execution is instant, utilizing the <span className="text-whitee0 font-[600]">Synchronized Liquidity Engine (SLE) Model</span>, with orders gradually filled until the target contract is reached.
        </p>
      </>
    ),
    composition: ["Call Spreads", "Put Spreads"],
    imgSrc: IronCondorStrategyImage,
  }
}
