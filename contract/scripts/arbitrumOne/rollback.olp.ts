import BigNumber from "bignumber.js";

import { getDeployedContracts } from "./deployedContracts";
import { ethers, upgrades } from "hardhat";

import ControllerAbi from "../../../shared/abis/Controller.json"
import PositionManagerAbi from "../../../shared/abis/PositionManager.json"
import SettleManagerAbi from "../../../shared/abis/SettleManager.json"
import request, { gql } from "graphql-request";
import { CONTRACT_ADDRESS } from "./constants";


BigNumber.config({
  EXPONENTIAL_AT: 1000,
  DECIMAL_PLACES: 80,
})

export async function rollbackPositions(ethers: any, addressMap: any) {
  const { CONTRACT_ADDRESS } = await getDeployedContracts(ethers, addressMap);

  const sOlpNetAmounts = await calculateNetAmounts(CONTRACT_ADDRESS.S_OLP);
  const mOlpNetAmounts = await calculateNetAmounts(CONTRACT_ADDRESS.M_OLP);

  console.log("sOlpNetAmounts", sOlpNetAmounts);
  console.log("mOlpNetAmounts", mOlpNetAmounts);

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

// Add Liquidity

const getAddLiquidityQueryFilter = (olpAddress: string) => {
  let filter: any = {
    olp: { equalToInsensitive: olpAddress },
  }

  return filter;
}

const getAddLiquidityWithFilter = async (filter: any) => {
  let document = gql`
    query($first: Int, $after: Cursor, $filter: AddLiquidityFilter) {
      addLiquidities(first: $first, after: $after, filter: $filter) {
          pageInfo {
            endCursor
            hasNextPage
          }

          nodes {
            id
            account
            olp
            token
            amount
            aumInUsdg
            olpSupply
            usdgAmount
            mintAmount
            processBlockTime
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

const getUserAddLiquidityWithState = async (olpAddress: string) => {
  const olpQueryFilter = getAddLiquidityQueryFilter(olpAddress);
  const { nodes } = await getAddLiquidityWithFilter(olpQueryFilter);

  let result: Record<string, string> = {};

  nodes.forEach((node: any) => {
    const { account, ...nodeData } = node;

    if (!result[account]) {
      result[account] = new BigNumber(nodeData.mintAmount).toString();
    } else {
      result[account] = new BigNumber(result[account]).plus(nodeData.mintAmount).toString();
    }
  });

  return result;
}

// Remove Liquidity

const getRemoveLiquidityQueryFilter = (olpAddress: string) => {
  let filter: any = {
    olp: { equalToInsensitive: olpAddress },
  }

  return filter;
}

const getRemoveLiquidityWithFilter = async (filter: any) => {
  let document = gql`
    query($first: Int, $after: Cursor, $filter: RemoveLiquidityFilter) {
      removeLiquidities(first: $first, after: $after, filter: $filter) {
          pageInfo {
            endCursor
            hasNextPage
          }

          nodes {
            id
            account
            olp
            token
            olpAmount
            aumInUsdg
            olpSupply
            usdgAmount
            amountOut
            processBlockTime
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

const getUserRemoveLiquidityWithState = async (olpAddress: string) => {
  const olpQueryFilter = getRemoveLiquidityQueryFilter(olpAddress)
  const { nodes } = await getRemoveLiquidityWithFilter(olpQueryFilter);

  let result: Record<string, string> = {};

  nodes.forEach((node: any) => {
    const { account, ...nodeData } = node;

    if (!result[account]) {
      result[account] = new BigNumber(nodeData.olpAmount).toString();
    } else {
      result[account] = new BigNumber(result[account]).plus(nodeData.olpAmount).toString();
    }
  });

  return result;
}

// Integrate

const calculateNetAmounts = async (olpAddress: string) => {
  const addLiquidityPositions = await getUserAddLiquidityWithState(olpAddress);
  const removeLiquidityPositions = await getUserRemoveLiquidityWithState(olpAddress);

  const netPositions: Record<string, string> = {};

  // Process add liquidity positions
  Object.entries(addLiquidityPositions).forEach(([account, amount]: [string, string]) => {
    netPositions[account] = new BigNumber(amount).toString();
  });

  // Subtract remove liquidity positions
  Object.entries(removeLiquidityPositions).forEach(([account, amount]: [string, string]) => {
    if (netPositions[account]) {
      netPositions[account]= new BigNumber(netPositions[account]).minus(new BigNumber(amount)).toString();
    } else {
      console.log(`Account ${account} has remove liquidity position but no add liquidity position`);
    }
  });
  
  return netPositions;
}