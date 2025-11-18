import { Interface, ethers } from "ethers"

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL)

export const getLogs = async (
  fromBlock: number, 
  toBlock: number,
  address: string, 
  topic: any, 
  abi: any[],
  handler: (log: any) => Promise<void>,
) => {

  const topics = [topic]

  const logs = await provider.getLogs({
    fromBlock: fromBlock,
    toBlock: toBlock,
    address,
    topics,
  })

  // uniq blocks
  const blockToQuery = [...new Set(logs.map((log) => log.blockNumber))]

  // get block timestamp
  const blocks = await Promise.all(blockToQuery.map((blockNumber) => provider.getBlock(blockNumber)))
  
  // block number => block timestamp
  const blockTimestamps = blocks.reduce((acc, block) => {
    acc[block.number] = block.timestamp
    return acc
  }, {})

  const results = logs.map((log) => {
    const args = new Interface(abi).parseLog({
        data: log.data,
        topics: log.topics as any,
      }).args

    return {
      args,
      transactionHash: log.transactionHash,
      blockNumber: log.blockNumber,
      address: log.address,
      block: {
        timestamp: blockTimestamps[log.blockNumber],
      }
    }
  })

  for await (const log of results) {
    await handler(log)
  }
  
  return results
}