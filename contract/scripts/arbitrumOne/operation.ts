import BigNumber from "bignumber.js";

import OptionsAuthorityAbi from "../../../shared/abis/OptionsAuthority.json"
import VaultPriceFeedAbi from "../../../shared/abis/VaultPriceFeed.json"
import OptionsMarketAbi from "../../../shared/abis/OptionsMarket.json"
import OptionsTokenAbi from "../../../shared/abis/OptionsToken.json"
import VaultAbi from "../../../shared/abis/Vault.json"
import VaultUtilsAbi from "../../../shared/abis/VaultUtils.json"
import OlpAbi from "../../../shared/abis/OLP.json"
import OlpManagerAbi from "../../../shared/abis/OlpManager.json"
import RewardTrackerAbi from "../../../shared/abis/RewardTracker.json"
import RewardDistributorAbi from "../../../shared/abis/RewardDistributor.json"
import ControllerAbi from "../../../shared/abis/Controller.json"
import PositionManagerAbi from "../../../shared/abis/PositionManager.json"
import FeeDistributorAbi from "../../../shared/abis/FeeDistributor.json"
import FastPriceFeedAbi from "../../../shared/abis/FastPriceFeed.json"
import PositionValueFeedAbi from "../../../shared/abis/PositionValueFeed.json"
import SettlePriceFeedAbi from "../../../shared/abis/SettlePriceFeed.json"
import SpotPriceFeedAbi from "../../../shared/abis/SpotPriceFeed.json"
import ViewAggregatorAbi from "../../../shared/abis/ViewAggregator.json"
import Erc20Abi from "../../../shared/abis/ERC20.json"

import { getDeployedContracts } from "./deployedContracts";
import { ethers, upgrades } from "hardhat";
import { parseOptionTokenId } from "../../utils/format";
import { CancelClosePositionTopic, ClearPositionTopic, CloseSellPositionTopic, CreateClosePositionTopic, db, getLogs, handleCancelClosePosition, handleClearPosition, handleCloseSellPosition, handleCreateClosePosition, handleOpenSellPosition, OpenSellPositionTopic } from "../handler";

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

  // const b = await mVault.poolAmounts(CONTRACT_ADDRESS.WBTC)
  // const c = await lVault.poolAmounts(CONTRACT_ADDRESS.WBTC)

  const a = await mVault.emergencyWithdrawERC20(DEPLOYER.address);
  console.log(a, "a")
  // console.log(backupAdmin, "backupAdmin")

  // const a = await sVault.poolAmounts(CONTRACT_ADDRESS.WBTC)
  // const b = await mVault.poolAmounts(CONTRACT_ADDRESS.WBTC)
  // const c = await lVault.poolAmounts(CONTRACT_ADDRESS.WBTC)
  // console.log(a, "a")
  // console.log(b, "b")
  // console.log(c, "c")
  

  // const forceTxOptions = {
  //   gasLimit: 2000000,  // 30M gas
  //   gasPrice: ethers.parseUnits("2", "gwei"), // 2 gwei
  // };

  // const tx = await mRewardRouterV2.connect(DEPLOYER).unstakeAndRedeemOlp(
  //   CONTRACT_ADDRESS.WETH,
  //   new BigNumber(100).multipliedBy(10 ** 18).toString(),
  //   0,
  //   DEPLOYER.address,
  //   forceTxOptions
  // );

  // 새로운 owner의 주소 설정
  const NEW_OWNER = "0x5bF4ADfC2b9b97AADfBa4B5191c7aadAd3ed7D1B";

  try {



    // await optionsAuthority.transferOwnership(NEW_OWNER);
    // console.log("optionsAuthority ownership transferred to:", NEW_OWNER);
    // await vaultPriceFeed.transferOwnership(NEW_OWNER);
    // console.log("vaultPriceFeed ownership transferred to:", NEW_OWNER);
    // await optionsMarket.transferOwnership(NEW_OWNER);
    // console.log("optionsMarket ownership transferred to:", NEW_OWNER);
    // await sVault.transferOwnership(NEW_OWNER);
    // console.log("sVault ownership transferred to:", NEW_OWNER);
    // await mVault.transferOwnership(NEW_OWNER);
    // console.log("mVault ownership transferred to:", NEW_OWNER);
    // await lVault.transferOwnership(NEW_OWNER);
    // console.log("lVault ownership transferred to:", NEW_OWNER);
    // await sVaultUtils.transferOwnership(NEW_OWNER);
    // console.log("sVaultUtils ownership transferred to:", NEW_OWNER);
    // await mVaultUtils.transferOwnership(NEW_OWNER);
    // console.log("mVaultUtils ownership transferred to:", NEW_OWNER);
    // await lVaultUtils.transferOwnership(NEW_OWNER);
    // console.log("lVaultUtils ownership transferred to:", NEW_OWNER);
    // await susdg.transferOwnership(NEW_OWNER);
    // console.log("susdg ownership transferred to:", NEW_OWNER);
    // await musdg.transferOwnership(NEW_OWNER);
    // console.log("musdg ownership transferred to:", NEW_OWNER);
    // await lusdg.transferOwnership(NEW_OWNER);
    // console.log("lusdg ownership transferred to:", NEW_OWNER);
    // await solp.transferOwnership(NEW_OWNER);
    // console.log("solp ownership transferred to:", NEW_OWNER);
    // await molp.transferOwnership(NEW_OWNER);
    // console.log("molp ownership transferred to:", NEW_OWNER);
    // await lolp.transferOwnership(NEW_OWNER);
    // console.log("lolp ownership transferred to:", NEW_OWNER);
    // await sOlpManager.transferOwnership(NEW_OWNER);
    // console.log("sOlpManager ownership transferred to:", NEW_OWNER);
    // await mOlpManager.transferOwnership(NEW_OWNER);
    // console.log("mOlpManager ownership transferred to:", NEW_OWNER);
    // await lOlpManager.transferOwnership(NEW_OWNER);
    // console.log("lOlpManager ownership transferred to:", NEW_OWNER);
    // await sRewardTracker.transferOwnership(NEW_OWNER);
    // console.log("sRewardTracker ownership transferred to:", NEW_OWNER);
    // await mRewardTracker.transferOwnership(NEW_OWNER);
    // console.log("mRewardTracker ownership transferred to:", NEW_OWNER);
    // await lRewardTracker.transferOwnership(NEW_OWNER)

    // await mOlpManager.setCooldownDuration(86400)
    
  } catch (error) {
    
  }

  
  
  // try {
    
  //   // // 현재 proxy admin owner 확인
  //   // const proxyAdmin = await upgrades.admin.getInstance();
  //   // const currentAdminOwner = await proxyAdmin.owner();
  //   // console.log("Current proxy admin owner:", currentAdminOwner);

  //   // // proxy admin ownership 이전 실행
  //   // console.log("Transferring proxy admin ownership to:", NEW_OWNER);
  //   // const tx = await upgrades.admin.transferProxyAdminOwnership(proxyAdmin.address, NEW_OWNER);
  //   // await tx.wait();
    
  //   // // 새로운 proxy admin owner 확인
  //   // const newAdminOwner = await proxyAdmin.owner();
  //   // console.log("New proxy admin owner:", newAdminOwner);

  //   // if (newAdminOwner.toLowerCase() !== NEW_OWNER.toLowerCase()) {
  //   //   throw new Error("Proxy admin ownership transfer failed");
  //   // }

  // } catch (error) {
  //   console.error("Error during proxy admin ownership transfer:", error);
  //   throw error;
  // }

  
  
  
  // try {
  //   console.log("Attempting force transaction...");

  //   // 1. 가스 제한과 가격을 매우 높게 설정
  //   const forceTxOptions = {
  //     gasLimit: 30000000,  // 높은 가스 제한
  //     gasPrice: ethers.parseUnits("1", "gwei"), // 최소 가스비
  //   };

  //   // 2. 트랜잭션 강제 실행
  //   const tx = await sVaultUtils
  //     .connect(DEPLOYER)
  //     .prepareExpiriesToSettle(forceTxOptions);

  //   console.log("Transaction sent:", tx.hash);
    
  //   // 3. 트랜잭션 영수증 대기
  //   const receipt = await tx.wait();
  //   console.log("Transaction confirmed:", receipt.transactionHash);
  // } catch (error) {
  //   console.log(error)
  // }
  

  // await positionManager.connect(DEPLOYER).setCopyTradeFeeRebateRate(3000);

  // const a = await positionManager.copyTradeFeeRebateRate();
  // console.log(a.toString())

  // const a = await sOlpManager.getPrice(true);
  // console.log(a, "a")

  // const b = await sOlpManager.getTotalOlpAssetUsd(true);
  // console.log(b, "b")

  // const c = await vaultPriceFeed.getPVAndSign(CONTRACT_ADDRESS.S_VAULT)
  // console.log(c, "c")

  // const result = new BigNumber(b[6])
  //   .minus(new BigNumber(c[0]))
  //   .toString()
  // console.log(result, "result")

  // const supply = await solp.totalSupply();
  // console.log(supply.toString(), "supply")

  // const price = new BigNumber(result).dividedBy(new BigNumber(supply)).toString()
  // console.log(price, "price")



  // /*
  //  * [2024-08-21] Deploy Social 0DTE
  //  */
  // await sVault.connect(DEPLOYER).setIsPositionEnabled(false);
  // await mVault.connect(DEPLOYER).setIsPositionEnabled(false);
  // console.log("Position disabled")
  // console.log("=====================================")

  // const PositionManager = "PositionManager";
  // const PositionManagerFactory = await ethers.getContractFactory(PositionManager)
  // console.log("target proxy : ", PositionManager);
  // console.log("start upgrading proxy : ", CONTRACT_ADDRESS.POSITION_MANAGER)
  // const positionManagerAfterUpgrades = await upgrades.upgradeProxy(CONTRACT_ADDRESS.POSITION_MANAGER, PositionManagerFactory)
  // console.log("upgrade complete : ", PositionManager)
  // console.log("=====================================")

  // const Vault = "Vault";
  // const VaultFactory = await ethers.getContractFactory(Vault)
  // console.log("target proxy : ", Vault);
  // console.log("start upgrading proxy : ", CONTRACT_ADDRESS.S_VAULT)
  // const sVaultAfterUpgrades = await upgrades.upgradeProxy(CONTRACT_ADDRESS.S_VAULT, VaultFactory, {unsafeSkipStorageCheck: true})
  // console.log("start upgrading proxy : ", CONTRACT_ADDRESS.M_VAULT)
  // const mVaultAfterUpgrades = await upgrades.upgradeProxy(CONTRACT_ADDRESS.M_VAULT, VaultFactory, {unsafeSkipStorageCheck: true})
  // console.log("start upgrading proxy : ", CONTRACT_ADDRESS.L_VAULT)
  // const lVaultAfterUpgrades = await upgrades.upgradeProxy(CONTRACT_ADDRESS.L_VAULT, VaultFactory, {unsafeSkipStorageCheck: true})
  // console.log("upgrade complete : ", Vault)
  // console.log("=====================================")

  // const VaultUtils = "VaultUtils";
  // const VaultUtilsFactory = await ethers.getContractFactory(VaultUtils)
  // console.log("target proxy : ", VaultUtils);
  // console.log("start upgrading proxy : ", CONTRACT_ADDRESS.S_VAULT_UTILS)
  // const sVaultUtilsAfterUpgrades = await upgrades.upgradeProxy(CONTRACT_ADDRESS.S_VAULT_UTILS, VaultUtilsFactory)
  // console.log("start upgrading proxy : ", CONTRACT_ADDRESS.M_VAULT_UTILS)
  // const mVaultUtilsAfterUpgrades = await upgrades.upgradeProxy(CONTRACT_ADDRESS.M_VAULT_UTILS, VaultUtilsFactory)
  // console.log("start upgrading proxy : ", CONTRACT_ADDRESS.L_VAULT_UTILS)
  // const lVaultUtilsAfterUpgrades = await upgrades.upgradeProxy(CONTRACT_ADDRESS.L_VAULT_UTILS, VaultUtilsFactory)
  // console.log("upgrade complete : ", VaultUtils)
  // console.log("=====================================")

  // await sVaultAfterUpgrades.setContracts(CONTRACT_ADDRESS.S_VAULT_UTILS, CONTRACT_ADDRESS.OPTIONS_MARKET, CONTRACT_ADDRESS.SETTLE_MANAGER, CONTRACT_ADDRESS.CONTROLLER, CONTRACT_ADDRESS.VAULT_PRICE_FEED, CONTRACT_ADDRESS.S_USDG)
  // await mVaultAfterUpgrades.setContracts(CONTRACT_ADDRESS.M_VAULT_UTILS, CONTRACT_ADDRESS.OPTIONS_MARKET, CONTRACT_ADDRESS.SETTLE_MANAGER, CONTRACT_ADDRESS.CONTROLLER, CONTRACT_ADDRESS.VAULT_PRICE_FEED, CONTRACT_ADDRESS.M_USDG)
  // await lVaultAfterUpgrades.setContracts(CONTRACT_ADDRESS.L_VAULT_UTILS, CONTRACT_ADDRESS.OPTIONS_MARKET, CONTRACT_ADDRESS.SETTLE_MANAGER, CONTRACT_ADDRESS.CONTROLLER, CONTRACT_ADDRESS.VAULT_PRICE_FEED, CONTRACT_ADDRESS.L_USDG)
  // console.log("setContracts complete")

  // await sVaultUtilsAfterUpgrades.setPositionManager(CONTRACT_ADDRESS.POSITION_MANAGER)
  // await mVaultUtilsAfterUpgrades.setPositionManager(CONTRACT_ADDRESS.POSITION_MANAGER)
  // await lVaultUtilsAfterUpgrades.setPositionManager(CONTRACT_ADDRESS.POSITION_MANAGER)
  // console.log("setPositionManager complete")

  // await sVault.connect(DEPLOYER).setIsPositionEnabled(true);
  // await mVault.connect(DEPLOYER).setIsPositionEnabled(true);
  // console.log("Position disabled")
  // console.log("=====================================")





  /*
   * [2024-08-20] Add Settle Manager as Manager to Vault
   */
  // await sVault.connect(DEPLOYER).setManager(CONTRACT_ADDRESS.SETTLE_MANAGER, true);
  // await mVault.connect(DEPLOYER).setManager(CONTRACT_ADDRESS.SETTLE_MANAGER, true);
  // await lVault.connect(DEPLOYER).setManager(CONTRACT_ADDRESS.SETTLE_MANAGER, true);
  // console.log("Settle Manager added as Manager to Vault")

  /*
   * [2024-08-20] Add Settle Manager as Plugin to Controller
   */
  // await controller.addPlugin(CONTRACT_ADDRESS.SETTLE_MANAGER);

  /*
   * [2024-08-20] Deploy Settle Manager
   */
  // const SettleManager = await ethers.getContractFactory("SettleManager")
  // const settleManager = await upgrades.deployProxy(SettleManager, [
  //   CONTRACT_ADDRESS.OPTIONS_MARKET,
  //   CONTRACT_ADDRESS.CONTROLLER,
  //   CONTRACT_ADDRESS.WBERA,
  //   CONTRACT_ADDRESS.OPTIONS_AUTHORITY
  // ])
  
  // CONTRACT_ADDRESS.SETTLE_MANAGER = await settleManager.getAddress()

  // console.log(CONTRACT_ADDRESS.SETTLE_MANAGER, 'CONTRACT_ADDRESS.SETTLE_MANAGER')




























  
  /* 
   *
   * Get Logs
   *
   */ 
  // const startBlock = 1280000;
  // const endBlock = 2737721;

  // const schedules = [
  //   { address: CONTRACT_ADDRESS.CONTROLLER, topic: ClearPositionTopic, abi: ControllerAbi, handler: handleClearPosition },
  //   // { address: CONTRACT_ADDRESS.POSITION_MANAGER, topic: CancelClosePositionTopic, abi: PositionManagerAbi, handler: handleCancelClosePosition },
  //   // { address: CONTRACT_ADDRESS.CONTROLLER, topic: OpenSellPositionTopic, abi: ControllerAbi, handler: handleOpenSellPosition },
  //   // { address: CONTRACT_ADDRESS.POSITION_MANAGER, topic: CreateClosePositionTopic, abi: PositionManagerAbi, handler: handleCreateClosePosition },
  //   // { address: CONTRACT_ADDRESS.CONTROLLER, topic: CloseSellPositionTopic, abi: ControllerAbi, handler: handleCloseSellPosition },
  // ]

  // for (let i = 1280000; i < 2737721; i += 10000) {
  //   for await (const { address, topic, abi, handler } of schedules) {
  //     await getLogs(ethers, i, i + 9999, address, topic, abi, handler)
  //   }

  //   console.log(db, "db")
  // }
  





  /* 
   *
   * Add Affiliates
   *
   */
  
  // // 2024-08-29
  // const affiliatesToAdd = [
  //   "0x168d8B164bC37820C3Cb9E49B6E8b788b3D9366B",
  // ]

  // // 2024-07-10
  // const affiliatesToAdd = [
  //   "0x73572065b5a52c8CbFEBF0630072EAAf90f10bB9",
  //   "0x4d11d8edcA605E92965339Ca3aF5447111111111",
  //   "0xca288eabadc6ed48cda2440a5b068cda8ae9995e"
  // ]

  // // 2024-09-19
  // const affiliatesToAdd = [
  //   "0x20F4AC652a45DA0B1c1ff14ffCF23Fa26f80d78e",
  // ]

  // const accountsBatch = []
  // const discountRatesBatch = []
  // const feeRebateRateBatch = []

  // for (let i = 0; i < affiliatesToAdd.length; i++) {
  //   accountsBatch.push(affiliatesToAdd[i])
  //   discountRatesBatch.push(1500)
  //   feeRebateRateBatch.push(3000)
  // }

  // await referral.addToAffiliatesInBatch(
  //   accountsBatch,
  //   discountRatesBatch,
  //   feeRebateRateBatch
  // )

  // for (let i = 0; i < affiliatesToAdd.length; i++) {
  //   const affiliatesDiscountRate = await referral.affiliatesDiscountRate(affiliatesToAdd[i])
  //   const affiliateFeeRebateRate = await referral.affiliatesFeeRebateRate(affiliatesToAdd[i])
  //   console.log(affiliatesToAdd[i], ":", affiliatesDiscountRate.toString() + " / " + affiliateFeeRebateRate.toString())
  // }




  
  /* 
   *
   * Add Partners
   *
   */

  // // 2024-07-24
  // const partnersToAdd = [
  //   "0x5215B4ee0914eA3C62Aa1d059837293C5d2ccEEf"
  // ]
  // const discountRatesToAdd = [
  //   0
  // ]
  // const termsToAdd = [
  //   253402300740    
  // ]

  // // 2024-10-01
  // const partnersToAdd = [
  //   "0xF23E84d4D510C5a95c6b12de8aEc1f3Db0e10363",
  //   "0xcFA13eFc46195806BAb6716D7Ab1A31076fA4d40"
  // ]
  // const discountRatesToAdd = [
  //   3000,
  //   3000
  // ]
  // const termsToAdd = [
  //   253402300740,
  //   253402300740
  // ]

  // // 2024-10-10
  // const partnersToAdd = [
  //   "0xcFA13eFc46195806BAb6716D7Ab1A31076fA4d40",
  //   "0xcE56a24463AdF9bAF8043606867605a2849794a7",
  // ]
  // const isPartner = [
  //   true,
  //   true
  // ]
  // const discountRatesToAdd = [
  //   5000,
  //   5000
  // ]
  // const termsToAdd = [
  //   253402300740,
  //   253402300740
  // ]
  
  // for (let i = 0; i < partnersToAdd.length; i++) {
  //   console.log("working on ", partnersToAdd[i], " at discount rate of ", discountRatesToAdd[i], "..")
  //   await referral.setPartner(partnersToAdd[i], isPartner[i], discountRatesToAdd[i], termsToAdd[i])
  // }

  // // Check
  // for (let i = 0; i < partnersToAdd.length; i++) {
  //   const isPartner = await referral.partners(partnersToAdd[i])
  //   const discountRate = await referral.partnersDiscountRate(partnersToAdd[i])
  //   const term = await referral.partnersTerm(partnersToAdd[i])
  //   console.log(partnersToAdd[i], ":", isPartner.toString() + " / " + discountRate.toString() + " / " + term.toString())
  // }
  





  /* 
   *
   * Set Buffer Amount
   *
   */

  // const vaults = [sVault, mVault, lVault];

  // const WBTC = "0x286F1C3f0323dB9c91D1E8f45c8DF2d065AB5fae"
  // const WBTC_DECIMAL = 8
  // const WETH = "0x6E1E9896e93F7A71ECB33d4386b49DeeD67a231A"
  // const WETH_DECIMAL = 18
  // const USDC = "0xd6D83aF58a19Cd14eF3CF6fe848C9A4d21e5727c"
  // const USDC_DECIMAL = 6
  // const WBERA = "0x7507c1dc16935B82698e4C63f2746A2fCf994dF8"
  // const WBERA_DECIMAL = 18
  // const HONEY = "0x0E4aaF1351de4c0264C5c7056Ef3777b41BD8e03"
  // const HONEY_DECIMAL = 18

  // const wbtcBufferAmounts = new BigNumber(1).multipliedBy(10 ** WBTC_DECIMAL).toString() // 4_00000000
  // const wethBufferAmounts = new BigNumber(16).multipliedBy(10 ** WETH_DECIMAL).toString() // 65_000000000000000000
  // const usdcBufferAmounts = new BigNumber(37500).multipliedBy(10 ** USDC_DECIMAL).toString() // 150000_000000
  // const honeyBufferAmounts = new BigNumber(10000).multipliedBy(10 ** HONEY_DECIMAL).toString() // 40000_000000000000000000

  // for (let i = 0; i < vaults.length; i++) {
  //   await vaults[i].connect(DEPLOYER).setBufferAmount(CONTRACT_ADDRESS.WBTC, wbtcBufferAmounts);
  //   await vaults[i].connect(DEPLOYER).setBufferAmount(CONTRACT_ADDRESS.WETH, wethBufferAmounts);
  //   await vaults[i].connect(DEPLOYER).setBufferAmount(CONTRACT_ADDRESS.USDC, usdcBufferAmounts);
  //   await vaults[i].connect(DEPLOYER).setBufferAmount(CONTRACT_ADDRESS.HONEY, honeyBufferAmounts);
  // }






  /* 
   *
   * Check Settlement Logic
   *
   */

  // const targetExpiry = 1724745600;
  // const optionTokensAtSelfExpiry = await sVaultUtils.getOptionTokensAtSelfOriginExpiry(targetExpiry);

  // const targetIndexes = [26];
  // const targetOptionIds = [];
  // const targetOptionInfos = [];
  // const targetOptionIdsAmount = [];

  // for (let i = 0; i < targetIndexes.length; i++) {
  //   const optionTokenId = optionTokensAtSelfExpiry[targetIndexes[i]][0];
  //   const optionInfo = parseOptionTokenId(optionTokenId);
  
  //   targetOptionIds.push(optionTokenId);
  //   targetOptionInfos.push(optionInfo);
  //   targetOptionIdsAmount.push(optionTokensAtSelfExpiry[targetIndexes[i]][1]);
  // }

  // console.log("targetOptionIds:", targetOptionIds);
  // console.log("targetOptionInfos:", targetOptionInfos);
  // console.log("targetOptionIdsAmount:", targetOptionIdsAmount);




















// const key = await positionManager.positionRequestKeys(100);
// const info = await positionManager.openPositionRequests(key);
// console.log(info)


















  // const test = await sOlpManager.getOlpAssetUsd(CONTRACT_ADDRESS.USDC, true)
  // console.log(
  //   "reservedUsd : ", new BigNumber(test[3]).dividedBy(new BigNumber(10).pow(30)).toString(), "\n",
  //   "utilizedUsd : ", new BigNumber(test[4]).dividedBy(new BigNumber(10).pow(30)).toString(), "\n",
  //   "availableUsd : ", new BigNumber(test[5]).dividedBy(new BigNumber(10).pow(30)).toString(), "\n",
  //   "depositedUsd : ", new BigNumber(test[6]).dividedBy(new BigNumber(10).pow(30)).toString(), "\n",
  // )











  // const aum = await sOlpManager.getAum(true);
  // console.log("aum:", aum.toString())

  // const aumAddition = await sOlpManager.aumAddition();
  // const aumaumDeduction = await sOlpManager.aumDeduction();
  // console.log("aumAddition:", aumAddition.toString())
  // console.log("aumDeduction:", aumaumDeduction.toString())
  
  // const totalOlpAssetUsd = await sOlpManager.getTotalOlpAssetUsd(true);
  // console.log("totalOlpAssetUsd:", totalOlpAssetUsd.toString())
  
  // const pv = await vaultPriceFeed.getPVAndSign(await sVault.getAddress());
  // console.log("pv:", pv.toString())

  // const aumInUsdg = await sOlpManager.getAumInUsdg(true);
  // console.log("aumInUsdg:", aumInUsdg.toString())

  console.log("Operation completed")
}

(async () => {
  await operation(ethers, null)
})()