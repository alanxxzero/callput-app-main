import BigNumber from "bignumber.js";

import { getDeployedContracts } from "../../deployedContracts";
import { ethers, upgrades } from "hardhat";

BigNumber.config({
  EXPONENTIAL_AT: 1000,
  DECIMAL_PLACES: 80,
})

export async function operation(ethers: any, addressMap: any) {
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
  const tx3 = await mVault.setIsPositionEnabled(false);
  await tx3.wait();
  const tx4 = await mVault.setIsBuySellSwapEnabled(false);
  await tx4.wait();
  console.log("Trade and Deposit/Withdraw stopped")

  // 2. Operate changing the thresholdDays of vaults
  const responseBefore = await Promise.all([
    sVault.thresholdDays(),
    mVault.thresholdDays(),
    lVault.thresholdDays()
  ])

  console.log(
    "sVault thresholdDays:",
    responseBefore[0].toString(),
    "mVault thresholdDays:",
    responseBefore[1].toString(),
    "lVault thresholdDays:",
    responseBefore[2].toString()
  )

  // Don't change the thresholdDays of other vaults, because it's not necessary.
  const sVaultThresholdDays = 0 * 86400; // 0 days of thresholdDays

  const tx5 = await sVault.setThresholdDays(sVaultThresholdDays);
  await tx5.wait();

  const responseAfter = await Promise.all([
    sVault.thresholdDays(),
    mVault.thresholdDays(),
    lVault.thresholdDays()
  ])

  console.log(
    "sVault thresholdDays:",
    responseAfter[0].toString(),
    "mVault thresholdDays:",
    responseAfter[1].toString(),
    "lVault thresholdDays:",
    responseAfter[2].toString()
  )

  console.log("Completed.")
}

(async () => {
  await operation(ethers, null)
})()