import { NetworkQuoteAsset } from "@moby/shared";
import { SupportedChains } from "@/networks/constants";
import ReusableDropdown, { DropdownOption } from "@/components/Common/ReusuableDropdown";
import { NetworkState } from "@/networks/types";
import { useAppSelector } from "@/store/hooks";
import { QA_TICKER_TO_IMG } from "@/networks/assets";

interface QuoteAssetSelectorProps {
  quoteAsset: NetworkQuoteAsset<SupportedChains>;
  setQuoteAsset: (quoteAsset: NetworkQuoteAsset<SupportedChains>) => void;
}

function QuoteAssetSelector({ quoteAsset, setQuoteAsset }: QuoteAssetSelectorProps) {
  const { chain } = useAppSelector(state => state.network) as NetworkState;

  const quoteAssetOptions: DropdownOption<NetworkQuoteAsset<SupportedChains>>[] =
    chain === "Arbitrum"
      ? [
          {
            value: NetworkQuoteAsset["Arbitrum"].ETH,
            icon: QA_TICKER_TO_IMG[chain][
              NetworkQuoteAsset["Arbitrum"].ETH as keyof (typeof QA_TICKER_TO_IMG)[typeof chain]
            ],
          },
          {
            value: NetworkQuoteAsset["Arbitrum"].USDC,
            icon: QA_TICKER_TO_IMG[chain][
              NetworkQuoteAsset["Arbitrum"].USDC as keyof (typeof QA_TICKER_TO_IMG)[typeof chain]
            ],
          },
          {
            value: NetworkQuoteAsset["Arbitrum"].WETH,
            icon: QA_TICKER_TO_IMG[chain][
              NetworkQuoteAsset["Arbitrum"].WETH as keyof (typeof QA_TICKER_TO_IMG)[typeof chain]
            ],
          },
          {
            value: NetworkQuoteAsset["Arbitrum"].WBTC,
            icon: QA_TICKER_TO_IMG[chain][
              NetworkQuoteAsset["Arbitrum"].WBTC as keyof (typeof QA_TICKER_TO_IMG)[typeof chain]
            ],
          },
        ]
      : [
          {
            value: NetworkQuoteAsset["Berachain Mainnet"].HONEY,
            icon: QA_TICKER_TO_IMG[chain][
              NetworkQuoteAsset["Berachain Mainnet"].HONEY as keyof (typeof QA_TICKER_TO_IMG)[typeof chain]
            ],
          },
          {
            value: NetworkQuoteAsset["Berachain Mainnet"].WETH,
            icon: QA_TICKER_TO_IMG[chain][
              NetworkQuoteAsset["Berachain Mainnet"].WETH as keyof (typeof QA_TICKER_TO_IMG)[typeof chain]
            ],
          },
          {
            value: NetworkQuoteAsset["Berachain Mainnet"].WBTC,
            icon: QA_TICKER_TO_IMG[chain][
              NetworkQuoteAsset["Berachain Mainnet"].WBTC as keyof (typeof QA_TICKER_TO_IMG)[typeof chain]
            ],
          },
          {
            value: NetworkQuoteAsset["Berachain Mainnet"].USDC,
            icon: QA_TICKER_TO_IMG[chain][
              NetworkQuoteAsset["Berachain Mainnet"].USDC as keyof (typeof QA_TICKER_TO_IMG)[typeof chain]
            ],
          },
        ];

  return (
    <ReusableDropdown
      options={quoteAssetOptions}
      selectedOption={quoteAsset}
      onOptionSelect={setQuoteAsset}
      width="max-content"
      height="28px"
      dropdownWidth="128px"
    />
  );
}

export default QuoteAssetSelector;
