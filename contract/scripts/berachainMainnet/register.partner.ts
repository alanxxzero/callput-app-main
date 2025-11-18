import BigNumber from "bignumber.js";

import { getDeployedContracts } from "./deployedContracts";
import { ethers } from "hardhat";

BigNumber.config({
  EXPONENTIAL_AT: 1000,
  DECIMAL_PLACES: 80,
});

export async function registerPartner(ethers: any, addressMap: any) {
  const [
    DEPLOYER,
    KEEPER_OPTIONS_MARKET,
    KEEPER_POSITION_PROCESSOR,
    KEEPER_SETTLE_OPERATOR,
    KEEPER_POSITION_VALUE_FEEDER,
    KEEPER_POSITION_VALUE_FEEDER_SUB1,
    KEEPER_SPOT_PRICE_FEEDER,
    KEEPER_SPOT_PRICE_FEEDER_SUB1,
    KEEPER_FEE_DISTRIBUTOR,
    KEEPER_CLEARING_HOUSE,
    TEST_USER1,
    TEST_USER2,
  ] = await (ethers as any).getSigners();
  const { referral } = await getDeployedContracts(ethers, addressMap);
  console.log("Start partner registration with the deployer:", DEPLOYER.address);

  /*
   *
   * Add Partners
   *
   */

  // 2025-01-22
  const partnersToAdd = [
    "0xa5aD419304107d4377Cf70533D7D5DfefC9Fdc9B",
    "0x65A3BC7233af4B908bcb59962D33cf1cc84b6e05",
    "0xE5fc376da76ae626871Cb3332Bf8FD40f5eD7fD0",
  ];1
  const isPartner = [true, true, true];
  const discountRatesToAdd = [8000, 8000, 8000];
  const termsToAdd = [253402300740, 253402300740, 253402300740];

  for (let i = 0; i < partnersToAdd.length; i++) {
    console.log("working on ", partnersToAdd[i], " at discount rate of ", discountRatesToAdd[i], "..");
    await referral.setPartner(partnersToAdd[i], isPartner[i], discountRatesToAdd[i], termsToAdd[i]);
  }

  // Check
  for (let i = 0; i < partnersToAdd.length; i++) {
    const isPartner = await referral.partners(partnersToAdd[i]);
    const discountRate = await referral.partnersDiscountRate(partnersToAdd[i]);
    const term = await referral.partnersTerm(partnersToAdd[i]);
    console.log(
      partnersToAdd[i],
      ":",
      isPartner.toString() + " / " + discountRate.toString() + " / " + term.toString()
    );
  }

  console.log("Partner registration completed");
}

(async () => {
  await registerPartner(ethers, null);
})();
