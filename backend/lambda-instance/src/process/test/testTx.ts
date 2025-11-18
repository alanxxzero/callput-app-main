import BigNumber from "bignumber.js"

import initializeContracts from "../../contract"

import { sendMessage } from "../../utils/slack"
import { ASSET_TOKEN_ADDRESSES, CONTRACT_ADDRESSES } from "../../constants/constants.addresses";
import { safeTx } from "../../../safeTx";
import { LogLevel } from "../../utils/enums";
import { MESSAGE_TYPE } from "../../utils/messages";
import { Keeper } from "../../constants/safe";

export const testTx = async () => {
  const chainId = Number(process.env.CHAIN_ID);

  const { WETHToken } = await initializeContracts();

  try { 
    console.log('testTx')
    const txData = await WETHToken.deposit.populateTransaction()
    console.log('txData', txData)
    await safeTx(Keeper.FEE_DISTRIBUTOR, {
      to: txData.to,
      data: txData.data,
      value: "0"
    })
  } catch (error) {
    console.log('Error depositing WETH:', error)
    await sendMessage(
      `\`[Lambda][testTx.ts]\` ${"TEST TX"}`,
      LogLevel.ERROR,
      {
        description: error?.message || error,
      }
    )
  }
}
