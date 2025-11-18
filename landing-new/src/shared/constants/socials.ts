import { SOCIAL_URLS } from "./urls";

import IconX from "../../assets/images/socials/icon-x.png";
import IconTelegram from "../../assets/images/socials/icon-telegram.png";
import IconDiscord from "../../assets/images/socials/icon-discord.png";
import IconMedium from "../../assets/images/socials/icon-medium.png";
import IconEmail from "../../assets/images/socials/icon-email.png";

export interface Social {
  name: string;
  imgSrc: string;
  url: string;
  ariaLabel?: string;
}

export const SOCIALS: Social[] = [
  {
    name: "Twitter",
    imgSrc: IconX,
    url: SOCIAL_URLS.X,
    ariaLabel: "Follow us on X",
  },
  {
    name: "Telegram",
    imgSrc: IconTelegram,
    url: SOCIAL_URLS.TELEGRAM,
    ariaLabel: "Join our Telegram group",
  },
  {
    name: "Discord",
    imgSrc: IconDiscord,
    url: SOCIAL_URLS.DISCORD,
    ariaLabel: "Join our Discord server",
  },
  {
    name: "Blog",
    imgSrc: IconMedium,
    url: SOCIAL_URLS.MEDIUM,
    ariaLabel: "Read our Medium blog",
  },
  {
    name: "Email",
    imgSrc: IconEmail,
    url: SOCIAL_URLS.EMAIL,
    ariaLabel: "Contact us via email",
  },
];
