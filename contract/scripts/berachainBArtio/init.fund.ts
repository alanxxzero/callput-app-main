
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

  console.log(`deployer balance before: ${deployerBalanceBefore}`)

  const targetAddresses = [
    KEEPER_OPTIONS_MARKET.address,
    KEEPER_POSITION_PROCESSOR.address,
    KEEPER_SETTLE_OPERATOR.address,
    KEEPER_POSITION_VALUE_FEEDER.address,
    KEEPER_POSITION_VALUE_FEEDER_SUB1.address,
    KEEPER_SPOT_PRICE_FEEDER.address,
    KEEPER_SPOT_PRICE_FEEDER_SUB1.address,
    KEEPER_FEE_DISTRIBUTOR.address,
    KEEPER_CLEARING_HOUSE.address,
  ]

  for (const address of targetAddresses) {
    const balanceOfAddress = await ethers.provider.getBalance(address)
    console.log(`balance of ${address}: ${formatEther(balanceOfAddress)}`)
  }

  // await fundETH(DEPLOYER, KEEPER_OPTIONS_MARKET.address, "0.05")
  // await fundETH(DEPLOYER, KEEPER_POSITION_PROCESSOR.address, "0.05")
  // await fundETH(DEPLOYER, KEEPER_SETTLE_OPERATOR.address, "4")
  await fundETH(DEPLOYER, KEEPER_POSITION_VALUE_FEEDER.address, "10")
  await fundETH(DEPLOYER, KEEPER_POSITION_VALUE_FEEDER_SUB1.address, "20")
  // await fundETH(DEPLOYER, KEEPER_SPOT_PRICE_FEEDER.address, "20")
  // await fundETH(DEPLOYER, KEEPER_SPOT_PRICE_FEEDER_SUB1.address, "0.05")
  // await fundETH(DEPLOYER, KEEPER_FEE_DISTRIBUTOR.address, "0.05")
  // await fundETH(DEPLOYER, KEEPER_CLEARING_HOUSE.address, "0.05")

  console.log('funding completed')

  for (const address of targetAddresses) {
    const balanceOfAddress = await ethers.provider.getBalance(address)
    console.log(`balance of ${address}: ${formatEther(balanceOfAddress)}`)
  }

  const deployerBalanceAfter = formatEther(
    await (ethers as any).provider.getBalance(DEPLOYER.address)
  )

  const txAfterFund = new BigNumber(deployerBalanceBefore).minus(deployerBalanceAfter).toString()
  console.log(`${txAfterFund} ETH used for funding`)
  console.log('operation completed')
}

const fundETH = async (sender: any, receiver: string, amount: string) => {
  const currentNonce = await sender.getNonce();

  const fundAmount = parseEther(amount)
  const tx = await sender.sendTransaction({
    to: receiver,
    value: fundAmount,
    nonce: currentNonce,
  })
  console.log(`tx: ${tx.hash}`)

  await tx.wait()

  console.log(`funded to ${receiver}`)
}

(async () => {
  await initFund(ethers)
})()