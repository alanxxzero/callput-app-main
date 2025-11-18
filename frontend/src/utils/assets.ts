import { Ticker } from "@/enums/enums.appSlice";

import IconSymbolWbtc from "../assets/icon-symbol-wbtc.svg";
import IconSymbolUsdc from "../assets/icon-symbol-usdc.svg";
import IconSymbolHoney from "../assets/icon-symbol-honey.svg";
import IconSymbolByusd from "../assets/icon-symbol-byusd.svg";
import IconSymbolBera from "../assets/icon-symbol-bera.svg";

//////////////////////////////////
//  Quote asset related         //
//////////////////////////////////
export type AssetInfo = {
  [key: string]: {
    name: string;
    symbol: string;
    src: string;
    srcList?: string[];
    color?: string;
    disabledSrc?: string;
  };
};
export const DOV_ASSET_INFO: AssetInfo = {
  [Ticker.DovAsset.BHONEY]: { name: "BHONEY", symbol: "BHONEY", src: IconSymbolHoney },
  [Ticker.DovAsset.HONEY]: { name: "HONEY", symbol: "HONEY", src: IconSymbolHoney },
  [Ticker.DovAsset.USDC]: { name: "USD Coin", symbol: "USDC", src: IconSymbolUsdc },
  [Ticker.DovAsset.SHARE]: { name: "SHARE", symbol: "SHARE", src: "" },
  [Ticker.DovAsset.WBTC]: { name: "Wrapped BTC", symbol: "WBTC", src: IconSymbolWbtc },
  [Ticker.DovAsset.BYUSD]: { name: "BYUSD", symbol: "BYUSD", src: IconSymbolByusd },
  [Ticker.DovAsset.WBERA]: { name: "Wrapped BERA", symbol: "WBERA", src: IconSymbolBera },
  [Ticker.DovAsset.BERA]: { name: "BERA", symbol: "BERA", src: IconSymbolBera },

  [Ticker.DovAsset["USDC.e-HONEY LP"]]: { name: "USDC.e-HONEY LP", symbol: "USDC.e-HONEY LP", src: "", srcList: [IconSymbolUsdc, IconSymbolHoney] },
  [Ticker.DovAsset["BYUSD-HONEY LP"]]: { name: "BYUSD-HONEY LP", symbol: "BYUSD-HONEY LP", src: "", srcList: [IconSymbolByusd, IconSymbolHoney] },
  [Ticker.DovAsset["WBERA-HONEY LP"]]: { name: "WBERA-HONEY LP", symbol: "WBERA-HONEY LP", src: "", srcList: [IconSymbolBera, IconSymbolHoney] },
}

export const DOV_TICKER_TO_DECIMAL: { [key: string]: number } = {
  [Ticker.DovAsset.BHONEY]: 18,
  [Ticker.DovAsset.HONEY]: 18,
  [Ticker.DovAsset.USDC]: 6,
  [Ticker.DovAsset.WBERA]: 18,
  [Ticker.DovAsset.BERA]: 18,
  [Ticker.DovAsset.SHARE]: 18,
  [Ticker.DovAsset.BYUSD]: 6,
  [Ticker.DovAsset["USDC.e-HONEY LP"]]: 18,
  [Ticker.DovAsset["BYUSD-HONEY LP"]]: 18,
  [Ticker.DovAsset["WBERA-HONEY LP"]]: 18,
}