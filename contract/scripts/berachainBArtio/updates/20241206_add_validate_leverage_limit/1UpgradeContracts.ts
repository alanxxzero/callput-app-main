import BigNumber from "bignumber.js";

import { getDeployedContracts } from "../../deployedContracts";
import { ethers, upgrades } from "hardhat";

BigNumber.config({
  EXPONENTIAL_AT: 1000,
  DECIMAL_PLACES: 80,
})

export async function upgradeContracts(ethers: any, addressMap: any) {
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
  const {
    CONTRACT_ADDRESS,
    wbtc,
    weth,
    usdc,
    optionsAuthority,
    vaultPriceFeed,
    optionsMarket,
    sVault,
    mVault,
    lVault,
    sVaultUtils,
    mVaultUtils,
    lVaultUtils,
    susdg,
    musdg,
    lusdg,
    solp,
    molp,
    lolp,
    sOlpManager,
    mOlpManager,
    lOlpManager,
    sRewardTracker,
    mRewardTracker,
    lRewardTracker,
    sRewardDistributor,
    mRewardDistributor,
    lRewardDistributor,
    sRewardRouterV2,
    mRewardRouterV2,
    lRewardRouterV2,
    controller,
    positionManager,
    feeDistributor,
    btcOptionsToken,
    ethOptionsToken,
    primaryOracle,
    fastPriceEvents,
    fastPriceFeed,
    positionValueFeed,
    settlePriceFeed,
    spotPriceFeed,
    viewAggregator,
    referral
  } = await getDeployedContracts(ethers, addressMap);
  console.log("Start with the account:", DEPLOYER.address)

  const [blockNumber, feeData] = await Promise.all([
    ethers.provider.getBlockNumber(),
    ethers.provider.getFeeData()
  ])
  console.log("Current block number:", blockNumber)
  console.log("Current fee data:", feeData)

  // 1. Stop Trade and Deposit/Withdraw
  const tx1 = await sVault.setIsPositionEnabled(false);
  await tx1.wait();
  const tx2 = await sVault.setIsBuySellSwapEnabled(false);
  await tx2.wait();
  console.log("Trade and Deposit/Withdraw stopped")

  // 2. Upgrade PositionManager
  const PositionManager = "PositionManager";
  const PositionManagerFactory = await ethers.getContractFactory(PositionManager)
  console.log("target proxy : ", PositionManager);
  console.log("start upgrading proxy : ", CONTRACT_ADDRESS.POSITION_MANAGER)
  const positionManagerAfterUpgrades = await upgrades.upgradeProxy(CONTRACT_ADDRESS.POSITION_MANAGER, PositionManagerFactory)
  console.log("upgrade complete : ", PositionManager)

  // 3. Upgrade VaultPriceFeed 
  const VaultPriceFeed = "VaultPriceFeed";
  const VaultPriceFeedFactory = await ethers.getContractFactory(VaultPriceFeed)
  console.log("target proxy : ", VaultPriceFeed);
  console.log("start upgrading proxy : ", CONTRACT_ADDRESS.VAULT_PRICE_FEED)
  const vaultPriceFeedAfterUpgrades = await upgrades.upgradeProxy(CONTRACT_ADDRESS.VAULT_PRICE_FEED, VaultPriceFeedFactory)
  console.log("upgrade complete : ", VaultPriceFeed)

  // 4. Initial Setting for VaultPriceFeed
  const tx3 = await vaultPriceFeedAfterUpgrades.setPositionManager(CONTRACT_ADDRESS.POSITION_MANAGER);
  await tx3.wait();

  const MIN_MARK_PRICES = {
    BTC: {
      INDEX: 3,
      VALUE: new BigNumber(60).multipliedBy(new BigNumber(10).pow(30)).toString()
    },
    ETH: {
      INDEX: 4,
      VALUE: new BigNumber(3).multipliedBy(new BigNumber(10).pow(30)).toString()
    }
  }

  const tx4 = await vaultPriceFeedAfterUpgrades.setMinMarkPrice(MIN_MARK_PRICES.BTC.INDEX, MIN_MARK_PRICES.BTC.VALUE)
  await tx4.wait();

  const tx5 = await vaultPriceFeedAfterUpgrades.setMinMarkPrice(MIN_MARK_PRICES.ETH.INDEX, MIN_MARK_PRICES.ETH.VALUE)
  await tx5.wait();

  // 5. Check
  const minMarkPriceForBTC = await vaultPriceFeedAfterUpgrades.minMarkPrices(3);
  const minMarkPriceForETH = await vaultPriceFeedAfterUpgrades.minMarkPrices(4);

  console.log("BTC min mark price: ", minMarkPriceForBTC);
  console.log("ETH min mark price: ", minMarkPriceForETH);

  console.log("Operation completed")
}

(async () => {
  await upgradeContracts(ethers, null)
})()