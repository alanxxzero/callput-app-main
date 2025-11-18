
import BigNumber from 'bignumber.js';
import { ethers, upgrades } from "hardhat";
import { formatEther } from "ethers";
import { writeFileSync } from 'fs'

import { init } from "./init.config";

import { deployAssetTokens } from "./deploy.assetTokens";
import { deployOptionsAuthority } from "./deploy.optionsAuthority";
import { deployVaultPriceFeed } from "./deploy.vaultPriceFeed";
import { deployOptionsMarket } from "./deploy.optionsMarket";
import { deployOptionsToken } from "./deploy.optionsToken";
import { deployVault } from "./deploy.vault";
import { deployVaultUtils } from './deploy.vaultUtils';
import { deployUSDG } from "./deploy.usdg";
import { deployOLP } from "./deploy.olp";
import { deployOlpManager } from "./deploy.olpManager";
import { deployRewardTracker } from "./deploy.rewardTacker";
import { deployRewardDistributor } from './deploy.rewardDistributor';
import { deployRewardRouterV2 } from './deploy.rewardRouterV2';
import { deployController } from './deploy.controller';
import { deployPositionManager } from './deploy.positionManager';
import { deploySettleManager } from './deploy.settleManager';
import { deployFeeDistributor } from './deploy.feeDistributor';
import { deployFastPriceFeed } from './deploy.fastPriceFeed';
import { deployPositionValueFeed } from './deploy.positionValueFeed';
import { deploySettlePriceFeed } from './deploy.settlePriceFeed';
import { deploySpotPriceFeed } from './deploy.spotPriceFeed';
import { deployViewAggregator } from './deploy.viewAggreagtor';
import { deployReferral } from './deploy.referral';

BigNumber.config({
  EXPONENTIAL_AT: 1000,
  DECIMAL_PLACES: 80,
})

async function main() {
  const [
    DEPLOYER,
    KEEPER_OPTIONS_MARKET,
    KEEPER_POSITION_PROCESSOR,
    KEEPER_SETTLE_OPERATOR,
    KEEPER_POSITION_VALUE_FEEDER,
    KEEPER_POSITION_VALUE_FEEDER_SUB1,
    KEEPER_SPOT_PRICE_FEEDER,
    KEEPER_SPOT_PRICE_FEEDER_SUB1,
    KEEPER_FEE_DISTRIBUTOR,
    KEEPER_CLEARING_HOUSE,
    TEST_USER1, 
    TEST_USER2
  ] = await (ethers as any).getSigners()

  console.log("Deploying contracts with the account:", DEPLOYER.address);
  const deployerBalanceBefore = formatEther(await (ethers as any).provider.getBalance(DEPLOYER.address))

  const CONTRACT_ADDRESS: any = {}

  const { wbtc, weth, usdc, wbera, honey } = await deployAssetTokens(ethers, { upgrades, CONTRACT_ADDRESS })
  const { optionsAuthority } = await deployOptionsAuthority(ethers, { upgrades, CONTRACT_ADDRESS })
  const { vaultPriceFeed } =  await deployVaultPriceFeed(ethers, { upgrades, CONTRACT_ADDRESS })

  const { optionsMarket } = await deployOptionsMarket(ethers, { upgrades, CONTRACT_ADDRESS })
  
  const { sVault, mVault, lVault } = await deployVault(ethers, { upgrades, CONTRACT_ADDRESS })
  const { sVaultUtils, mVaultUtils, lVaultUtils } = await deployVaultUtils(ethers, { upgrades, CONTRACT_ADDRESS })
  const { susdg, musdg, lusdg } = await deployUSDG(ethers, { upgrades, CONTRACT_ADDRESS })
  const { solp, molp, lolp } = await deployOLP(ethers, { upgrades, CONTRACT_ADDRESS })
  const { sOlpManager, mOlpManager, lOlpManager } = await deployOlpManager(ethers, { upgrades, CONTRACT_ADDRESS })
  const { sRewardTracker, mRewardTracker, lRewardTracker } = await deployRewardTracker(ethers, { upgrades, CONTRACT_ADDRESS })
  const { sRewardDistributor, mRewardDistributor, lRewardDistributor } = await deployRewardDistributor(ethers, { upgrades, CONTRACT_ADDRESS })
  const { sRewardRouterV2, mRewardRouterV2, lRewardRouterV2 } = await deployRewardRouterV2(ethers, { upgrades, CONTRACT_ADDRESS })
  
  const { controller } = await deployController(ethers, { upgrades, CONTRACT_ADDRESS })
  const { positionManager } = await deployPositionManager(ethers, { upgrades, CONTRACT_ADDRESS })
  const { settleManager } = await deploySettleManager(ethers, { upgrades, CONTRACT_ADDRESS })
  const { feeDistributor } = await deployFeeDistributor(ethers, { upgrades, CONTRACT_ADDRESS })
  
  const { btcOptionsToken, ethOptionsToken } = await deployOptionsToken(ethers, { upgrades, CONTRACT_ADDRESS })
  
  const { fastPriceEvents, fastPriceFeed } = await deployFastPriceFeed(ethers, { upgrades, CONTRACT_ADDRESS })
  const { positionValueFeed } = await deployPositionValueFeed(ethers, { upgrades, CONTRACT_ADDRESS })
  const { settlePriceFeed } = await deploySettlePriceFeed(ethers, { upgrades, CONTRACT_ADDRESS })
  const { spotPriceFeed } = await deploySpotPriceFeed(ethers, { upgrades, CONTRACT_ADDRESS })

  const { viewAggregator } = await deployViewAggregator(ethers, { upgrades, CONTRACT_ADDRESS })
  const { referral } = await deployReferral(ethers, { upgrades, CONTRACT_ADDRESS })

  writeFileSync(`latestAddress.${process.env.HARDHAT_NETWORK}.json`, JSON.stringify(CONTRACT_ADDRESS, null, 2))
  writeFileSync(`../shared/latestAddress.${process.env.HARDHAT_NETWORK}.json`, JSON.stringify(CONTRACT_ADDRESS, null, 2))

  // init
  await init(ethers, CONTRACT_ADDRESS)

  const deployerBalanceAfter = formatEther(await (ethers as any).provider.getBalance(DEPLOYER.address))
  const diffBalance = new BigNumber(deployerBalanceBefore).minus(deployerBalanceAfter).toString()
  console.log(`${diffBalance} ETH used for running deploy script`)

  console.log('Deployment completed')
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});