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
    honey,
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
  const BerachainBArtioPrimaryOracleFactory = await ethers.getContractFactory("BerachainBArtioPrimaryOracle");
  const BerachainBArtioPrimaryOracleDeployed = await upgrades.deployProxy(BerachainBArtioPrimaryOracleFactory, [CONTRACT_ADDRESS.OPTIONS_AUTHORITY]);
  const BerachainBArtioPrimaryOracleAddress = await BerachainBArtioPrimaryOracleDeployed.getAddress();
  const BerachainBArtioPrimaryOracle = await ethers.getContractAt("BerachainBArtioPrimaryOracle", BerachainBArtioPrimaryOracleAddress);
  console.log("BerachainPrimaryOracle deployed to:", BerachainBArtioPrimaryOracleAddress);

  // 3. Set VaultPriceFeed
  const tx1 = await VaultPriceFeed.connect(DEPLOYER).setPriceFeeds(
    CONTRACT_ADDRESS.FAST_PRICE_FEED,
    CONTRACT_ADDRESS.SETTLE_PRICE_FEED,
    CONTRACT_ADDRESS.POSITION_VALUE_FEED
  )
  await tx1.wait();
  console.log("VaultPriceFeed set price feeds");

  const isPrimaryOracleEnabled = false;
  const isSecondaryOracleEnabled = true;
  const wbtcDecimal = await wbtc.decimals();
  const wethDecimal = await weth.decimals();
  const usdcDecimal = await usdc.decimals();
  const honeyDecimal = await honey.decimals();

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

  const tx5 = await VaultPriceFeed.connect(DEPLOYER).setTokenConfig(
    CONTRACT_ADDRESS.HONEY,
    honeyDecimal,
    true
  );
  await tx5.wait();
  console.log("VaultPriceFeed set honey config: ", CONTRACT_ADDRESS.HONEY, " / decimal: ", honeyDecimal);

  const tx6 = await VaultPriceFeed.connect(DEPLOYER).setPrimaryOracle(BerachainBArtioPrimaryOracleAddress, isPrimaryOracleEnabled);
  await tx6.wait();
  console.log("VaultPriceFeed set primary oracle: ", BerachainBArtioPrimaryOracleAddress, " / isEnabled: ", isPrimaryOracleEnabled);

  const tx7 = await VaultPriceFeed.connect(DEPLOYER).setSecondarySpotPriceFeed(CONTRACT_ADDRESS.SPOT_PRICE_FEED, isSecondaryOracleEnabled);
  await tx7.wait();
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

  // 5. Result
  // VaultPriceFeed deployed to: 0x039620d1f93dfD92B0937073967b6998219D9279
  // BerachainPrimaryOracle deployed to: 0xA08dc27D2962aD24e3C058e18867DD47F5a09720
  // VaultPriceFeed set price feeds
  // VaultPriceFeed set wbtc config:  0x2577D24a26f8FA19c1058a8b0106E2c7303454a4  / decimal:  8n
  // VaultPriceFeed set weth config:  0xE28AfD8c634946833e89ee3F122C06d7C537E8A8  / decimal:  18n
  // VaultPriceFeed set usdc config:  0xd6D83aF58a19Cd14eF3CF6fe848C9A4d21e5727c  / decimal:  6n
  // VaultPriceFeed set honey config:  0x0E4aaF1351de4c0264C5c7056Ef3777b41BD8e03  / decimal:  18n
  // VaultPriceFeed set primary oracle:  0xA08dc27D2962aD24e3C058e18867DD47F5a09720  / isEnabled:  false
  // VaultPriceFeed set secondary spot price feed:  0xb8bBD05803d2d169A88439364CD7F6D7F96eb277  / isEnabled:  true
  // VaultPriceFeed primary oracle:  0xA08dc27D2962aD24e3C058e18867DD47F5a09720
  // VaultPriceFeed primary oracle enabled:  false
  // VaultPriceFeed secondary spot price:  0xb8bBD05803d2d169A88439364CD7F6D7F96eb277
  // VaultPriceFeed secondary oracle enabled:  true
  // VaultPriceFeed fast price feed:  0x5Dc73DfD1b60f0CF9e8B8c57B09bB796C045EE3E
  // VaultPriceFeed settle price feed:  0x2444Df6311596735770eEB41D15b82A1B4bFDC38
  // VaultPriceFeed position value feed:  0x590896a6eFfCa7857696E2E7f027B30C35ca0Ef7
}

(async () => {
  await deployVaultPriceFeed(ethers, null)
})()