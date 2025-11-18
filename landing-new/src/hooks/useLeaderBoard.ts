import { useContext } from "react";
import { LeaderBoardContext } from "../contexts/data/LeaderBoardContext";

export const useLeaderBoard = () => {
  const context = useContext(LeaderBoardContext);
  if (context === undefined) {
    throw new Error("useLeaderBoard must be used within a LeaderBoardProvider");
  }
  return context;
};
