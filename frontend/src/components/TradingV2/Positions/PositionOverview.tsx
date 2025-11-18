import { UnderlyingAssetWithAll } from "@moby/shared";
import PositionStatisticsAssetSelector from "./PositionStatisticsAssetSelector";
import PositionStatisticsDisplay from "./PositionStatisticsDisplay";
import { PositionStats } from "../utils/calculations";

interface PositionOverviewProps {
  underlyingAsset: UnderlyingAssetWithAll;
  setUnderlyingAsset: (underlyingAsset: UnderlyingAssetWithAll) => void;
  positionStats: PositionStats;
  setCurrentPage: (page: number) => void;
}

function PositionOverview({
  underlyingAsset,
  setUnderlyingAsset,
  positionStats,
  setCurrentPage,
}: PositionOverviewProps) {
  return (
    <div className="flex flex-row items-center gap-[68px]">
      <PositionStatisticsDisplay positionStats={positionStats} />
      <PositionStatisticsAssetSelector
        underlyingAsset={underlyingAsset}
        setUnderlyingAsset={setUnderlyingAsset}
        setCurrentPage={setCurrentPage}
      />
    </div>
  );
}

export default PositionOverview;
