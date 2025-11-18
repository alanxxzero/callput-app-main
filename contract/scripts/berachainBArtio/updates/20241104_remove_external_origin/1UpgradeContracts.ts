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

  // 2. Upgrade Controller
  const Controller = "Controller";
  const ControllerFactory = await ethers.getContractFactory(Controller)
  console.log("target proxy : ", Controller);
  console.log("start upgrading proxy : ", CONTRACT_ADDRESS.CONTROLLER)
  const controllerAfterUpgrades = await upgrades.upgradeProxy(CONTRACT_ADDRESS.CONTROLLER, ControllerFactory); 
  console.log("upgrade complete : ", Controller)

  // 3. Upgrade Vault
  const Vault = "Vault";
  const VaultFactory = await ethers.getContractFactory(Vault)
  console.log("target proxy : ", Vault);
  console.log("start upgrading proxy : ", CONTRACT_ADDRESS.S_VAULT)
  const sVaultAfterUpgrades = await upgrades.upgradeProxy(CONTRACT_ADDRESS.S_VAULT, VaultFactory)
  console.log("start upgrading proxy : ", CONTRACT_ADDRESS.M_VAULT)
  const mVaultAfterUpgrades = await upgrades.upgradeProxy(CONTRACT_ADDRESS.M_VAULT, VaultFactory)
  console.log("start upgrading proxy : ", CONTRACT_ADDRESS.L_VAULT)
  const lVaultAfterUpgrades = await upgrades.upgradeProxy(CONTRACT_ADDRESS.L_VAULT, VaultFactory)
  console.log("upgrade complete : ", Vault)

  // 4. Upgrade VaultUtils
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

  // 5. Upgrade ViewAggregator (as Utils.sol changed)
  const ViewAggregator = "ViewAggregator";
  const ViewAggregatorFactory = await ethers.getContractFactory(ViewAggregator)
  console.log("target proxy : ", ViewAggregator);
  console.log("start upgrading proxy : ", CONTRACT_ADDRESS.VIEW_AGGREGATOR)
  const viewAggregatorAfterUpgrades = await upgrades.upgradeProxy(CONTRACT_ADDRESS.VIEW_AGGREGATOR, ViewAggregatorFactory)
  console.log("upgrade complete : ", ViewAggregator)

  // 6. Resume Trade and Deposit/Withdraw
  const tx3 = await sVault.setIsPositionEnabled(true);
  await tx3.wait();
  const tx4 = await sVault.setIsBuySellSwapEnabled(true);
  await tx4.wait();
  console.log("Trade and Deposit/Withdraw resumed")

  console.log("Operation completed")
}

(async () => {
  await upgradeContracts(ethers, null)
})()