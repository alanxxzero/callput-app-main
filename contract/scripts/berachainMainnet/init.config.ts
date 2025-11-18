import BigNumber from "bignumber.js";
import { getDeployedContracts } from "./deployedContracts";
import {
  MIN_MARK_PRICES,
  mpReleaseDuration,
  OLP_TOKEN_INFO,
  referralDiscountRate,
  referralFeeRebateRate,
  rpReleaseDuration,
  settleFeeCalculationLimitRate,
  copyTradeFeeRebateRate,
  tradeFeeCalculationLimitRate,
  TOKEN_INFO,
  mpIndex,
  rpIndex,
  CHAINLINK_FLAGS,
  CHAINLINK_PRICE_FEED_WBTC,
  CHAINLINK_TOKEN_DECIMALS,
  CHAINLINK_PRICE_FEED_WETH,
  CHAINLINK_PRICE_FEED_USDC,
  SAFE_WALLET,
} from "./constants";

BigNumber.config({
  EXPONENTIAL_AT: 1000,
  DECIMAL_PLACES: 18,
});

export const init = async (ethers: any, addressMap: any) => {
  const [DEPLOYER, TEST_USER1] = await (ethers as any).getSigners();

  const {
    CONTRACT_ADDRESS,
    wbtc,
    weth,
    usdc,
    wbera,
    honey,
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
    settleManager,
    feeDistributor,
    btcOptionsToken,
    ethOptionsToken,
    fastPriceEvents,
    fastPriceFeed,
    positionValueFeed,
    settlePriceFeed,
    spotPriceFeed,
    primaryOracle,
    viewAggregator,
    referral,
  } = await getDeployedContracts(ethers, addressMap);

  if (
    !SAFE_WALLET.ADMIN ||
    !SAFE_WALLET.KEEPER_OPTIONS_MARKET_ADDRESS ||
    !SAFE_WALLET.KEEPER_OPTIONS_MARKET_ADDRESS ||
    !SAFE_WALLET.KEEPER_POSITION_PROCESSOR_ADDRESS ||
    !SAFE_WALLET.KEEPER_SETTLE_OPERATOR_ADDRESS ||
    !SAFE_WALLET.KEEPER_POSITION_VALUE_FEEDER_ADDRESS ||
    !SAFE_WALLET.KEEPER_POSITION_VALUE_FEEDER_SUB1_ADDRESS ||
    !SAFE_WALLET.KEEPER_SPOT_PRICE_FEEDER_ADDRESS ||
    !SAFE_WALLET.KEEPER_SPOT_PRICE_FEEDER_SUB1_ADDRESS ||
    !SAFE_WALLET.KEEPER_FEE_DISTRIBUTOR_ADDRESS ||
    !SAFE_WALLET.KEEPER_CLEARING_HOUSE_ADDRESS
  ) {
    throw new Error("Safe wallet not found");
  }

  console.log("init OptionsAuthority: set keeper and transfer ownership");
  await optionsAuthority.connect(DEPLOYER).setKeeper(DEPLOYER.address, true);
  await optionsAuthority.connect(DEPLOYER).setKeeper(SAFE_WALLET.ADMIN, true);
  await optionsAuthority.connect(DEPLOYER).setKeeper(SAFE_WALLET.KEEPER_OPTIONS_MARKET_ADDRESS, true); // keeper that update option market
  await optionsAuthority.connect(DEPLOYER).setKeeper(SAFE_WALLET.KEEPER_SETTLE_OPERATOR_ADDRESS, true); // keeper that feeds settle price
  await optionsAuthority.connect(DEPLOYER).setKeeper(SAFE_WALLET.KEEPER_POSITION_VALUE_FEEDER_ADDRESS, true); // keeper that update position value
  await optionsAuthority.connect(DEPLOYER).setKeeper(SAFE_WALLET.KEEPER_POSITION_VALUE_FEEDER_SUB1_ADDRESS, true); // keeper that update position value
  await optionsAuthority.connect(DEPLOYER).setKeeper(SAFE_WALLET.KEEPER_SPOT_PRICE_FEEDER_ADDRESS, true); // keeper that feeds spot price
  await optionsAuthority.connect(DEPLOYER).setKeeper(SAFE_WALLET.KEEPER_SPOT_PRICE_FEEDER_SUB1_ADDRESS, true); // keeper that feeds spot price
  await optionsAuthority.connect(DEPLOYER).setKeeper(SAFE_WALLET.KEEPER_FEE_DISTRIBUTOR_ADDRESS, true); // keeper that distibute fee
  await optionsAuthority.connect(DEPLOYER).setKeeper(SAFE_WALLET.KEEPER_CLEARING_HOUSE_ADDRESS, true); // keeper that update clearing house
  await optionsAuthority.connect(DEPLOYER).setPositionKeeper(SAFE_WALLET.KEEPER_POSITION_PROCESSOR_ADDRESS, true);
  await optionsAuthority.connect(DEPLOYER).setFastPriceFeed(CONTRACT_ADDRESS.FAST_PRICE_FEED, true);
  await optionsAuthority.connect(DEPLOYER).setController(CONTRACT_ADDRESS.CONTROLLER, true);
  await optionsAuthority.connect(DEPLOYER).setFeeDistributor(CONTRACT_ADDRESS.FEE_DISTRIBUTOR, true);

  console.log("init VaultPriceFeed: set price feeds, token configs, and chainlink flag");
  await vaultPriceFeed
    .connect(DEPLOYER)
    .setPriceFeeds(
      CONTRACT_ADDRESS.FAST_PRICE_FEED,
      CONTRACT_ADDRESS.SETTLE_PRICE_FEED,
      CONTRACT_ADDRESS.POSITION_VALUE_FEED
    );
  await vaultPriceFeed.connect(DEPLOYER).setTokenConfig(
    CONTRACT_ADDRESS.WBTC,
    true, // isSupported
    false // isStrictStable
  );
  await vaultPriceFeed.connect(DEPLOYER).setTokenConfig(
    CONTRACT_ADDRESS.WETH,
    true, // isSupported
    false // isStrictStable
  );
  await vaultPriceFeed.connect(DEPLOYER).setTokenConfig(
    CONTRACT_ADDRESS.USDC,
    true, // isSupported
    true // isStrictStable
  );
  await vaultPriceFeed.connect(DEPLOYER).setTokenConfig(
    CONTRACT_ADDRESS.HONEY,
    true, // isSupported
    true // isStrictStable
  );
  await vaultPriceFeed.connect(DEPLOYER).setPrimaryOracle(
    CONTRACT_ADDRESS.PRIMARY_ORACLE,
    false // isPrimaryOracleEnabled
  );
  await vaultPriceFeed.connect(DEPLOYER).setSecondarySpotPriceFeed(
    CONTRACT_ADDRESS.SPOT_PRICE_FEED,
    true // isSecondarySpotEnabled
  );
  await vaultPriceFeed.connect(DEPLOYER).setPositionManager(CONTRACT_ADDRESS.POSITION_MANAGER);
  await vaultPriceFeed
    .connect(DEPLOYER)
    .setMinMarkPrice(MIN_MARK_PRICES.BTC.INDEX, MIN_MARK_PRICES.BTC.VALUE);
  await vaultPriceFeed
    .connect(DEPLOYER)
    .setMinMarkPrice(MIN_MARK_PRICES.ETH.INDEX, MIN_MARK_PRICES.ETH.VALUE);

  // @desc not necessary for berachain mainnet
  // console.log("init primaryOracle: set chainlink");
  // await primaryOracle.connect(DEPLOYER).setChainlinkFlags(
  //   CHAINLINK_FLAGS
  // );
  // await primaryOracle.connect(DEPLOYER).setTokenConfig(
  //   CONTRACT_ADDRESS.WBTC,
  //   CHAINLINK_PRICE_FEED_WBTC,
  //   CHAINLINK_TOKEN_DECIMALS
  // );
  // await primaryOracle.connect(DEPLOYER).setTokenConfig(
  //   CONTRACT_ADDRESS.WETH,
  //   CHAINLINK_PRICE_FEED_WETH,
  //   CHAINLINK_TOKEN_DECIMALS
  // );
  // await primaryOracle.connect(DEPLOYER).setTokenConfig(
  //   CONTRACT_ADDRESS.USDC,
  //   CHAINLINK_PRICE_FEED_USDC,
  //   CHAINLINK_TOKEN_DECIMALS
  // );

  console.log("init OptionsMarket: add optionsToken");
  await optionsMarket.connect(DEPLOYER).setMainStableAsset(CONTRACT_ADDRESS.USDC);
  await optionsMarket
    .connect(DEPLOYER)
    .addUnderlyingAsset(CONTRACT_ADDRESS.WBTC, CONTRACT_ADDRESS.BTC_OPTIONS_TOKEN);
  await optionsMarket
    .connect(DEPLOYER)
    .addUnderlyingAsset(CONTRACT_ADDRESS.WETH, CONTRACT_ADDRESS.ETH_OPTIONS_TOKEN);

  console.log("init Vault: set contracts, and token configs");
  const vaults = [sVault, mVault, lVault];
  const vaultUtils = [sVaultUtils, mVaultUtils, lVaultUtils];
  const usdgs = [susdg, musdg, lusdg];
  const olpManagers = [sOlpManager, mOlpManager, lOlpManager];
  for (let i = 0; i < vaults.length; i++) {
    await vaults[i]
      .connect(DEPLOYER)
      .setContracts(
        vaultUtils[i].getAddress(),
        CONTRACT_ADDRESS.OPTIONS_MARKET,
        CONTRACT_ADDRESS.SETTLE_MANAGER,
        CONTRACT_ADDRESS.CONTROLLER,
        CONTRACT_ADDRESS.VAULT_PRICE_FEED,
        usdgs[i].getAddress()
      );
    await vaults[i]
      .connect(DEPLOYER)
      .setBufferAmount(CONTRACT_ADDRESS.WBTC, OLP_TOKEN_INFO.WBTC.BUFFER_AMOUNT);
    await vaults[i]
      .connect(DEPLOYER)
      .setBufferAmount(CONTRACT_ADDRESS.WETH, OLP_TOKEN_INFO.WETH.BUFFER_AMOUNT);
    await vaults[i]
      .connect(DEPLOYER)
      .setBufferAmount(CONTRACT_ADDRESS.USDC, OLP_TOKEN_INFO.USDC.BUFFER_AMOUNT);
    await vaults[i]
      .connect(DEPLOYER)
      .setBufferAmount(CONTRACT_ADDRESS.HONEY, OLP_TOKEN_INFO.HONEY.BUFFER_AMOUNT);
    await vaults[i]
      .connect(DEPLOYER)
      .setTokenConfig(
        CONTRACT_ADDRESS.WBTC,
        TOKEN_INFO.WBTC.DECIMAL,
        OLP_TOKEN_INFO.WBTC.WEIGHT,
        OLP_TOKEN_INFO.WBTC.MAX_USDG_AMOUNT,
        OLP_TOKEN_INFO.WBTC.IS_UNDERLYINGASSET_TOKEN,
        OLP_TOKEN_INFO.WBTC.IS_STABLE_TOKEN,
        OLP_TOKEN_INFO.WBTC.DECREASE_TOLERANCE_AMOUNT
      );
    await vaults[i]
      .connect(DEPLOYER)
      .setTokenConfig(
        CONTRACT_ADDRESS.WETH,
        TOKEN_INFO.WETH.DECIMAL,
        OLP_TOKEN_INFO.WETH.WEIGHT,
        OLP_TOKEN_INFO.WETH.MAX_USDG_AMOUNT,
        OLP_TOKEN_INFO.WETH.IS_UNDERLYINGASSET_TOKEN,
        OLP_TOKEN_INFO.WETH.IS_STABLE_TOKEN,
        OLP_TOKEN_INFO.WETH.DECREASE_TOLERANCE_AMOUNT
      );
    await vaults[i]
      .connect(DEPLOYER)
      .setTokenConfig(
        CONTRACT_ADDRESS.USDC,
        TOKEN_INFO.USDC.DECIMAL,
        OLP_TOKEN_INFO.USDC.WEIGHT,
        OLP_TOKEN_INFO.USDC.MAX_USDG_AMOUNT,
        OLP_TOKEN_INFO.USDC.IS_UNDERLYINGASSET_TOKEN,
        OLP_TOKEN_INFO.USDC.IS_STABLE_TOKEN,
        OLP_TOKEN_INFO.USDC.DECREASE_TOLERANCE_AMOUNT
      );
    await vaults[i]
      .connect(DEPLOYER)
      .setTokenConfig(
        CONTRACT_ADDRESS.HONEY,
        TOKEN_INFO.HONEY.DECIMAL,
        OLP_TOKEN_INFO.HONEY.WEIGHT,
        OLP_TOKEN_INFO.HONEY.MAX_USDG_AMOUNT,
        OLP_TOKEN_INFO.HONEY.IS_UNDERLYINGASSET_TOKEN,
        OLP_TOKEN_INFO.HONEY.IS_STABLE_TOKEN,
        OLP_TOKEN_INFO.HONEY.DECREASE_TOLERANCE_AMOUNT
      );
    await vaults[i].connect(DEPLOYER).setManager(olpManagers[i].getAddress(), true);
    await vaults[i].connect(DEPLOYER).setManager(CONTRACT_ADDRESS.POSITION_MANAGER, true);
    await vaults[i].connect(DEPLOYER).setManager(CONTRACT_ADDRESS.SETTLE_MANAGER, true);
    await vaults[i].connect(DEPLOYER).setManager(CONTRACT_ADDRESS.CONTROLLER, true);
  }

  console.log("init VaultUtils: set vault release duration");
  for (let i = 0; i < vaultUtils.length; i++) {
    await vaultUtils[i].connect(DEPLOYER).setReleaseDuration(CONTRACT_ADDRESS.WBTC, mpReleaseDuration, mpIndex); // MP
    await vaultUtils[i].connect(DEPLOYER).setReleaseDuration(CONTRACT_ADDRESS.WETH, mpReleaseDuration, mpIndex); // MP
    await vaultUtils[i].connect(DEPLOYER).setReleaseDuration(CONTRACT_ADDRESS.USDC, mpReleaseDuration, mpIndex); // MP
    await vaultUtils[i].connect(DEPLOYER).setReleaseDuration(CONTRACT_ADDRESS.HONEY, mpReleaseDuration, mpIndex); // MP
    await vaultUtils[i].connect(DEPLOYER).setReleaseDuration(CONTRACT_ADDRESS.WBTC, rpReleaseDuration, rpIndex); // RP
    await vaultUtils[i].connect(DEPLOYER).setReleaseDuration(CONTRACT_ADDRESS.WETH, rpReleaseDuration, rpIndex); // RP
    await vaultUtils[i].connect(DEPLOYER).setReleaseDuration(CONTRACT_ADDRESS.USDC, rpReleaseDuration, rpIndex); // RP
    await vaultUtils[i].connect(DEPLOYER).setReleaseDuration(CONTRACT_ADDRESS.HONEY, rpReleaseDuration, rpIndex); // RP
    await vaultUtils[i].connect(DEPLOYER).setReferral(CONTRACT_ADDRESS.REFERRAL);
    await vaultUtils[i].connect(DEPLOYER).setTradeFeeCalculationLimitRate(tradeFeeCalculationLimitRate);
    await vaultUtils[i].connect(DEPLOYER).setSettleFeeCalculationLimitRate(settleFeeCalculationLimitRate);
    await vaultUtils[i].connect(DEPLOYER).setPositionManager(CONTRACT_ADDRESS.POSITION_MANAGER);
  }

  console.log("init Controller: set position manager")
  await controller.connect(DEPLOYER).addPlugin(CONTRACT_ADDRESS.POSITION_MANAGER);
  await controller.connect(DEPLOYER).addPlugin(CONTRACT_ADDRESS.SETTLE_MANAGER);
  await controller.connect(DEPLOYER).addPlugin(CONTRACT_ADDRESS.FEE_DISTRIBUTOR);

  console.log("init FacePriceEvents: set fast price feed")
  await fastPriceEvents.connect(DEPLOYER).setIsPriceFeed(CONTRACT_ADDRESS.FAST_PRICE_FEED, true);

  console.log("init OlpManager: set reward router v2 as handler");
  await sOlpManager.connect(DEPLOYER).setHandler(CONTRACT_ADDRESS.S_REWARD_ROUTER_V2, true);
  await mOlpManager.connect(DEPLOYER).setHandler(CONTRACT_ADDRESS.M_REWARD_ROUTER_V2, true);
  await lOlpManager.connect(DEPLOYER).setHandler(CONTRACT_ADDRESS.L_REWARD_ROUTER_V2, true);

  console.log("init RewardTracker: set deposit token and distributor");
  await sRewardTracker.connect(DEPLOYER).initSetup(CONTRACT_ADDRESS.S_OLP, CONTRACT_ADDRESS.S_REWARD_DISTRIBUTOR);
  await mRewardTracker.connect(DEPLOYER).initSetup(CONTRACT_ADDRESS.M_OLP, CONTRACT_ADDRESS.M_REWARD_DISTRIBUTOR);
  await lRewardTracker.connect(DEPLOYER).initSetup(CONTRACT_ADDRESS.L_OLP, CONTRACT_ADDRESS.L_REWARD_DISTRIBUTOR);

  console.log("init USDG: set vault");
  await susdg.connect(DEPLOYER).setVault(CONTRACT_ADDRESS.S_VAULT, true);
  await musdg.connect(DEPLOYER).setVault(CONTRACT_ADDRESS.M_VAULT, true);
  await lusdg.connect(DEPLOYER).setVault(CONTRACT_ADDRESS.L_VAULT, true);

  console.log("init OLP: set minter and set reward tracker as handler");
  await solp.connect(DEPLOYER).setMinter(CONTRACT_ADDRESS.S_OLP_MANAGER, true);
  await molp.connect(DEPLOYER).setMinter(CONTRACT_ADDRESS.M_OLP_MANAGER, true);
  await lolp.connect(DEPLOYER).setMinter(CONTRACT_ADDRESS.L_OLP_MANAGER, true);
  await solp.connect(DEPLOYER).setHandler(CONTRACT_ADDRESS.S_REWARD_TRACKER, true);
  await molp.connect(DEPLOYER).setHandler(CONTRACT_ADDRESS.M_REWARD_TRACKER, true);
  await lolp.connect(DEPLOYER).setHandler(CONTRACT_ADDRESS.L_REWARD_TRACKER, true);

  console.log("init RewardTracker: set reward router v2 as handler");
  await sRewardTracker.connect(DEPLOYER).setHandler(CONTRACT_ADDRESS.S_REWARD_ROUTER_V2, true);
  await mRewardTracker.connect(DEPLOYER).setHandler(CONTRACT_ADDRESS.M_REWARD_ROUTER_V2, true);
  await lRewardTracker.connect(DEPLOYER).setHandler(CONTRACT_ADDRESS.L_REWARD_ROUTER_V2, true);

  console.log("init Reward Distributor: update last distribution time");
  await sRewardDistributor.connect(DEPLOYER).updateLastDistributionTime();
  await mRewardDistributor.connect(DEPLOYER).updateLastDistributionTime();
  await lRewardDistributor.connect(DEPLOYER).updateLastDistributionTime();

  console.log("init Referral: set default discount rate and fee rebate rate");
  await referral.connect(DEPLOYER).setReferralRate(referralDiscountRate, referralFeeRebateRate);

  console.log("init OptionsToken: set controller as handler");
  await btcOptionsToken.connect(DEPLOYER).setHandler(CONTRACT_ADDRESS.CONTROLLER, true);
  await ethOptionsToken.connect(DEPLOYER).setHandler(CONTRACT_ADDRESS.CONTROLLER, true);

  console.log("init PositionManager: set social trading leader fee rebate rate");
  await positionManager.connect(DEPLOYER).setCopyTradeFeeRebateRate(copyTradeFeeRebateRate);

  console.log("OptionsAuthority: remove keeper and set admin")
  await optionsAuthority.connect(DEPLOYER).setKeeper(DEPLOYER.address, false);
  await optionsAuthority.connect(DEPLOYER).setAdmin(DEPLOYER.address, false);
  await optionsAuthority.connect(DEPLOYER).setAdmin(SAFE_WALLET.ADMIN, true)

  console.log("transfer ownership of each contract")
  await optionsAuthority.connect(DEPLOYER).transferOwnership(SAFE_WALLET.ADMIN);
  console.log("- successfully transferred for optionsAuthority")
  await vaultPriceFeed.connect(DEPLOYER).transferOwnership(SAFE_WALLET.ADMIN);
  console.log("- successfully transferred for vaultPriceFeed")
  await optionsMarket.connect(DEPLOYER).transferOwnership(SAFE_WALLET.ADMIN);
  console.log("- successfully transferred for optionsMarket")

  await sVault.connect(DEPLOYER).transferOwnership(SAFE_WALLET.ADMIN);
  console.log("- successfully transferred for sVault")
  await mVault.connect(DEPLOYER).transferOwnership(SAFE_WALLET.ADMIN);
  console.log("- successfully transferred for mVault")
  await lVault.connect(DEPLOYER).transferOwnership(SAFE_WALLET.ADMIN);
  console.log("- successfully transferred for lVault")

  await sVaultUtils.connect(DEPLOYER).transferOwnership(SAFE_WALLET.ADMIN);
  console.log("- successfully transferred for sVaultUtils")
  await mVaultUtils.connect(DEPLOYER).transferOwnership(SAFE_WALLET.ADMIN);
  console.log("- successfully transferred for mVaultUtils")
  await lVaultUtils.connect(DEPLOYER).transferOwnership(SAFE_WALLET.ADMIN);
  console.log("- successfully transferred for lVaultUtils")

  await susdg.connect(DEPLOYER).transferOwnership(SAFE_WALLET.ADMIN);
  console.log("- successfully transferred for susdg")
  await musdg.connect(DEPLOYER).transferOwnership(SAFE_WALLET.ADMIN);
  console.log("- successfully transferred for musdg")
  await lusdg.connect(DEPLOYER).transferOwnership(SAFE_WALLET.ADMIN);
  console.log("- successfully transferred for lusdg")

  await solp.connect(DEPLOYER).transferOwnership(SAFE_WALLET.ADMIN);
  console.log("- successfully transferred for solp")
  await molp.connect(DEPLOYER).transferOwnership(SAFE_WALLET.ADMIN);
  console.log("- successfully transferred for molp")
  await lolp.connect(DEPLOYER).transferOwnership(SAFE_WALLET.ADMIN);
  console.log("- successfully transferred for lolp")

  await sOlpManager.connect(DEPLOYER).transferOwnership(SAFE_WALLET.ADMIN);
  console.log("- successfully transferred for sOlpManager")
  await mOlpManager.connect(DEPLOYER).transferOwnership(SAFE_WALLET.ADMIN);
  console.log("- successfully transferred for mOlpManager")
  await lOlpManager.connect(DEPLOYER).transferOwnership(SAFE_WALLET.ADMIN);
  console.log("- successfully transferred for lOlpManager")

  await sRewardTracker.connect(DEPLOYER).transferOwnership(SAFE_WALLET.ADMIN);
  console.log("- successfully transferred for sRewardTracker")
  await mRewardTracker.connect(DEPLOYER).transferOwnership(SAFE_WALLET.ADMIN);
  console.log("- successfully transferred for mRewardTracker")
  await lRewardTracker.connect(DEPLOYER).transferOwnership(SAFE_WALLET.ADMIN);
  console.log("- successfully transferred for lRewardTracker")

  await sRewardDistributor.connect(DEPLOYER).transferOwnership(SAFE_WALLET.ADMIN);
  console.log("- successfully transferred for sRewardDistributor")
  await mRewardDistributor.connect(DEPLOYER).transferOwnership(SAFE_WALLET.ADMIN);
  console.log("- successfully transferred for mRewardDistributor")
  await lRewardDistributor.connect(DEPLOYER).transferOwnership(SAFE_WALLET.ADMIN);
  console.log("- successfully transferred for lRewardDistributor")

  await sRewardRouterV2.connect(DEPLOYER).transferOwnership(SAFE_WALLET.ADMIN);
  console.log("- successfully transferred for sRewardRouterV2")
  await mRewardRouterV2.connect(DEPLOYER).transferOwnership(SAFE_WALLET.ADMIN);
  console.log("- successfully transferred for mRewardRouterV2")
  await lRewardRouterV2.connect(DEPLOYER).transferOwnership(SAFE_WALLET.ADMIN);
  console.log("- successfully transferred for lRewardRouterV2")
  
  await controller.connect(DEPLOYER).transferOwnership(SAFE_WALLET.ADMIN);
  console.log("- successfully transferred for controller")
  await positionManager.connect(DEPLOYER).transferOwnership(SAFE_WALLET.ADMIN);
  console.log("- successfully transferred for positionManager")
  await settleManager.connect(DEPLOYER).transferOwnership(SAFE_WALLET.ADMIN);
  console.log("- successfully transferred for settleManager")
  await feeDistributor.connect(DEPLOYER).transferOwnership(SAFE_WALLET.ADMIN);
  console.log("- successfully transferred for feeDistributor")
  
  await btcOptionsToken.connect(DEPLOYER).transferOwnership(SAFE_WALLET.ADMIN);
  console.log("- successfully transferred for btcOptionsToken")
  await ethOptionsToken.connect(DEPLOYER).transferOwnership(SAFE_WALLET.ADMIN);
  console.log("- successfully transferred for ethOptionsToken")

  await fastPriceEvents.connect(DEPLOYER).transferOwnership(SAFE_WALLET.ADMIN);
  console.log("- successfully transferred for fastPriceEvents")
  await fastPriceFeed.connect(DEPLOYER).transferOwnership(SAFE_WALLET.ADMIN);
  console.log("- successfully transferred for fastPriceFeed")
  await positionValueFeed.connect(DEPLOYER).transferOwnership(SAFE_WALLET.ADMIN);
  console.log("- successfully transferred for positionValueFeed")
  await settlePriceFeed.connect(DEPLOYER).transferOwnership(SAFE_WALLET.ADMIN);
  console.log("- successfully transferred for settlePriceFeed")
  await spotPriceFeed.connect(DEPLOYER).transferOwnership(SAFE_WALLET.ADMIN);
  console.log("- successfully transferred for spotPriceFeed")

  await primaryOracle.connect(DEPLOYER).transferOwnership(SAFE_WALLET.ADMIN);
  console.log("- successfully transferred for primaryOracle")
  await viewAggregator.connect(DEPLOYER).transferOwnership(SAFE_WALLET.ADMIN);
  console.log("- successfully transferred for viewAggregator")
  await referral.connect(DEPLOYER).transferOwnership(SAFE_WALLET.ADMIN);
  console.log("- successfully transferred for referral")

  console.log(await optionsAuthority.owner(), "await optionsAuthority.owner()");
  console.log(await vaultPriceFeed.owner(), "await vaultPriceFeed.owner()");
  console.log(await optionsMarket.owner(), "await optionsMarket.owner()");
  console.log(await sVault.owner(), "await sVault.owner()");
  console.log(await mVault.owner(), "await mVault.owner()");
  console.log(await lVault.owner(), "await lVault.owner()");
  console.log(await sVaultUtils.owner(), "await sVaultUtils.owner()");
  console.log(await mVaultUtils.owner(), "await mVaultUtils.owner()");
  console.log(await lVaultUtils.owner(), "await lVaultUtils.owner()");
  console.log(await susdg.owner(), "await susdg.owner()");
  console.log(await musdg.owner(), "await musdg.owner()");
  console.log(await lusdg.owner(), "await lusdg.owner()");
  console.log(await solp.owner(), "await solp.owner()");
  console.log(await molp.owner(), "await molp.owner()");
  console.log(await lolp.owner(), "await lolp.owner()");
  console.log(await sOlpManager.owner(), "await sOlpManager.owner()");
  console.log(await mOlpManager.owner(), "await mOlpManager.owner()");
  console.log(await lOlpManager.owner(), "await lOlpManager.owner()");
  console.log(await sRewardTracker.owner(), "await sRewardTracker.owner()");
  console.log(await mRewardTracker.owner(), "await mRewardTracker.owner()");
  console.log(await lRewardTracker.owner(), "await lRewardTracker.owner()");
  console.log(await sRewardDistributor.owner(), "await sRewardDistributor.owner()");
  console.log(await mRewardDistributor.owner(), "await mRewardDistributor.owner()");
  console.log(await lRewardDistributor.owner(), "await lRewardDistributor.owner()");
  console.log(await sRewardRouterV2.owner(), "await sRewardRouterV2.owner()");
  console.log(await mRewardRouterV2.owner(), "await mRewardRouterV2.owner()");
  console.log(await lRewardRouterV2.owner(), "await lRewardRouterV2.owner()");
  console.log(await controller.owner(), "await controller.owner()");
  console.log(await positionManager.owner(), "await positionManager.owner()");
  console.log(await settleManager.owner(), "await settleManager.owner()");
  console.log(await feeDistributor.owner(), "await feeDistributor.owner()");
  console.log(await btcOptionsToken.owner(), "await btcOptionsToken.owner()");
  console.log(await ethOptionsToken.owner(), "await ethOptionsToken.owner()");
  console.log(await fastPriceEvents.owner(), "await fastPriceEvents.owner()");
  console.log(await fastPriceFeed.owner(), "await fastPriceFeed.owner()");
  console.log(await positionValueFeed.owner(), "await positionValueFeed.owner()");
  console.log(await settlePriceFeed.owner(), "await settlePriceFeed.owner()");
  console.log(await spotPriceFeed.owner(), "await spotPriceFeed.owner()");
  console.log(await primaryOracle.owner(), "await primaryOracle.owner()");
  console.log(await viewAggregator.owner(), "await viewAggregator.owner()");
  console.log(await referral.owner(), "await referral.owner()");
};
