import fs from 'fs'
import BigNumber from "bignumber.js"

BigNumber.config({
  EXPONENTIAL_AT: 1000,
  DECIMAL_PLACES: 80,
})

export const CONTRACT_ADDRESS = JSON.parse(fs.readFileSync(`./latestAddress.${process.env.HARDHAT_NETWORK}.json`, 'utf8'))

// btcTokenWeight
export const WBTC = "0x7f908D0faC9B8D590178bA073a053493A1D0A5d4"
const WBTC_DECIMAL = 8
export const WETH = "0xc556bAe1e86B2aE9c22eA5E036b07E55E7596074"
const WETH_DECIMAL = 18
export const USDC = "0x1459F5c7FC539F42ffd0c63A0e4AD000dfF70919"
const USDC_DECIMAL = 6


// VAULT PRICE FEED
export const CHAINLINK_FLAGS = "0x0000000000000000000000000000000000000000";
export const CHAINLINK_PRICE_FEED_WBTC = "0x56a43EB56Da12C0dc1D972ACb089c06a5dEF8e69"
export const CHAINLINK_PRICE_FEED_WETH = "0xd30e2101a97dcbAeBCBC04F14C3f624E67A35165"
export const CHAINLINK_PRICE_FEED_USDC = "0x0153002d20B96532C639313c2d54c3dA09109309"
export const CHAINLINK_TOKEN_DECIMALS = 8

// VAULT
export const sThresholdDays = 2 * 86400 // 2 days of thresholdDays
export const mThresholdDays = 90 * 86400 // 90 days of thresholdDays
export const lThresholdDays = 1099511627775 // Max value for uint40 (infinite thresholdDays)

export const btcTokenWeight = 15000;
export const ethTokenWeight = 15000;
export const usdcTokenWeight = 70000;

export const wbtcBufferAmounts = new BigNumber(1).multipliedBy(10 ** WBTC_DECIMAL).toString() // 1_00000000
export const wethBufferAmounts = new BigNumber(10).multipliedBy(10 ** WETH_DECIMAL).toString() // 10_000000000000000000
export const usdcBufferAmounts = new BigNumber(15000).multipliedBy(10 ** USDC_DECIMAL).toString() // 15000_000000

export const btcMaxUsdgAmount = new BigNumber(30000000).multipliedBy(10 ** 18).toString(); // $30,000,000
export const ethMaxUsdgAmount = new BigNumber(30000000).multipliedBy(10 ** 18).toString(); // $30,000,000
export const usdcMaxUsdgAmount = new BigNumber(70000000).multipliedBy(10 ** 18).toString(); // $30,000,000

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