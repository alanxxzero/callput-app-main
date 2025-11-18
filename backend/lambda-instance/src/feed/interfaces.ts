import { VolatilityScore } from "@moby/shared";

export interface NumericKeyValue {
  [key: string]: number;
}

export interface Olppv {
  data: NumericKeyValue;
  lastUpdatedAt: number;
  positionKeysStart?: string; // Track which position state this OLPPV corresponds to
}

export type VolatilityScoreRes = {
  data: VolatilityScore;
  lastUpdatedAt: number;
};

export interface TimeSeriesData {
  [timestamp: string]: NumericKeyValue;
}
