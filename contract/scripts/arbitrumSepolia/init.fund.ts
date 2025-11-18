
import BigNumber from 'bignumber.js';
import { ethers } from "hardhat";
import { formatEther, parseEther } from "ethers";

export async function initFund(ethers: any) {
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
  console.log("Deploying contracts with the account:", DEPLOYER.address);

  const deployerBalanceBefore = formatEther(
    await (ethers as any).provider.getBalance(DEPLOYER.address)
  )

  // eth fund
  await fundETH(ethers, KEEPER_OPTIONS_MARKET.address)
  await fundETH(ethers, KEEPER_POSITION_PROCESSOR.address)
  await fundETH(ethers, KEEPER_SETTLE_OPERATOR.address)
  await fundETH(ethers, KEEPER_POSITION_VALUE_FEEDER.address)
  await fundETH(ethers, KEEPER_POSITION_VALUE_FEEDER_SUB1.address)
  await fundETH(ethers, KEEPER_SPOT_PRICE_FEEDER.address)
  await fundETH(ethers, KEEPER_SPOT_PRICE_FEEDER_SUB1.address)
  await fundETH(ethers, KEEPER_FEE_DISTRIBUTOR.address)
  await fundETH(ethers, KEEPER_CLEARING_HOUSE.address)
  console.log('eth funded')

  const deployerBalanceAfter = formatEther(
    await (ethers as any).provider.getBalance(DEPLOYER.address)
  )

  const txAfterFund = new BigNumber(deployerBalanceBefore).minus(deployerBalanceAfter).toString()
  console.log(`${txAfterFund} ETH used for funding`)
}

const fundETH = async (ethers: any, receiver: string) => {
  const [DEPLOYER] = await (ethers as any).getSigners()

  const balanceOfReceiver = await ethers.provider.getBalance(receiver)

  const fundAmount = parseEther("0.05")

  if (balanceOfReceiver < parseEther("0.01")) {
    await DEPLOYER.sendTransaction({ to: receiver, value: fundAmount })
    console.log(`funded to ${receiver}`)
  } else {
    const currentBalance = formatEther(balanceOfReceiver.toString())
    console.log(`already funded ${receiver}, balance: ${currentBalance})`)
  }
}

(async () => {
  await initFund(ethers)
})()