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

  // 1. Upgrade SettleManager
  const SettleManager = "SettleManager";
  const SettleManagerFactory = await ethers.getContractFactory(SettleManager)
  console.log("target proxy : ", SettleManager);
  console.log("start upgrading proxy : ", CONTRACT_ADDRESS.SETTLE_MANAGER)
  const settleManagerAfterUpgrades = await upgrades.upgradeProxy(CONTRACT_ADDRESS.SETTLE_MANAGER, SettleManagerFactory)
  console.log("upgrade complete : ", SettleManager)

  // 2. Upgrade OlpManager
  const OlpManager = "OlpManager";
  const OlpManagerFactory = await ethers.getContractFactory(OlpManager)
  console.log("target proxy : ", OlpManager);
  console.log("start upgrading proxy : ", CONTRACT_ADDRESS.S_OLP_MANAGER)
  const sOlpManagerAfterUpgrades = await upgrades.upgradeProxy(CONTRACT_ADDRESS.S_OLP_MANAGER, OlpManagerFactory)
  console.log("start upgrading proxy : ", CONTRACT_ADDRESS.M_OLP_MANAGER)
  const mOlpManagerAfterUpgrades = await upgrades.upgradeProxy(CONTRACT_ADDRESS.M_OLP_MANAGER, OlpManagerFactory)
  console.log("start upgrading proxy : ", CONTRACT_ADDRESS.L_OLP_MANAGER)
  const lOlpManagerAfterUpgrades = await upgrades.upgradeProxy(CONTRACT_ADDRESS.L_OLP_MANAGER, OlpManagerFactory)
  console.log("upgrade complete : ", OlpManager)

  // 3. Upgrade VaultUtils
  const VaultUtils = "VaultUtils";
  const VaultUtilsFactory = await ethers.getContractFactory(VaultUtils)
  console.log("target proxy : ", VaultUtils);
  console.log("start upgrading proxy : ", CONTRACT_ADDRESS.S_VAULT_UTILS)
  const sVaultUtilsAfterUpgrades = await upgrades.upgradeProxy(CONTRACT_ADDRESS.S_VAULT_UTILS, VaultUtilsFactory)
  console.log("start upgrading proxy : ", CONTRACT_ADDRESS.M_VAULT_UTILS)
  const mVaultUtilsAfterUpgrades = await upgrades.upgradeProxy(CONTRACT_ADDRESS.M_VAULT_UTILS, VaultUtilsFactory)
  console.log("start upgrading proxy : ", CONTRACT_ADDRESS.L_VAULT_UTILS)
  const lVaultUtilsAfterUpgrades = await upgrades.upgradeProxy(CONTRACT_ADDRESS.L_VAULT_UTILS, VaultUtilsFactory)
  console.log("upgrade complete : ", VaultUtils)

  console.log("Operation completed")
}

(async () => {
  await upgradeContracts(ethers, null)
})()