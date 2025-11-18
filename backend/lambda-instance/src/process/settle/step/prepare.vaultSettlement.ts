import initializeContracts from "../../../contract";
import { Keeper } from "../../../constants/safe"
import { safeTx } from "../../../../safeTx";

export const prepareVaultSettlement = async () => {
  const { sVaultUtils } = await initializeContracts();
  console.log("running step 1 : prepare vault settlement");

  const prevSelfOriginExpiriesToSettle = await sVaultUtils.getSelfOriginExpiriesToSettle();
  const txData = await sVaultUtils.prepareExpiriesToSettle.populateTransaction();

  const { isSuccess } = await safeTx(
    Keeper.SETTLE_OPERATOR,
    {
      to: txData.to,
      data: txData.data,
      value: "0"
    }
  );

  if (!isSuccess) {
    console.log(`Failed to prepare self expiries for contract ${sVaultUtils.constructor.name}.`);
    return false;
  }

  const nextSelfOriginExpiriesToSettle = await sVaultUtils.getSelfOriginExpiriesToSettle();
  console.log(
    "Self expiries for settlement:",
    prevSelfOriginExpiriesToSettle,
    "->",
    nextSelfOriginExpiriesToSettle
  );

  return true;
};
