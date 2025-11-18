import BigNumber from "bignumber.js";
import { getDeployedContracts } from "./deployedContracts";
import { ethers } from "hardhat";
import { safeTx } from "../safeTx";

BigNumber.config({
  EXPONENTIAL_AT: 1000,
  DECIMAL_PLACES: 80,
})

export async function operation(ethers: any, addressMap: any) {
  const [
    DEPLOYER,
  ] = await (ethers as any).getSigners()
  const {
    CONTRACT_ADDRESS,
    optionsAuthority,
    vaultPriceFeed,
    optionsMarket,
    sVault,
    mVault,
    lVault,
    sVaultUtils,
    susdg,
    solp,
    sOlpManager,
    sRewardTracker,
    sRewardDistributor,
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
  } = await getDeployedContracts(ethers, addressMap);
  console.log("Starting operation with the account:", DEPLOYER.address)
  
  console.log("positionManager : ", await positionManager.getAddress())
  console.log("sVault : ", await sVault.getAddress())
  console.log("mVault : ", await mVault.getAddress())
  console.log("lVault : ", await lVault.getAddress())

  const txData1 = (await sVault.connect(DEPLOYER).setManager.populateTransaction(await positionManager.getAddress(), true)).data
  const txData2 = (await mVault.connect(DEPLOYER).setManager.populateTransaction(await positionManager.getAddress(), true)).data
  const txData3 = (await lVault.connect(DEPLOYER).setManager.populateTransaction(await positionManager.getAddress(), true)).data

  try {
    await safeTx(
      "", CONTRACT_ADDRESS.SAFE_ADDRESS, [
      { to: await sVault.getAddress(), data: txData1 },
      { to: await mVault.getAddress(), data: txData2 },
      { to: await lVault.getAddress(), data: txData3 },
    ], "", "", "https://transaction.safe.berachain.com/api")
  } catch (e) {
    console.log(e)
    return;
  }
  console.log("Operation completed")
}

(async () => {
  await operation(ethers, null)
})()