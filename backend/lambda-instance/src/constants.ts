import { CONTRACT_ADDRESSES } from "./constants/constants.addresses"
import { ChainId } from "./constants/constants.networks"
import { AssetTicker } from "./utils/enums"

export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000"
export const ZERO_KEY = "0x0000000000000000000000000000000000000000000000000000000000000000"

export const UNDERLYING_ASSET_CURRENCIES = [
  "BTC",
  "ETH"
]

export const ASSET_CURRENCIES = [
  "BTC",
  "ETH",
  "USDC"
]

export const REDEPLOYED_BLOCK_TIME = 1736550507000

//////////////////////////////////
//  Olp related                 //
//////////////////////////////////

export const OLP_TERM_THRESHOLD: {
  [key: number]: { [key: string]: number }
} = {
  [ChainId.ARBITRUM_ONE]: {
    SHORT: 365,
    MID: 999999
  },
  [ChainId.ARBITRUM_SEPOLIA]: {
    SHORT: 2,
    MID: 90
  },
  [ChainId.BERACHAIN_MAINNET]: {
    SHORT: 365,
    MID: 999999
  },
}

export const OLP_NAME_TO_ADDRESS: {
  [key: number]: { [key: string]: string }
} = {
  [ChainId.ARBITRUM_ONE]: {
    "sOlp": (CONTRACT_ADDRESSES[ChainId.ARBITRUM_ONE].S_OLP).toLowerCase(),
    "mOlp": (CONTRACT_ADDRESSES[ChainId.ARBITRUM_ONE].M_OLP).toLowerCase(),
    "lOlp": (CONTRACT_ADDRESSES[ChainId.ARBITRUM_ONE].L_OLP).toLowerCase()
  },
  [ChainId.ARBITRUM_SEPOLIA]: {
    "sOlp": (CONTRACT_ADDRESSES[ChainId.ARBITRUM_SEPOLIA].S_OLP).toLowerCase(),
    "mOlp": (CONTRACT_ADDRESSES[ChainId.ARBITRUM_SEPOLIA].M_OLP).toLowerCase(),
    "lOlp": (CONTRACT_ADDRESSES[ChainId.ARBITRUM_SEPOLIA].L_OLP).toLowerCase()
  },
  [ChainId.BERACHAIN_MAINNET]: {
    "sOlp": (CONTRACT_ADDRESSES[ChainId.BERACHAIN_MAINNET].S_OLP).toLowerCase(),
    "mOlp": (CONTRACT_ADDRESSES[ChainId.BERACHAIN_MAINNET].M_OLP).toLowerCase(),
    "lOlp": (CONTRACT_ADDRESSES[ChainId.BERACHAIN_MAINNET].L_OLP).toLowerCase()
  }
}


//////////////////////////////////
//  Asset related               //
//////////////////////////////////

export const ASSET_TICKER_TO_DECIMALS: {
  [key: number]: { [key: string]: number }
} = {
  [ChainId.ARBITRUM_ONE]: {
    [AssetTicker.BTC]: 8,
    [AssetTicker.ETH]: 18,
    [AssetTicker.USDC]: 6,
  },
  [ChainId.ARBITRUM_SEPOLIA]: {
    [AssetTicker.BTC]: 8,
    [AssetTicker.ETH]: 18,
    [AssetTicker.USDC]: 6,
  },
  [ChainId.BERACHAIN_MAINNET]: {
    [AssetTicker.BTC]: 8,
    [AssetTicker.ETH]: 18,
    [AssetTicker.USDC]: 6,
    [AssetTicker.HONEY]: 18
  }
}

export const ASSET_ADDRESS_TO_TICKER: {
  [key: number]: { [key: string]: AssetTicker }
} = {
  [ChainId.ARBITRUM_ONE]: {
    [(CONTRACT_ADDRESSES[ChainId.ARBITRUM_ONE].WBTC).toLowerCase()]: AssetTicker.BTC,
    [(CONTRACT_ADDRESSES[ChainId.ARBITRUM_ONE].WETH).toLowerCase()]: AssetTicker.ETH,
    [(CONTRACT_ADDRESSES[ChainId.ARBITRUM_ONE].USDC).toLowerCase()]: AssetTicker.USDC
  },
  [ChainId.ARBITRUM_SEPOLIA]: {
    [(CONTRACT_ADDRESSES[ChainId.ARBITRUM_SEPOLIA].WBTC).toLowerCase()]: AssetTicker.BTC,
    [(CONTRACT_ADDRESSES[ChainId.ARBITRUM_SEPOLIA].WETH).toLowerCase()]: AssetTicker.ETH,
    [(CONTRACT_ADDRESSES[ChainId.ARBITRUM_SEPOLIA].USDC).toLowerCase()]: AssetTicker.USDC
  },
  [ChainId.BERACHAIN_MAINNET]: {
    [(CONTRACT_ADDRESSES[ChainId.BERACHAIN_MAINNET].WBTC).toLowerCase()]: AssetTicker.BTC,
    [(CONTRACT_ADDRESSES[ChainId.BERACHAIN_MAINNET].WETH).toLowerCase()]: AssetTicker.ETH,
    [(CONTRACT_ADDRESSES[ChainId.BERACHAIN_MAINNET].USDC).toLowerCase()]: AssetTicker.USDC,
    [(CONTRACT_ADDRESSES[ChainId.BERACHAIN_MAINNET].HONEY).toLowerCase()]: AssetTicker.HONEY,
  }
}

export const ASSET_ADDRESS_TO_DECIMALS: {
  [key: number]: { [key: string]: number }
} = {
  [ChainId.ARBITRUM_ONE]: {
    [(CONTRACT_ADDRESSES[ChainId.ARBITRUM_ONE].WBTC).toLowerCase()]: 8,
    [(CONTRACT_ADDRESSES[ChainId.ARBITRUM_ONE].WETH).toLowerCase()]: 18,
    [(CONTRACT_ADDRESSES[ChainId.ARBITRUM_ONE].USDC).toLowerCase()]: 6
  },
  [ChainId.ARBITRUM_SEPOLIA]: {
    [(CONTRACT_ADDRESSES[ChainId.ARBITRUM_SEPOLIA].WBTC).toLowerCase()]: 8,
    [(CONTRACT_ADDRESSES[ChainId.ARBITRUM_SEPOLIA].WETH).toLowerCase()]: 18,
    [(CONTRACT_ADDRESSES[ChainId.ARBITRUM_SEPOLIA].USDC).toLowerCase()]: 6
  },
  [ChainId.BERACHAIN_MAINNET]: {
    [(CONTRACT_ADDRESSES[ChainId.BERACHAIN_MAINNET].WBTC).toLowerCase()]: 8,
    [(CONTRACT_ADDRESSES[ChainId.BERACHAIN_MAINNET].WETH).toLowerCase()]: 18,
    [(CONTRACT_ADDRESSES[ChainId.BERACHAIN_MAINNET].USDC).toLowerCase()]: 6,
    [(CONTRACT_ADDRESSES[ChainId.BERACHAIN_MAINNET].HONEY).toLowerCase()]: 18
  }
}


//////////////////////////////////
//  Month related               //
//////////////////////////////////

export const MONTHS_MAP: { [key: number]: string } = {
  1: 'JAN', 2: 'FEB', 3: 'MAR', 4: 'APR', 5: 'MAY', 6: 'JUN',
  7: 'JUL', 8: 'AUG', 9: 'SEP', 10: 'OCT', 11: 'NOV', 12: 'DEC'
}

export const MONTHS_MAP_REV: { [key: string]: number } = {
  'JAN': 1, 'FEB': 2, 'MAR': 3, 'APR': 4, 'MAY': 5, 'JUN': 6,
  'JUL': 7, 'AUG': 8, 'SEP': 9, 'OCT': 10, 'NOV': 11, 'DEC': 12
}