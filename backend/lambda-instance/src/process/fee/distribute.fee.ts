import BigNumber from "bignumber.js"

import initializeContracts from "../../contract"

import { sendMessage } from "../../utils/slack"
import { ASSET_TOKEN_ADDRESSES, CONTRACT_ADDRESSES } from "../../constants/constants.addresses";
import { Keeper } from "../../constants/safe"
import { safeTx } from "../../../safeTx";
import { LogLevel } from "../../utils/enums";
import { MESSAGE_TYPE } from "../../utils/messages";

export const distributeFee = async () => {
  const chainId = Number(process.env.CHAIN_ID);

  const { FeeDistributor, sVault, ViewAggregator } = await initializeContracts();

  /*
   * Withdraw fees from vault to fee distributor every day at 00:00 UTC (after swapping WETH)
   */ 

  const s_feeReserves_WBTC = await sVault.feeReserves(CONTRACT_ADDRESSES[chainId].WBTC)
  const s_feeReserves_WETH = await sVault.feeReserves(CONTRACT_ADDRESSES[chainId].WETH)
  const s_feeReserves_USDC = await sVault.feeReserves(CONTRACT_ADDRESSES[chainId].USDC)

  const feeReserves = [
    s_feeReserves_WBTC,
    s_feeReserves_WETH,
    s_feeReserves_USDC,
  ]

  if (chainId === 80094) {
    const s_feeReserves_HONEY = await sVault.feeReserves(CONTRACT_ADDRESSES[chainId].HONEY);
    feeReserves.push(s_feeReserves_HONEY);
  }

  const shouldDistributeFee = feeReserves.filter((feeReserve) => feeReserve > 0).length > 0

  if (!shouldDistributeFee) {
    console.log('No fees to distribute')
    return false
  }

  try { 
    const txData = await FeeDistributor.distributeFee.populateTransaction(ASSET_TOKEN_ADDRESSES[chainId])
    await safeTx(
      Keeper.FEE_DISTRIBUTOR,
      {
        to: txData.to,
        data: txData.data,
        value: "0"
      }
    )
  } catch (error) {
    console.log('Error withdrawing fees:', error)
    await sendMessage(
      `\`[Lambda][distribute.fee.ts]\` ${MESSAGE_TYPE.ERROR_DURING_WITHDRAWING_FEES}`,
      LogLevel.ERROR,
      {
        description: error?.message || error,
      }
    )
  }

  /*
   * Check in advance whether it is possible to swap fee Withdraw fees from vault to fee distributor every day at 00:00 UTC (after swapping WETH)
   */ 

  const feeReservesUsdAndEthAvailableUsd = await ViewAggregator.getFeeReservesUsdAndEthAvailableUsd()
  
  const sVaultFeeReservesUsd = new BigNumber(feeReservesUsdAndEthAvailableUsd[0][0]).div(10 ** 30).toNumber()
  const sVaultEthAvailableUsd = new BigNumber(feeReservesUsdAndEthAvailableUsd[1][0]).div(10 ** 30).toNumber()
  const sVaultFeeReservesRatio = sVaultEthAvailableUsd === 0 ? 0 : sVaultFeeReservesUsd / sVaultEthAvailableUsd

  const threshold = 0.8

  if (sVaultFeeReservesRatio > threshold) {
    await sendMessage(
      `\`[Lambda][distribute.fee.ts]\` ${MESSAGE_TYPE.NEED_TO_DEPOSIT_MORE_WETH}`,
      LogLevel.WARN,
      {
        description: `
        - sVault: ${sVaultFeeReservesRatio * 100}%
        `,
      }
    )
  }
}
