import fs from 'fs'
import BigNumber from "bignumber.js"

BigNumber.config({
  EXPONENTIAL_AT: 1000,
  DECIMAL_PLACES: 80,
})

export const CONTRACT_ADDRESS = JSON.parse(fs.readFileSync(`./latestAddress.${process.env.HARDHAT_NETWORK}.json`, 'utf8'))

// TOKENS
export const WBTC = "0x286F1C3f0323dB9c91D1E8f45c8DF2d065AB5fae"
const WBTC_DECIMAL = 8
export const WETH = "0x6E1E9896e93F7A71ECB33d4386b49DeeD67a231A"
const WETH_DECIMAL = 18
export const USDC = "0xd6D83aF58a19Cd14eF3CF6fe848C9A4d21e5727c"
const USDC_DECIMAL = 6
export const WBERA = "0x7507c1dc16935B82698e4C63f2746A2fCf994dF8"
const WBERA_DECIMAL = 18
export const HONEY = "0x0E4aaF1351de4c0264C5c7056Ef3777b41BD8e03"
const HONEY_DECIMAL = 18

// VAULT PRICE FEED
// export const CHAINLINK_FLAGS = "0x3C14e07Edd0dC67442FA96f1Ec6999c57E810a83"
// export const CHAINLINK_PRICE_FEED_WBTC = "0x6ce185860a4963106506C203335A2910413708e9"
// export const CHAINLINK_PRICE_FEED_WETH = "0x639Fe6ab55C921f74e7fac1ee960C0B6293ba612"
// export const CHAINLINK_PRICE_FEED_USDC = "0x50834F3163758fcC1Df9973b6e91f0F0F0434aD3"
// export const CHAINLINK_TOKEN_DECIMALS = 8

// VAULT
export const sThresholdDays = 2 * 86400 // 2 days of thresholdDays
export const mThresholdDays = 90 * 86400 // 90 days of thresholdDays
export const lThresholdDays = 1099511627775 // Max value for uint40 (infinite thresholdDays)

export const btcTokenWeight = 15000;
export const ethTokenWeight = 15000;
export const usdcTokenWeight = 55000;
export const honeyTokenWeight = 15000;

export const wbtcBufferAmounts = new BigNumber(4).multipliedBy(10 ** WBTC_DECIMAL).toString() // 4_00000000
export const wethBufferAmounts = new BigNumber(65).multipliedBy(10 ** WETH_DECIMAL).toString() // 65_000000000000000000
export const usdcBufferAmounts = new BigNumber(150000).multipliedBy(10 ** USDC_DECIMAL).toString() // 150000_000000
export const honeyBufferAmounts = new BigNumber(40000).multipliedBy(10 ** HONEY_DECIMAL).toString() // 40000_000000000000000000

export const btcMaxUsdgAmount = new BigNumber(30000000).multipliedBy(10 ** 18).toString(); // $30,000,000
export const ethMaxUsdgAmount = new BigNumber(30000000).multipliedBy(10 ** 18).toString();
export const usdcMaxUsdgAmount = new BigNumber(70000000).multipliedBy(10 ** 18).toString();
export const honeyMaxUsdgAmount = new BigNumber(30000000).multipliedBy(10 ** 18).toString();

// VAULT UTILS
export const mpReleaseDuration = 0; // 0 days
export const rpReleaseDuration = 7 * 86400; // 7 days
export const tradeFeeCalculationLimitRate = 1250 // 12.5%
export const settleFeeCalculationLimitRate = 5000 // 50%

// OLP MANAGER
export const cooldownDuration = 7 * 86400;

// POSITION MANAGER
export const executionFee = new BigNumber(0.00006).multipliedBy(10 ** 18).toString();
export const socialTradingLeaderFeeRebateRate = 3000;

// FEE DISTRIBUTOR
export const GOVERNANCE = "0x0"
export const TREASURY = "0x0"

// REFERRAL
export const referralDiscountRate = 1000;
export const referralFeeRebateRate = 1500;