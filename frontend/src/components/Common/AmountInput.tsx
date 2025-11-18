import { twMerge, twJoin } from 'tailwind-merge'
import IconWalletGray from "@assets/icon-input-wallet-gray.svg";
import { advancedFormatNumber } from '@/utils/helper';
import { DOV_ASSET_INFO } from '@/utils/assets';
import { NetworkQuoteAsset } from '@moby/shared';
import { SupportedChains } from '@/networks/constants';
import { Ticker } from '@/enums/enums.appSlice';
import DovAssetDropDown from './DovAssetDropDown';

type Props = {
  className?: string;
  selectedAsset: string | NetworkQuoteAsset<SupportedChains>;
  selectAsset: (asset: NetworkQuoteAsset<SupportedChains>) => void;
  balance: string;
  amount: string | number;
  setAmount: (amount: string) => void;
  dropdownList?: any;
}

const AmountInput = ({ 
  className,
  selectedAsset,
  selectAsset,
  balance,
  amount,
  setAmount,
  dropdownList,
 }: Props) => {

  const leftIconSrc = DOV_ASSET_INFO[selectedAsset as keyof typeof DOV_ASSET_INFO]?.src

  return (
    <div
      className={twMerge(
        twJoin(
          "flex flex-col",
          "w-full",
          "bg-[#0A0A0A]",
          "px-[18px] py-[16px]"
        ),
        className,
      )}
    >
      <div className="flex flex-row justify-between items-center h-[26px]">
        <p 
          className={twJoin(
            "text-[13px] text-gray80 font-semibold",
            "dt:text-[14px]"
          )}
        >
          Amount
        </p>
        <div className="flex flex-row justify-end">
          <div className="flex flex-row justify-center items-center">
            <img className="w-[14px] h-[14px]" src={IconWalletGray} />
            <p 
              className="font-plex-mono text-[12px] text-whitee0 font-semibold ml-[6px]"
            >
              {advancedFormatNumber(Number(balance), 4, "")}
            </p>
          </div>

          {balance && (
            <div
              className={twJoin(
                "cursor-pointer",
                "flex flex-row justify-center items-center",
                "w-[55px] h-[22px] ml-[10px] rounded-[11px] bg-black2e",
                "text-[12px] text-greenc1 font-semibold"
              )}
              onClick={() => {
                setAmount(balance)
              }}
            >
              MAX
            </div>
          )}
        </div>
      </div>
      <div 
        className={twJoin(
          "grid",
          leftIconSrc 
            ? "grid-cols-[32px,1fr,100px]"
            : "grid-cols-[1fr,150px]",
          "items-center",
          "mt-[16px]",
        )}
      >
        {leftIconSrc && <img src={leftIconSrc} className="w-[32px] h-[32px] min-w-[32px] min-h-[32px]" />}
        <input
          autoFocus
          ref={(e) => e}
          value={amount}
          placeholder="0"
          className={twJoin(
            leftIconSrc ? "ml-[10px]" : "ml-0",
            "w-full",
            "text-[16px] text-greenc1 font-bold bg-transparent",
            "focus:outline-none",
            "placeholder:text-[16px] placeholder-gray80 placeholder:font-bold",
            "pr-[10px]",
            "dt:text-[20px] dt:placeholder:text-[20px]",
          )}
          onChange={(e) => {

            if (e.target.value.includes(" ")) return;
            if (isNaN(Number(e.target.value))) return;

            if (e.target.value === "") {
              setAmount("");
              return;
            }

            setAmount(e.target.value.replace(/^0+(?=\d)/, ''))
          }}
          onFocus={() => {

          }}
        />
        {dropdownList 
          ? (
            <div
              className={twJoin(
                "flex w-full justify-end",
              )}
            >
              <DovAssetDropDown 
                list={dropdownList}
                selectedAsset={selectedAsset} 
                selectAsset={selectAsset as (asset: Ticker.DovAsset) => void}
              />
            </div>
          )
          : (
            <div
              className={twJoin(
                "flex justify-end",
                "text-[15px] text-gray80 font-semibold leading-[24px]",
                "dt:text-[16px]"
              )}
            >
              {/* code smell */}
              {selectedAsset == "SHARE" ? "Shares" : selectedAsset}
            </div>
          )
        }
      </div>
    </div>
  )
}

export default AmountInput