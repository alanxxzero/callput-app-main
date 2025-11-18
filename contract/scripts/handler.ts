import BigNumber from "bignumber.js";

import { CONTRACT_ADDRESS } from "./arbitrumOne/constants";
import { Interface } from "ethers";
import keccak256 from "keccak256";
import { HardhatEthersHelpers } from "hardhat/types";
import { parseOptionTokenId } from "../utils/format";

BigNumber.config({
  EXPONENTIAL_AT: 1000,
  DECIMAL_PLACES: 80,
})

export const db: any = {
  0: {
    BTC: [],
    ETH: []
  },
  1: {
    BTC: [],
    ETH: []
  },
  3: {
    BTC: [],
    ETH: []
  },
  totalBTCAmountClearedSVault: 0,
  totalETHAmountClearedSVault: 0,
  totalBTCAmountClearedMVault: 0,
  totalETHAmountClearedMVault: 0,
  totalUSDCAmountIncreasedSVault: 0,
  totalUSDCAmountDecreasedSVault: 0,
  diff: 112470642
}

export const getLogs = async (
  ethers: HardhatEthersHelpers,
  fromBlock: number, 
  toBlock: number,
  address: string, 
  topic: any, 
  abi: any[],
  handler: (log: any) => Promise<void>,
) => {
  const topics = [topic]

  const logs = await ethers.provider.getLogs({
    fromBlock: fromBlock,
    toBlock: toBlock,
    address,
    topics,
  })

  const results = logs.map((log) => {
    const parsedLog = new Interface(abi).parseLog({
        data: log.data as any,
        topics: log.topics as any,
      });
      
    const args = parsedLog ? parsedLog.args : null;

    return {
      args,
      transactionHash: log.transactionHash,
      blockNumber: log.blockNumber
    }
  })

  for await (const log of results) {
    await handler(log)
  }
  
  return results
}

export const OpenBuyPositionTopic= "0x" + keccak256("OpenBuyPosition(address,uint256,uint16,uint40,uint256,uint256,address,uint256,uint256,uint256)").toString('hex')
export const OpenSellPositionTopic= "0x" + keccak256("OpenSellPosition(address,uint256,uint16,uint40,uint256,uint256,address,uint256,address,uint256,uint256,uint256)").toString('hex')
export const CloseBuyPositionTopic= "0x" + keccak256("CloseBuyPosition(address,uint256,uint16,uint40,uint256,uint256,address,uint256,uint256,uint256)").toString('hex')
export const CloseSellPositionTopic= "0x" + keccak256("CloseSellPosition(address,uint256,uint16,uint40,uint256,uint256,address,uint256,address,uint256,uint256,uint256)").toString('hex')
export const SettleBuyPositionTopic= "0x" + keccak256("SettleBuyPosition(address,uint16,uint40,uint256,uint256,address,uint256,uint256)").toString('hex')
export const SettleSellPositionTopic= "0x" + keccak256("SettleSellPosition(address,uint16,uint40,uint256,uint256,address,uint256,address,uint256,uint256)").toString('hex')
export const AddLiquidityTopic = "0x" + keccak256("AddLiquidity(address,address,uint256,uint256,uint256,uint256,uint256)").toString('hex');
export const RemoveLiquidityTopic = "0x" + keccak256("RemoveLiquidity(address,address,uint256,uint256,uint256,uint256,uint256)").toString('hex');

export async function handleOpenBuyPosition(log: any): Promise<void> {
  console.log(`New handleOpenBuyPosition log at block ${log.blockNumber}`);

  const account = String(log.args.account);
  const optionTokenId = String(log.args.optionTokenId);

  if (
    account.toLowerCase() === CONTRACT_ADDRESS.S_VAULT.toLowerCase() || 
    account.toLowerCase() === CONTRACT_ADDRESS.M_VAULT.toLowerCase()
  ) return;

  if (!db[account]) {
    db[account] = {};
  }

  const currentSize = db[account][optionTokenId] || '0';
  
  // BigNumber 계산
  const nextSize = new BigNumber(currentSize)
    .plus(log.args.size)
    .toString();
    
  db[account][optionTokenId] = nextSize;
}

export async function handleOpenSellPosition(log: any): Promise<void> {
  console.log(`New handleOpenSellPosition log at block ${log.blockNumber}`);

  const account = String(log.args.account);
  const optionTokenId = String(log.args.optionTokenId);

  if (
    account.toLowerCase() === CONTRACT_ADDRESS.S_VAULT.toLowerCase() || 
    account.toLowerCase() === CONTRACT_ADDRESS.M_VAULT.toLowerCase()
  ) return;

  if (!db[account]) {
    db[account] = {};
  }

  const currentSize = db[account][optionTokenId] || '0';
  
  // BigNumber 계산
  const nextSize = new BigNumber(currentSize)
    .plus(log.args.size)
    .toString();
    
  db[account][optionTokenId] = nextSize;
}

export async function handleCloseBuyPosition(log: any): Promise<void> {
  console.log(`New handleCloseBuyPosition log at block ${log.blockNumber}`);

  const account = String(log.args.account);
  const optionTokenId = String(log.args.optionTokenId);

  if (account.toLowerCase() === CONTRACT_ADDRESS.S_VAULT.toLowerCase() || 
      account.toLowerCase() === CONTRACT_ADDRESS.M_VAULT.toLowerCase()) {
    return;
  }

  // position이 없으면 처리하지 않음
  if (!db[account] || !db[account][optionTokenId]) {
    return;
  }

  const nextSize = new BigNumber(db[account][optionTokenId]).minus(log.args.size).toString();
  
  if (new BigNumber(nextSize).isLessThanOrEqualTo(0)) {
    delete db[account][optionTokenId];
  } else {
    db[account][optionTokenId] = nextSize;
  }
}

export async function handleCloseSellPosition(log: any): Promise<void> {
  console.log(`New handleCloseSellPosition log at block ${log.blockNumber}`);

  const account = String(log.args.account);
  const optionTokenId = String(log.args.optionTokenId);

  if (account.toLowerCase() === CONTRACT_ADDRESS.S_VAULT.toLowerCase() || 
      account.toLowerCase() === CONTRACT_ADDRESS.M_VAULT.toLowerCase()) {
    return;
  }

  if (!db[account] || !db[account][optionTokenId]) {
    return;
  }

  const nextSize = new BigNumber(db[account][optionTokenId]).minus(log.args.size).toString();
  
  if (new BigNumber(nextSize).isLessThanOrEqualTo(0)) {
    delete db[account][optionTokenId];
  } else {
    db[account][optionTokenId] = nextSize;
  }
}

export async function handleSettleBuyPosition(log: any): Promise<void> {
  console.log(`New handleSettleBuyPosition log at block ${log.blockNumber}`);

  const account = String(log.args.account);
  const optionTokenId = String(log.args.optionTokenId);

  if (account.toLowerCase() === CONTRACT_ADDRESS.S_VAULT.toLowerCase() || 
      account.toLowerCase() === CONTRACT_ADDRESS.M_VAULT.toLowerCase()) {
    return;
  }

  if (!db[account] || !db[account][optionTokenId]) {
    return;
  }

  const nextSize = new BigNumber(db[account][optionTokenId]).minus(log.args.size).toString();
  
  if (new BigNumber(nextSize).isLessThanOrEqualTo(0)) {
    delete db[account][optionTokenId];
  } else {
    db[account][optionTokenId] = nextSize;
  }
}

export async function handleSettleSellPosition(log: any): Promise<void> {
  console.log(`New handleSettleSellPosition log at block ${log.blockNumber}`);

  const account = String(log.args.account);
  const optionTokenId = String(log.args.optionTokenId);

  if (account.toLowerCase() === CONTRACT_ADDRESS.S_VAULT.toLowerCase() || 
      account.toLowerCase() === CONTRACT_ADDRESS.M_VAULT.toLowerCase()) {
    return;
  }

  if (!db[account] || !db[account][optionTokenId]) {
    return;
  }

  const nextSize = new BigNumber(db[account][optionTokenId]).minus(log.args.size).toString();
  
  if (new BigNumber(nextSize).isLessThanOrEqualTo(0)) {
    delete db[account][optionTokenId];
  } else {
    db[account][optionTokenId] = nextSize;
  }
}











export const ClearPositionTopic = "0x" + keccak256("ClearPosition(address,address,uint256,uint256,uint256)").toString('hex')
export const CreateClosePositionTopic = "0x" + keccak256("CreateClosePosition(address,uint16,uint40,uint256,uint256,address[],uint256,uint256,uint256,uint256,uint40)").toString('hex')
export const CancelClosePositionTopic = "0x" + keccak256("CancelClosePosition(address,uint16,uint40,uint256,uint256,address[],uint40)").toString('hex')
export const ExecuteClosePositionTopic = "0x" + keccak256("ExecuteClosePosition(address,uint16,uint40,uint256,uint256,address[],uint256,uint256,uint40)").toString('hex')
export const FeedSpotPriceTopic = "0x" + keccak256("FeedSpotPrice(address,uint256,address)").toString('hex')
export const SetMaxStrictPriceDeviationTopic = "0x" + keccak256("SetMaxStrictPriceDeviation(uint256)").toString('hex');
export const IncreaseUtilizedAmountTopic = "0x" + keccak256("IncreaseUtilizedAmount(address,uint256)").toString('hex')
export const DecreaseUtilizedAmountTopic = "0x" + keccak256("DecreaseUtilizedAmount(address,uint256)").toString('hex')

export async function handleIncreaseUtilizedAmount(log: any): Promise<void> {
  const args = log.args;
  const token = args[0];
  const amount = args[1];
  if (token === "0xd6D83aF58a19Cd14eF3CF6fe848C9A4d21e5727c") {
    db.totalUSDCAmountIncreasedSVault += new BigNumber(amount).toNumber();
    db.diff += new BigNumber(amount).toNumber();
    if (db.diff <= 1000000) {
      console.log(log.blockNumber, "blockNumber")
      console.log(db.diff, "diff")
    }
  }
}
export async function handleDecreaseUtilizedAmount(log: any): Promise<void> {
  const args = log.args;
  const token = args[0];
  const amount = args[1];
  if (token === "0xd6D83aF58a19Cd14eF3CF6fe848C9A4d21e5727c") {
    db.totalUSDCAmountDecreasedSVault += new BigNumber(amount).toNumber();
    db.diff -= new BigNumber(amount).toNumber();
    if (db.diff <= 1000000) {
      console.log(log.blockNumber, "blockNumber")
      console.log(db.diff, "diff")
    }
  }
}

export async function handleClearPosition(log: any): Promise<void> {
  const args = log.args;
  const optionTokenId = BigInt(args[2])
  const oppositeOptionTokenId = BigInt(args[3])
  
  const data = parseOptionTokenId(optionTokenId)
  const oppositeData = parseOptionTokenId(oppositeOptionTokenId)

  if (data.strategy === 1 || data.strategy === 2 || oppositeData.strategy === 1 || oppositeData.strategy === 2) {
    console.log(data.underlyingAssetIndex, "data.underlyingAssetIndex")
    const underlyingAssetTicker = data.underlyingAssetIndex === 1 ? "BTC" : "ETH"

    db[data.vaultIndex][underlyingAssetTicker].push({
      optionTokenId: optionTokenId,
      oppositeOptionTokenId: oppositeOptionTokenId,
      vaultAddress: args[0],
      size: args[4],
    })

    if (data.vaultIndex === 0 && underlyingAssetTicker === "BTC" ) {
      db.totalBTCAmountClearedSVault += new BigNumber(args[4]).toNumber();
    } else if (data.vaultIndex === 0 && underlyingAssetTicker === "ETH") {
      db.totalETHAmountClearedSVault += new BigNumber(args[4]).toNumber();
    } else if (data.vaultIndex === 1 && underlyingAssetTicker === "BTC") {
      db.totalBTCAmountClearedMVault += new BigNumber(args[4]).toNumber();
    } else if (data.vaultIndex === 1 && underlyingAssetTicker === "ETH") {
      db.totalETHAmountClearedMVault += new BigNumber(args[4]).toNumber();
    } else {
      console.log("Error")
    }
  }
}

export async function handleCreateClosePosition(log: any): Promise<void> {
  console.log(`New handleCreateClosePosition log at block ${log.blockNumber}`);

  const optionTokenId = BigInt(log.args.optionTokenId)

  const _id = `${log.args.account}-${optionTokenId}`

  // const existingPosition: any = await queryRunner.manager.findOne(Position, { where: { id: _id }})
  const existingPosition: any = db[_id]

  console.log(existingPosition)

  if (existingPosition) {
    const nextSize = new BigNumber(existingPosition.size).minus(log.args.size).toString();
    const nextSizeClosing = new BigNumber(existingPosition.sizeClosing).plus(log.args.size).toString();

    existingPosition.size = nextSize;
    existingPosition.sizeClosing = nextSizeClosing;

    // await queryRunner.manager.save(existingPosition)
    db[_id] = {
      ...existingPosition,
      size: nextSize,
      sizeClosing: nextSizeClosing
    }
  }
}

export async function handleCancelClosePosition(log: any): Promise<void> {
  console.log(`New handleCancelClosePosition log at block ${log.blockNumber}`);

  const optionTokenId = BigInt(log.args.optionTokenId)

  const _id = `${log.args.account}-${optionTokenId}`

  // const existingPosition: any = await queryRunner.manager.findOne(Position, { where: { id: _id }})
  const existingPosition: any = db[_id]

  if (existingPosition) {
    const nextSize = new BigNumber(existingPosition.size).plus(log.args.size).toString();
    const nextSizeClosing = new BigNumber(existingPosition.sizeClosing).minus(log.args.size).toString();

    existingPosition.size = nextSize;
    existingPosition.sizeClosing = nextSizeClosing;

    db[_id] = {
      ...existingPosition,
      size: nextSize,
      sizeClosing: nextSizeClosing
    }
  }
}

// export async function handleOpenBuyPosition(log: any): Promise<void> {
//   console.log(`New handleOpenBuyPosition log at block ${log.blockNumber}`);

//   const optionTokenId = BigInt(log.args.optionTokenId)
  
//   const _id = `${log.args.account}-${optionTokenId}`

//   // 1. update existing position
//   const existingPosition: any = db[_id]

//   if (existingPosition) {
//     const nextSize = new BigNumber(existingPosition.size).plus(log.args.size).toString();

//     const nextSizeOpened = new BigNumber(existingPosition.sizeOpened).plus(log.args.size).toString();
//     const nextOpenedAmount = new BigNumber(existingPosition.openedAmount).plus(log.args.amountPaid).toString();

//     existingPosition.size = nextSize;

//     existingPosition.sizeOpened = nextSizeOpened;
//     existingPosition.openedAmount = nextOpenedAmount;

//     existingPosition.lastProcessBlockTime = String(0);

//     db[_id] = {
//       ...existingPosition,
//       size: nextSize,
//       sizeOpened: nextSizeOpened,
//       openedAmount: nextOpenedAmount,
//       lastProcessBlockTime: String(0)
//     }
//   } else {
    
//     const record = {
//       id: _id,
//       account: log.args.account,
//       underlyingAssetIndex: String(log.args.underlyingAssetIndex),
//       expiry: String(log.args.expiry),
//       optionTokenId: String(optionTokenId),
//       length: String(2),
//       size: String(log.args.size),
//       sizeOpened: String(log.args.size),
//       sizeClosing: String(0),
//       sizeClosed: String(0),
//       sizeSettled: String(0),
//       isBuy: true,
//       executionPrice: String(log.args.executionPrice),
//       openedToken: log.args.quoteToken,          // for buy position, openToken is usdc
//       openedAmount: String(log.args.amountPaid), // for buy position, openAmount is amountPaid
//       openedCollateralToken: "",
//       openedCollateralAmount: String(0),
//       openedAvgExecutionPrice: String(log.args.executionPrice),
//       openedAvgSpotPrice: String(log.args.spotPrice),
//       closedToken: "",
//       closedAmount: String(0),
//       closedCollateralToken: "",
//       closedCollateralAmount: String(0),
//       closedAvgExecutionPrice: String(0),
//       closedAvgSpotPrice: String(0),
//       settledToken: "",
//       settledAmount: String(0),
//       settledCollateralToken: "",
//       settledCollateralAmount: String(0),
//       settledPrice: String(0),
//       isSettled: false,
//       lastProcessBlockTime: String(0)
//     }
  
//     db[_id] = record;
//   }
// }

// export async function handleOpenSellPosition(log: any): Promise<void> {
//   console.log(`New handleOpenSellPosition log at block ${log.blockNumber}`);

//   const optionTokenId = BigInt(log.args.optionTokenId)
  
//   const _id = `${log.args.account}-${optionTokenId}`

//   const existingPosition: any = db[_id]

//   if (existingPosition) {
//     const nextSize = new BigNumber(existingPosition.size).plus(log.args.size).toString();

//     const nextSizeOpened = new BigNumber(existingPosition.sizeOpened).plus(log.args.size).toString();
//     const nextOpenedAmount = new BigNumber(existingPosition.openedAmount).plus(log.args.amountReceived).toString();
//     const nextOpenedCollateralAmount = new BigNumber(existingPosition.openedCollateralAmount).plus(log.args.collateralAmount).toString();

//     existingPosition.size = nextSize;

//     existingPosition.sizeOpened = nextSizeOpened;
//     existingPosition.openedAmount = nextOpenedAmount;
//     existingPosition.openedCollateralAmount = nextOpenedCollateralAmount;

//     existingPosition.lastProcessBlockTime = String(0);

//     db[_id] = {
//       ...existingPosition,
//       size: nextSize,
//       sizeOpened: nextSizeOpened,
//       openedAmount: nextOpenedAmount,
//       openedCollateralAmount: nextOpenedCollateralAmount,
//       lastProcessBlockTime: String(0)
//     }
//   } else {
//     const record = {
//       id: _id,
//       account: log.args.account,
//       underlyingAssetIndex: String(log.args.underlyingAssetIndex),
//       expiry: String(log.args.expiry),
//       optionTokenId: String(optionTokenId),
//       length: String(2),
//       size: String(log.args.size),
//       sizeOpened: String(log.args.size),
//       sizeClosing: String(0),
//       sizeClosed: String(0),
//       sizeSettled: String(0),
//       isBuy: false,
//       executionPrice: String(log.args.executionPrice),
//       openedToken: log.args.quoteToken,                 // for sell position, openToken is usdc
//       openedAmount: String(log.args.amountReceived),    // for sell position, openAmount is amountReceived
//       openedCollateralToken: log.args.collateralToken,
//       openedCollateralAmount: String(log.args.collateralAmount),
//       openedAvgExecutionPrice: String(log.args.executionPrice),
//       openedAvgSpotPrice: String(log.args.spotPrice),
//       closedToken: "",
//       closedAmount: String(0),
//       closedCollateralToken: "",
//       closedCollateralAmount: String(0),
//       closedAvgExecutionPrice: String(0),
//       closedAvgSpotPrice: String(0),
//       settledToken: "",
//       settledAmount: String(0),
//       settledCollateralToken: "",
//       settledCollateralAmount: String(0),
//       settledPrice: String(0),
//       isSettled: false,
//       lastProcessBlockTime: String(0)
//     }
  
//     db[_id] = record;
//   }
// }

// export async function handleCloseSellPosition(log: any): Promise<void> {
//   console.log(`New handleCloseSellPosition log at block ${log.blockNumber}`);

//   const optionTokenId = BigInt(log.args.optionTokenId)
//   const _id = `${log.args.account}-${optionTokenId}`
  
//   const existingPosition: any = db[_id]

//   if (existingPosition) {
//     if (existingPosition.closedToken === "") {
//       existingPosition.closedToken = log.args.quoteToken
//     }

//     if (existingPosition.closedCollateralToken === "") {
//       existingPosition.closedCollateralToken = log.args.collateralToken
//     }

//     // 2. update existing position
//     const nextSizeClosed = new BigNumber(existingPosition.sizeClosed).plus(log.args.size).toString();
//     const nextClosedAmount = new BigNumber(existingPosition.closedAmount).plus(log.args.amountPaid).toString();
//     const nextClosedCollateralAmount = new BigNumber(existingPosition.closedCollateralAmount).plus(log.args.collateralAmount).toString();

//     if (String(log.args.account).toLowerCase() === CONTRACT_ADDRESS.S_VAULT.toLowerCase() || String(log.args.account).toLowerCase() === CONTRACT_ADDRESS.M_VAULT.toLowerCase()) {
//       const nextSize = new BigNumber(existingPosition.size).minus(log.args.size).toString();
//       existingPosition.size = nextSize;
//     } else {
//       const nextSizeClosing = new BigNumber(existingPosition.sizeClosing).minus(log.args.size).toString();
//       existingPosition.sizeClosing = nextSizeClosing;
//     }

//     existingPosition.sizeClosed = nextSizeClosed;
//     existingPosition.closedAmount = nextClosedAmount;
//     existingPosition.closedCollateralAmount = nextClosedCollateralAmount;

//     existingPosition.lastProcessBlockTime = String(0);
  
//     db[_id] = {
//       ...existingPosition,
//       sizeClosed: nextSizeClosed,
//       closedAmount: nextClosedAmount,
//       closedCollateralAmount: nextClosedCollateralAmount,
//       lastProcessBlockTime: String(0)
//     }
//   }
// }

export async function handleFeedSpotPrice(log: any): Promise<void> {
  const args = log.args;
  const token = args[0];
  const price = args[1];
  if (token === "0xd6D83aF58a19Cd14eF3CF6fe848C9A4d21e5727c") {
    const ONE_USD = new BigNumber(10).pow(30).toNumber();
    if (new BigNumber(price).minus(ONE_USD).abs().div(ONE_USD).toNumber() >= 0.04) {
      console.log(price, "price")
    }
  }
}
export async function handleSetMaxStrictPriceDeviation(log: any): Promise<void> {
  console.log(`New handleSetMaxStrictPriceDeviation log at block ${log.blockNumber}`);
  const args = log.args;
  console.log(args[0], "maxStrictPriceDeviation")
}