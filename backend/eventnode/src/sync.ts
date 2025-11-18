

import { ethers } from 'ethers'
import { AppDataSource } from './data-source'
import { SyncedBlock } from './entity/syncedBlock'
import { getLogs } from './utils/logs'
import { schedules } from './sync.schedule'

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL)
export const queryRunner = AppDataSource.createQueryRunner()

export const sync = async (fromBlock: number) => {
  const blockNumber = await provider.getBlockNumber()
  
  const toBlock = Math.min(
    fromBlock + Number(process.env.BLOCK_BATCH_SIZE),
    blockNumber,
  ) 

  console.log(`scanning from: ${fromBlock} to: ${toBlock}`)

  if (toBlock < fromBlock) {
    await new Promise((resolve) => setTimeout(resolve, 200))
    return sync(fromBlock)
  }

  await queryRunner.connect()
  await queryRunner.startTransaction()

  try {
    for await (const { address, topic, abi, handler } of schedules) {
      await getLogs(fromBlock, toBlock, address, topic, abi, handler);
    }

    // ** Block syncing
    const syncedBlock: SyncedBlock = await SyncedBlock.get(0) || new SyncedBlock({ id: 0 });
    syncedBlock.blockNumber = toBlock;
    
    await syncedBlock.save();
    await queryRunner.commitTransaction();

    return await sync(toBlock + 1);
  } catch (e) {
    console.log(e, 'e')

    await queryRunner.rollbackTransaction()

    await sync(fromBlock)
  }
}