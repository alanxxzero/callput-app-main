import BigNumber from "bignumber.js";

import { getDeployedContracts } from "./deployedContracts";
import { ethers, upgrades } from "hardhat";
import { CloseBuyPositionTopic, CloseSellPositionTopic, db, getLogs, handleCloseBuyPosition, handleCloseSellPosition, handleOpenBuyPosition, handleOpenSellPosition, handleSettleBuyPosition, handleSettleSellPosition, OpenBuyPositionTopic, OpenSellPositionTopic, SettleBuyPositionTopic, SettleSellPositionTopic } from "../handler";

import ControllerAbi from "../../../shared/abis/Controller.json"
import PositionManagerAbi from "../../../shared/abis/PositionManager.json"
import SettleManagerAbi from "../../../shared/abis/SettleManager.json"
import request, { gql } from "graphql-request";

BigNumber.config({
  EXPONENTIAL_AT: 1000,
  DECIMAL_PLACES: 80,
})

export async function rollbackPositions(ethers: any, addressMap: any) {
  // // 1. 한국 시간 기준 8일 10시 30분 전까지 포지션 보유 현황
  // // 2. 한국 시간 기준 8일 10시 30분 전까지 OLP 보유 현황
  // const startBlock = 282500000;
  // const endBlock = 293500000;

  // const schedules = [
  //   { address: CONTRACT_ADDRESS.CONTROLLER, topic: OpenBuyPositionTopic, abi: ControllerAbi, handler: handleOpenBuyPosition },
  //   { address: CONTRACT_ADDRESS.CONTROLLER, topic: OpenSellPositionTopic, abi: ControllerAbi, handler: handleOpenSellPosition },
  //   { address: CONTRACT_ADDRESS.CONTROLLER, topic: CloseBuyPositionTopic, abi: ControllerAbi, handler: handleCloseBuyPosition },
  //   { address: CONTRACT_ADDRESS.CONTROLLER, topic: CloseSellPositionTopic, abi: ControllerAbi, handler: handleCloseSellPosition },
  //   { address: CONTRACT_ADDRESS.CONTROLLER, topic: SettleBuyPositionTopic, abi: ControllerAbi, handler: handleSettleBuyPosition },
  //   { address: CONTRACT_ADDRESS.CONTROLLER, topic: SettleSellPositionTopic, abi: ControllerAbi, handler: handleSettleSellPosition },
  // ]

  // for (let i = startBlock; i < endBlock; i += 1000000) {
  //   for await (const { address, topic, abi, handler } of schedules) {
  //     await getLogs(ethers, i, i + 999999, address, topic, abi, handler)
  //   }

  //   console.log(("Block " + i + " ~ " + (i + 999999) + " completed"));
  // }

  // console.log(db, "db");

  const notExpiredPositions = await getUsersNotExpiredPositions();
  console.log("notExpiredPositions", notExpiredPositions);
  
  const fromExpiry = getTimestampForDate(2024, 12, 1);
  const expiredButNotSettledPositions = await getUsersExpiredButNotSettledPositions(fromExpiry);

  console.log("Completed");
}

(async () => {
  await rollbackPositions(ethers, null)
})()

const getAllResult = async ({
  filter, 
  document, 
  endCursor, 
  accumulation = {
    pageInfo: {},
    nodes: []
  },
}: {
  filter: any,
  document: any,
  endCursor: any,
  accumulation?: {
    pageInfo: {},
    nodes: undefined[]
  }
}): Promise<{
  pageInfo: {},
  nodes: undefined[]
}> => {
  const response: any = await request(
    "http://43.202.154.127:3111/graphql",
    document,
    {
      first: 1000,
      after: endCursor,
      filter,
    }
  )

  const itemKey = Object.keys(response)[0]
  const items = response[itemKey]

  // console.log(filter, 'filter')
  // console.log(items.pageInfo, 'items.pageInfo')
  // console.log(items.nodes.length, 'items.nodes.length')
  // console.log(endCursor, 'endCursor')
  // console.log(items.pageInfo.endCursor, 'items.pageInfo.endCursor')

  accumulation = {
    pageInfo: items.pageInfo,
    nodes: [
      ...accumulation.nodes,
      ...items.nodes,
    ]
  }

  if (!items.pageInfo.hasNextPage) {
    return accumulation
  }

  return await getAllResult({ 
    filter, 
    document, 
    endCursor: items.pageInfo.endCursor, 
    accumulation 
  })
}

enum PositionState {
  ALL,
  NOT_EXPIRED,
  EXPIRED,
}

enum SettleState {
  ALL,
  NOT_SETTLED,
  SETTLED,
}

const getPositionsQueryFilter = (
  positionState: PositionState,
  settleState: SettleState,
  fromExpiry?: number,
) => {
  let filter: any = {
    size: { greaterThan: "0" }
  }

  const currentTime = Math.floor(new Date().getTime() / 1000);

  if (positionState === PositionState.NOT_EXPIRED) {
    filter = {
      ...filter,
      expiry: { greaterThan: `${currentTime}` },
    }
  } else if (positionState === PositionState.EXPIRED) {
    filter = {
      ...filter,
      expiry: {
        lessThanOrEqualTo: `${currentTime}`,
        greaterThanOrEqualTo: `${fromExpiry || 0}`  // Add minimum expiry filter
      }
    }
  }

  if (settleState === SettleState.NOT_SETTLED) {
    filter = { ...filter, isSettled: { equalTo: false } }
  } else if (settleState === SettleState.SETTLED) {
    filter = { ...filter, isSettled: { equalTo: true } }
  }

  return filter
}

const getPositionsWithFilter = async (filter: any) => {
  let document = gql`
    query($first: Int, $after: Cursor, $filter: PositionFilter) {
      positions(first: $first, after: $after, filter: $filter) {
          pageInfo {
            endCursor
            hasNextPage
          }

          nodes {
            id
            account
            underlyingAssetIndex
            expiry
            optionTokenId
            length
            isBuys
            strikePrices
            isCalls
            optionNames
            size
            sizeOpened
            sizeClosing
            sizeClosed
            sizeSettled
            isBuy
            executionPrice
            openedToken
            openedAmount
            openedCollateralToken
            openedCollateralAmount
            openedAvgExecutionPrice
            openedAvgSpotPrice
            closedToken
            closedAmount
            closedCollateralToken
            closedCollateralAmount
            closedAvgExecutionPrice
            closedAvgSpotPrice
            settledToken
            settledAmount
            settledCollateralToken
            settledCollateralAmount
            settledPrice
            isSettled
            lastProcessBlockTime
          }
      }
    }
  `

  return getAllResult({ 
    filter, 
    document, 
    endCursor: null
  })
}

const getUsersPositionsWithState = async (
  positionState: PositionState,
  settleState: SettleState = SettleState.ALL,
  fromExpiry?: number
) => {
  const positionsQueryFilter = getPositionsQueryFilter(positionState, settleState, fromExpiry);
  const { nodes } = await getPositionsWithFilter(positionsQueryFilter);

  let result: Record<string, Record<string, any[]>> = {};

  nodes.forEach((node: any) => {
    const { account, expiry, ...nodeData } = node;

    const dataObj = {
      underlyingAssetIndex: nodeData.underlyingAssetIndex,
      optionTokenId: nodeData.optionTokenId,
      length: nodeData.length,
      isBuys: nodeData.isBuys,
      strikePrices: nodeData.strikePrices,
      isCalls: nodeData.isCalls,
      optionNames: nodeData.optionNames,
      size: nodeData.size,
      isBuy: nodeData.isBuy,
      executionPrice: nodeData.executionPrice,
      openedToken: nodeData.openedToken,
      openedAmount: nodeData.openedAmount,
      openedCollateralToken: nodeData.openedCollateralToken,
      openedCollateralAmount: nodeData.openedCollateralAmount,
      closedToken: nodeData.closedToken,
      closedAmount: nodeData.closedAmount,
      closedCollateralToken: nodeData.closedCollateralToken,
      closedCollateralAmount: nodeData.closedCollateralAmount,
      settledToken: nodeData.settledToken,
      settledAmount: nodeData.settledAmount,
      settledCollateralToken: nodeData.settledCollateralToken,
      settledCollateralAmount: nodeData.settledCollateralAmount,
      settledPrice: nodeData.settledPrice,
      isSettled: nodeData.isSettled
    };

    if (!result[account]) {
      result[account] = {};
    }

    if (!result[account][expiry]) {
      result[account][expiry] = [dataObj];
    } else {
      result[account][expiry].push(dataObj);
    }
  });

  return result;
};

// Original functions can now be simplified to use the common function
const getUsersNotExpiredPositions = () => {
  return getUsersPositionsWithState(PositionState.NOT_EXPIRED);
};

const getUsersExpiredButNotSettledPositions = (fromExpiry?: number) => {
  return getUsersPositionsWithState(PositionState.EXPIRED, SettleState.NOT_SETTLED, fromExpiry);
};

const getTimestampForDate = (year: number, month: number, day: number) => {
  return Math.floor(new Date(year, month - 1, day).getTime() / 1000);
};