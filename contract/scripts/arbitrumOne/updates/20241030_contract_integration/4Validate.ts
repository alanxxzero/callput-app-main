import BigNumber from "bignumber.js";

import { getDeployedContracts } from "../../deployedContracts";
import { ethers, upgrades } from "hardhat";

BigNumber.config({
  EXPONENTIAL_AT: 1000,
  DECIMAL_PLACES: 80,
})

export async function validateUpgrade(ethers: any, addressMap: any) {
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

  // 1. Check isNATSupported and Controller
  const isNATSupported = await controller.isNATSupported()
  const controllerAtSReward = await sRewardRouterV2.controller()
  const controllerAtMReward = await mRewardRouterV2.controller()
  const controllerAtLReward = await lRewardRouterV2.controller()
  console.log(
    "isNATSupported and Controller address test",
    isNATSupported,
    controllerAtSReward,
    controllerAtMReward,
    controllerAtLReward
  )

  // 2. VaultPriceFeed 주요 함수 동작
  const btcSettlePrice = await vaultPriceFeed.getSettlePrice(CONTRACT_ADDRESS.WBTC, "1730188800")
  const ethSettlePrice = await vaultPriceFeed.getSettlePrice(CONTRACT_ADDRESS.WETH, "1730188800")
  const sPositionValue = await vaultPriceFeed.getPVAndSign(CONTRACT_ADDRESS.S_VAULT)
  const mPositionValue = await vaultPriceFeed.getPVAndSign(CONTRACT_ADDRESS.M_VAULT)
  const btcSpotPrice = await vaultPriceFeed.getSpotPrice(CONTRACT_ADDRESS.WBTC, true)
  const ethSpotPrice = await vaultPriceFeed.getSpotPrice(CONTRACT_ADDRESS.WETH, true)
  const usdcSpotPrice = await vaultPriceFeed.getSpotPrice(CONTRACT_ADDRESS.USDC, true)
  console.log(
    "VaultPriceFeed functions test",
    btcSettlePrice.toString(),
    ethSettlePrice.toString(),
    sPositionValue.toString(),
    mPositionValue.toString(),
    btcSpotPrice.toString(),
    ethSpotPrice.toString(),
    usdcSpotPrice.toString()
  )

  // 3. 주요 컨트랙트의 VaultPriceFeed 주소 조회
  const controllerVaultPriceFeed = await controller.vaultPriceFeed()
  const sOlpManagerVaultPriceFeed = await sOlpManager.vaultPriceFeed()
  const mOlpManagerVaultPriceFeed = await mOlpManager.vaultPriceFeed()
  const lOlpManagerVaultPriceFeed = await lOlpManager.vaultPriceFeed()
  const sVaultVaultPriceFeed = await sVault.vaultPriceFeed()
  const mVaultVaultPriceFeed = await mVault.vaultPriceFeed()
  const lVaultVaultPriceFeed = await lVault.vaultPriceFeed()
  const viewAggreagtorVaultPriceFeed = await viewAggregator.vaultPriceFeed()
  console.log(
    "VaultPriceFeed address test",
    controllerVaultPriceFeed,
    sOlpManagerVaultPriceFeed,
    mOlpManagerVaultPriceFeed,
    lOlpManagerVaultPriceFeed,
    sVaultVaultPriceFeed,
    mVaultVaultPriceFeed,
    lVaultVaultPriceFeed,
    viewAggreagtorVaultPriceFeed
  )

  console.log("Upgrade validation success")
}

(async () => {
  await validateUpgrade(ethers, null)
})()