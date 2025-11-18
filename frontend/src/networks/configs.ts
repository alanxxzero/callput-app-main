import {
  MOBY_DISCORD_URL,
  MOBY_DOCS_URL,
  MOBY_EMAIL_URL,
  MOBY_MEDIUM_URL,
  MOBY_TELEGRAM_URL,
  MOBY_TWITTER_URL,
} from "@/utils/urls";
import { CustomCssMap, MenuMap, NetworkConfigs, OlpTermMap, SocialMap } from "./types";
import { CONTRACT_ADDRESSES } from "./addresses";
import { SupportedChains } from "./constants";

import arbitrumOneConfig from "../../environments/arbitrumOne/env.json";
import berachainMainnetConfig from "../../environments/berachainMainnet/env.json";

import MobileIconTrading from "@assets/mobile/bottom-nav-bar/icon-trading.svg";
import MobileIconTradingSelected from "@assets/mobile/bottom-nav-bar/icon-trading-selected.svg";
import MobileIcon0dte from "@assets/mobile/bottom-nav-bar/icon-0dte.svg";
import MobileIcon0dteSelected from "@assets/mobile/bottom-nav-bar/icon-0dte-selected.svg";
import MobileIconPools from "@assets/mobile/bottom-nav-bar/icon-pools.svg";
import MobileIconPoolsSelected from "@assets/mobile/bottom-nav-bar/icon-pools-selected.svg";
import MobileIconRewards from "@assets/mobile/bottom-nav-bar/icon-rewards.svg";
import MobileIconRewardsSelected from "@assets/mobile/bottom-nav-bar/icon-rewards-selected.svg";
import MobileIconEarn from "@assets/mobile/bottom-nav-bar/icon-earn.svg";
import MobileIconEarnSelected from "@assets/mobile/bottom-nav-bar/icon-earn-selected.svg";

import LogoArb from "@assets/logo-arb.svg";
import LogoArbWallet from "@assets/logo-arb-wallet.svg";
import LogoBera from "@assets/logo-bera.svg";
import LogoBeraWallet from "@assets/logo-bera-wallet.svg";
import IconChainDropdownBlack from "@assets/icon-chain-dropdown-black.svg";
import IconChainDropdownWhite from "@assets/icon-chain-dropdown-white.svg";
import LogoArbForMobile from "@assets/mobile/logo-arb-mobile.svg";
import LogoArbActiveForMobile from "@assets/mobile/logo-arb-active-mobile.svg";
import LogoBeraForMobile from "@assets/mobile/logo-bera-mobile.svg";
import LogoBeraActiveForMobile from "@assets/mobile/logo-bera-active-mobile.svg";

import IconDashboard from "@assets/icon-dashboard.svg";
import IconDashboardSelected from "@assets/icon-dashboard-selected.svg";
import IconSocialDocs from "@assets/icon-social-docs.svg";
import IconSocialDocsSelected from "@assets/icon-social-docs-selected.svg";
import IconSocialTwitter from "@assets/icon-social-twitter.svg";
import IconSocialTwitterSelected from "@assets/icon-social-twitter-selected.svg";
import IconSocialTelegram from "@assets/icon-social-telegram.svg";
import IconSocialTelegramSelected from "@assets/icon-social-telegram-selected.svg";
import IconSocialDiscord from "@assets/icon-social-discord.svg";
import IconSocialDiscordSelected from "@assets/icon-social-discord-selected.svg";
import IconSocialMedium from "@assets/icon-social-medium.svg";
import IconSocialMediumSelected from "@assets/icon-social-medium-selected.svg";
import IconSocialEmail from "@assets/icon-social-email.svg";
import IconSocialEmailSelected from "@assets/icon-social-email-selected.svg";
import IconEarn from "@assets/mobile/bottom-nav-bar/icon-earn.svg";
import IconEarnSelected from "@assets/mobile/bottom-nav-bar/icon-earn-selected.svg";

export const PROD_NETWORK: NetworkConfigs = {
  [SupportedChains["Arbitrum"]]: arbitrumOneConfig,
  [SupportedChains["Berachain Mainnet"]]: berachainMainnetConfig,
} as const;

export const DEV_NETWORK: NetworkConfigs = {
  [SupportedChains["Arbitrum"]]: arbitrumOneConfig,
  [SupportedChains["Berachain Mainnet"]]: berachainMainnetConfig,
} as const;

export const MENU_ITEMS: MenuMap = {
  [SupportedChains["Arbitrum"]]: [
    {
      id: 1,
      name: "Trading",
      url: "/trading",
      isExternal: false,
      isNew: false,
      isDisabled: false,
      mobileIcon: MobileIconTrading,
      mobileIconSelected: MobileIconTradingSelected,
      isMobileDisabled: false,
    },
    {
      id: 2,
      name: "0DTE",
      url: "/0dte",
      isExternal: false,
      isNew: false,
      isDisabled: false,
      mobileIcon: MobileIcon0dte,
      mobileIconSelected: MobileIcon0dteSelected,
      isMobileDisabled: false,
    },
    {
      id: 3,
      name: "Pool",
      url: "/pools",
      isExternal: false,
      isNew: false,
      isDisabled: false,
      mobileIcon: MobileIconPools,
      mobileIconSelected: MobileIconPoolsSelected,
      isMobileDisabled: false,
    },
    {
      id: 4,
      name: "Rewards",
      url: "/rewards",
      isExternal: false,
      isNew: false,
      isDisabled: false,
      mobileIcon: MobileIconRewards,
      mobileIconSelected: MobileIconRewardsSelected,
      isMobileDisabled: true,
    },
  ],
  [SupportedChains["Berachain Mainnet"]]: [
    {
      id: 1,
      name: "Trading",
      url: "/trading",
      isExternal: false,
      isNew: false,
      isDisabled: false,
      mobileIcon: MobileIconTrading,
      mobileIconSelected: MobileIconTradingSelected,
      isMobileDisabled: false,
    }, 
    {
      id: 2,
      name: "0DTE",
      url: "/0dte",
      isExternal: false,
      isNew: false,
      isDisabled: false,
      mobileIcon: MobileIcon0dte,
      mobileIconSelected: MobileIcon0dteSelected,
      isMobileDisabled: false,
    },
    {
      id: 3,
      name: "Pool",
      url: "/pools",
      isExternal: false,
      isNew: false,
      isDisabled: false,
      mobileIcon: MobileIconPools,
      mobileIconSelected: MobileIconPoolsSelected,
      isMobileDisabled: false,
    },
    {
      id: 4,
      name: "Rewards",
      url: "/rewards",
      isExternal: false,
      isNew: false,
      isDisabled: false,
      mobileIcon: MobileIconRewards,
      mobileIconSelected: MobileIconRewardsSelected,
      isMobileDisabled: true,
    },
    {
      id: 6,
      name: "Earn",
      url: "/earn",
      isExternal: false,
      isNew: false,
      isDisabled: false,
      mobileIcon: IconEarn,
      mobileIconSelected: IconEarnSelected,
      isMobileDisabled: false,
    },
  ],
};

export const DASHBOARD_URL = {
  [SupportedChains["Arbitrum"]]: "https://dune.com/mobytrade/moby",
  [SupportedChains["Berachain Mainnet"]]: "https://dune.com/mobytrade/berachain",
};

export const OLP_TERM: OlpTermMap = {
  [SupportedChains["Arbitrum"]]: {
    SHORT: 90,
    MID: 180,
  },
  [SupportedChains["Berachain Mainnet"]]: {
    SHORT: 90,
    MID: 180,
  },
};

export const VAULT_CREATED_AT = {
  [SupportedChains["Arbitrum"]]: {
    [CONTRACT_ADDRESSES[SupportedChains["Arbitrum"]].S_VAULT]: "02 April 2024",
  },
  [SupportedChains["Berachain Mainnet"]]: {
    [CONTRACT_ADDRESSES[SupportedChains["Berachain Mainnet"]].S_VAULT]: "08 February 2025",
  },
};

export const CUSTOM_CSS: CustomCssMap = {
  [SupportedChains["Arbitrum"]]: {
    logoSrc: LogoArb,
    walletLogoSrc: LogoArbWallet,
    dropdownIconSrc: IconChainDropdownWhite,
    backgroundClass: "bg-[url('@assets/bg-arb.svg')] hover:bg-[url('@assets/bg-arb-hovered.svg')]",
    outlineClass: "rounded-[4px]",

    walletLogoForMobileSrc: LogoArbForMobile,
    walletActiveLogoForMobileSrc: LogoArbActiveForMobile,
    backgroundClassForMobile: "bg-[#2c4d7a]",
    backgroundLineForMobile: "bg-text opacity-10",
    outlineClassForMobile: "border-[1px] border-solid border-[#1C3023]",
  },
  [SupportedChains["Berachain Mainnet"]]: {
    logoSrc: LogoBera,
    walletLogoSrc: LogoBeraWallet,
    dropdownIconSrc: IconChainDropdownBlack,
    backgroundClass: "bg-[url('@assets/bg-bera.svg')] hover:bg-[url('@assets/bg-bera-hovered.svg')]",
    outlineClass: "border-[1px] border-solid border-[rgba(255,198,113,.4)] rounded-[10px]",

    walletLogoForMobileSrc: LogoBeraForMobile,
    walletActiveLogoForMobileSrc: LogoBeraActiveForMobile,
    backgroundClassForMobile: "bg-[#f47226]",
    backgroundLineForMobile: "bg-[#F7931A66]",
    outlineClassForMobile: "border-[1px] border-solid border-[#FFC67166]",
  },
};

export const SOCIALS: SocialMap = {
  [SupportedChains["Arbitrum"]]: [
    {
      id: 1,
      name: "Dashboard",
      url: DASHBOARD_URL[SupportedChains["Arbitrum"]],
      iconSrc: IconDashboard,
      iconSrcSelected: IconDashboardSelected,
      isDisabled: false,
    },
    {
      id: 2,
      name: "Docs",
      url: MOBY_DOCS_URL,
      iconSrc: IconSocialDocs,
      iconSrcSelected: IconSocialDocsSelected,
      isDisabled: false,
    },
    {
      id: 3,
      name: "Twitter",
      url: MOBY_TWITTER_URL,
      iconSrc: IconSocialTwitter,
      iconSrcSelected: IconSocialTwitterSelected,
      isDisabled: false,
    },
    {
      id: 4,
      name: "Telegram",
      url: MOBY_TELEGRAM_URL,
      iconSrc: IconSocialTelegram,
      iconSrcSelected: IconSocialTelegramSelected,
      isDisabled: false,
    },
    {
      id: 5,
      name: "Discord",
      url: MOBY_DISCORD_URL,
      iconSrc: IconSocialDiscord,
      iconSrcSelected: IconSocialDiscordSelected,
      isDisabled: false,
    },
    {
      id: 6,
      name: "Blog",
      url: MOBY_MEDIUM_URL,
      iconSrc: IconSocialMedium,
      iconSrcSelected: IconSocialMediumSelected,
      isDisabled: false,
    },
    {
      id: 7,
      name: "Email",
      url: MOBY_EMAIL_URL,
      iconSrc: IconSocialEmail,
      iconSrcSelected: IconSocialEmailSelected,
      isDisabled: false,
    },
  ],
  [SupportedChains["Berachain Mainnet"]]: [
    {
      id: 1,
      name: "Dashboard",
      url: DASHBOARD_URL[SupportedChains["Berachain Mainnet"]],
      iconSrc: IconDashboard,
      iconSrcSelected: IconDashboardSelected,
      isDisabled: false,
    },
    {
      id: 2,
      name: "Docs",
      url: MOBY_DOCS_URL,
      iconSrc: IconSocialDocs,
      iconSrcSelected: IconSocialDocsSelected,
      isDisabled: false,
    },
    {
      id: 3,
      name: "Twitter",
      url: MOBY_TWITTER_URL,
      iconSrc: IconSocialTwitter,
      iconSrcSelected: IconSocialTwitterSelected,
      isDisabled: false,
    },
    {
      id: 4,
      name: "Telegram",
      url: MOBY_TELEGRAM_URL,
      iconSrc: IconSocialTelegram,
      iconSrcSelected: IconSocialTelegramSelected,
      isDisabled: false,
    },
    {
      id: 5,
      name: "Discord",
      url: MOBY_DISCORD_URL,
      iconSrc: IconSocialDiscord,
      iconSrcSelected: IconSocialDiscordSelected,
      isDisabled: false,
    },
    {
      id: 6,
      name: "Blog",
      url: MOBY_MEDIUM_URL,
      iconSrc: IconSocialMedium,
      iconSrcSelected: IconSocialMediumSelected,
      isDisabled: false,
    },
    {
      id: 7,
      name: "Email",
      url: MOBY_EMAIL_URL,
      iconSrc: IconSocialEmail,
      iconSrcSelected: IconSocialEmailSelected,
      isDisabled: false,
    },
  ],
};
