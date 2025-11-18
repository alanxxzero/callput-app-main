import IconCircleAnimeLoss from "@/assets/shareposition/anime-loss.png";
import IconCircleAnimeProfit from "@/assets/shareposition/anime-profit.png";
import IconCircleBera1Loss from "@/assets/shareposition/bera1-loss.png";
import IconCircleBera1Profit from "@/assets/shareposition/bera1-profit.png";
import IconCircleBera2Loss from "@/assets/shareposition/bera2-loss.png";
import IconCircleBera2Profit from "@/assets/shareposition/bera2-profit.png";
import IconCircleMuscleWhaleLoss from "@/assets/shareposition/muscle-whale-loss.png";
import IconCircleMuscleWhaleProfit from "@/assets/shareposition/muscle-whale-profit.png";
import IconCirclePepeLoss from "@/assets/shareposition/pepe-loss.png";
import IconCirclePepeProfit from "@/assets/shareposition/pepe-profit.png";

import BgConceptMoby from "@/assets/bg-concept-moby.png";
import BgConceptMobyWhale from "@/assets/bg-concept-moby-whale.png";
import BgConceptMuscleWhaleLoss from "@/assets/bg-concept-muscle-whale-loss.png";
import BgConceptMuscleWhaleProfit from "@/assets/bg-concept-muscle-whale-profit.png";
import BgConceptPepeLoss from "@/assets/bg-concept-pepe-loss.png";
import BgConceptPepeProfit from "@/assets/bg-concept-pepe-profit.png";
import BgConceptAnimeLoss from "@/assets/bg-concept-anime-loss.png";
import BgConceptAnimeProfit from "@/assets/bg-concept-anime-profit.png";

import BgConceptBera1Profit from "@/assets/shareposition/bg-type-bera-profit.png";
import BgConceptBera1Loss from "@/assets/shareposition/bg-type-bera-loss.png";
import BgConceptBera2Profit from "@/assets/shareposition/bg-type-bera2-profit.png";
import BgConceptBera2Loss from "@/assets/shareposition/bg-type-bera2-loss.png";

export enum CardConcept {
  Moby = "Moby",
  MobyWhale = "Moby Whale",
  Bera1 = "Bera1",
  Bera2 = "Bera2",
  MuscleWhale = "Muscle Whale",
  Pepe = "Pepe",
  Anime = "Anime",
}

export type CardConceptInfo = {
  [key: string]: {
    name: string;
    thumbnailProfit: string;
    thumbnailLoss: string;
    imgProfit: string;
    imgLoss: string;
  };
};

export const CARD_CONCEPT_LIST = [
  CardConcept.Bera1,
  CardConcept.Bera2,
  CardConcept.MuscleWhale,
  CardConcept.Pepe,
  CardConcept.Anime,
];

export const CARD_CONCEPT_INFO: CardConceptInfo = {
  [CardConcept.Bera1]: {
    name: "Bera 1",
    thumbnailProfit: IconCircleBera1Profit,
    thumbnailLoss: IconCircleBera1Loss,
    imgProfit: BgConceptBera1Profit,
    imgLoss: BgConceptBera1Loss,
  },
  [CardConcept.Bera2]: {
    name: "Bera 2",
    thumbnailProfit: IconCircleBera2Profit,
    thumbnailLoss: IconCircleBera2Loss,
    imgProfit: BgConceptBera2Profit,
    imgLoss: BgConceptBera2Loss,
  },
  [CardConcept.MuscleWhale]: {
    name: "Muscle Whale",
    thumbnailProfit: IconCircleMuscleWhaleProfit,
    thumbnailLoss: IconCircleMuscleWhaleLoss,
    imgProfit: BgConceptMuscleWhaleProfit,
    imgLoss: BgConceptMuscleWhaleLoss,
  },
  [CardConcept.Pepe]: {
    name: "Pepe",
    thumbnailProfit: IconCirclePepeProfit,
    thumbnailLoss: IconCirclePepeLoss,
    imgProfit: BgConceptPepeProfit,
    imgLoss: BgConceptPepeLoss,
  },
  [CardConcept.Anime]: {
    name: "Anime",
    thumbnailProfit: IconCircleAnimeProfit,
    thumbnailLoss: IconCircleAnimeLoss,
    imgProfit: BgConceptAnimeProfit,
    imgLoss: BgConceptAnimeLoss,
  },
};
