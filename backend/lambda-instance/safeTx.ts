import { createSafeClient, SafeClient, SdkStarterKitConfig } from '@safe-global/sdk-starter-kit';
import { TransactionReceipt, ethers } from 'ethers';
import { CONFIG } from './src/constants/constants.config';
import REQUIREMENTS from './src/constants/constants.requirements';
import { SAFE_ADDRESSES, Keeper } from './src/constants/safe';
import { initializeRedis } from './src/redis';
import Redis from 'ioredis';
import { ZERO_ADDRESS } from './src/constants';
import { getMostReliableProvider } from './src/contract';
import { MESSAGE_TYPE } from './src/utils/messages';

interface SafeTxData {
    to: string,
    value: string,
    data: string,
    gasLimit?: string,
}
const TIMEOUT = 10000;

export async function safeTx(
    keeper: Keeper,
    safeTxData: SafeTxData,
    shouldCheckPendingTx: boolean = false
): Promise<{
    isSuccess: boolean,
    tx: ethers.TransactionResponse,
    txHash: string,
    receipt: TransactionReceipt
}> {
    validateSafeTxData(safeTxData);
    const { redis } = await initializeRedis();
    const {provider, rpcUrl} = await getMostReliableProvider();
    const { signerAddress, safeAddress, safeClient } = await getSafeInfo(rpcUrl, keeper);
    
    const nonce = await provider.getTransactionCount(signerAddress, "latest")
    let maxFeePerGas = await getMaxFeePerGasWithBuffer(provider);

    if (shouldCheckPendingTx) {
        const pendingTxData = await getPendingSafeTx(redis, safeAddress, nonce);
        if (pendingTxData) maxFeePerGas = getIncreasedMaxFeePerGas(pendingTxData, maxFeePerGas);
        await updatePendingSafeTx(redis, safeAddress, nonce, maxFeePerGas);
    }

    const safeTxHash = await sendTxWithSafeClient(safeClient, safeTxData, maxFeePerGas, nonce);
    const safeTx = await provider.getTransaction(safeTxHash)
    const { isSuccess, safeTxReceipt } = await (async () => {
        try {
            const safeTxReceipt = await provider.waitForTransaction(safeTxHash, 1, TIMEOUT);
            return {isSuccess: safeTxReceipt.status === 1, safeTxReceipt};
        } catch (error) {
            if (error.message?.includes(MESSAGE_TYPE.NODE_REQUEST_TIMEOUT)) {
                return {isSuccess: false, safeTxReceipt: null};
            }
            throw error;
        }
    })();

    if (shouldCheckPendingTx) {
        await deletePendingSafeTx(redis, safeAddress, nonce);
    }

    if (!isSuccess) console.log("SafeTx failed", safeTxHash, safeTxReceipt);
    
    return {
        isSuccess,
        tx: safeTx,
        txHash: safeTxHash,
        receipt: safeTxReceipt
    }
}

export async function safeTxBatch(
    keeper: Keeper, 
    safeTxs: SafeTxData[]
): Promise<{
    isSuccess: boolean,
    tx: ethers.TransactionResponse,
    txHash: string,
    receipt: TransactionReceipt
}> {
    safeTxs.forEach(validateSafeTxData);
    const {provider, rpcUrl} = await getMostReliableProvider();
    const { signerAddress, safeAddress, safeClient } = await getSafeInfo(rpcUrl, keeper);

    const nonce = await provider.getTransactionCount(signerAddress, "pending")
    let maxFeePerGas = await getMaxFeePerGasWithBuffer(provider);
    
    const safeTxHash = await sendTxWithSafeClient(safeClient, safeTxs, maxFeePerGas, nonce);
    const safeTx = await provider.getTransaction(safeTxHash)
    const safeTxReceipt = await provider.waitForTransaction(safeTxHash, 1, TIMEOUT);
    const isSuccess = safeTxReceipt.status === 1;

    if (!isSuccess) console.log("SafeTx failed", safeTxHash, safeTxReceipt);

    return {
        isSuccess,
        tx: safeTx,
        txHash: safeTxHash,
        receipt: safeTxReceipt
    }
}

const getSignerPrivateKey = (keeper: Keeper): string => {
    switch (keeper) {
        case Keeper.OPTIONS_MARKET:
            return process.env.KEEPER_OPTIONS_MARKET_KEY
        case Keeper.POSITION_PROCESSOR:
            return process.env.KEEPER_POSITION_PROCESSOR_KEY
        case Keeper.SETTLE_OPERATOR:
            return process.env.KEEPER_SETTLE_OPERATOR_KEY
        case Keeper.POSITION_VALUE_FEEDER:
            return process.env.KEEPER_POSITION_VALUE_FEEDER_KEY
        case Keeper.POSITION_VALUE_FEEDER_SUB1:
            return process.env.KEEPER_POSITION_VALUE_FEEDER_SUB1_KEY
        case Keeper.SPOT_PRICE_FEEDER:
            return process.env.KEEPER_SPOT_PRICE_FEEDER_KEY
        case Keeper.SPOT_PRICE_FEEDER_SUB1:
            return process.env.KEEPER_SPOT_PRICE_FEEDER_SUB1_KEY
        case Keeper.FEE_DISTRIBUTOR:
            return process.env.KEEPER_FEE_DISTRIBUTOR_KEY
        case Keeper.CLEARING_HOUSE:
            return process.env.KEEPER_CLEARING_HOUSE_KEY
        default:
            throw new Error("Invalid safe keeper")
    }
}

const getPendingSafeTx = async (redis: Redis, safeAddress: string, nonce: number) => {
    const pendingTx = await redis.get(`pendingSafeTx:${safeAddress}:${nonce}`);

    if (pendingTx) {
        const pendingTxData = JSON.parse(pendingTx);
        
        return pendingTxData;
    }
    return null;
}

const updatePendingSafeTx = async (redis: Redis, safeAddress: string, nonce: number, maxFeePerGas: bigint) => {
    await redis.set(`pendingSafeTx:${safeAddress}:${nonce}`, JSON.stringify({
        maxFeePerGas: maxFeePerGas.toString(),
    }), 'EX', 5 * 60);
}

const deletePendingSafeTx = async (redis: Redis, safeAddress: string, nonce: number) => {
    await redis.del(`pendingSafeTx:${safeAddress}:${nonce}`);
}

const getIncreasedMaxFeePerGas = (pendingTxData: any, maxFeePerGas: bigint) => {
    const maxAllowedFeePerGas = maxFeePerGas * BigInt(2000) / BigInt(100);
    const increasedMaxFeePerGas = BigInt(pendingTxData.maxFeePerGas) * BigInt(120) / BigInt(100);
    maxFeePerGas = increasedMaxFeePerGas > maxFeePerGas ? increasedMaxFeePerGas : maxFeePerGas;
    maxFeePerGas = maxFeePerGas > maxAllowedFeePerGas ? maxAllowedFeePerGas : maxFeePerGas;    
    return maxFeePerGas;
}

const getSafeInfo = async (rpcUrl: string, keeper: Keeper) => {
    const chainId = Number(process.env.CHAIN_ID);
    const privateKey = getSignerPrivateKey(keeper);
    const safeAddress = SAFE_ADDRESSES[chainId][keeper];
    const safeClientConfig: SdkStarterKitConfig = {
        provider: rpcUrl,
        signer: privateKey,
        safeAddress
    }
    if (REQUIREMENTS[chainId].TX_SERVICE_URL) {
        safeClientConfig.txServiceUrl = REQUIREMENTS[chainId].TX_SERVICE_URL
    }
    const safeClient = await createSafeClient(safeClientConfig)
    const signerAddress = ethers.computeAddress("0x" + privateKey)
    return {
        signerAddress,
        safeAddress,
        safeClient
    };
}

const getMaxFeePerGasWithBuffer = async (provider: ethers.JsonRpcProvider) : Promise<bigint> => {
    const feeData = await provider.getFeeData();

    if (typeof feeData.maxFeePerGas == 'undefined' || typeof feeData.maxPriorityFeePerGas == 'undefined') {
        throw new Error(MESSAGE_TYPE.NO_FEE_DATA_FOUND);
    }

    const bufferedMaxFee = feeData.maxFeePerGas * BigInt(120) / BigInt(100);
    const bufferedPriorityFee = feeData.maxPriorityFeePerGas * BigInt(120) / BigInt(100);
    
    return bufferedMaxFee > bufferedPriorityFee ? bufferedMaxFee : bufferedPriorityFee;
}

const validateSafeTxData = (safeTxData: SafeTxData) => {
    if (safeTxData.to === ZERO_ADDRESS) {
        throw new Error("Zero address is not allowed for safeTx.")
    }
}

const sendTxWithSafeClient = async (
    safeClient: SafeClient,
    safeTxData: SafeTxData | SafeTxData[],
    maxFeePerGas: bigint,
    nonce: number
): Promise<string> => {
    try {
        const transactions = Array.isArray(safeTxData) ? safeTxData : [safeTxData];
        const safeTxResult = await safeClient.send({
            transactions: transactions.map(tx => ({
                to: tx.to,
                value: tx.value,
                data: tx.data,
                ...(tx.gasLimit && { gas: tx.gasLimit }) // Map gasLimit to 'gas' for Safe SDK
            })),
            ...(maxFeePerGas && { maxFeePerGas: maxFeePerGas.toString() }),
            nonce,
        })
        return safeTxResult.transactions?.ethereumTxHash
    } catch (error) {
        console.error("sendTxWithSafeClient failed", error);
        throw error;
    }
}