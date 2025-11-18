import { initializeRedis } from "../redis"

const FALLBACK_PROCESSING_TIMEOUT = 10

// prevent feed duplication
export const processFeedTx = async (key: string, txCallback: (...args: any) => any) => {
    const { redis } = await initializeRedis()

    const isProcessing = await redis.get(`isProcessing:${key}`)

    if (isProcessing) {
        console.log(`processTx: ${key} is already processing`)
        return {
            isSuccess: false,
            receipt: { status: null }
        }
    }

    // set processing flag
    // @dev: set a timeout to prevent tx from being stuck in processing state
    await redis.set(`isProcessing:${key}`, 'true', 'EX', FALLBACK_PROCESSING_TIMEOUT)

    // process tx
    const result = await txCallback()

    await redis.del(`isProcessing:${key}`)

    return result
}