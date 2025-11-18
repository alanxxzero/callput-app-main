import '@openzeppelin/hardhat-upgrades';
import "@nomicfoundation/hardhat-toolbox";
import { HardhatUserConfig } from "hardhat/config";
import { config as dotenvConfig } from 'dotenv';
import { resolve } from 'path';
import { loadEnv } from "./utils/parseFiles";
require("hardhat-contract-sizer")

dotenvConfig({
  path: resolve(__dirname, './environments/.env.defaults')
});

if (process.env.HARDHAT_NETWORK == "berachainMainnet") {
  dotenvConfig({
    path: resolve(__dirname, './environments/berachainMainnet/.env')
  })
}

if (process.env.HARDHAT_NETWORK == "newArbitrumOne") {
  dotenvConfig({ 
    path: resolve(__dirname, './environments/newArbitrumOne/.env')
  })
}

// const localEnv = loadEnv("local");
// const arbitrumOneEnv = loadEnv("arbitrumOne");
// const arbitrumSepoliaEnv = loadEnv("arbitrumSepolia");
// const berachainBArtioEnv = loadEnv("berachainBArtio");
// const berachainCArtioEnv = loadEnv("berachainCArtio");
const berachainMainnetEnv = loadEnv("berachainMainnet");
const newArbitrumOneEnv = loadEnv("newArbitrumOne");

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: '0.8.16',
        settings: {
          optimizer: {
            enabled: true,
            runs: 10,
          },
          viaIR: true,
        },
      },
    ],
  },
  networks: {
    // arbitrumOne: {
    //   url: arbitrumOneEnv.RPC_URL,
    //   gasPrice: Number(arbitrumOneEnv.GAS_PRICE),
    //   chainId: Number(arbitrumOneEnv.CHAIN_ID),
    //   accounts: [
    //     arbitrumOneEnv.DEPLOYER_KEY,
    //     arbitrumOneEnv.KEEPER_OPTIONS_MARKET_KEY,
    //     arbitrumOneEnv.KEEPER_POSITION_PROCESSOR_KEY,
    //     arbitrumOneEnv.KEEPER_SETTLE_OPERATOR_KEY,
    //     arbitrumOneEnv.KEEPER_POSITION_VALUE_FEEDER_KEY,
    //     arbitrumOneEnv.KEEPER_POSITION_VALUE_FEEDER_SUB1_KEY,
    //     arbitrumOneEnv.KEEPER_SPOT_PRICE_FEEDER_KEY,
    //     arbitrumOneEnv.KEEPER_SPOT_PRICE_FEEDER_SUB1_KEY,
    //     arbitrumOneEnv.KEEPER_FEE_DISTRIBUTOR_KEY,
    //     arbitrumOneEnv.KEEPER_CLEARING_HOUSE_KEY,
    //     arbitrumOneEnv.TEST_USER1_KEY,
    //     arbitrumOneEnv.TEST_USER2_KEY,
    //   ].filter(Boolean) as string[], // Remove any undefined keys
    // },
    // arbitrumSepolia: {
    //   url: arbitrumSepoliaEnv.RPC_URL,
    //   gasPrice: Number(arbitrumSepoliaEnv.GAS_PRICE),
    //   chainId: Number(arbitrumSepoliaEnv.CHAIN_ID),
    //   accounts: [
    //     arbitrumSepoliaEnv.DEPLOYER_KEY,
    //     arbitrumSepoliaEnv.KEEPER_OPTIONS_MARKET_KEY,
    //     arbitrumSepoliaEnv.KEEPER_POSITION_PROCESSOR_KEY,
    //     arbitrumSepoliaEnv.KEEPER_SETTLE_OPERATOR_KEY,
    //     arbitrumSepoliaEnv.KEEPER_POSITION_VALUE_FEEDER_KEY,
    //     arbitrumSepoliaEnv.KEEPER_POSITION_VALUE_FEEDER_SUB1_KEY,
    //     arbitrumSepoliaEnv.KEEPER_SPOT_PRICE_FEEDER_KEY,
    //     arbitrumSepoliaEnv.KEEPER_SPOT_PRICE_FEEDER_SUB1_KEY,
    //     arbitrumSepoliaEnv.KEEPER_FEE_DISTRIBUTOR_KEY,
    //     arbitrumSepoliaEnv.KEEPER_CLEARING_HOUSE_KEY,
    //     arbitrumSepoliaEnv.TEST_USER1_KEY,
    //     arbitrumSepoliaEnv.TEST_USER2_KEY,
    //   ].filter(Boolean) as string[], // Remove any undefined keys
    // },
    // berachainBArtio: {
    //   url: berachainBArtioEnv.RPC_URL,
    //   gasPrice: Number(berachainBArtioEnv.GAS_PRICE),
    //   chainId: Number(berachainBArtioEnv.CHAIN_ID),
    //   accounts: [
    //     berachainBArtioEnv.DEPLOYER_KEY,
    //     berachainBArtioEnv.KEEPER_OPTIONS_MARKET_KEY,
    //     berachainBArtioEnv.KEEPER_POSITION_PROCESSOR_KEY,
    //     berachainBArtioEnv.KEEPER_SETTLE_OPERATOR_KEY,
    //     berachainBArtioEnv.KEEPER_POSITION_VALUE_FEEDER_KEY,
    //     berachainBArtioEnv.KEEPER_POSITION_VALUE_FEEDER_SUB1_KEY,
    //     berachainBArtioEnv.KEEPER_SPOT_PRICE_FEEDER_KEY,
    //     berachainBArtioEnv.KEEPER_SPOT_PRICE_FEEDER_SUB1_KEY,
    //     berachainBArtioEnv.KEEPER_FEE_DISTRIBUTOR_KEY,
    //     berachainBArtioEnv.KEEPER_CLEARING_HOUSE_KEY,
    //     berachainBArtioEnv.TEST_USER1_KEY,
    //     berachainBArtioEnv.TEST_USER2_KEY,
    //   ].filter(Boolean) as string[],
    // },
    // berachainCArtio: {
    //   url: berachainCArtioEnv.RPC_URL,
    //   gasPrice: Number(berachainCArtioEnv.GAS_PRICE),
    //   chainId: Number(berachainCArtioEnv.CHAIN_ID),
    //   accounts: [
    //     berachainCArtioEnv.DEPLOYER_KEY,
    //     berachainCArtioEnv.KEEPER_OPTIONS_MARKET_KEY,
    //     berachainCArtioEnv.KEEPER_POSITION_PROCESSOR_KEY,
    //     berachainCArtioEnv.KEEPER_SETTLE_OPERATOR_KEY,
    //     berachainCArtioEnv.KEEPER_POSITION_VALUE_FEEDER_KEY,
    //     berachainCArtioEnv.KEEPER_POSITION_VALUE_FEEDER_SUB1_KEY,
    //     berachainCArtioEnv.KEEPER_SPOT_PRICE_FEEDER_KEY,
    //     berachainCArtioEnv.KEEPER_SPOT_PRICE_FEEDER_SUB1_KEY,
    //     berachainCArtioEnv.KEEPER_FEE_DISTRIBUTOR_KEY,
    //     berachainCArtioEnv.KEEPER_CLEARING_HOUSE_KEY,
    //     berachainCArtioEnv.TEST_USER1_KEY,
    //     berachainCArtioEnv.TEST_USER2_KEY,
    //   ].filter(Boolean) as string[],
    // },
    berachainMainnet: {
      url: berachainMainnetEnv.RPC_URL,
      gasPrice: Number(berachainMainnetEnv.GAS_PRICE),
      chainId: Number(berachainMainnetEnv.CHAIN_ID),
      accounts: [
        berachainMainnetEnv.DEPLOYER_KEY,
        berachainMainnetEnv.TEST_USER1_KEY,
      ].filter(Boolean) as string[], // Remove any undefined keys
    },
    newArbitrumOne: {
      url: newArbitrumOneEnv.RPC_URL,
      gasPrice: Number(newArbitrumOneEnv.GAS_PRICE),
      chainId: Number(newArbitrumOneEnv.CHAIN_ID),
      accounts: [
        newArbitrumOneEnv.DEPLOYER_KEY,
        newArbitrumOneEnv.TEST_USER1_KEY,
      ].filter(Boolean) as string[], // Remove any undefined keys
    },
    // "local": {
    //   url: localEnv.RPC_URL,
    //   gasPrice: 20000000000,
    //   chainId: 31337,
    //   accounts: [
    //     localEnv.DEPLOYER_KEY,

    //     localEnv.KEEPER_OPTIONS_MARKET_KEY!,
    //     localEnv.KEEPER_POSITION_PROCESSOR_KEY!,
    //     localEnv.KEEPER_SETTLE_OPERATOR_KEY!,
    //     localEnv.KEEPER_POSITION_VALUE_FEEDER_KEY!,
    //     localEnv.KEEPER_POSITION_VALUE_FEEDER_SUB1_KEY!,
    //     localEnv.KEEPER_SPOT_PRICE_FEEDER_KEY!,
    //     localEnv.KEEPER_SPOT_PRICE_FEEDER_SUB1_KEY!,
    //     localEnv.KEEPER_FEE_DISTRIBUTOR_KEY!,
    //     localEnv.KEEPER_CLEARING_HOUSE_KEY!,

    //     localEnv.TEST_USER1_KEY!,
    //     localEnv.TEST_USER2_KEY!,
    //   ],
    // },
    hardhat: {
      allowUnlimitedContractSize: true,
      blockGasLimit: 40_000_000,
      throwOnCallFailures: false,
      accounts: {
        mnemonic: 'test options test options test options test options test options test options',
      },
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
};

export default config;