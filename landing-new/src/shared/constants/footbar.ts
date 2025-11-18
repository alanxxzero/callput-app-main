import { ABOUT_URLS, PRODUCT_URLS } from "./urls";

export interface FootbarItem {
  name: string;
  url: string;
}

export const FOOTBAR_PRODUCTS: FootbarItem[] = [
  {
    name: "Trading",
    url: PRODUCT_URLS.TRADING,
  },
  {
    name: "0DTE",
    url: PRODUCT_URLS.ZERODTE,
  },
  {
    name: "OLP",
    url: PRODUCT_URLS.OLP,
  },
  {
    name: "SPV",
    url: PRODUCT_URLS.SPV,
  },
];

export const FOOTBAR_ABOUT: FootbarItem[] = [
  {
    name: "FAQ",
    url: ABOUT_URLS.FAQ,
  },
  {
    name: "Docs",
    url: ABOUT_URLS.DOCS,
  },
  {
    name: "Developers",
    url: ABOUT_URLS.DEVELOPERS,
  },
  {
    name: "Dashboard",
    url: PRODUCT_URLS.DASHBOARD,
  },
];
