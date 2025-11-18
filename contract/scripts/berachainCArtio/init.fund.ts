
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
  console.log("Init fund with the account:", DEPLOYER.address);

  const deployerBalanceBefore = formatEther(
    await (ethers as any).provider.getBalance(DEPLOYER.address)
  )

  const fundAmount = parseEther("0.4")

  await fundETH(ethers, KEEPER_OPTIONS_MARKET.address, fundAmount)
  await fundETH(ethers, KEEPER_SETTLE_OPERATOR.address, fundAmount)
  await fundETH(ethers, KEEPER_POSITION_VALUE_FEEDER.address, fundAmount)
  await fundETH(ethers, KEEPER_POSITION_VALUE_FEEDER_SUB1.address, fundAmount)
  await fundETH(ethers, KEEPER_SPOT_PRICE_FEEDER.address, fundAmount)
  await fundETH(ethers, KEEPER_SPOT_PRICE_FEEDER_SUB1.address, fundAmount)
  await fundETH(ethers, KEEPER_FEE_DISTRIBUTOR.address, fundAmount)
  await fundETH(ethers, KEEPER_CLEARING_HOUSE.address, fundAmount)
  await fundETH(ethers, KEEPER_POSITION_PROCESSOR.address, fundAmount)
  console.log("Init fund done");

  const deployerBalanceAfter = formatEther(
    await (ethers as any).provider.getBalance(DEPLOYER.address)
  )

  const txAfterFund = new BigNumber(deployerBalanceBefore).minus(deployerBalanceAfter).toString()
  console.log(`${txAfterFund} ETH used for funding`)
}

const fundETH = async (ethers: any, receiver: string, fundAmount: bigint) => {
  const [DEPLOYER] = await (ethers as any).getSigners();
  const balanceBefore = await ethers.provider.getBalance(receiver);
  const parsedBalanceBefore = formatEther(balanceBefore.toString());

  console.log(`funding to ${receiver}, balance: ${parsedBalanceBefore}`)

  if (balanceBefore >= fundAmount) {
    console.log(`funded already to ${receiver}`);
  } else {
    await DEPLOYER.sendTransaction({ to: receiver, value: fundAmount })
    const balanceAfter = await ethers.provider.getBalance(receiver);
    const parsedBalanceAfter = formatEther(balanceAfter.toString());
    console.log(`funded to ${receiver}, balance: ${parsedBalanceAfter}`)
  }
}

(async () => {
  await initFund(ethers)
})()