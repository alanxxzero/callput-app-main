import BigNumber from "bignumber.js";

import { getDeployedContracts } from "./deployedContracts";
import { ethers, upgrades } from "hardhat";
import {deploySettleManager} from "./deploy.settleManager";

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
    fastPriceEvents,
    fastPriceFeed,
    positionValueFeed,
    settlePriceFeed,
    spotPriceFeed,
    viewAggregator,
    referral
  } = await getDeployedContracts(ethers, addressMap);
  console.log("Start upgrading contracts with the account:", DEPLOYER.address)

  /*
   * Controller 업데이트
   */
  const Controller = "Controller";
  const ControllerFactory = await ethers.getContractFactory(Controller)
  console.log("target proxy : ", Controller);
  console.log("start upgrading proxy : ", CONTRACT_ADDRESS.CONTROLLER)
  const controllerAfterUpgrades = await upgrades.upgradeProxy(CONTRACT_ADDRESS.CONTROLLER, ControllerFactory)
  console.log("upgrade complete : ", Controller)

  /*
   * FastPriceEvents 업데이트
   */
  // const FastPriceEvents = "FastPriceEvents";
  // const FastPriceEventsFactory = await ethers.getContractFactory(FastPriceEvents)
  // console.log("target proxy : ", FastPriceEvents);
  // console.log("start upgrading proxy : ", CONTRACT_ADDRESS.FAST_PRICE_EVENTS)
  // const fastPriceEventsAfterUpgrades = await upgrades.upgradeProxy(CONTRACT_ADDRESS.FAST_PRICE_EVENTS, FastPriceEventsFactory)
  // console.log("upgrade complete : ", FastPriceEvents)

  /*
   * FastPriceFeed 업데이트
   */
  // const FastPriceFeed = "FastPriceFeed";
  // const FastPriceFeedFactory = await ethers.getContractFactory(FastPriceFeed)
  // console.log("target proxy : ", FastPriceFeed);
  // console.log("start upgrading proxy : ", CONTRACT_ADDRESS.FAST_PRICE_FEED)
  // const fastPriceFeedAfterUpgrades = await upgrades.upgradeProxy(CONTRACT_ADDRESS.FAST_PRICE_FEED, FastPriceFeedFactory)
  // console.log("upgrade complete : ", FastPriceFeed)

  /*
   * FeeDistributor 업데이트
   */
  // const FeeDistributor = "FeeDistributor";
  // const feeDistributorFactory = await ethers.getContractFactory(FeeDistributor)
  // console.log("target proxy : ", FeeDistributor);
  // console.log("start upgrading proxy : ", CONTRACT_ADDRESS.FEE_DISTRIBUTOR)
  // const feeDistributorAfterUpgrades = await upgrades.upgradeProxy(CONTRACT_ADDRESS.FEE_DISTRIBUTOR, feeDistributorFactory)
  // console.log("upgrade complete : ", FeeDistributor)

  /*
   * OlpManager 업데이트
   */
  // const OlpManager = "OlpManager";
  // const OlpManagerFactory = await ethers.getContractFactory(OlpManager)
  // console.log("target proxy : ", OlpManager);
  // console.log("start upgrading proxy : ", CONTRACT_ADDRESS.S_OLP_MANAGER)
  // const sOlpManagerAfterUpgrades = await upgrades.upgradeProxy(CONTRACT_ADDRESS.S_OLP_MANAGER, OlpManagerFactory)
  // console.log("start upgrading proxy : ", CONTRACT_ADDRESS.M_OLP_MANAGER)
  // const mOlpManagerAfterUpgrades = await upgrades.upgradeProxy(CONTRACT_ADDRESS.M_OLP_MANAGER, OlpManagerFactory)
  // console.log("start upgrading proxy : ", CONTRACT_ADDRESS.L_OLP_MANAGER)
  // const lOlpManagerAfterUpgrades = await upgrades.upgradeProxy(CONTRACT_ADDRESS.L_OLP_MANAGER, OlpManagerFactory)
  // console.log("upgrade complete : ", OlpManager)

  /*
   * OptionsMarket 업데이트
   */
  // const OptionsMarket = "OptionsMarket";
  // const OptionsMarketFactory = await ethers.getContractFactory(OptionsMarket)
  // console.log("target proxy : ", OptionsMarket);
  // console.log("start upgrading proxy : ", CONTRACT_ADDRESS.OPTIONS_MARKET)
  // const optionsMarketAfterUpgrades = await upgrades.upgradeProxy(CONTRACT_ADDRESS.OPTIONS_MARKET, OptionsMarketFactory)
  // console.log("upgrade complete : ", OptionsMarket)

  /*
   * OptionsToken 업데이트
   */
  // const OptionsToken = "OptionsToken";
  // const OptionsTokenFactory = await ethers.getContractFactory(OptionsToken)
  
  // console.log("target proxy : ", "Btc", OptionsToken)
  // console.log("start upgrading proxy : ", CONTRACT_ADDRESS.BTC_OPTIONS_TOKEN)
  // const btcOptionsTokenAfterUpgrades = await upgrades.upgradeProxy(CONTRACT_ADDRESS.BTC_OPTIONS_TOKEN, OptionsTokenFactory)
  // console.log("upgrade complete : ", "Btc", OptionsToken)

  // console.log("target proxy : ", "Eth", OptionsToken)
  // console.log("start upgrading proxy : ", CONTRACT_ADDRESS.ETH_OPTIONS_TOKEN)
  // const ethOptionsTokenAfterUpgrades = await upgrades.upgradeProxy(CONTRACT_ADDRESS.ETH_OPTIONS_TOKEN, OptionsTokenFactory)
  // console.log("upgrade complete : ", "Eth", OptionsToken)

  /*
   * PositionManager 업데이트
   */
  // const PositionManager = "PositionManager";
  // const PositionManagerFactory = await ethers.getContractFactory(PositionManager)
  // console.log("target proxy : ", PositionManager);
  // console.log("start upgrading proxy : ", CONTRACT_ADDRESS.POSITION_MANAGER)
  // const positionManagerAfterUpgrades = await upgrades.upgradeProxy(CONTRACT_ADDRESS.POSITION_MANAGER, PositionManagerFactory)
  // console.log("upgrade complete : ", PositionManager)

  /*
   * PositionValueFeed 업데이트
   */
  // const PositionValueFeed = "PositionValueFeed";
  // const PositionValueFeedFactory = await ethers.getContractFactory(PositionValueFeed)
  // console.log("target proxy : ", PositionValueFeed);
  // console.log("start upgrading proxy : ", CONTRACT_ADDRESS.POSITION_VALUE_FEED)
  // const positionValueFeedAfterUpgrades = await upgrades.upgradeProxy(CONTRACT_ADDRESS.POSITION_VALUE_FEED, PositionValueFeedFactory)
  // console.log("upgrade complete : ", PositionValueFeed)

  /*
   * Referral 업데이트
   */
  // const Referral = "Referral";
  // const ReferralFactory = await ethers.getContractFactory(Referral)
  // console.log("target proxy : ", Referral);
  // console.log("start upgrading proxy : ", CONTRACT_ADDRESS.REFERRAL)
  // const referralAfterUpgrades = await upgrades.upgradeProxy(CONTRACT_ADDRESS.REFERRAL, ReferralFactory)
  // console.log("upgrade complete : ", Referral)

  /*
   * RewardRouterV2 업데이트
   */
  // const RewardRouterV2 = "RewardRouterV2";
  // const RewardRouterV2Factory = await ethers.getContractFactory(RewardRouterV2)
  // console.log("target proxy : ", RewardRouterV2);
  // console.log("start upgrading proxy : ", CONTRACT_ADDRESS.S_REWARD_ROUTER_V2)
  // const sRewardRouterAfterUpgrades = await upgrades.upgradeProxy(CONTRACT_ADDRESS.S_REWARD_ROUTER_V2, RewardRouterV2Factory)
  // console.log("start upgrading proxy : ", CONTRACT_ADDRESS.M_REWARD_ROUTER_V2)
  // const mRewardRouterAfterUpgrades = await upgrades.upgradeProxy(CONTRACT_ADDRESS.M_REWARD_ROUTER_V2, RewardRouterV2Factory)
  // console.log("start upgrading proxy : ", CONTRACT_ADDRESS.L_REWARD_ROUTER_V2)
  // const lRewardRouterAfterUpgrades = await upgrades.upgradeProxy(CONTRACT_ADDRESS.L_REWARD_ROUTER_V2, RewardRouterV2Factory)
  // console.log("upgrade complete : ", RewardRouterV2)

  /*
   * RewardTracker 업데이트
   */
  // const RewardTracker = "RewardTracker";
  // const RewardTrackerFactory = await ethers.getContractFactory(RewardTracker)
  // console.log("target proxy : ", RewardTracker);
  // console.log("start upgrading proxy : ", CONTRACT_ADDRESS.S_REWARD_TRACKER)
  // const sRewardTrackerAfterUpgrades = await upgrades.upgradeProxy(CONTRACT_ADDRESS.S_REWARD_TRACKER, RewardTrackerFactory)
  // console.log("start upgrading proxy : ", CONTRACT_ADDRESS.M_REWARD_TRACKER)
  // const mRewardTrackerAfterUpgrades = await upgrades.upgradeProxy(CONTRACT_ADDRESS.M_REWARD_TRACKER, RewardTrackerFactory)
  // console.log("start upgrading proxy : ", CONTRACT_ADDRESS.L_REWARD_TRACKER)
  // const lRewardTrackerAfterUpgrades = await upgrades.upgradeProxy(CONTRACT_ADDRESS.L_REWARD_TRACKER, RewardTrackerFactory)
  // console.log("upgrade complete : ", RewardTracker)
  
  /*
   * SpotPriceFeed 업데이트
   */
  // const SpotPriceFeed = "SpotPriceFeed";
  // const SpotPriceFeedFactory = await ethers.getContractFactory(SpotPriceFeed)
  // console.log("target proxy : ", SpotPriceFeed);
  // console.log("start upgrading proxy : ", CONTRACT_ADDRESS.SPOT_PRICE_FEED)
  // const spotPriceFeedAfterUpgrades = await upgrades.upgradeProxy(CONTRACT_ADDRESS.SPOT_PRICE_FEED, SpotPriceFeedFactory)
  // console.log("upgrade complete : ", SpotPriceFeed)

  /*
   * Vault 업데이트
   */
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

  /*
   * VaultUtils 업데이트
   */
  // const VaultUtils = "VaultUtils";
  // const VaultUtilsFactory = await ethers.getContractFactory(VaultUtils)
  // console.log("target proxy : ", VaultUtils);
  // console.log("start upgrading proxy : ", CONTRACT_ADDRESS.S_VAULT_UTILS)
  // const sVaultUtilsAfterUpgrades = await upgrades.upgradeProxy(CONTRACT_ADDRESS.S_VAULT_UTILS, VaultUtilsFactory)
  // console.log("start upgrading proxy : ", CONTRACT_ADDRESS.M_VAULT_UTILS)
  // const mVaultUtilsAfterUpgrades = await upgrades.upgradeProxy(CONTRACT_ADDRESS.M_VAULT_UTILS, VaultUtilsFactory)
  // console.log("start upgrading proxy : ", CONTRACT_ADDRESS.L_VAULT_UTILS)
  // const lVaultUtilsAfterUpgrades = await upgrades.upgradeProxy(CONTRACT_ADDRESS.L_VAULT_UTILS, VaultUtilsFactory)
  // console.log("upgrade complete : ", VaultUtils)  

  /*
   * VaultPriceFeed 업데이트
   */
  // const VaultPriceFeed = "VaultPriceFeed";
  // const VaultPriceFeedFactory = await ethers.getContractFactory(VaultPriceFeed)
  // console.log("target proxy : ", VaultPriceFeed);
  // console.log("start upgrading proxy : ", CONTRACT_ADDRESS.VAULT_PRICE_FEED)
  // const vaultPriceFeedAfterUpgrades = await upgrades.upgradeProxy(CONTRACT_ADDRESS.VAULT_PRICE_FEED, VaultPriceFeedFactory)
  // console.log("upgrade complete : ", VaultPriceFeed)

  /*
   * ViewAggregator 업데이트
   */
  // const ViewAggregator = "ViewAggregator";
  // const ViewAggregatorFactory = await ethers.getContractFactory(ViewAggregator)
  // console.log("target proxy : ", ViewAggregator);
  // console.log("start upgrading proxy : ", CONTRACT_ADDRESS.VIEW_AGGREGATOR)
  // const viewAggregatorAfterUpgrades = await upgrades.upgradeProxy(CONTRACT_ADDRESS.VIEW_AGGREGATOR, ViewAggregatorFactory)
  // console.log("upgrade complete : ", ViewAggregator)

  /*
   * [2024-08-19] Upgrade Controller and Options Token for advanced approval
   */
  // await btcOptionsTokenAfterUpgrades.setHandler(CONTRACT_ADDRESS.CONTROLLER, true);
  // await ethOptionsTokenAfterUpgrades.setHandler(CONTRACT_ADDRESS.CONTROLLER, true);
  // console.log("Has set handler for Controller in Options Token")
  // await solp.setHandler(CONTRACT_ADDRESS.S_REWARD_TRACKER, true);
  // await molp.setHandler(CONTRACT_ADDRESS.M_REWARD_TRACKER, true);
  // await lolp.setHandler(CONTRACT_ADDRESS.L_REWARD_TRACKER, true);
  // console.log("Has set handler for Reward Tracker in Olp Manager")









  

  // const positionManagerImpl = await upgrades.erc1967.getImplementationAddress(CONTRACT_ADDRESS.POSITION_MANAGER)
  // const controllerImpl = await upgrades.erc1967.getImplementationAddress(CONTRACT_ADDRESS.CONTROLLER)
  // const sRewardRouterV2Impl = await upgrades.erc1967.getImplementationAddress(CONTRACT_ADDRESS.S_REWARD_ROUTER_V2)
  // const mRewardRouterV2Impl = await upgrades.erc1967.getImplementationAddress(CONTRACT_ADDRESS.M_REWARD_ROUTER_V2)
  // const sVaultImpl = await upgrades.erc1967.getImplementationAddress(CONTRACT_ADDRESS.S_VAULT)
  // const mVaultImpl = await upgrades.erc1967.getImplementationAddress(CONTRACT_ADDRESS.M_VAULT)
  // const sOlpManagerImpl = await upgrades.erc1967.getImplementationAddress(CONTRACT_ADDRESS.S_OLP_MANAGER)
  // const mOlpManagerImpl = await upgrades.erc1967.getImplementationAddress(CONTRACT_ADDRESS.M_OLP_MANAGER)

  // console.log(
  //   "positionManagerImpl : ", positionManagerImpl,
  //   "controllerImpl : ", controllerImpl,
  //   "sRewardRouterV2Impl : ", sRewardRouterV2Impl,
  //   "mRewardRouterV2Impl : ", mRewardRouterV2Impl,
  //   "sVaultImpl : ", sVaultImpl,
  //   "mVaultImpl : ", mVaultImpl,
  //   "sOlpManagerImpl : ", sOlpManagerImpl,
  //   "mOlpManagerImpl : ", mOlpManagerImpl
  // )

  
  // const test = await controller.getNotionalVolume(["1", "2"])
  // console.log(test, "test")

  // const btcCallNotionalVolume = await controller.accumulatedNotionalVolume(1, true)
  // const btcPutNotionalVolume = await controller.accumulatedNotionalVolume(1, false)
  // const btcCallExecutionPrice = await controller.accumulatedExecutionPrice(1, true)
  // const btcPutExecutionPrice = await controller.accumulatedExecutionPrice(1, false)
  // const ethCallNotionalVolume = await controller.accumulatedNotionalVolume(2, true)
  // const ethPutNotionalVolume = await controller.accumulatedNotionalVolume(2, false)
  // const ethCallExecutionPrice = await controller.accumulatedExecutionPrice(2, true)
  // const ethPutExecutionPrice = await controller.accumulatedExecutionPrice(2, false)

  // console.log("btcCallNotionalVolume : ", btcCallNotionalVolume.toString())
  // console.log("btcPutNotionalVolume : ", btcPutNotionalVolume.toString())
  // console.log("btcCallExecutionPrice : ", btcCallExecutionPrice.toString())
  // console.log("btcPutExecutionPrice : ", btcPutExecutionPrice.toString())
  // console.log("ethCallNotionalVolume : ", ethCallNotionalVolume.toString())
  // console.log("ethPutNotionalVolume : ", ethPutNotionalVolume.toString())
  // console.log("ethCallExecutionPrice : ", ethCallExecutionPrice.toString())
  // console.log("ethPutExecutionPrice : ", ethPutExecutionPrice.toString())

  // console.log("btcCallNotionalVolume : ", new BigNumber(btcCallNotionalVolume.toString()).div(new BigNumber(10).pow(30)).toString())
  // console.log("btcPutNotionalVolume : ", new BigNumber(btcPutNotionalVolume.toString()).div(new BigNumber(10).pow(30)).toString())
  // console.log("btcCallExecutionPrice : ", new BigNumber(btcCallExecutionPrice.toString()).div(new BigNumber(10).pow(30)).toString())
  // console.log("btcPutExecutionPrice : ", new BigNumber(btcPutExecutionPrice.toString()).div(new BigNumber(10).pow(30)).toString())
  // console.log("ethCallNotionalVolume : ", new BigNumber(ethCallNotionalVolume.toString()).div(new BigNumber(10).pow(30)).toString())
  // console.log("ethPutNotionalVolume : ", new BigNumber(ethPutNotionalVolume.toString()).div(new BigNumber(10).pow(30)).toString())
  // console.log("ethCallExecutionPrice : ", new BigNumber(ethCallExecutionPrice.toString()).div(new BigNumber(10).pow(30)).toString())
  // console.log("ethPutExecutionPrice : ", new BigNumber(ethPutExecutionPrice.toString()).div(new BigNumber(10).pow(30)).toString())

  // console.log(new BigNumber(btcCallNotionalVolume.toString()).plus(btcPutNotionalVolume.toString()).plus(ethCallNotionalVolume.toString()).plus(ethPutNotionalVolume.toString()).div(new BigNumber(10).pow(30)).toString())
  // console.log(new BigNumber(btcCallExecutionPrice.toString()).plus(btcPutExecutionPrice.toString()).plus(ethCallExecutionPrice.toString()).plus(ethPutExecutionPrice.toString()).div(new BigNumber(10).pow(30)).toString())




















  // await referral.addToAffiliates(
  //   "0x507E2135DA72698044a8E6FF042324a18D73597B",
  //   1500,
  //   3000
  // )
  // const isAffiliate = await referral.isAffiliates("0x507E2135DA72698044a8E6FF042324a18D73597B")
  // console.log(isAffiliate, "isAffiliate")

  // const data = [
  //   "0x507E2135DA72698044a8E6FF042324a18D73597B",
  //   "0x656043c240b7722810ddd339cc4f6daaae436f53",
  //   "0xf8bc58b556403dcc4d05e3fd67e052f9324869ca",
  //   "0x6e1e9701bee5f23fbb9a22f5e7c0c18e09f6ec2d",
  //   "0x0bbaf32bc6f843042a0082cc822a6add6d636c3e",
  //   "0x36ba09b6d77b49fab174aa1e97a7c0677476eabd",
  //   "0x51fc339d57541ed05fe5a88a6c970373c733edbc",
  //   "0x59e40752be0f745b63ff918089743ca8dfb04151",
  //   "0x04e7913b5186bbd5a738e096177e20473464d326",
  //   "0xd0eb787a913c41d4eedacc32b08771b89db7a7de",
  //   "0xbf7b02df420520d07c0aa1f67706f142b2bc0a0a",
  //   "0xa641bfbf23340d5014d50a674a02cf193a694870",
  //   "0xe06cc74a01d2585c457020f20755dd6afb885e9b",
  //   "0xcd55002a5a295a746bac55da82400edda8e3ba27",
  //   "0x3eada457690661775e560a2285594363c9be1364",
  //   "0x14cff5a34109f9696d32c5842baf018016870751",
  //   "0xb7b1a0ff66840ce7c70d21ad561644564b20fbcf",
  //   "0x093615032936fe291e9e18be0743a4143a295e8a",
  //   "0xd0d9b4ad7d1951858bd7be52e3b7bb53e6100f0c",
  //   "0xa5c0ac1b11a9da27af7e6aabbf6eb497917eb145",
  //   "0x05b5d413e8350460ce37c40c41f98b4a37e7a241",
  //   "0xdfa7671bd325412cb2d5e7199ebc79f882bbf6a1",
  //   "0x79374fdf37d880354c89cbdb89a50c4471aee336",
  //   "0x55e36f90b8ffca6dae79d67025f0e3fb5516a991",
  //   "0x4e9c104d24ca8aa27c3e1a5d9d3249e96c5bbd80",
  //   "0x7924259dab32774a5a34ef07ae6a834777a78033",
  //   "0x566339480990eadee8f30153785e580df875e2bd",
  //   "0xc23816d5c97ccf07f57e8701859d6b524e5a320c",
  //   "0x94c71d1780ff80e6154f9e885132bb9d3c207ffd",
  //   "0x1848d26f76c8f8ab416f8aaf064506d9d77183ff",
  //   "0xf0259de4b474a5d9e2e2b227626b50b0769de08f"
  // ]


  // const beforeReferralDiscountRate = await referral.referralDiscountRate();
  // const beforeReferralFeeRebateRate = await referral.referralFeeRebateRate();
  // console.log(beforeReferralDiscountRate.toString(), beforeReferralFeeRebateRate.toString())

  // await referral.setReferralRate(1000, 1500);

  // const afterReferralDiscountRate = await referral.referralDiscountRate();
  // const afterReferralFeeRebateRate = await referral.referralFeeRebateRate();
  // console.log(afterReferralDiscountRate.toString(), afterReferralFeeRebateRate.toString())

  // const affiliates = [
  //   "0x220b522979B9F2Ca0F83663fcfF2ee2426aa449C",
  //   "0x38280B86C66788EdA4637033074C2c0fF18552ef",
  //   "0xE9C9b648B899E1662faB21E983725eD3f299F4e9",
  //   "0xabf47ac2DFa7112977fa22D55590eBd351C3Aefe",
  //   "0x313e2223436e151C6B4167c63a5e0324aC8FbcED",
  //   "0xcd48347AFBF0Db796955497bB3370Cef512994a7",
  //   "0x507E2135DA72698044a8E6FF042324a18D73597B",
  //   "0x656043c240b7722810ddd339cc4f6daaae436f53",
  //   "0xf8bc58b556403dcc4d05e3fd67e052f9324869ca",
  //   "0x6e1e9701bee5f23fbb9a22f5e7c0c18e09f6ec2d",
  //   "0x0bbaf32bc6f843042a0082cc822a6add6d636c3e",
  //   "0x36ba09b6d77b49fab174aa1e97a7c0677476eabd",
  //   "0x51fc339d57541ed05fe5a88a6c970373c733edbc",
  //   "0x59e40752be0f745b63ff918089743ca8dfb04151",
  //   "0x04e7913b5186bbd5a738e096177e20473464d326",
  //   "0xd0eb787a913c41d4eedacc32b08771b89db7a7de",
  //   "0xbf7b02df420520d07c0aa1f67706f142b2bc0a0a",
  //   "0xa641bfbf23340d5014d50a674a02cf193a694870",
  //   "0xe06cc74a01d2585c457020f20755dd6afb885e9b",
  //   "0xcd55002a5a295a746bac55da82400edda8e3ba27",
  //   "0x3eada457690661775e560a2285594363c9be1364",
  //   "0x14cff5a34109f9696d32c5842baf018016870751",
  //   "0xb7b1a0ff66840ce7c70d21ad561644564b20fbcf",
  //   "0x093615032936fe291e9e18be0743a4143a295e8a",
  //   "0xd0d9b4ad7d1951858bd7be52e3b7bb53e6100f0c",
  //   "0xa5c0ac1b11a9da27af7e6aabbf6eb497917eb145",
  //   "0x05b5d413e8350460ce37c40c41f98b4a37e7a241",
  //   "0xdfa7671bd325412cb2d5e7199ebc79f882bbf6a1",
  //   "0x79374fdf37d880354c89cbdb89a50c4471aee336",
  //   "0x55e36f90b8ffca6dae79d67025f0e3fb5516a991",
  //   "0x4e9c104d24ca8aa27c3e1a5d9d3249e96c5bbd80",
  //   "0x7924259dab32774a5a34ef07ae6a834777a78033",
  //   "0x566339480990eadee8f30153785e580df875e2bd",
  //   "0xc23816d5c97ccf07f57e8701859d6b524e5a320c",
  //   "0x94c71d1780ff80e6154f9e885132bb9d3c207ffd",
  //   "0x1848d26f76c8f8ab416f8aaf064506d9d77183ff",
  //   "0xf0259de4b474a5d9e2e2b227626b50b0769de08f"
  // ]

  // for (let i = 0; i < affiliates.length; i++) {
  //   const affiliateDiscountRate = await referral.affiliatesDiscountRate(affiliates[i])
  //   console.log(affiliateDiscountRate.toString())
  // }  

  // const accountsBatch = []
  // const discountRatesBatch = []
  // const feeRebateRateBatch = []

  // for (let i = 0; i < 6; i++) {
  //   accountsBatch.push(affiliates[i])
  //   discountRatesBatch.push(1500)
  //   feeRebateRateBatch.push(3000)
  // }

  // console.log(accountsBatch, discountRatesBatch, feeRebateRateBatch)
  // await referral.addToAffiliatesInBatch(
  //   accountsBatch,
  //   discountRatesBatch,
  //   feeRebateRateBatch
  // )

  // for (let i = 0; i < affiliates.length; i++) {
  //   const affiliateFeeRebateRate = await referral.affiliatesFeeRebateRate(affiliates[i])
  //   console.log(affiliateFeeRebateRate.toString())
  // }


  // const discountRates = data.map(() => 1500)
  // const feeRebateRates = data.map(() => 3000)

  // console.log(discountRates, feeRebateRates)

  // const tx = await referral.addToAffiliatesInBatch(
  //   data,
  //   discountRates,
  //   feeRebateRates
  // )
  // const receipt = await tx.wait()
  // console.log(receipt.status, "status")

  // const isAffiliate = await referral.isAffiliates("0x7924259dab32774a5a34ef07ae6a834777a78033")
  // console.log(isAffiliate, "isAffiliate")

  // "0x0ed475ee727854d59De0C4B4057405e6e4d80193"
  // "0xcFA13eFc46195806BAb6716D7Ab1A31076fA4d40"
  // "0xc45D5902d25af59d765837EbF2CE4871F67d741F"

  // const feeReservesUsdAndEthAvailableUsd = await viewAggregator.getFeeReservesUsdAndEthAvailableUsd()

  // const feeReservesUsd = feeReservesUsdAndEthAvailableUsd[0].map((value) => new BigNumber(value).div(10 ** 30).toNumber())
  // const ethAvailableUsd = feeReservesUsdAndEthAvailableUsd[1].map((value) => new BigNumber(value).div(10 ** 30).toNumber())

  // console.log(feeReservesUsd, ethAvailableUsd)

  // const feeReservesRatio = [0, 0, 0]

  // for (let i = 0; i < feeReservesUsd.length; i++) {
  //   if (ethAvailableUsd[i] === 0) {
  //     feeReservesRatio[i] = 0
  //     continue
  //   }
  //   feeReservesRatio[i] = feeReservesUsd[i] / ethAvailableUsd[i];
  // }

  // const threshold = 0.8
  // const shouldAlert = feeReservesRatio.filter((ratio) => ratio > threshold).length > 0

  // console.log(feeReservesRatio)
  // console.log(shouldAlert)

  // const test = await sOlpManager.getOlpAssetUsd(SHARED_CONTRACT_ADDRESS.USDC, true)
  // console.log(
  //   "reservedUsd : ", new BigNumber(test[3]).dividedBy(new BigNumber(10).pow(30)).toString(), "\n",
  //   "utilizedUsd : ", new BigNumber(test[4]).dividedBy(new BigNumber(10).pow(30)).toString(), "\n",
  //   "availableUsd : ", new BigNumber(test[5]).dividedBy(new BigNumber(10).pow(30)).toString(), "\n",
  //   "depositedUsd : ", new BigNumber(test[6]).dividedBy(new BigNumber(10).pow(30)).toString(), "\n",
  // )

  // const a = await positionManager.executionFee();
  // console.log(a, "a")

  // const a = await sVaultUtils.optionTokensAtSelfExpiry(1720425600, 53);
  // const { underlyingAssetIndex, expiry, strategy, length, isBuys, strikePrices, isCalls, vaultIndex } = parseOptionTokenId(a[0])
  // console.log(a, "A")
  // console.log(underlyingAssetIndex, expiry, strategy, length, isBuys, strikePrices, isCalls, vaultIndex, "B")
  // 732.6118725 돌려줘야 하는데
  // 733.972372

  // const { settleManager } = await deploySettleManager(ethers, { upgrades, CONTRACT_ADDRESS })
  // console.log("settleManager Address : ", await settleManager.getAddress())




  // operation after deploy settlemanager

  // await sVaultAfterUpgrades.setContracts(await sVaultUtils.getAddress(), await optionsMarket.getAddress(), await settleManager.getAddress(), await controller.getAddress(), await vaultPriceFeed.getAddress(), await susdg.getAddress())
  // await mVaultAfterUpgrades.setContracts(await mVaultUtils.getAddress(), await optionsMarket.getAddress(), await settleManager.getAddress(), await controller.getAddress(), await vaultPriceFeed.getAddress(), await musdg.getAddress())
  // await lVaultAfterUpgrades.setContracts(await lVaultUtils.getAddress(), await optionsMarket.getAddress(), await settleManager.getAddress(), await controller.getAddress(), await vaultPriceFeed.getAddress(), await lusdg.getAddress())

  // await sVaultAfterUpgrades.setManager(await settleManager.getAddress(), true)
  // await mVaultAfterUpgrades.setManager(await settleManager.getAddress(), true)
  // await lVaultAfterUpgrades.setManager(await settleManager.getAddress(), true)

  // await sVaultUtilsAfterUpgrades.setPositionManager(await positionManager.getAddress())
  // await mVaultUtilsAfterUpgrades.setPositionManager(await positionManager.getAddress())
  // await lVaultUtilsAfterUpgrades.setPositionManager(await positionManager.getAddress())

  // await controller.addPlugin(await settleManager.getAddress())
  // await positionManagerAfterUpgrades.setCopyTradeFeeRebateRate("3000")

  console.log("Upgrade completed")
}

(async () => {
  await upgradeContracts(ethers, null)
})()