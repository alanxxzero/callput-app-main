import BigNumber from "bignumber.js";

import { getDeployedContracts } from "./deployedContracts";
import { ethers } from "hardhat";
import { formatEther, parseEther } from "ethers";

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
    fastPriceEvents,
    fastPriceFeed,
    positionValueFeed,
    settlePriceFeed,
    spotPriceFeed,
    viewAggregator,
    referral
  } = await getDeployedContracts(ethers, addressMap);
  console.log("Start operating with the account:", DEPLOYER.address)

  // const [
  //   balanceOfDeployer,
  //   balanceOfKeeperOptionsMarket,
  //   balanceOfKeeperPositionProcessor,
  //   balanceOfKeeperSettleOperator,
  //   balanceOfKeeperPositionValueFeeder,
  //   balanceOfKeeperPositionValueFeederSub1,
  //   balanceOfKeeperSpotPriceFeeder,
  //   balanceOfKeeperSpotPriceFeederSub1,
  //   balanceOfKeeperFeeDistributor,
  //   balanceOfKeeperClearingHouse,
  // ] = await Promise.all([
  //   ethers.provider.getBalance(DEPLOYER.address), 
  //   ethers.provider.getBalance(KEEPER_OPTIONS_MARKET.address),
  //   ethers.provider.getBalance(KEEPER_POSITION_PROCESSOR.address),
  //   ethers.provider.getBalance(KEEPER_SETTLE_OPERATOR.address),
  //   ethers.provider.getBalance(KEEPER_POSITION_VALUE_FEEDER.address),
  //   ethers.provider.getBalance(KEEPER_POSITION_VALUE_FEEDER_SUB1.address),
  //   ethers.provider.getBalance(KEEPER_SPOT_PRICE_FEEDER.address),
  //   ethers.provider.getBalance(KEEPER_SPOT_PRICE_FEEDER_SUB1.address),
  //   ethers.provider.getBalance(KEEPER_FEE_DISTRIBUTOR.address),
  //   ethers.provider.getBalance(KEEPER_CLEARING_HOUSE.address),
  // ])

  // console.log(
  //   "balanceOfDeployer", formatEther(balanceOfDeployer), "\n",
  //   "balanceOfKeeperOptionsMarket", formatEther(balanceOfKeeperOptionsMarket), "\n",
  //   "balanceOfKeeperPositionProcessor", formatEther(balanceOfKeeperPositionProcessor), "\n",
  //   "balanceOfKeeperSettleOperator", formatEther(balanceOfKeeperSettleOperator), "\n",
  //   "balanceOfKeeperPositionValueFeeder", formatEther(balanceOfKeeperPositionValueFeeder), "\n",
  //   "balanceOfKeeperPositionValueFeederSub1", formatEther(balanceOfKeeperPositionValueFeederSub1), "\n",
  //   "balanceOfKeeperSpotPriceFeeder", formatEther(balanceOfKeeperSpotPriceFeeder), "\n",
  //   "balanceOfKeeperSpotPriceFeederSub1", formatEther(balanceOfKeeperSpotPriceFeederSub1), "\n",
  //   "balanceOfKeeperFeeDistributor", formatEther(balanceOfKeeperFeeDistributor), "\n",
  //   "balanceOfKeeperClearingHouse", formatEther(balanceOfKeeperClearingHouse),  
  // )

  // const amount = parseEther("3")

  // await DEPLOYER.sendTransaction({
  //   to: KEEPER_OPTIONS_MARKET.address,
  //   value: amount
  // }),
  // await DEPLOYER.sendTransaction({
  //   to: KEEPER_POSITION_VALUE_FEEDER.address,
  //   value: amount
  // }),
  // await DEPLOYER.sendTransaction({
  //   to: KEEPER_POSITION_VALUE_FEEDER_SUB1.address,
  //   value: amount
  // }),
  // await DEPLOYER.sendTransaction({
  //   to: KEEPER_SPOT_PRICE_FEEDER_SUB1.address,
  //   value: amount
  // })

  const addresses = [
    "0x0ed475ee727854d59De0C4B4057405e6e4d80193",
    "0xBC1798B0F494584F8DbE9a94205Fc32A5446deAc",
    "0xC7b9D637059e1d3A6ff1131c5020aaD14E3dcC72",
    "0x6Eb1076b0174AB13c981A0c2F3A1FA83A3e215c0",
    "0xaB8847bb40E2163Cc550eDf5fa92B6C62B7A33fa",
    "0xcFA13eFc46195806BAb6716D7Ab1A31076fA4d40"
  ]

  // for (let i = 0; i < addresses.length; i++) {
  //   await DEPLOYER.sendTransaction({
  //     to: addresses[i],
  //     value: parseEther("1")
  //   })
  //   console.log("Sent 1 eth to", addresses[i])
  // }

  for (let i = 0; i < addresses.length; i++) {
    await wbtc.connect(DEPLOYER).transfer(addresses[i], new BigNumber(10).pow(8).toString())
    await weth.connect(DEPLOYER).transfer(addresses[i], new BigNumber(10).multipliedBy(new BigNumber(10).pow(18)).toString())
    await usdc.connect(DEPLOYER).transfer(addresses[i], new BigNumber(1000).multipliedBy(new BigNumber(10).pow(6)).toString())
    console.log("Sent 1 wbtc, 10 weth, 10000 usdc to", addresses[i])
  }

  console.log("Operation completed")
}

(async () => {
  await operation(ethers, null)
})()