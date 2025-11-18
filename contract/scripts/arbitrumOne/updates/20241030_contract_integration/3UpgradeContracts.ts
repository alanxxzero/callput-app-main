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
  console.log("Start upgrading contracts with the account:", DEPLOYER.address)

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
  const tx3 = await mVault.setIsPositionEnabled(false);
  await tx3.wait();
  const tx4 = await mVault.setIsBuySellSwapEnabled(false);
  await tx4.wait();

  // 2. Upgrade PositionManager
  const PositionManager = "PositionManager";
  const PositionManagerFactory = await ethers.getContractFactory(PositionManager)
  console.log("target proxy : ", PositionManager);
  console.log("start upgrading proxy : ", CONTRACT_ADDRESS.POSITION_MANAGER)
  // const positionManagerAfterUpgrades = await upgrades.upgradeProxy(CONTRACT_ADDRESS.POSITION_MANAGER, PositionManagerFactory)
  const positionManagerAfterUpgrades = await upgrades.upgradeProxy(CONTRACT_ADDRESS.POSITION_MANAGER, PositionManagerFactory, {
    unsafeSkipStorageCheck: true,
    // txOverrides: {
    //   gasLimit: 2000000,
    //   gasPrice: 20000000
    // }
  })
  console.log("upgrade complete : ", PositionManager)

  // 3. Upgrade SettleManager
  const SettleManager = "SettleManager";
  const SettleManagerFactory = await ethers.getContractFactory(SettleManager)
  console.log("target proxy : ", SettleManager);
  console.log("start upgrading proxy : ", CONTRACT_ADDRESS.SETTLE_MANAGER)
  // const settleManagerAfterUpgrades = await upgrades.upgradeProxy(CONTRACT_ADDRESS.SETTLE_MANAGER, SettleManagerFactory)
  const settleManagerAfterUpgrades = await upgrades.upgradeProxy(CONTRACT_ADDRESS.SETTLE_MANAGER, SettleManagerFactory, {
    unsafeSkipStorageCheck: true
  })
  console.log("upgrade complete : ", SettleManager)
  
  // 4. Upgrade Controller
  const Controller = "Controller";
  const ControllerFactory = await ethers.getContractFactory(Controller)
  console.log("target proxy : ", Controller);
  console.log("start upgrading proxy : ", CONTRACT_ADDRESS.CONTROLLER)
  // const controllerAfterUpgrades = await upgrades.upgradeProxy(CONTRACT_ADDRESS.CONTROLLER, ControllerFactory);
  const controllerAfterUpgrades = await upgrades.upgradeProxy(CONTRACT_ADDRESS.CONTROLLER, ControllerFactory, {
    unsafeSkipStorageCheck: true
  })
  console.log("upgrade complete : ", Controller)

  // 5. Upgrade OlpManager
  const OlpManager = "OlpManager";
  const OlpManagerFactory = await ethers.getContractFactory(OlpManager)
  console.log("target proxy : ", OlpManager);
  console.log("start upgrading proxy : ", CONTRACT_ADDRESS.S_OLP_MANAGER)
  const sOlpManagerAfterUpgrades = await upgrades.upgradeProxy(CONTRACT_ADDRESS.S_OLP_MANAGER, OlpManagerFactory)
  // const sOlpManagerAfterUpgrades = await upgrades.upgradeProxy(CONTRACT_ADDRESS.S_OLP_MANAGER, OlpManagerFactory, {
  //   unsafeSkipStorageCheck: true
  // })
  console.log("start upgrading proxy : ", CONTRACT_ADDRESS.M_OLP_MANAGER)
  const mOlpManagerAfterUpgrades = await upgrades.upgradeProxy(CONTRACT_ADDRESS.M_OLP_MANAGER, OlpManagerFactory)
  // const mOlpManagerAfterUpgrades = await upgrades.upgradeProxy(CONTRACT_ADDRESS.M_OLP_MANAGER, OlpManagerFactory, {
  //   unsafeSkipStorageCheck: true
  // })
  console.log("start upgrading proxy : ", CONTRACT_ADDRESS.L_OLP_MANAGER)
  const lOlpManagerAfterUpgrades = await upgrades.upgradeProxy(CONTRACT_ADDRESS.L_OLP_MANAGER, OlpManagerFactory)
  // const lOlpManagerAfterUpgrades = await upgrades.upgradeProxy(CONTRACT_ADDRESS.L_OLP_MANAGER, OlpManagerFactory, {
  //   unsafeSkipStorageCheck: true
  // })
  console.log("upgrade complete : ", OlpManager)

  // 6. Upgrade Vault
  const Vault = "Vault";
  const VaultFactory = await ethers.getContractFactory(Vault)
  console.log("target proxy : ", Vault);
  console.log("start upgrading proxy : ", CONTRACT_ADDRESS.S_VAULT)
  const sVaultAfterUpgrades = await upgrades.upgradeProxy(CONTRACT_ADDRESS.S_VAULT, VaultFactory)
  // const sVaultAfterUpgrades = await upgrades.upgradeProxy(CONTRACT_ADDRESS.S_VAULT, VaultFactory, {
  //   unsafeSkipStorageCheck: true
  // })
  console.log("start upgrading proxy : ", CONTRACT_ADDRESS.M_VAULT)
  const mVaultAfterUpgrades = await upgrades.upgradeProxy(CONTRACT_ADDRESS.M_VAULT, VaultFactory)
  // const mVaultAfterUpgrades = await upgrades.upgradeProxy(CONTRACT_ADDRESS.M_VAULT, VaultFactory, {
  //   unsafeSkipStorageCheck: true
  // })
  console.log("start upgrading proxy : ", CONTRACT_ADDRESS.L_VAULT)
  const lVaultAfterUpgrades = await upgrades.upgradeProxy(CONTRACT_ADDRESS.L_VAULT, VaultFactory)
  // const lVaultAfterUpgrades = await upgrades.upgradeProxy(CONTRACT_ADDRESS.L_VAULT, VaultFactory, {
  //   unsafeSkipStorageCheck: true
  // })
  console.log("upgrade complete : ", Vault)

  // 7. Upgrade RewardRouterV2
  const RewardRouterV2 = "RewardRouterV2";
  const RewardRouterV2Factory = await ethers.getContractFactory(RewardRouterV2)
  console.log("target proxy : ", RewardRouterV2);
  console.log("start upgrading proxy : ", CONTRACT_ADDRESS.S_REWARD_ROUTER_V2)
  // const sRewardRouterAfterUpgrades = await upgrades.upgradeProxy(CONTRACT_ADDRESS.S_REWARD_ROUTER_V2, RewardRouterV2Factory)
  const sRewardRouterAfterUpgrades = await upgrades.upgradeProxy(CONTRACT_ADDRESS.S_REWARD_ROUTER_V2, RewardRouterV2Factory, {
    unsafeSkipStorageCheck: true
  })
  console.log("start upgrading proxy : ", CONTRACT_ADDRESS.M_REWARD_ROUTER_V2)
  // const mRewardRouterAfterUpgrades = await upgrades.upgradeProxy(CONTRACT_ADDRESS.M_REWARD_ROUTER_V2, RewardRouterV2Factory)
  const mRewardRouterAfterUpgrades = await upgrades.upgradeProxy(CONTRACT_ADDRESS.M_REWARD_ROUTER_V2, RewardRouterV2Factory, {
    unsafeSkipStorageCheck: true
  })
  console.log("start upgrading proxy : ", CONTRACT_ADDRESS.L_REWARD_ROUTER_V2)
  // const lRewardRouterAfterUpgrades = await upgrades.upgradeProxy(CONTRACT_ADDRESS.L_REWARD_ROUTER_V2, RewardRouterV2Factory)
  const lRewardRouterAfterUpgrades = await upgrades.upgradeProxy(CONTRACT_ADDRESS.L_REWARD_ROUTER_V2, RewardRouterV2Factory, {
    unsafeSkipStorageCheck: true
  })
  console.log("upgrade complete : ", RewardRouterV2)

  // 8. Upgrade RewardTracker
  const RewardTracker = "RewardTracker";
  const RewardTrackerFactory = await ethers.getContractFactory(RewardTracker)
  console.log("target proxy : ", RewardTracker);
  console.log("start upgrading proxy : ", CONTRACT_ADDRESS.S_REWARD_TRACKER)
  const sRewardTrackerAfterUpgrades = await upgrades.upgradeProxy(CONTRACT_ADDRESS.S_REWARD_TRACKER, RewardTrackerFactory)
  // const sRewardTrackerAfterUpgrades = await upgrades.upgradeProxy(CONTRACT_ADDRESS.S_REWARD_TRACKER, RewardTrackerFactory, {
  //   unsafeSkipStorageCheck: true
  // })
  console.log("start upgrading proxy : ", CONTRACT_ADDRESS.M_REWARD_TRACKER)
  const mRewardTrackerAfterUpgrades = await upgrades.upgradeProxy(CONTRACT_ADDRESS.M_REWARD_TRACKER, RewardTrackerFactory)
  // const mRewardTrackerAfterUpgrades = await upgrades.upgradeProxy(CONTRACT_ADDRESS.M_REWARD_TRACKER, RewardTrackerFactory, {
  //   unsafeSkipStorageCheck: true
  // })
  console.log("start upgrading proxy : ", CONTRACT_ADDRESS.L_REWARD_TRACKER)
  const lRewardTrackerAfterUpgrades = await upgrades.upgradeProxy(CONTRACT_ADDRESS.L_REWARD_TRACKER, RewardTrackerFactory)
  // const lRewardTrackerAfterUpgrades = await upgrades.upgradeProxy(CONTRACT_ADDRESS.L_REWARD_TRACKER, RewardTrackerFactory, {
  //   unsafeSkipStorageCheck: true
  // })
  console.log("upgrade complete : ", RewardTracker)

  // 9. Upgrade FeeDistributor
  const FeeDistributor = "FeeDistributor";
  const feeDistributorFactory = await ethers.getContractFactory(FeeDistributor)
  console.log("target proxy : ", FeeDistributor);
  console.log("start upgrading proxy : ", CONTRACT_ADDRESS.FEE_DISTRIBUTOR)
  const feeDistributorAfterUpgrades = await upgrades.upgradeProxy(CONTRACT_ADDRESS.FEE_DISTRIBUTOR, feeDistributorFactory)
  // const feeDistributorAfterUpgrades = await upgrades.upgradeProxy(CONTRACT_ADDRESS.FEE_DISTRIBUTOR, feeDistributorFactory, {
  //   unsafeSkipStorageCheck: true
  // })
  console.log("upgrade complete : ", FeeDistributor)

  // 10. Upgrade OptionsToken
  const OptionsToken = "OptionsToken";
  const OptionsTokenFactory = await ethers.getContractFactory(OptionsToken)
  console.log("target proxy : ", "Btc", OptionsToken)
  console.log("start upgrading proxy : ", CONTRACT_ADDRESS.BTC_OPTIONS_TOKEN)
  const btcOptionsTokenAfterUpgrades = await upgrades.upgradeProxy(CONTRACT_ADDRESS.BTC_OPTIONS_TOKEN, OptionsTokenFactory)
  // const btcOptionsTokenAfterUpgrades = await upgrades.upgradeProxy(CONTRACT_ADDRESS.BTC_OPTIONS_TOKEN, OptionsTokenFactory, {
  //   unsafeSkipStorageCheck: true
  // })
  console.log("upgrade complete : ", "Btc", OptionsToken)
  console.log("target proxy : ", "Eth", OptionsToken)
  console.log("start upgrading proxy : ", CONTRACT_ADDRESS.ETH_OPTIONS_TOKEN)
  const ethOptionsTokenAfterUpgrades = await upgrades.upgradeProxy(CONTRACT_ADDRESS.ETH_OPTIONS_TOKEN, OptionsTokenFactory)
  // const ethOptionsTokenAfterUpgrades = await upgrades.upgradeProxy(CONTRACT_ADDRESS.ETH_OPTIONS_TOKEN, OptionsTokenFactory, {
  //   unsafeSkipStorageCheck: true
  // })
  console.log("upgrade complete : ", "Eth", OptionsToken)

  // 11. Upgrade ViewAggregator
  const ViewAggregator = "ViewAggregator";
  const ViewAggregatorFactory = await ethers.getContractFactory(ViewAggregator)
  console.log("target proxy : ", ViewAggregator);
  console.log("start upgrading proxy : ", CONTRACT_ADDRESS.VIEW_AGGREGATOR)
  const viewAggregatorAfterUpgrades = await upgrades.upgradeProxy(CONTRACT_ADDRESS.VIEW_AGGREGATOR, ViewAggregatorFactory)
  // const viewAggregatorAfterUpgrades = await upgrades.upgradeProxy(CONTRACT_ADDRESS.VIEW_AGGREGATOR, ViewAggregatorFactory, {
  //   unsafeSkipStorageCheck: true,
  // })
  console.log("upgrade complete : ", ViewAggregator)

  // 12. Update isNATSupported 
  const tx5 = await controllerAfterUpgrades.setIsNATSupported(true);
  await tx5.wait();
  console.log("Controller sets isNATSupported")

  const tx6 = await sRewardRouterAfterUpgrades.setController(CONTRACT_ADDRESS.CONTROLLER)
  await tx6.wait()
  const tx7 = await mRewardRouterAfterUpgrades.setController(CONTRACT_ADDRESS.CONTROLLER)
  await tx7.wait()
  const tx8 = await lRewardRouterAfterUpgrades.setController(CONTRACT_ADDRESS.CONTROLLER)
  await tx8.wait()
  console.log("RewardRouters set Controller")

  // 13. Update VaultPriceFeed
  console.log("New VaultPriceFeed address: ", CONTRACT_ADDRESS.VAULT_PRICE_FEED)
  
  const tx9 = await controllerAfterUpgrades.setVaultPriceFeed(CONTRACT_ADDRESS.VAULT_PRICE_FEED);
  await tx9.wait();
  console.log("Controller set VaultPriceFeed")

  const tx10 = await sOlpManagerAfterUpgrades.setVaultPriceFeed(CONTRACT_ADDRESS.VAULT_PRICE_FEED);
  await tx10.wait();
  const tx11 = await mOlpManagerAfterUpgrades.setVaultPriceFeed(CONTRACT_ADDRESS.VAULT_PRICE_FEED);
  await tx11.wait();
  const tx12 = await lOlpManagerAfterUpgrades.setVaultPriceFeed(CONTRACT_ADDRESS.VAULT_PRICE_FEED);
  await tx12.wait();
  console.log("OlpManagers set VaultPriceFeed")

  const tx13 = await sVaultAfterUpgrades.setContracts(
    CONTRACT_ADDRESS.S_VAULT_UTILS,
    CONTRACT_ADDRESS.OPTIONS_MARKET,
    CONTRACT_ADDRESS.SETTLE_MANAGER,
    CONTRACT_ADDRESS.CONTROLLER,
    CONTRACT_ADDRESS.VAULT_PRICE_FEED,
    CONTRACT_ADDRESS.S_USDG
  );
  await tx13.wait();
  const tx14 = await mVaultAfterUpgrades.setContracts(
    CONTRACT_ADDRESS.M_VAULT_UTILS,
    CONTRACT_ADDRESS.OPTIONS_MARKET,
    CONTRACT_ADDRESS.SETTLE_MANAGER,
    CONTRACT_ADDRESS.CONTROLLER,
    CONTRACT_ADDRESS.VAULT_PRICE_FEED,
    CONTRACT_ADDRESS.M_USDG
  );
  await tx14.wait();
  const tx15 = await lVaultAfterUpgrades.setContracts(
    CONTRACT_ADDRESS.L_VAULT_UTILS,
    CONTRACT_ADDRESS.OPTIONS_MARKET,
    CONTRACT_ADDRESS.SETTLE_MANAGER,
    CONTRACT_ADDRESS.CONTROLLER,
    CONTRACT_ADDRESS.VAULT_PRICE_FEED,
    CONTRACT_ADDRESS.L_USDG
  );
  await tx15.wait();
  console.log("Vaults set contracts")

  const tx16 = await viewAggregatorAfterUpgrades.setVaultPriceFeed(CONTRACT_ADDRESS.VAULT_PRICE_FEED);
  await tx16.wait();
  console.log("ViewAggregator set VaultPriceFeed")

  // 14. Resume Trade and Deposit/Withdraw
  const tx17 = await sVault.setIsPositionEnabled(true);
  await tx17.wait();
  const tx18 = await sVault.setIsBuySellSwapEnabled(true);
  await tx18.wait();
  const tx19 = await mVault.setIsPositionEnabled(true);
  await tx19.wait();
  const tx20 = await mVault.setIsBuySellSwapEnabled(true);
  await tx20.wait();

  console.log("Upgrade completed")
}

(async () => {
  await upgradeContracts(ethers, null)
})()