import { multicall, readContract, getBalance } from "wagmi/actions"
import BigNumber from "bignumber.js";
import { Abi, getContract } from "viem";

import { config } from "@/store/wagmi";
import DovVaultAbi from '../../../shared/abis/DovVault.json';
import DovVaultQueueAbi from '../../../shared/abis/DovVaultQueue.json'
import DovSwapUtilAbi from '../../../shared/abis/DovSwapUtil.json'
import { getContractAddress, makeTransaction } from "./contract";
import { getDovInfo, getStakingToken } from "@/constants/constants.dov";
import { dovTokenPrices$ } from "@/streams/dov";
import { Ticker } from "@/enums/enums.appSlice";
import { network$ } from "@/streams/store";
import { parseEther } from "ethers";
import { isSameAddress } from "./misc";
import { forkJoin } from "rxjs";
import { getChainIdFromNetworkConfigs, getNetworkConfigs } from "@/networks/helpers";

BigNumber.config({
  EXPONENTIAL_AT: 1000,
  DECIMAL_PLACES: 80,
})

// dov
export const getDOVTVL = async () => {
  const network = network$.value

  const tokenPriceMap = dovTokenPrices$.value

  const stakingTokenInfoList = Object.values(getDovInfo()).map(({ stakingToken }: any) => {
    return {
      address: stakingToken.address,
      decimal: stakingToken.decimal,
    }
  })

  const collateralToken = getStakingToken(Ticker.DovAsset.USDC) // USDC

  const contracts_collateralBalances = Object.values(getDovInfo()).map(({ contractAddress }: any) => {
    return {
      address: contractAddress,
      abi: DovVaultAbi as Abi,
      functionName: "totalAssets",
      args: [collateralToken.address]
    }
  })

  const contracts_assetBalacnes = Object.values(getDovInfo()).map(({ contractAddress, stakingToken }: any) => {
    return {
      address: contractAddress,
      abi: DovVaultAbi as Abi,
      functionName: "totalAssets",
      args: [stakingToken.address]
    }
  })

  const collateralBalances: any = await multicall(config, {
    chainId: getChainIdFromNetworkConfigs(network),
    contracts: contracts_collateralBalances
  })

  const assetBalances: any = await multicall(config, {
    chainId: getChainIdFromNetworkConfigs(network),
    contracts: contracts_assetBalacnes
  })

  return Object.values(getDovInfo()).reduce((acc: any, { title, contractAddress }: any, idx) => {
    const collateralBalance = collateralBalances[idx].result
    const stakingTokenBalance = assetBalances[idx].result

    const stakingTokenInfo = stakingTokenInfoList[idx]

    const stakingTokenValue = new BigNumber(stakingTokenBalance)
      .div(10 ** stakingTokenInfo.decimal)
      .multipliedBy(tokenPriceMap[stakingTokenInfo.address] || 0)
      .toNumber()

    const collateralValue = new BigNumber(collateralBalance)
      .div(10 ** collateralToken.decimal)
      .multipliedBy(1)
      .toNumber()

    const tvl = new BigNumber(stakingTokenValue)
      .plus(collateralValue)
      .toString()

    return {
      ...acc,
      [title]: tvl
    }
  }, {})
}

export const getDovTokenBalance = async (address: `0x${string}`) => {
  const network = network$.value

  const nativeCoinBalance = await getBalance(config, { address })

  const tokenAddressesToQuery = [...new Set(
    Object.values(getDovInfo()).map(({ stakingToken, tokenIngredients }: any) => {
      return [
        stakingToken.address, 
        ...tokenIngredients.map(({ symbol }: any) => getContractAddress(symbol, network))
      ]
    }).flat()
  )].filter((address: string) => !!address)

  const contractCalls = tokenAddressesToQuery.map((tokenAddress) => {
    return {
      address: tokenAddress,
      abi: DovVaultAbi as Abi,
      functionName: "balanceOf",
      args: [address]
    }
  })

  const tokenBalances: any = await multicall(config, {
    chainId: getChainIdFromNetworkConfigs(network),
    contracts: contractCalls,
  })

  const result = tokenAddressesToQuery.reduce((acc: any, address: string, idx: number) => {
    acc[address] = BigNumber(tokenBalances[idx].result).toString()

    return acc
  }, {})

  return {
    ...result,
    ["0x" + "0".repeat(40)]: String(nativeCoinBalance?.value)
  }
}

export const getDovStakedBalance = async (address: `0x${string}`) => {
  const network = network$.value

  const contracts_share = Object.values(getDovInfo()).map(({ contractAddress }: any) => {
    return {
      address: contractAddress,
      abi: DovVaultAbi as Abi,
      functionName: "balanceOf",
      args: [address]
    }
  })

  const shareBalances: any = await multicall(config, {
    chainId: getChainIdFromNetworkConfigs(network),
    contracts: contracts_share
  })

  const contracts_assetBalances = Object.values(getDovInfo()).map(({ vaultQueueAddress, stakingToken }: any, idx) => {

    return {
      address: vaultQueueAddress,
      abi: DovVaultQueueAbi as Abi,
      functionName: "getUserInfo",
      args: [address]
    }
  })

  const assetBalances: any = await multicall(config, {
    chainId: getChainIdFromNetworkConfigs(network),
    contracts: contracts_assetBalances
  })

  return Object.values(getDovInfo()).reduce((acc: any, { title, stakingToken }: any, idx) => {
    return {
      ...acc,
      [title]: {
        shareBalance: BigNumber(shareBalances[idx].result).toString(),
        stakingTokenBalance: BigNumber(assetBalances[idx].result[0]).toString(),
        collateralTokenBalance: BigNumber(assetBalances[idx].result[1]).toString(),
      }
    }
  }, {})
}

export const getDOVAllowances = async (address: `0x${string}`) => {
  const network = network$.value

  const contractCalls = Object.values(getDovInfo()).flatMap(({ contractAddress, stakingToken, tokenIngredients }: any) => {
    return [
      {
        address: stakingToken.address,
        abi: DovVaultAbi as Abi,
        functionName: "allowance",
        args: [
          address,
          contractAddress,
        ]
      },
      tokenIngredients.map(({ symbol }: any) => {
        return {
          address: getContractAddress(symbol, network$.value),
          abi: DovVaultAbi as Abi,
          functionName: "allowance",
          args: [
            address,
            contractAddress,
          ]
        }
      })
    ]
  }).flat()

  const allowances: any = await multicall(config, {
    chainId: getChainIdFromNetworkConfigs(network),
    contracts: contractCalls
  })

  return contractCalls.reduce((acc: any, { address, args }: any, idx: number) => {
    const tokenAddress = address
    const allowance = BigNumber(allowances[idx].result).toString()
    const spender = args[1]
    const vaultInfo: any = Object.values(getDovInfo()).find(({ contractAddress }: any) => isSameAddress(contractAddress, spender))
    const vaultTitle = vaultInfo?.title

    return {
      ...acc,
      [vaultTitle]: {
        ...acc[vaultTitle],
        [tokenAddress]: allowance
      }
    }
  }, {})
}

export const depositDOV = async (vaultAddress: `0x${string}`, amount: string, receiver: `0x${string}`, successMessage?: any) => {
  return await makeTransaction({
    address: vaultAddress,
    abi: DovVaultAbi as Abi,
    functionName: "deposit",
    args: [amount, receiver],
    value: parseEther("0"),
    returnReceipt: true,
    successMessage,
  })
}

export const zapInDOV = async (vaultAddress: `0x${string}`, tokenIn: string, amount: string, receiver: `0x${string}`, successMessage?: any) => {
  const isNativeToken = tokenIn == "0x" + "0".repeat(40)

  return await makeTransaction({
    address: vaultAddress,
    abi: DovVaultAbi as Abi,
    functionName: "zapIn",
    args: [tokenIn, amount, receiver],
    value: isNativeToken 
      ? BigInt(amount)
      : parseEther("0"),
    returnReceipt: true,
    successMessage,
  })
}

export const withdrawDOV = async (vaultAddress: `0x${string}`, shareAmount: string, force = false, receiver: `0x${string}`, successMessage?: any) => {
  return await makeTransaction({
    address: vaultAddress,
    abi: DovVaultAbi as Abi,
    functionName: force 
      ? "withdrawOutOfTime"
      : "withdraw"
    ,
    args: [shareAmount, receiver],
    value: parseEther("0"),
    returnReceipt: true,
    successMessage,
  })
}

export const cancelQueueItem = async (vaultQueueAddress: `0x${string}`, index: string) => {
  const receipt: any = await makeTransaction({
    address: vaultQueueAddress,
    abi: DovVaultQueueAbi as Abi,
    functionName: "cancel",
    args: [index],
    value: parseEther("0"),
    returnReceipt: true,
  })

  return receipt
}

export const previewDeposit = async (vaultAddress: `0x${string}`, amount: string) => {
  return readContract(config, {
    address: vaultAddress,
    abi: DovVaultAbi as Abi,
    functionName: "previewDeposit",
    args: [amount]
  })
}

export const queryJoin = (lpAddress: string, joinTokenAddress: string, amount: string) => {
  return readContract(config, {
    address: getContractAddress("DOV_SWAP_UTIL", network$.value as "Berachain Mainnet"),
    abi: DovSwapUtilAbi as Abi,
    functionName: "queryJoin",
    args: [lpAddress, joinTokenAddress, amount]
  })
}

export const previewRedeemMultiAssets = (vaultAddress: `0x${string}`, shareAmount: string) => {
  const vaultInfo: any = Object.values(getDovInfo()).find(({ contractAddress }: any) => isSameAddress(contractAddress, vaultAddress))
  const collateralToken = getStakingToken(Ticker.DovAsset.USDC)

  return forkJoin([
    readContract(config, {
      address: vaultAddress,
      abi: DovVaultAbi as Abi,
      functionName: "previewRedeem",
      args: [vaultInfo.stakingToken.address, shareAmount]
    }),
    readContract(config, {
      address: vaultAddress,
      abi: DovVaultAbi as Abi,
      functionName: "previewRedeem",
      args: [collateralToken.address, shareAmount]
    })
  ])
}

export const getEpochInfos = async (address: `0x${string}`) => {
  const network = network$.value

  const contracts_tradeInfo = Object.values(getDovInfo()).map(({ contractAddress, vaultQueueAddress, stakingToken }: any) => {
    return {
      address: vaultQueueAddress,
      abi: DovVaultQueueAbi as Abi,
      functionName: "getTradeInfo",
      args: []
    }
  })

  const contracts_userInfo = Object.values(getDovInfo()).map(({ contractAddress, vaultQueueAddress, stakingToken }: any) => {
    return {
      address: vaultQueueAddress,
      abi: DovVaultQueueAbi as Abi,
      functionName: "getUserInfo",
      args: [address]
    }
  })

  const tradeInfos: any = await multicall(config, {
    chainId: getChainIdFromNetworkConfigs(network),
    contracts: contracts_tradeInfo
  })
  
  const userInfos: any = await multicall(config, {
    chainId: getChainIdFromNetworkConfigs(network),
    contracts: contracts_userInfo
  })

  return Object.values(getDovInfo()).reduce((acc: any, { title, stakingToken }: any, idx) => {
    return {
      ...acc,
      [title]: {
        epochNum: tradeInfos[idx]?.result?.[0],
        epochStage: tradeInfos[idx]?.result?.[1],
        assetBalance: userInfos[idx]?.result?.[0],
        collateralBalance: userInfos[idx]?.result?.[1],
        withdrawableEpoch: userInfos[idx]?.result?.[2],
        lastDepositedEpoch: userInfos[idx]?.result?.[3],
      }
    }
  }, {})
}

export const getDOVStrategyAPR = async () => {
  const network = network$.value
  
  const contracts_strategyAPR = Object.values(getDovInfo()).map(({ contractAddress, vaultQueueAddress, stakingToken }: any) => {
    return {
      address: vaultQueueAddress,
      abi: DovVaultQueueAbi as Abi,
      functionName: "getOptionsAPR",
      args: []
    }
  })

  const strategyAPRs: any = await multicall(config, {
    chainId: getChainIdFromNetworkConfigs(network),
    contracts: contracts_strategyAPR
  })

  return Object.values(getDovInfo()).reduce((acc: any, { title }: any, idx) => {
    return {
      ...acc,
      [title]: BigNumber(strategyAPRs[idx].result || 0).div(10 ** 12).toNumber()
    }
  }, {})
}

