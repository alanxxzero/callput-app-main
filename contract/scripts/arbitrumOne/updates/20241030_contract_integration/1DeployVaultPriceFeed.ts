import BigNumber from "bignumber.js";

import { getDeployedContracts } from "../../deployedContracts";
import { ethers, upgrades } from "hardhat";

BigNumber.config({
  EXPONENTIAL_AT: 1000,
  DECIMAL_PLACES: 80,
})

export async function deployVaultPriceFeed(ethers: any, addressMap: any) {
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
    // vaultPriceFeed,
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

  const [blockNumber, feeData] = await Promise.all([
    ethers.provider.getBlockNumber(),
    ethers.provider.getFeeData()
  ])
  console.log("Current block number:", blockNumber)
  console.log("Current fee data:", feeData)

  // 1. Deploy New VaultPriceFeed
  const VaultPriceFeedFactory = await ethers.getContractFactory("VaultPriceFeed");
  const VaultPriceFeedDeployed = await upgrades.deployProxy(VaultPriceFeedFactory, [CONTRACT_ADDRESS.OPTIONS_AUTHORITY]);
  const VaultPriceFeedAddress = await VaultPriceFeedDeployed.getAddress();
  const VaultPriceFeed = await ethers.getContractAt("VaultPriceFeed", VaultPriceFeedAddress);
  console.log("VaultPriceFeed deployed to:", VaultPriceFeedAddress);

  // 2. Deploy New PrimaryOracle
  const ArbitrumPrimaryOracleFactory = await ethers.getContractFactory("ArbitrumPrimaryOracle");
  const ArbitrumPrimaryOracleDeployed = await upgrades.deployProxy(ArbitrumPrimaryOracleFactory, [CONTRACT_ADDRESS.OPTIONS_AUTHORITY]);
  const ArbitrumPrimaryOracleAddress = await ArbitrumPrimaryOracleDeployed.getAddress();
  const ArbitrumPrimaryOracle = await ethers.getContractAt("ArbitrumPrimaryOracle", ArbitrumPrimaryOracleAddress);
  console.log("ArbitrumPrimaryOracle deployed to:", ArbitrumPrimaryOracleAddress);

  // 3. Set VaultPriceFeed
  const tx1 = await VaultPriceFeed.connect(DEPLOYER).setPriceFeeds(
    CONTRACT_ADDRESS.FAST_PRICE_FEED,
    CONTRACT_ADDRESS.SETTLE_PRICE_FEED,
    CONTRACT_ADDRESS.POSITION_VALUE_FEED
  )
  await tx1.wait();
  console.log("VaultPriceFeed set price feeds");

  const isPrimaryOracleEnabled = true;
  const isSecondaryOracleEnabled = true;
  const wbtcDecimal = 8;
  const wethDecimal = 18;
  const usdcDecimal = 6;

  const tx2 = await VaultPriceFeed.connect(DEPLOYER).setTokenConfig(
    CONTRACT_ADDRESS.WBTC,
    wbtcDecimal,
    false
  );
  await tx2.wait();
  console.log("VaultPriceFeed set wbtc config: ", CONTRACT_ADDRESS.WBTC, " / decimal: ", wbtcDecimal);

  const tx3 = await VaultPriceFeed.connect(DEPLOYER).setTokenConfig(
    CONTRACT_ADDRESS.WETH,
    wethDecimal,
    false
  );
  await tx3.wait();
  console.log("VaultPriceFeed set weth config: ", CONTRACT_ADDRESS.WETH, " / decimal: ", wethDecimal);

  const tx4 = await VaultPriceFeed.connect(DEPLOYER).setTokenConfig(
    CONTRACT_ADDRESS.USDC,
    usdcDecimal,
    true
  );
  await tx4.wait();
  console.log("VaultPriceFeed set usdc config: ", CONTRACT_ADDRESS.USDC, " / decimal: ", usdcDecimal);

  const tx5 = await VaultPriceFeed.connect(DEPLOYER).setPrimaryOracle(ArbitrumPrimaryOracleAddress, isPrimaryOracleEnabled);
  await tx5.wait();
  console.log("VaultPriceFeed set primary oracle: ", ArbitrumPrimaryOracleAddress, " / isEnabled: ", isPrimaryOracleEnabled);

  const tx6 = await VaultPriceFeed.connect(DEPLOYER).setSecondarySpotPriceFeed(CONTRACT_ADDRESS.SPOT_PRICE_FEED, isSecondaryOracleEnabled);
  await tx6.wait();
  console.log("VaultPriceFeed set secondary spot price feed: ", CONTRACT_ADDRESS.SPOT_PRICE_FEED, " / isEnabled: ", isSecondaryOracleEnabled);

  // 4. Check Get Functions
  const [primaryOracle, primaryOracleEnabled, secondarySpotPrice, secondaryOracleEnabled, fastPrice, settlePrice, positionValue] = await Promise.all([
    VaultPriceFeed.connect(DEPLOYER).primaryOracle(),
    VaultPriceFeed.connect(DEPLOYER).isPrimaryOracleEnabled(),
    VaultPriceFeed.connect(DEPLOYER).secondarySpotPriceFeed(),
    VaultPriceFeed.connect(DEPLOYER).isSecondarySpotEnabled(),
    VaultPriceFeed.connect(DEPLOYER).fastPriceFeed(),
    VaultPriceFeed.connect(DEPLOYER).settlePriceFeed(),
    VaultPriceFeed.connect(DEPLOYER).positionValueFeed()
  ])

  console.log("VaultPriceFeed primary oracle: ", primaryOracle);
  console.log("VaultPriceFeed primary oracle enabled: ", primaryOracleEnabled);
  console.log("VaultPriceFeed secondary spot price: ", secondarySpotPrice);
  console.log("VaultPriceFeed secondary oracle enabled: ", secondaryOracleEnabled);
  console.log("VaultPriceFeed fast price feed: ", fastPrice);
  console.log("VaultPriceFeed settle price feed: ", settlePrice);
  console.log("VaultPriceFeed position value feed: ", positionValue);

  // 5. Initialize PrimaryOracle
  const CHAINLINK_FLAGS = "0x3C14e07Edd0dC67442FA96f1Ec6999c57E810a83"
  const CHAINLINK_PRICE_FEED_WBTC = "0x6ce185860a4963106506C203335A2910413708e9"
  const CHAINLINK_PRICE_FEED_WETH = "0x639Fe6ab55C921f74e7fac1ee960C0B6293ba612"
  const CHAINLINK_PRICE_FEED_USDC = "0x50834F3163758fcC1Df9973b6e91f0F0F0434aD3"
  const CHAINLINK_TOKEN_DECIMALS = 8

  await ArbitrumPrimaryOracle.connect(DEPLOYER).setTokenConfig(
    CONTRACT_ADDRESS.WBTC,
    CHAINLINK_PRICE_FEED_WBTC,
    CHAINLINK_TOKEN_DECIMALS
  );
  await ArbitrumPrimaryOracle.connect(DEPLOYER).setTokenConfig(
    CONTRACT_ADDRESS.WETH,
    CHAINLINK_PRICE_FEED_WETH,
    CHAINLINK_TOKEN_DECIMALS
  );
  await ArbitrumPrimaryOracle.connect(DEPLOYER).setTokenConfig(
    CONTRACT_ADDRESS.USDC,
    CHAINLINK_PRICE_FEED_USDC,
    CHAINLINK_TOKEN_DECIMALS
  );
  await ArbitrumPrimaryOracle.connect(DEPLOYER).setChainlinkFlags(
    CHAINLINK_FLAGS
  );

  // 5. Result
  // VaultPriceFeed deployed to: 0x1fd9299A5a298a6ECEc643e6f60885fF2C15f22b
  // ArbitrumPrimaryOracle deployed to: 0xb2f1E1cba048e1efF0472b0E45944A93E038b2dF
  // VaultPriceFeed set price feeds
  // VaultPriceFeed set wbtc config:  0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f  / decimal:  8
  // VaultPriceFeed set weth config:  0x82aF49447D8a07e3bd95BD0d56f35241523fBab1  / decimal:  18
  // VaultPriceFeed set usdc config:  0xaf88d065e77c8cC2239327C5EDb3A432268e5831  / decimal:  6
  // VaultPriceFeed set primary oracle:  0xb2f1E1cba048e1efF0472b0E45944A93E038b2dF  / isEnabled:  true
  // VaultPriceFeed set secondary spot price feed:  0xeaa3BE0f53B780654e91e32CAC94c3625C58FE75  / isEnabled:  true
  // VaultPriceFeed primary oracle:  0xb2f1E1cba048e1efF0472b0E45944A93E038b2dF
  // VaultPriceFeed primary oracle enabled:  true
  // VaultPriceFeed secondary spot price:  0xeaa3BE0f53B780654e91e32CAC94c3625C58FE75
  // VaultPriceFeed secondary oracle enabled:  true
  // VaultPriceFeed fast price feed:  0xf77472c99AaBCDCf30412bf5c6E763deCDE49165
  // VaultPriceFeed settle price feed:  0x136937B91EA2635b94fecfAD44189aFeDd39f0AE
  // VaultPriceFeed position value feed:  0x4c16E62D93Aa82876BC4478C74BAe48EaAEFe6A1
}

(async () => {
  await deployVaultPriceFeed(ethers, null)
})()