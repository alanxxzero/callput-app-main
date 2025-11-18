
import { UnderlyingAsset } from "@moby/shared";
import AssetSelector from "./AssetSelector";
import ExpirySelector from "./ExpirySelector";
import { NetworkState } from "@/networks/types";
import { useAppSelector } from "@/store/hooks";

interface UnderlyingSelectorProps {
  selectedUnderlyingAsset: UnderlyingAsset;
  setSelectedUnderlyingAsset: (underlyingAsset: UnderlyingAsset) => void;
  selectedExpiry: number;
  setSelectedExpiry: (expiry: number) => void;
}

function UnderlyingSelector({
  selectedUnderlyingAsset,
  setSelectedUnderlyingAsset,
  selectedExpiry,
  setSelectedExpiry,
}: UnderlyingSelectorProps) {
  const { chain } = useAppSelector(state => state.network) as NetworkState;
  return (
    <div className="flex flex-row items-center justify-between bg-black17 h-[72px] p-[12px]">
      <AssetSelector
        selectedUnderlyingAsset={selectedUnderlyingAsset}
        setSelectedUnderlyingAsset={setSelectedUnderlyingAsset}
        chain={chain}
      />
      <ExpirySelector
        selectedUnderlyingAsset={selectedUnderlyingAsset}
        selectedExpiry={selectedExpiry}
        setSelectedExpiry={setSelectedExpiry}
      />
    </div>
  );
}

export default UnderlyingSelector;
