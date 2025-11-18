import { createContext } from "react";

export interface TopGainerOption {
  instrument: string;
  currentPrice: number;
  basePrice: number;
  priceDiffPercentage: number;
}

export interface HighestVolumeOption {
  instrument: string;
  currentPrice: number;
  volume: number;
}

export interface LeaderBoardData {
  topGainerOptions: TopGainerOption[];
  highestVolumeOptions: HighestVolumeOption[];
}

export interface LeaderBoardContextType {
  data: LeaderBoardData;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export const LeaderBoardContext = createContext<LeaderBoardContextType | undefined>(undefined);
