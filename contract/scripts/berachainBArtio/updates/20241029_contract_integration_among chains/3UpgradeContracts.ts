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
  // const tx1 = await sVault.setIsPositionEnabled(false);
  // await tx1.wait();
  // const tx2 = await sVault.setIsBuySellSwapEnabled(false);
  // await tx2.wait();

  // 2. Upgrade Controller
  const Controller = "Controller";
  const ControllerFactory = await ethers.getContractFactory(Controller)
  console.log("target proxy : ", Controller);
  console.log("start upgrading proxy : ", CONTRACT_ADDRESS.CONTROLLER)
  const controllerAfterUpgrades = await upgrades.upgradeProxy(CONTRACT_ADDRESS.CONTROLLER, ControllerFactory);
  // const controllerAfterUpgrades = await upgrades.upgradeProxy(CONTRACT_ADDRESS.CONTROLLER, ControllerFactory, {
  //   unsafeSkipStorageCheck: true,
  //   txOverrides: {
  //     gasLimit: 8000000,
  //     gasPrice: 100000000000
  //   }
  // })
  console.log("upgrade complete : ", Controller)

  // 3. Upgrade OlpManager
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

  // 4. Upgrade OptionsToken
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

  // 5. Upgrade Vault
  const Vault = "Vault";
  const VaultFactory = await ethers.getContractFactory(Vault)
  console.log("target proxy : ", Vault);
  console.log("start upgrading proxy : ", CONTRACT_ADDRESS.S_VAULT)
  // const sVaultAfterUpgrades = await upgrades.upgradeProxy(CONTRACT_ADDRESS.S_VAULT, VaultFactory)
  const sVaultAfterUpgrades = await upgrades.upgradeProxy(CONTRACT_ADDRESS.S_VAULT, VaultFactory, {
    unsafeSkipStorageCheck: true,
    txOverrides: {
      gasLimit: 8000000,
      gasPrice: 100000000000
    }
  })
  console.log("start upgrading proxy : ", CONTRACT_ADDRESS.M_VAULT)
  // const mVaultAfterUpgrades = await upgrades.upgradeProxy(CONTRACT_ADDRESS.M_VAULT, VaultFactory)
  const mVaultAfterUpgrades = await upgrades.upgradeProxy(CONTRACT_ADDRESS.M_VAULT, VaultFactory, {
    unsafeSkipStorageCheck: true,
    txOverrides: {
      gasLimit: 8000000,
      gasPrice: 100000000000
    }
  })
  console.log("start upgrading proxy : ", CONTRACT_ADDRESS.L_VAULT)
  // const lVaultAfterUpgrades = await upgrades.upgradeProxy(CONTRACT_ADDRESS.L_VAULT, VaultFactory)
  const lVaultAfterUpgrades = await upgrades.upgradeProxy(CONTRACT_ADDRESS.L_VAULT, VaultFactory, {
    unsafeSkipStorageCheck: true,
    txOverrides: {
      gasLimit: 8000000,
      gasPrice: 100000000000
    }
  })
  console.log("upgrade complete : ", Vault)

  // 6. Upgrade ViewAggregator
  const ViewAggregator = "ViewAggregator";
  const ViewAggregatorFactory = await ethers.getContractFactory(ViewAggregator)
  console.log("target proxy : ", ViewAggregator);
  console.log("start upgrading proxy : ", CONTRACT_ADDRESS.VIEW_AGGREGATOR)
  const viewAggregatorAfterUpgrades = await upgrades.upgradeProxy(CONTRACT_ADDRESS.VIEW_AGGREGATOR, ViewAggregatorFactory)
  // const viewAggregatorAfterUpgrades = await upgrades.upgradeProxy(CONTRACT_ADDRESS.VIEW_AGGREGATOR, ViewAggregatorFactory, {
  //   unsafeSkipStorageCheck: true,
  //   txOverrides: {
  //     gasLimit: 8000000,
  //     gasPrice: 100000000000
  //   }
  // })
  console.log("upgrade complete : ", ViewAggregator)

  // 7. Update VaultPriceFeed
  console.log("New VaultPriceFeed address: ", CONTRACT_ADDRESS.VAULT_PRICE_FEED)
  
  const tx3 = await controllerAfterUpgrades.setVaultPriceFeed(CONTRACT_ADDRESS.VAULT_PRICE_FEED);
  await tx3.wait();
  console.log("Controller set VaultPriceFeed")

  const tx4 = await sOlpManagerAfterUpgrades.setVaultPriceFeed(CONTRACT_ADDRESS.VAULT_PRICE_FEED);
  await tx4.wait();
  console.log("sOlpManager set VaultPriceFeed")

  const tx5 = await mOlpManagerAfterUpgrades.setVaultPriceFeed(CONTRACT_ADDRESS.VAULT_PRICE_FEED);
  await tx5.wait();
  console.log("mOlpManager set VaultPriceFeed")

  const tx6 = await lOlpManagerAfterUpgrades.setVaultPriceFeed(CONTRACT_ADDRESS.VAULT_PRICE_FEED);
  await tx6.wait();
  console.log("lOlpManager set VaultPriceFeed")

  const tx7 = await sVaultAfterUpgrades.setContracts(
    CONTRACT_ADDRESS.S_VAULT_UTILS,
    CONTRACT_ADDRESS.OPTIONS_MARKET,
    CONTRACT_ADDRESS.SETTLE_MANAGER,
    CONTRACT_ADDRESS.CONTROLLER,
    CONTRACT_ADDRESS.VAULT_PRICE_FEED,
    CONTRACT_ADDRESS.S_USDG
  );
  await tx7.wait();
  console.log("sVault set contracts")

  const tx8 = await mVaultAfterUpgrades.setContracts(
    CONTRACT_ADDRESS.M_VAULT_UTILS,
    CONTRACT_ADDRESS.OPTIONS_MARKET,
    CONTRACT_ADDRESS.SETTLE_MANAGER,
    CONTRACT_ADDRESS.CONTROLLER,
    CONTRACT_ADDRESS.VAULT_PRICE_FEED,
    CONTRACT_ADDRESS.M_USDG
  );
  await tx8.wait();
  console.log("mVault set contracts")

  const tx9 = await lVaultAfterUpgrades.setContracts(
    CONTRACT_ADDRESS.L_VAULT_UTILS,
    CONTRACT_ADDRESS.OPTIONS_MARKET,
    CONTRACT_ADDRESS.SETTLE_MANAGER,
    CONTRACT_ADDRESS.CONTROLLER,
    CONTRACT_ADDRESS.VAULT_PRICE_FEED,
    CONTRACT_ADDRESS.L_USDG
  );
  await tx9.wait();
  console.log("lVault set contracts")

  const tx10 = await viewAggregatorAfterUpgrades.setVaultPriceFeed(CONTRACT_ADDRESS.VAULT_PRICE_FEED);
  await tx10.wait();
  console.log("ViewAggregator set VaultPriceFeed")

  // 8. Resume Trade and Deposit/Withdraw
  const tx11 = await sVault.setIsPositionEnabled(true);
  await tx11.wait();
  const tx12 = await sVault.setIsBuySellSwapEnabled(true);
  await tx12.wait();

  console.log("Upgrade completed")
}

(async () => {
  await upgradeContracts(ethers, null)
})()