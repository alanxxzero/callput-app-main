export namespace Ticker {
  export enum OlpAsset {
    WBTC = "WBTC",
    WETH = "WETH",
    USDC = "USDC",
    HONEY = "HONEY"
  }
  
  export enum QuoteAsset { // OlpAsset + Native ETH
    ETH = "ETH",
    WBTC = "WBTC",
    WETH = "WETH",
    USDC = "USDC",
    HONEY = "HONEY"
  }

  export enum DovAsset {
    BERA = "BERA",
    HONEY = "HONEY",
    BHONEY = "BHONEY",
    USDC = "USDC",
    BYUSD = "BYUSD",
    WBTC = "WBTC",
    WBERA = "WBERA",
    SHARE = "SHARE",

    "USDC.e-HONEY LP" = "USDC.e-HONEY LP",
    "BYUSD-HONEY LP" = "BYUSD-HONEY LP",
    "WBERA-HONEY LP" = "WBERA-HONEY LP",
  }
}
