import BigNumber from "bignumber.js";

import { ethers } from "hardhat";
import { getDeployedContracts } from "./deployedContracts";
import { MaxUint256 } from "ethers"

BigNumber.config({
  EXPONENTIAL_AT: 1000,
  DECIMAL_PLACES: 80,
})

export async function initialDirectPoolDeposit(ethers: any) {

  const [
    deployer, 
    KEEPER_OPTIONS_MARKET,
    KEEPER_POSITION_PROCESSOR,
    KEEPER_SETTLE_OPERATOR,
    KEEPER_POSITION_VALUE_FEEDER,
    KEEPER_POSITION_VALUE_FEEDER_SUB1,
    KEEPER_SPOT_PRICE_FEEDER,
    KEEPER_SPOT_PRICE_FEEDER_SUB1,
    KEEPER_FEE_DISTRIBUTOR,
    KEEPER_CLEARING_HOUSE,
    user1, 
    user2
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
  } = await getDeployedContracts(ethers, undefined);

  const accountToFund = deployer.address

  let nonce = await ethers.provider.getTransactionCount(accountToFund)
  let balance = await ethers.provider.getBalance(accountToFund)

  console.log(accountToFund, 'accountToFund')
  console.log(balance, 'balance')

  const wethAddress = await weth.getAddress()
  const wbtcAddress = await wbtc.getAddress()
  const usdcAddress = await usdc.getAddress()

  const s_wbtcAmount = new BigNumber(1_000).multipliedBy(10 ** 8).toString();
  const s_wethAmount = new BigNumber(17_000).multipliedBy(10 ** 18).toString()
  const s_usdcAmount = new BigNumber(45_000_000).multipliedBy(10 ** 6).toString()
  
  const m_wbtcAmount = new BigNumber(1_100).multipliedBy(10 ** 8).toString();
  const m_wethAmount = new BigNumber(20_000).multipliedBy(10 ** 18).toString()
  const m_usdcAmount = new BigNumber(65_000_000).multipliedBy(10 ** 6).toString()

  const l_wbtcAmount = new BigNumber(1_000).multipliedBy(10 ** 8).toString();
  const l_wethAmount = new BigNumber(15_000).multipliedBy(10 ** 18).toString()
  const l_usdcAmount = new BigNumber(70_000_000).multipliedBy(10 ** 6).toString()

  const all_usdcAmount = new BigNumber(s_usdcAmount)
    .plus(m_usdcAmount)
    .plus(l_usdcAmount)
    .toString()

  const all_wbtcAmount = new BigNumber(s_wbtcAmount)
    .plus(m_wbtcAmount)
    .plus(l_wbtcAmount)
    .toString()

  const all_wethAmount = new BigNumber(s_wethAmount)
    .plus(m_wethAmount)
    .plus(l_wethAmount)
    .toString()

  await usdc.connect(deployer).mint(accountToFund, all_usdcAmount, { nonce: nonce++ });
  await wbtc.connect(deployer).mint(accountToFund, all_wbtcAmount, { nonce: nonce++ });
  await weth.connect(deployer).transfer(accountToFund, all_wethAmount, { nonce: nonce++ })

  const controllerAddress = await controller.getAddress()

  // approval
  await (wbtc.connect(deployer).approve(controllerAddress, MaxUint256, { nonce: nonce++ }))
  await (weth.connect(deployer).approve(controllerAddress, MaxUint256, { nonce: nonce++ }))
  await (usdc.connect(deployer).approve(controllerAddress, MaxUint256, { nonce: nonce++ }))

  // <S>
  // eth

  const sVaultAddress = await sVault.getAddress()
  const mVaultAddress = await mVault.getAddress()
  const lVaultAddress = await lVault.getAddress()

  await controller.connect(deployer).directPoolDeposit(sVaultAddress, wethAddress, s_wethAmount, { nonce: nonce++ })
  await controller.connect(deployer).directPoolDeposit(sVaultAddress, wbtcAddress, s_wbtcAmount, { nonce: nonce++ })
  await controller.connect(deployer).directPoolDeposit(sVaultAddress, usdcAddress, s_usdcAmount, { nonce: nonce++ })
  
  await controller.connect(deployer).directPoolDeposit(mVaultAddress, wethAddress, m_wethAmount, { nonce: nonce++ })
  await controller.connect(deployer).directPoolDeposit(mVaultAddress, wbtcAddress, m_wbtcAmount, { nonce: nonce++ })
  await controller.connect(deployer).directPoolDeposit(mVaultAddress, usdcAddress, m_usdcAmount, { nonce: nonce++ })
  
  await controller.connect(deployer).directPoolDeposit(lVaultAddress, wethAddress, l_wethAmount, { nonce: nonce++ })
  await controller.connect(deployer).directPoolDeposit(lVaultAddress, wbtcAddress, l_wbtcAmount, { nonce: nonce++ })
  await controller.connect(deployer).directPoolDeposit(lVaultAddress, usdcAddress, l_usdcAmount, { nonce: nonce++ })

  // check
  console.log(await sVault.poolAmounts(wethAddress), 'await sVault.poolAmounts(wethAddress)')
  console.log(await sVault.poolAmounts(wbtcAddress), 'await sVault.poolAmounts(wbtcAddress)')
  console.log(await sVault.poolAmounts(usdcAddress), 'await sVault.poolAmounts(usdcAddress)')
  
  console.log(await mVault.poolAmounts(wethAddress), 'await mVault.poolAmounts(wethAddress)')
  console.log(await mVault.poolAmounts(wbtcAddress), 'await mVault.poolAmounts(wbtcAddress)')
  console.log(await mVault.poolAmounts(usdcAddress), 'await mVault.poolAmounts(usdcAddress)')
  
  console.log(await lVault.poolAmounts(wethAddress), 'await lVault.poolAmounts(wethAddress)')
  console.log(await lVault.poolAmounts(wbtcAddress), 'await lVault.poolAmounts(wbtcAddress)')
  console.log(await lVault.poolAmounts(usdcAddress), 'await lVault.poolAmounts(usdcAddress)')
}

(async () => {
  await initialDirectPoolDeposit(ethers)
})()