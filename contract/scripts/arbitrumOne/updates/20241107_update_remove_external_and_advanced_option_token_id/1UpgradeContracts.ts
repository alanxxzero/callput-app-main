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

  // 3. Upgrade Controller
  const Controller = "Controller";
  const ControllerFactory = await ethers.getContractFactory(Controller)
  console.log("target proxy : ", Controller);
  console.log("start upgrading proxy : ", CONTRACT_ADDRESS.CONTROLLER)
  const controllerAfterUpgrades = await upgrades.upgradeProxy(CONTRACT_ADDRESS.CONTROLLER, ControllerFactory); 
  console.log("upgrade complete : ", Controller)

  // 4. Upgrade Vault
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

  // 5. Upgrade VaultUtils
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

  // 6. Upgrade OptionsMarket
  const OptionsMarket = "OptionsMarket";
  const OptionsMarketFactory = await ethers.getContractFactory(OptionsMarket)
  console.log("target proxy : ", OptionsMarket);
  console.log("start upgrading proxy : ", CONTRACT_ADDRESS.OPTIONS_MARKET)
  const optionsMarketAfterUpgrades = await upgrades.upgradeProxy(CONTRACT_ADDRESS.OPTIONS_MARKET, OptionsMarketFactory)
  console.log("upgrade complete : ", OptionsMarket)

  // 7. Upgrade SettleManager (as Utils.sol changed)
  const SettleManager = "SettleManager";
  const SettleManagerFactory = await ethers.getContractFactory(SettleManager)
  console.log("target proxy : ", SettleManager);
  console.log("start upgrading proxy : ", CONTRACT_ADDRESS.SETTLE_MANAGER)
  const settleManagerAfterUpgrades = await upgrades.upgradeProxy(CONTRACT_ADDRESS.SETTLE_MANAGER, SettleManagerFactory)
  console.log("upgrade complete : ", SettleManager)

  // 8. Upgrade OptionsToken (as Utils.sol changed)
  const OptionsToken = "OptionsToken";
  const OptionsTokenFactory = await ethers.getContractFactory(OptionsToken)
  console.log("target proxy : ", "Btc", OptionsToken)
  console.log("start upgrading proxy : ", CONTRACT_ADDRESS.BTC_OPTIONS_TOKEN)
  const btcOptionsTokenAfterUpgrades = await upgrades.upgradeProxy(CONTRACT_ADDRESS.BTC_OPTIONS_TOKEN, OptionsTokenFactory)
  console.log("upgrade complete : ", "Btc", OptionsToken)
  console.log("target proxy : ", "Eth", OptionsToken)
  console.log("start upgrading proxy : ", CONTRACT_ADDRESS.ETH_OPTIONS_TOKEN)
  const ethOptionsTokenAfterUpgrades = await upgrades.upgradeProxy(CONTRACT_ADDRESS.ETH_OPTIONS_TOKEN, OptionsTokenFactory)
  console.log("upgrade complete : ", "Eth", OptionsToken)

  // 9. Upgrade ViewAggregator (as Utils.sol changed)
  const ViewAggregator = "ViewAggregator";
  const ViewAggregatorFactory = await ethers.getContractFactory(ViewAggregator)
  console.log("target proxy : ", ViewAggregator);
  console.log("start upgrading proxy : ", CONTRACT_ADDRESS.VIEW_AGGREGATOR)
  const viewAggregatorAfterUpgrades = await upgrades.upgradeProxy(CONTRACT_ADDRESS.VIEW_AGGREGATOR, ViewAggregatorFactory)
  console.log("upgrade complete : ", ViewAggregator)

  console.log("Operation completed")
}

(async () => {
  await upgradeContracts(ethers, null)
})()