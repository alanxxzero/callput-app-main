
import BigNumber from 'bignumber.js';
import { ethers, network } from "hardhat";
import { task } from "hardhat/config";
import {formatEther, MaxUint256, parseEther, ZeroAddress, ZeroHash} from "ethers";
import {getDeployedContracts} from "./deployedContracts";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import {parseOptionTokenId} from "../../utils/format";
const axios = require('axios');


export async function doTx(ethers: any) {
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

  const settleManager = await ethers.getContractAt("SettleManager", "0x6D4705507CeEbE28367392b04C43516b119E9864")

  const underlyingAssetIndex = 1; // BTC
  const expiry = 1722931200
  const strikePrice = 55000;


  // // 1. Prepare creation
  // {
  //   console.log("prepare tx  ....")
  //   await weth.connect(TEST_USER1).deposit({value: BigNumber(1).multipliedBy(10 ** 18).toString()})
  //   await weth.connect(TEST_USER1).approve(await controller.getAddress(), MaxUint256)
  //   await usdc.connect(TEST_USER1).approve(await controller.getAddress(), MaxUint256)
  //   await controller.connect(TEST_USER1).approvePlugin(await positionManager.getAddress())
  //   await weth.connect(TEST_USER2).deposit({value: BigNumber(1).multipliedBy(10 ** 18).toString()})
  //   await weth.connect(TEST_USER2).approve(await controller.getAddress(), MaxUint256)
  //   await usdc.connect(TEST_USER2).approve(await controller.getAddress(), MaxUint256)
  //   await controller.connect(TEST_USER2).approvePlugin(await positionManager.getAddress())
  //   console.log("prepare tx done.")
  // }
  //
  // // 2. create Open
  // {
  //   console.log("open position ...")
  //   const _length = 1
  //   const _isBuys = [true, false, false, false]
  //   const optionIds = [
  //     await optionsMarket.getOptionId(underlyingAssetIndex, expiry, strikePrice),
  //     ZeroHash,
  //     ZeroHash,
  //     ZeroHash
  //   ]
  //   const _isCalls = [true, false, false, false]
  //   const _minSize = 0
  //   const _amountIn = BigNumber(1).multipliedBy(10 ** 17).toString()
  //   const _minOutWhenSwap = 0
  //   const _path = [await weth.getAddress(), await usdc.getAddress()]
  //
  //   await positionManager.connect(TEST_USER1).createOpenPosition(
  //       underlyingAssetIndex,
  //       _length,
  //       _isBuys,
  //       optionIds,
  //       _isCalls,
  //       _minSize,
  //       _path,
  //       _amountIn,
  //       _minOutWhenSwap,
  //       ZeroAddress,
  //       {value : BigNumber(6).multipliedBy(10 ** 13).toString()}
  //   )
  //   console.log("leader opened position ...")
  //   await positionManager.connect(TEST_USER2).createOpenPosition(
  //       underlyingAssetIndex,
  //       _length,
  //       _isBuys,
  //       optionIds,
  //       _isCalls,
  //       _minSize,
  //       _path,
  //       _amountIn,
  //       _minOutWhenSwap,
  //       TEST_USER1.address,
  //       {value : BigNumber(6).multipliedBy(10 ** 13).toString()}
  //   )
  //   console.log("open position done.")
  // }


  // 5. feed spotPrice
  {
    console.log("feed spot ...")
    await spotPriceFeed.connect(TEST_USER1).feedSpotPrices(
        [await wbtc.getAddress()],
        ["67000000000000000000000000000000000"],
    )
    console.log("feed spot done.")
  }

  let requestIndexFollow
  let requestIndexLead
  let openPositionIndexLead
  let openPositionIndexFollow
  let keyLead
  let keyFollow
  {
    const [,_requestLength,] = await positionManager.getRequestQueueLengths()
    requestIndexLead = BigNumber(_requestLength).minus(2)
    requestIndexFollow = BigNumber(_requestLength).minus(1)
    openPositionIndexLead = await positionManager.openPositionsIndex(TEST_USER1.address)
    openPositionIndexFollow = await positionManager.openPositionsIndex(TEST_USER2.address)
    console.log("openPositionIndexLead : ",  openPositionIndexLead)
    console.log("openPositionIndexFollow : ",  openPositionIndexFollow)
    keyLead = await positionManager.getRequestKey(TEST_USER1.address, openPositionIndexLead, true)
    keyFollow = await positionManager.getRequestKey(TEST_USER2.address, openPositionIndexFollow, true)
    console.log("Key generate inputs : ")
    console.log(TEST_USER1.address, openPositionIndexLead, true)
    console.log(TEST_USER2.address, openPositionIndexFollow, true)
    console.log("key is")
    console.log(keyLead)
    console.log(keyFollow)
    const openPositionRequestLead = await positionManager.openPositionRequests(keyLead)
    console.log("optionTokenId(Lead) : ", openPositionRequestLead.optionTokenId)
    const openPositionRequestFollow = await positionManager.openPositionRequests(keyFollow)
    console.log("optionTokenId(Follow) : ", openPositionRequestFollow.optionTokenId)
  }

  // 3. execute position
  {
    let openPositionRequestLead = await positionManager.openPositionRequests(keyLead)
    let openPositionRequestFollow = await positionManager.openPositionRequests(keyFollow)

    console.log("execute position ...")
    const _markPriceBitArray = ["1000000000000000000000000000000"]
    const _riskPremiumBitArray = ["10000000000000000000000000000"]
    const _optionTokenIds = [openPositionRequestLead.optionTokenId]
    const _requestIndexes = [requestIndexLead.toString(), requestIndexFollow.toString()]
    await fastPriceFeed.connect(TEST_USER1).setPricesAndRiskPremiumsWithBits(
        /*await positionManager.getAddress(),*/
        _markPriceBitArray,
        _riskPremiumBitArray,
        _optionTokenIds,
        _requestIndexes,
        Math.floor(new Date().getTime() / 1000)/*,
        positionEndIndex.toString(),
        "100"*/
    )
    console.log("setPricesAndRiskPremiumsWithBits done ...")
    await positionManager.connect(TEST_USER1).executeOpenPosition(
        requestIndexLead.toString(),
        keyLead,
        TEST_USER1.address
    )
    await positionManager.connect(TEST_USER1).executeOpenPosition(
        requestIndexFollow.toString(),
        keyFollow,
        TEST_USER1.address
    )
    openPositionRequestLead = await positionManager.openPositionRequests(keyLead)
    openPositionRequestFollow = await positionManager.openPositionRequests(keyFollow)
    console.log("status(Lead) : ", openPositionRequestLead.status, "   0: pending 1: canceled 2: executed")
    console.log("status(Follow) : ", openPositionRequestFollow.status, "   0: pending 1: canceled 2: executed")
    console.log("executeOpenPosition done ...")
  }

  // 4. 시간 + 2 days
  {
    await increaseTimeAndMine(86400 * 2)
    console.log("force time elapse for 2 days.")
  }


  // 5. feed spotPrice
  {
    console.log("feed spot ...")
    await spotPriceFeed.connect(TEST_USER1).feedSpotPrices(
        [await wbtc.getAddress()],
        ["67000000000000000000000000000000000"],
    )
    console.log("feed spot done.")
  }

  // 6. feed settlePrice
  {
    console.log("feed settle ...")
    await settlePriceFeed.connect(TEST_USER1).feedSettlePrices(
        [await wbtc.getAddress()],
        ["67000000000000000000000000000000000"],
        expiry
    )
    console.log("feed settle done.")
  }


  // 7. prepare settle Position
  {
    console.log("prepare settle position ...")
    await controller.connect(TEST_USER1).approvePlugin(await settleManager.getAddress())
    await btcOptionsToken.connect(TEST_USER1).setApprovalForAll(await controller.getAddress(), true)
    await controller.connect(TEST_USER2).approvePlugin(await settleManager.getAddress())
    await btcOptionsToken.connect(TEST_USER2).setApprovalForAll(await controller.getAddress(), true)
    console.log("prepare settle position done.")
  }

  // 8. settle Position
  {
    console.log("settle position ...")
    const openPositionRequestLead = await positionManager.openPositionRequests(keyLead)
    const openPositionRequestFollow = await positionManager.openPositionRequests(keyFollow)
    await settleManager.connect(TEST_USER1).settlePosition(
        [await wbtc.getAddress()],
        underlyingAssetIndex,
        openPositionRequestLead.optionTokenId,
        0,
        false
    )
    await settleManager.connect(TEST_USER2).settlePosition(
      [await wbtc.getAddress()],
      underlyingAssetIndex,
        openPositionRequestFollow.optionTokenId,
      0,
      false
  )
    console.log("settle position done.")
  }

}

(async () => {
  await doTx(ethers)
})()



async function sendRpc(method, params = []) {
  const response = await axios.post('http://127.0.0.1:8545', {
    jsonrpc: '2.0',
    method: method,
    params: params,
    id: 1
  });
  return response.data.result;
}

async function increaseTimeAndMine(seconds) {
  await sendRpc('evm_increaseTime', [seconds]);
  await sendRpc('evm_mine');
}


