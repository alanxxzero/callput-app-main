import fs from 'fs'
import BigNumber from "bignumber.js"

BigNumber.config({
  EXPONENTIAL_AT: 1000,
  DECIMAL_PLACES: 80,
})

export interface ISafeWallet {
  ADMIN: string;
  GOVERNANCE: string;
  TREASURY: string;
  KEEPER_OPTIONS_MARKET_ADDRESS: string;
  KEEPER_POSITION_PROCESSOR_ADDRESS: string;
  KEEPER_SETTLE_OPERATOR_ADDRESS: string;
  KEEPER_POSITION_VALUE_FEEDER_ADDRESS: string;
  KEEPER_POSITION_VALUE_FEEDER_SUB1_ADDRESS: string;
  KEEPER_SPOT_PRICE_FEEDER_ADDRESS: string;
  KEEPER_SPOT_PRICE_FEEDER_SUB1_ADDRESS: string;
  KEEPER_FEE_DISTRIBUTOR_ADDRESS: string;
  KEEPER_CLEARING_HOUSE_ADDRESS: string;
}

// DEPLOYMENT - GENERAL
export const SAFE_WALLET: ISafeWallet = {
  ADMIN: "0x2fb278c39fffF7Fb8D7389a587b1272C84C45f2B",
  GOVERNANCE: "0x021fa1ab5ef36da8d02ce6490af8141c9d8db787",
  TREASURY: "0x44145b17a2a15316042f51174c63158fbe7ea2c3",
  KEEPER_OPTIONS_MARKET_ADDRESS: "0x74d85484604b4cD9137F903cc96b6CbE5d068b4c",
  KEEPER_POSITION_PROCESSOR_ADDRESS: "0x278B60cDbA9F12242EdeAD25dE3338b997059323",
  KEEPER_SETTLE_OPERATOR_ADDRESS: "0x0A08E396Ca32Bc38595f725fc2454E04503Bb15e",
  KEEPER_POSITION_VALUE_FEEDER_ADDRESS: "0xeA5d870E9627421cD00C02144f104bF6aaD6D3AC",
  KEEPER_POSITION_VALUE_FEEDER_SUB1_ADDRESS: "0xAd63894054221F206dE6b5f21E6fFbD6B57860C0",
  KEEPER_SPOT_PRICE_FEEDER_ADDRESS: "0xf557a9E95D532c1d4788eF7350dF870416370765",
  KEEPER_SPOT_PRICE_FEEDER_SUB1_ADDRESS: "0x28d332eFAd36C3cCE04E1F31eBDd1358784B97aC",
  KEEPER_FEE_DISTRIBUTOR_ADDRESS: "0x8B1D78592291C4932Cf85c76b54B87A6F7C838D2",
  KEEPER_CLEARING_HOUSE_ADDRESS: "0xf4a6727476eF785a971FF901C3bb0dacFe2A7aE4",
}

// DEPLOYMENT - VAULT
export const VAULT_THRESHOLD_DAYS = {
  S: 365 * 86400, // 1 year
  M: 1099511627775, // infinity
  L: 1099511627775 // infinity
}

// DEPLOYMENT - OLP MANAGER
export const cooldownDuration = 7 * 86400;

// DEPLOYMENT - POSITION MANAGER
export const executionFee = new BigNumber(0.00006).multipliedBy(10 ** 18).toString();

// TOKEN
export const TOKEN_INFO = {
  WBTC: {
    ADDRESS: "0x0555E30da8f98308EdB960aa94C0Db47230d2B9c",
    DECIMAL: 8
  },
  WETH: {
    ADDRESS: "0x2F6F07CDcf3588944Bf4C42aC74ff24bF56e7590",
    DECIMAL: 18
  },
  USDC: {
    ADDRESS: "0x549943e04f40284185054145c6E4e9568C1D3241",
    DECIMAL: 6
  },
  WBERA: {
    ADDRESS: "0x6969696969696969696969696969696969696969",
    DECIMAL: 18
  },
  HONEY: {
    ADDRESS: "0xFCBD14DC51f0A4d49d5E53C2E0950e0bC26d0Dce",
    DECIMAL: 18
  }
}

// VAULT PRICE FEED
export const MIN_MARK_PRICES = {
  BTC: {
    INDEX: 1,
    VALUE: new BigNumber(60).multipliedBy(new BigNumber(10).pow(30)).toString()
  },
  ETH: {
    INDEX: 2,
    VALUE: new BigNumber(3).multipliedBy(new BigNumber(10).pow(30)).toString()
  }
}

// PRIMARY ORACLE
export const CHAINLINK_FLAGS = "0x3C14e07Edd0dC67442FA96f1Ec6999c57E810a83"
export const CHAINLINK_PRICE_FEED_WBTC = "0x6ce185860a4963106506C203335A2910413708e9"
export const CHAINLINK_PRICE_FEED_WETH = "0x639Fe6ab55C921f74e7fac1ee960C0B6293ba612"
export const CHAINLINK_PRICE_FEED_USDC = "0x50834F3163758fcC1Df9973b6e91f0F0F0434aD3"
export const CHAINLINK_TOKEN_DECIMALS = 8

// VAULT
export const OLP_TOKEN_INFO = {
  WBTC: {
    WEIGHT: 15000,
    BUFFER_AMOUNT: new BigNumber(0.05).multipliedBy(10 ** TOKEN_INFO.WBTC.DECIMAL).toString(), // 0.05 * 10^8
    MAX_USDG_AMOUNT: new BigNumber(30000000).multipliedBy(10 ** 18).toString(), // $30,000,000
    DECREASE_TOLERANCE_AMOUNT: new BigNumber(0.0005).multipliedBy(10 ** TOKEN_INFO.WBTC.DECIMAL).toString(), // 0.005 WBTC
    IS_UNDERLYINGASSET_TOKEN: true,
    IS_STABLE_TOKEN: false,
  },
  WETH: {
    WEIGHT: 15000,
    BUFFER_AMOUNT: new BigNumber(1).multipliedBy(10 ** TOKEN_INFO.WETH.DECIMAL).toString(), // 1 * 10^18
    MAX_USDG_AMOUNT: new BigNumber(30000000).multipliedBy(10 ** 18).toString(), // $30,000,000
    DECREASE_TOLERANCE_AMOUNT: new BigNumber(0.01).multipliedBy(10 ** TOKEN_INFO.WETH.DECIMAL).toString(), // 0.01 WETH
    IS_UNDERLYINGASSET_TOKEN: true,
    IS_STABLE_TOKEN: false,
  },
  USDC: {
    WEIGHT: 65000,
    BUFFER_AMOUNT: new BigNumber(30000).multipliedBy(10 ** TOKEN_INFO.USDC.DECIMAL).toString(), // 30000 * 10^6
    MAX_USDG_AMOUNT: new BigNumber(70000000).multipliedBy(10 ** 18).toString(), // $70,000,000
    DECREASE_TOLERANCE_AMOUNT: new BigNumber(40).multipliedBy(10 ** TOKEN_INFO.USDC.DECIMAL).toString(), // 40 USDC
    IS_UNDERLYINGASSET_TOKEN: false,
    IS_STABLE_TOKEN: true,
  },
  HONEY: {
    WEIGHT: 5000,
    BUFFER_AMOUNT: new BigNumber(3000).multipliedBy(10 ** TOKEN_INFO.HONEY.DECIMAL).toString(), // 3000 * 10^6
    MAX_USDG_AMOUNT: new BigNumber(30000000).multipliedBy(10 ** 18).toString(), // $30,000,000
    DECREASE_TOLERANCE_AMOUNT: new BigNumber(40).multipliedBy(10 ** TOKEN_INFO.HONEY.DECIMAL).toString(), // 40 HONEY
    IS_UNDERLYINGASSET_TOKEN: false,
    IS_STABLE_TOKEN: true,
  }
}

// VAULT UTILS
export const mpIndex = BigInt(0);
export const rpIndex = BigInt(1);
export const mpReleaseDuration = 0; // 0 days
export const rpReleaseDuration = 7 * 86400; // 7 days
export const tradeFeeCalculationLimitRate = 1250 // 12.5%
export const settleFeeCalculationLimitRate = 5000 // 50%

// REFERRAL
export const referralDiscountRate = 1000;
export const referralFeeRebateRate = 1500;

// POSITION MANAGER
export const copyTradeFeeRebateRate = 3000;

// AFTER DEPLOYMENT
export const CONTRACT_ADDRESS = JSON.parse(fs.readFileSync(`./latestAddress.${process.env.HARDHAT_NETWORK}.json`, 'utf8'));
























































