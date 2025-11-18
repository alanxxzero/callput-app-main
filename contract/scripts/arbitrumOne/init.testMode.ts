
import BigNumber from 'bignumber.js';
import { ethers, network } from "hardhat";
import { task } from "hardhat/config";
import { formatEther, parseEther } from "ethers";
import {getDeployedContracts} from "./deployedContracts";
import { HardhatRuntimeEnvironment } from "hardhat/types";

export async function initTestMode(ethers: any) {
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

  if (network.name != "local") {
    console.log("not test mode")
    return
  } else {
    console.log("test mode init")

    let {
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
    } = await getDeployedContracts(ethers, null);

    console.log("Deploying contracts with the account:", DEPLOYER.address);

    const deployerBalanceBefore = formatEther(
        await (ethers as any).provider.getBalance(DEPLOYER.address)
    )
    console.log("deployer balance : ", deployerBalanceBefore)

    // eth fund
    await fundETH(ethers, DEPLOYER.address)
    await fundETH(ethers, TEST_USER1.address)
    await fundETH(ethers, TEST_USER2.address)
    await optionsAuthority.connect(DEPLOYER).setPositionKeeper(TEST_USER1.address, true)
    await optionsAuthority.connect(DEPLOYER).setKeeper(TEST_USER1.address, true)
    await fastPriceFeed.connect(DEPLOYER).setMaxTimeDeviation(86400 * 2)
    await fastPriceFeed.connect(DEPLOYER).setUpdateDuration(3600 / 2)
    await spotPriceFeed.connect(DEPLOYER).setUpdateDuration(3600 / 2)
    await positionValueFeed.connect(DEPLOYER).setUpdateDuration(3600 / 2)
    await positionManager.connect(DEPLOYER).setMaxTimeDelay(8640000)
    await positionManager.connect(DEPLOYER).setPositionDeadlineBuffer(0)
    await sVault.connect(DEPLOYER).setThresholdDays(8640000)

    console.log('test eth funded')
  }


}

const fundETH = async (ethers: any, receiver: string) => {
  const funder = new ethers.Wallet("0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", ethers.provider);

  const balanceOfReceiver = await ethers.provider.getBalance(receiver)

  const fundAmount = parseEther("1000")

  if (balanceOfReceiver < parseEther("0.01")) {
    await funder.sendTransaction({ to: receiver, value: fundAmount })
    console.log(`funded to ${receiver}`)
  } else {
    const currentBalance = formatEther(balanceOfReceiver.toString())
    console.log(`already funded ${receiver}, balance: ${currentBalance})`)
  }
}

(async () => {
  await initTestMode(ethers)
})()