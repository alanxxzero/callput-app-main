
import BigNumber from 'bignumber.js';
import { ethers, network, upgrades } from "hardhat";
import { formatEther } from "ethers";
import { writeFileSync } from 'fs'

import { init } from "./init.config";

import { deployAssetTokens } from "./deployContracts/deploy.assetTokens";
import { deployOptionsAuthority } from "./deployContracts/deploy.optionsAuthority";
import { deployVaultPriceFeed } from "./deployContracts/deploy.vaultPriceFeed";
import { deployOptionsMarket } from "./deployContracts/deploy.optionsMarket";
import { deployOptionsToken } from "./deployContracts/deploy.optionsToken";
import { deployVault } from "./deployContracts/deploy.vault";
import { deployVaultUtils } from './deployContracts/deploy.vaultUtils';
import { deployUSDG } from "./deployContracts/deploy.usdg";
import { deployOLP } from "./deployContracts/deploy.olp";
import { deployOlpManager } from "./deployContracts/deploy.olpManager";
import { deployRewardTracker } from "./deployContracts/deploy.rewardTacker";
import { deployRewardDistributor } from './deployContracts/deploy.rewardDistributor';
import { deployRewardRouterV2 } from './deployContracts/deploy.rewardRouterV2';
import { deployController } from './deployContracts/deploy.controller';
import { deployPositionManager } from './deployContracts/deploy.positionManager';
import { deploySettleManager } from './deployContracts/deploy.settleManager';
import { deployFeeDistributor } from './deployContracts/deploy.feeDistributor';
import { deployFastPriceFeed } from './deployContracts/deploy.fastPriceFeed';
import { deployPositionValueFeed } from './deployContracts/deploy.positionValueFeed';
import { deploySettlePriceFeed } from './deployContracts/deploy.settlePriceFeed';
import { deploySpotPriceFeed } from './deployContracts/deploy.spotPriceFeed';
import { deployViewAggregator } from './deployContracts/deploy.viewAggreagtor';
import { deployReferral } from './deployContracts/deploy.referral';
import { deployPrimaryOracle } from './deployContracts/deploy.primaryOracle';
import { SAFE_WALLET } from './constants';

BigNumber.config({
  EXPONENTIAL_AT: 1000,
  DECIMAL_PLACES: 80,
})

async function main() {
  const [
    DEPLOYER,
  ] = await (ethers as any).getSigners()
  
  console.log("Deploying contracts with the account: ", DEPLOYER.address);
  console.log("Deploying on the following network: ", process.env.HARDHAT_NETWORK)
  
  // STEP 1. DEPLOYMENT
  // const CONTRACT_ADDRESS: any = {}

  // const { wbtc, weth, usdc, wbera, honey } = await deployAssetTokens(ethers, { upgrades, CONTRACT_ADDRESS }) // TOKEN_INFO에 TOKEN 주소와 Decimal 입력해야함
  // const { optionsAuthority } = await deployOptionsAuthority(ethers, { upgrades, CONTRACT_ADDRESS })  
  // const { vaultPriceFeed } =  await deployVaultPriceFeed(ethers, { upgrades, CONTRACT_ADDRESS })

  // const { optionsMarket } = await deployOptionsMarket(ethers, { upgrades, CONTRACT_ADDRESS })
  
  // const { sVault, mVault, lVault } = await deployVault(ethers, { upgrades, CONTRACT_ADDRESS })
  // const { sVaultUtils, mVaultUtils, lVaultUtils } = await deployVaultUtils(ethers, { upgrades, CONTRACT_ADDRESS })
  
  // const { controller } = await deployController(ethers, { upgrades, CONTRACT_ADDRESS })
  
  // const { susdg, musdg, lusdg } = await deployUSDG(ethers, { upgrades, CONTRACT_ADDRESS })
  // const { solp, molp, lolp } = await deployOLP(ethers, { upgrades, CONTRACT_ADDRESS })
  // const { sOlpManager, mOlpManager, lOlpManager } = await deployOlpManager(ethers, { upgrades, CONTRACT_ADDRESS })
  // const { sRewardTracker, mRewardTracker, lRewardTracker } = await deployRewardTracker(ethers, { upgrades, CONTRACT_ADDRESS })
  // const { sRewardDistributor, mRewardDistributor, lRewardDistributor } = await deployRewardDistributor(ethers, { upgrades, CONTRACT_ADDRESS })
  // const { sRewardRouterV2, mRewardRouterV2, lRewardRouterV2 } = await deployRewardRouterV2(ethers, { upgrades, CONTRACT_ADDRESS })
  
  // const { positionManager } = await deployPositionManager(ethers, { upgrades, CONTRACT_ADDRESS })
  // const { settleManager } = await deploySettleManager(ethers, { upgrades, CONTRACT_ADDRESS })
  // const { feeDistributor } = await deployFeeDistributor(ethers, { upgrades, CONTRACT_ADDRESS })
  
  // const { btcOptionsToken, ethOptionsToken } = await deployOptionsToken(ethers, { upgrades, CONTRACT_ADDRESS })
  
  // const { fastPriceEvents, fastPriceFeed } = await deployFastPriceFeed(ethers, { upgrades, CONTRACT_ADDRESS })
  // const { positionValueFeed } = await deployPositionValueFeed(ethers, { upgrades, CONTRACT_ADDRESS })
  // const { settlePriceFeed } = await deploySettlePriceFeed(ethers, { upgrades, CONTRACT_ADDRESS })
  // const { spotPriceFeed } = await deploySpotPriceFeed(ethers, { upgrades, CONTRACT_ADDRESS })
  // const { primaryOracle } = await deployPrimaryOracle(ethers, { upgrades, CONTRACT_ADDRESS })

  // const { viewAggregator } = await deployViewAggregator(ethers, { upgrades, CONTRACT_ADDRESS })
  // const { referral } = await deployReferral(ethers, { upgrades, CONTRACT_ADDRESS })

  // writeFileSync(`latestAddress.${process.env.HARDHAT_NETWORK}.json`, JSON.stringify(CONTRACT_ADDRESS, null, 2))
  // writeFileSync(`../shared/latestAddress.${process.env.HARDHAT_NETWORK}.json`, JSON.stringify(CONTRACT_ADDRESS, null, 2))

  // STEP2. INIT
  const OWNABLE_UPGRADEABLE_CONTRACT_ADDRESS = "0x7d5C6fcdEBDAFc75a17A56B783f5a148442DFd7b";

  const CONTRACT_ADDRESS = {
    WBTC: '0x0555E30da8f98308EdB960aa94C0Db47230d2B9c',
    WETH: '0x2F6F07CDcf3588944Bf4C42aC74ff24bF56e7590',
    USDC: '0x549943e04f40284185054145c6E4e9568C1D3241',
    WBERA: '0x6969696969696969696969696969696969696969',
    HONEY: '0xFCBD14DC51f0A4d49d5E53C2E0950e0bC26d0Dce',
    OPTIONS_AUTHORITY: '0xa61A2dEd896D1926A5cAf7F98A7Ad9349d8dc9Ab',
    VAULT_PRICE_FEED: '0x0f6d134F8244475B89EF31a6BfEB13B30E29267C',
    OPTIONS_MARKET: '0xC89A05956faB0E81654E8Bd865C83d12f3eD4870',
    S_VAULT: '0x66f782E776a91CE9c33EcD07f7D2a9743775209e',
    M_VAULT: '0xE5693cf40142Cf04ff0582f11A420892fd9a774B',
    L_VAULT: '0x734964E8AAB65D6258f16f4CBEE3B8C2ffC4Cd39',
    S_VAULT_UTILS: '0xc7aC44419Fe4aC0fe47072b56471bb82829F072C',
    M_VAULT_UTILS: '0xEfF76f36BC1A4D260ABC3008AD8AC146d051FaBD',
    L_VAULT_UTILS: '0x2577834A20c40a684DEA294c4482c59525301207',
    CONTROLLER: '0xb706379CE35Cc8f035428cF8F43C63F8AD9948fD',
    S_USDG: '0xa8b63965490a33AC3b440C7a2fCd6AfB2eB61eb1',
    M_USDG: '0x330A48bCe71577c15AC4fA8424D53d18379A4cd9',
    L_USDG: '0x5A25D8322B1a50F4C5A750620264596De721FEAB',
    S_OLP: '0xFC89d8Beb356ee287CcF266F7ade4Fc49fB501Ea',
    M_OLP: '0x3046A1ED0e645C02A3C91d0a5c8af8D09d75b445',
    L_OLP: '0x2eb726f77293E310E3EEc95fB264552328116795',
    S_OLP_MANAGER: '0x01d8D689C75423F7e3DF93D178c70cf04b5d23D3',
    M_OLP_MANAGER: '0xCDb549CC56c63c03d536E6131e1327102382bD30',
    L_OLP_MANAGER: '0x61250e80f77ac8c37D5588A1f1e15f88D5D1d348',
    S_REWARD_TRACKER: '0xA6fd5df0A2EC1B72df6fd4005ff6bB6e454E8A30',
    M_REWARD_TRACKER: '0xE6fC429CEBBfE3a0d4254b9E9A0c3B8d416F529e',
    L_REWARD_TRACKER: '0x2A46AE905bD469fCb21B4e2cc7aACCBa041C0F96',
    S_REWARD_DISTRIBUTOR: '0x721Bc48Bae4B84a0Be18c45F05bc0dcDC5A97f9B',
    M_REWARD_DISTRIBUTOR: '0x1524E2794718cd74d21862c704F5A965704Ddf60',
    L_REWARD_DISTRIBUTOR: '0x7256EC2a59F6c2Da894B60895Cf25CFd66Fd5Afe',
    S_REWARD_ROUTER_V2: '0x3277CB7dfa81849215B8d413b832054052e3d182',
    M_REWARD_ROUTER_V2: '0x139fA03e9bC5A3a0c5e66d3B5D59fDEd67ECB659',
    L_REWARD_ROUTER_V2: '0x92749463D1e19fFBb02c405Eec0110e8518c157B',
    POSITION_MANAGER: '0x3162bf8186b77c45Cfd4Dc8BfE59dAa138297806',
    SETTLE_MANAGER: '0xEe01F4021edA68b6CfD32560e24f79De593F50A1',
    FEE_DISTRIBUTOR: '0x3F630a0f143a389974D18B8e73ba695E2D5D7b0b',
    BTC_OPTIONS_TOKEN: '0xa0075b88779d538582929937F9dB65d75a77bE4E',
    ETH_OPTIONS_TOKEN: '0xDf99FE0E93294c7D841C9BcC18d831B767226dF0',
    FAST_PRICE_EVENTS: '0x35617DAD445f352555E087dcD0Ff874171f8CF6B',
    FAST_PRICE_FEED: '0x985bE94BcEe4A59cE6A2Cb5E66378B51FdEdcA58',
    POSITION_VALUE_FEED: '0x0E8DD50962fc8cDABb11f024fBA50F728449e451',
    SETTLE_PRICE_FEED: '0x9cFBc16b70134dF63E64aaB663c8aC115421ad66',
    SPOT_PRICE_FEED: '0xf6447325B199Fb0a700e95E3362Ce4f99B79A0e8',
    PRIMARY_ORACLE: '0x14257586c70b2f89ee104bc90335Aa1DbD1584F5',
    VIEW_AGGREGATOR: '0xa3ad14e114925c3de01CeAc48EaCbF389A7aea7b',
    REFERRAL: '0xD9b93909fF1D78D4C8E90D6597f8Ed20D0cf7086'
  }

  await init(ethers, CONTRACT_ADDRESS)

  const proxyAdmin = await ethers.getContractAt("OwnableUpgradeable", OWNABLE_UPGRADEABLE_CONTRACT_ADDRESS)
  await proxyAdmin.transferOwnership(SAFE_WALLET.ADMIN)

  console.log('Deployment completed')
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});