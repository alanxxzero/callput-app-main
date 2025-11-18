export const MOBY_URLS = {
  HOME: "https://moby.trade",
  APP: "https://app.moby.trade",
  DOCS: "https://docs.moby.trade",
  DASHBOARD: "https://dune.com/mobytrade/moby",
};

export const SOCIAL_URLS = {
  X: "https://twitter.com/Moby_trade",
  TELEGRAM: "https://t.me/+ikz21RB1B_c2YWVl",
  DISCORD: "https://discord.gg/neJMg9P4Ps",
  MEDIUM: "https://medium.com/moby-trade",
  EMAIL: "mailto:team@moby.trade",
};

export const EXTERNAL_URLS = {};

export const ALL_URLS = {
  ...MOBY_URLS,
  ...SOCIAL_URLS,
  ...EXTERNAL_URLS,
};

export const PRODUCT_URLS = {
  TRADING: `${MOBY_URLS.APP}/trading`,
  ZERODTE: `${MOBY_URLS.APP}/0dte`,
  OLP: `${MOBY_URLS.APP}/pools`,
  SPV: `${MOBY_URLS.APP}/spv`,
  DASHBOARD: `${MOBY_URLS.DASHBOARD}`,
};

export const ABOUT_URLS = {
  FAQ: `${MOBY_URLS.DOCS}/need-more-info/resource-library/faq`,
  DOCS: `${MOBY_URLS.DOCS}`,
  DEVELOPERS: `${MOBY_URLS.DOCS}/developers`,
};

export const API_URLS = {
  // Arb
  VOLUME_DATA_ARB: "https://5kjx4q22r2.execute-api.ap-northeast-2.amazonaws.com/prod/getVolumeData",
  TRADE_DATA_ARB: "https://moby-arb-data.s3.ap-northeast-2.amazonaws.com/trade-data.json.gz",
  REVENUE_DATA_ARB: "https://5kjx4q22r2.execute-api.ap-northeast-2.amazonaws.com/prod/getRevenue",
  PROTOCOL_NET_REVENUE_ARB: "https://5kjx4q22r2.execute-api.ap-northeast-2.amazonaws.com/prod/getProtocolNetRevenue",
  MARKET_DATA_ARB: "https://moby-arb-data.s3.ap-northeast-2.amazonaws.com/market-data.json",
  MARKET_DAILY_ARB: "https://moby-arb-data.s3.ap-northeast-2.amazonaws.com/market-daily/market-daily",

  // Bera
  VOLUME_DATA_BERA: "https://63npoycp9b.execute-api.ap-northeast-2.amazonaws.com/prod/getVolumeData",
  TRADE_DATA_BERA: "https://moby-data-berachain-mainnet.s3.ap-northeast-2.amazonaws.com/trade-data.json.gz",
  REVENUE_DATA_BERA: "https://63npoycp9b.execute-api.ap-northeast-2.amazonaws.com/prod/getRevenue",
  PROTOCOL_NET_REVENUE_BERA:
    "https://63npoycp9b.execute-api.ap-northeast-2.amazonaws.com/prod/getProtocolNetRevenue",
  MARKET_DATA_BERA: "https://moby-data-berachain-mainnet.s3.ap-northeast-2.amazonaws.com/market-data.json",
  MARKET_DAILY_BERA:
    "https://moby-data-berachain-mainnet.s3.ap-northeast-2.amazonaws.com/market-daily/market-daily",
};
