import BigNumber from "bignumber.js";
import { getDeployedContracts } from "./deployedContracts";
import { MIN_MARK_PRICES, mpReleaseDuration, OLP_TOKEN_INFO, referralDiscountRate, referralFeeRebateRate, rpReleaseDuration, settleFeeCalculationLimitRate, copyTradeFeeRebateRate, tradeFeeCalculationLimitRate } from "./constants";

BigNumber.config({
  EXPONENTIAL_AT: 1000,
  DECIMAL_PLACES: 18,
})

export const init = async (ethers: any, addressMap: any) => {
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
    viewAggregator,
    referral
  } = await getDeployedContracts(ethers, addressMap)
  
  const wbtcDecimal = await wbtc.decimals();
  const wethDecimal = await weth.decimals();
  const usdcDecimal = await usdc.decimals();
  const honeyDecimal = await honey.decimals();

  await optionsAuthority.connect(DEPLOYER).setKeeper(DEPLOYER.address, true);

  console.log("init VaultPriceFeed: set price feeds, token configs, and chainlink flag");  
  await vaultPriceFeed.connect(DEPLOYER).setPriceFeeds(
    CONTRACT_ADDRESS.FAST_PRICE_FEED,
    CONTRACT_ADDRESS.SETTLE_PRICE_FEED,
    CONTRACT_ADDRESS.POSITION_VALUE_FEED,
  )
  await vaultPriceFeed.connect(DEPLOYER).setTokenConfig(
    CONTRACT_ADDRESS.WBTC,
    wbtcDecimal,
    false
  );
  await vaultPriceFeed.connect(DEPLOYER).setTokenConfig(
    CONTRACT_ADDRESS.WETH,
    wethDecimal,
    false
  );
  await vaultPriceFeed.connect(DEPLOYER).setTokenConfig(
    CONTRACT_ADDRESS.USDC,
    usdcDecimal,
    true
  );
  await vaultPriceFeed.connect(DEPLOYER).setTokenConfig(
    CONTRACT_ADDRESS.HONEY,
    honeyDecimal,
    true
  );
  await vaultPriceFeed.connect(DEPLOYER).setPrimaryOracle(
    CONTRACT_ADDRESS.PRIMARY_ORACLE,
    false
  )
  await vaultPriceFeed.connect(DEPLOYER).setSecondarySpotPriceFeed(
    CONTRACT_ADDRESS.SPOT_PRICE_FEED,
    true
  )
  await vaultPriceFeed.connect(DEPLOYER).setPositionManager(
    CONTRACT_ADDRESS.POSITION_MANAGER
  )
  await vaultPriceFeed.connect(DEPLOYER).setMinMarkPrice(
    MIN_MARK_PRICES.BTC.INDEX,
    MIN_MARK_PRICES.BTC.VALUE
  )
  await vaultPriceFeed.connect(DEPLOYER).setMinMarkPrice(
    MIN_MARK_PRICES.ETH.INDEX,
    MIN_MARK_PRICES.ETH.VALUE
  )

  console.log("init OptionsMarket: add optionsToken");
  await optionsMarket.connect(DEPLOYER).setMainStableAsset(CONTRACT_ADDRESS.USDC);
  await (optionsMarket.connect(DEPLOYER)).addUnderlyingAsset(CONTRACT_ADDRESS.WBTC, CONTRACT_ADDRESS.BTC_OPTIONS_TOKEN);
  await (optionsMarket.connect(DEPLOYER)).addUnderlyingAsset(CONTRACT_ADDRESS.WETH, CONTRACT_ADDRESS.ETH_OPTIONS_TOKEN);

  console.log("init Vault: set contracts, and token configs");
  const vaults = [sVault, mVault, lVault];
  const vaultUtils = [sVaultUtils, mVaultUtils, lVaultUtils];
  const usdgs = [susdg, musdg, lusdg];
  const olpManagers = [sOlpManager, mOlpManager, lOlpManager];
  for (let i = 0; i < vaults.length; i++) {
    await vaults[i].connect(DEPLOYER).setContracts(
      vaultUtils[i].getAddress(),
      CONTRACT_ADDRESS.OPTIONS_MARKET,
      CONTRACT_ADDRESS.SETTLE_MANAGER,
      CONTRACT_ADDRESS.CONTROLLER,
      CONTRACT_ADDRESS.VAULT_PRICE_FEED,
      usdgs[i].getAddress()
    );
    await vaults[i].connect(DEPLOYER).setBufferAmount(CONTRACT_ADDRESS.WBTC, OLP_TOKEN_INFO.WBTC.BUFFER_AMOUNT);
    await vaults[i].connect(DEPLOYER).setBufferAmount(CONTRACT_ADDRESS.WETH, OLP_TOKEN_INFO.WETH.BUFFER_AMOUNT);
    await vaults[i].connect(DEPLOYER).setBufferAmount(CONTRACT_ADDRESS.USDC, OLP_TOKEN_INFO.USDC.BUFFER_AMOUNT);
    await vaults[i].connect(DEPLOYER).setBufferAmount(CONTRACT_ADDRESS.HONEY, OLP_TOKEN_INFO.HONEY.BUFFER_AMOUNT);
    await vaults[i].connect(DEPLOYER).setTokenConfig(CONTRACT_ADDRESS.WBTC, wbtcDecimal, OLP_TOKEN_INFO.WBTC.WEIGHT, OLP_TOKEN_INFO.WBTC.MAX_USDG_AMOUNT, true, false, OLP_TOKEN_INFO.WBTC.DECREASE_TOLERANCE_AMOUNT);
    await vaults[i].connect(DEPLOYER).setTokenConfig(CONTRACT_ADDRESS.WETH, wethDecimal, OLP_TOKEN_INFO.WETH.WEIGHT, OLP_TOKEN_INFO.WETH.MAX_USDG_AMOUNT, true, false, OLP_TOKEN_INFO.WETH.DECREASE_TOLERANCE_AMOUNT);
    await vaults[i].connect(DEPLOYER).setTokenConfig(CONTRACT_ADDRESS.USDC, usdcDecimal, OLP_TOKEN_INFO.USDC.WEIGHT, OLP_TOKEN_INFO.USDC.MAX_USDG_AMOUNT, false, true, OLP_TOKEN_INFO.USDC.DECREASE_TOLERANCE_AMOUNT);
    await vaults[i].connect(DEPLOYER).setTokenConfig(CONTRACT_ADDRESS.HONEY, honeyDecimal, OLP_TOKEN_INFO.HONEY.WEIGHT, OLP_TOKEN_INFO.HONEY.MAX_USDG_AMOUNT, false, true, OLP_TOKEN_INFO.HONEY.DECREASE_TOLERANCE_AMOUNT)
    await vaults[i].connect(DEPLOYER).setManager(olpManagers[i].getAddress(), true);
    await vaults[i].connect(DEPLOYER).setManager(CONTRACT_ADDRESS.SETTLE_MANAGER, true);
    await vaults[i].connect(DEPLOYER).setManager(CONTRACT_ADDRESS.CONTROLLER, true);
  }

  console.log("init VaultUtils: set vault release duration");
  for (let i = 0; i < vaultUtils.length; i++) {
    await vaultUtils[i].connect(DEPLOYER).setReleaseDuration(CONTRACT_ADDRESS.WBTC, mpReleaseDuration, BigInt(0)); // MP
    await vaultUtils[i].connect(DEPLOYER).setReleaseDuration(CONTRACT_ADDRESS.WETH, mpReleaseDuration, BigInt(0)); // MP
    await vaultUtils[i].connect(DEPLOYER).setReleaseDuration(CONTRACT_ADDRESS.USDC, mpReleaseDuration, BigInt(0)); // MP
    await vaultUtils[i].connect(DEPLOYER).setReleaseDuration(CONTRACT_ADDRESS.HONEY, mpReleaseDuration, BigInt(0)); // MP
    await vaultUtils[i].connect(DEPLOYER).setReleaseDuration(CONTRACT_ADDRESS.WBTC, rpReleaseDuration, BigInt(1)); // RP
    await vaultUtils[i].connect(DEPLOYER).setReleaseDuration(CONTRACT_ADDRESS.WETH, rpReleaseDuration, BigInt(1)); // RP
    await vaultUtils[i].connect(DEPLOYER).setReleaseDuration(CONTRACT_ADDRESS.USDC, rpReleaseDuration, BigInt(1)); // RP
    await vaultUtils[i].connect(DEPLOYER).setReleaseDuration(CONTRACT_ADDRESS.HONEY, rpReleaseDuration, BigInt(1)); // RP
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
  await fastPriceEvents.connect(DEPLOYER).setIsPriceFeed(fastPriceFeed.target, true);
  
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
  
  console.log("init OLP: set minter");
  await solp.connect(DEPLOYER).setMinter(CONTRACT_ADDRESS.S_OLP_MANAGER, true);
  await molp.connect(DEPLOYER).setMinter(CONTRACT_ADDRESS.M_OLP_MANAGER, true);
  await lolp.connect(DEPLOYER).setMinter(CONTRACT_ADDRESS.L_OLP_MANAGER, true);
  
  console.log("init OLP: set reward tracker as handler");
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

  console.log("init Authority: set contracts");
  await optionsAuthority.connect(DEPLOYER).setKeeper(KEEPER_OPTIONS_MARKET.address, true) // keeper that update option market
  await optionsAuthority.connect(DEPLOYER).setKeeper(KEEPER_SETTLE_OPERATOR.address, true) // keeper that feeds settle price
  await optionsAuthority.connect(DEPLOYER).setKeeper(KEEPER_POSITION_VALUE_FEEDER.address, true) // keeper that update position value
  await optionsAuthority.connect(DEPLOYER).setKeeper(KEEPER_POSITION_VALUE_FEEDER_SUB1.address, true) // keeper that update position value
  await optionsAuthority.connect(DEPLOYER).setKeeper(KEEPER_SPOT_PRICE_FEEDER.address, true) // keeper that feeds spot price
  await optionsAuthority.connect(DEPLOYER).setKeeper(KEEPER_SPOT_PRICE_FEEDER_SUB1.address, true) // keeper that feeds spot price
  await optionsAuthority.connect(DEPLOYER).setKeeper(KEEPER_FEE_DISTRIBUTOR.address, true) // keeper that distibute fee
  await optionsAuthority.connect(DEPLOYER).setKeeper(KEEPER_CLEARING_HOUSE.address, true) // keeper that update clearing house
  await optionsAuthority.connect(DEPLOYER).setPositionKeeper(KEEPER_POSITION_PROCESSOR.address, true);
  await optionsAuthority.connect(DEPLOYER).setFastPriceFeed(CONTRACT_ADDRESS.FAST_PRICE_FEED, true);
  await optionsAuthority.connect(DEPLOYER).setController(CONTRACT_ADDRESS.CONTROLLER, true);
  await optionsAuthority.connect(DEPLOYER).setFeeDistributor(CONTRACT_ADDRESS.FEE_DISTRIBUTOR, true);
}