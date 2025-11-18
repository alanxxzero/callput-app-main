import BigNumber from "bignumber.js";
import { twJoin } from "tailwind-merge";
import { useContext, useEffect, useState } from "react";

import { advancedFormatNumber } from "@/utils/helper";
import { OrderSide } from "@/utils/types";
import { useAppSelector } from "@/store/hooks";
import { OlpKey } from "@/utils/enums";

import ToggleButton from "../Common/ToggleButton";
import PoolAssetRatioTableHead from "./PoolAssetRatioTableHead";
import PoolAssetRatioTableBody from "./PoolAssetRatioTableBody";
import RealTimeGreeksTableHead from "./RealTimeGreeksTableHead";
import RealTimeGreeksTableBody from "./RealTimeGreeksTableBody";
import BuyInput from "./BuyInput";
import SellInput from "./SellInput";

import IconDropdownDown from "@assets/icon-dropdown-down.svg";
import IconDropdownUp from "@assets/icon-dropdown-up.svg";
import MyOLPV2 from "./MyOLPV2";
import { BaseQuoteAsset, NetworkQuoteAsset, SpotAssetIndexMap } from "@moby/shared";
import { SupportedChains } from "@/networks/constants";
import { NetworkState } from "@/networks/types";

BigNumber.config({
  EXPONENTIAL_AT: 1000,
  DECIMAL_PLACES: 80,
})

type OlpProps = {
  olpKey: OlpKey;
  isDeprecated: boolean;
}

const OLP: React.FC<OlpProps> = ({ olpKey, isDeprecated }) => {  
  const { chain, isBerachain } = useAppSelector(state => state.network) as NetworkState;
  
  const isDisabled = olpKey === OlpKey.lOlp || olpKey === OlpKey.mOlp
    ? true
    : false;

  const olpStats = useAppSelector((state: any) => state.market.olpStats);
  const olpMetricsData = useAppSelector((state: any) => state.app.olpMetrics);
  const spotAssetIndexMap = useAppSelector((state: any) => state.market.spotAssetIndexMap) as SpotAssetIndexMap;
  
  const olpApr = useAppSelector((state: any) => state.app.olpApr);
  const feeApr = olpApr[olpKey].feeApr;
  const riskPremiumApr = olpApr[olpKey].riskPremiumApr;
  
  const [selectedOrderSide, setSelectedOrderSide] = useState<OrderSide>('Buy');
  const [selectedQuoteAsset, setSelectedQuoteAsset] = useState<NetworkQuoteAsset<SupportedChains>>(BaseQuoteAsset.USDC);

  const [payAmount, setPayAmount] = useState<string>("");
  const [receiveAmount, setReceiveAmount] = useState<string>("");

  const [detailOpened, setDetailOpened] = useState<boolean>(false);
  
  const [loading, setLoading] = useState(true);

  const [olpPrice, setOlpPrice] = useState<string>("0");
  const [olpDepositedAssetValue, setOlpDepositedAssetValue] = useState<Record<string, string>>({});
  const [fee, setFee] = useState<number>(0);

  const [lowestFeeAsset, setLowestFeeAsset] = useState<NetworkQuoteAsset<SupportedChains>>(BaseQuoteAsset.USDC);
  const [lowestFee, setLowestFee] = useState<number>(0);

  useEffect(() => {
    let lowestFee = 10000;
    let lowestFeeAsset = "";

    if (selectedOrderSide === "Buy") {
      const buyUsdgFee = olpMetricsData[olpKey].buyUsdgFee;

      Object.entries(buyUsdgFee).forEach(([asset, fee]) => {
        if (!isBerachain && asset === "honey") return;

        if (Number(fee) < lowestFee) {
          lowestFeeAsset = asset;
          lowestFee = Number(fee);
        }
      })
    } else {
      const sellUsdgFee = olpMetricsData[olpKey].sellUsdgFee;

      Object.entries(sellUsdgFee).forEach(([asset, fee]) => {
        if (!isBerachain && asset === "honey") return;

        if (Number(fee) < lowestFee) {
          lowestFeeAsset = asset;
          lowestFee = Number(fee);
        }
      })
    }

    if (lowestFeeAsset === "wbtc") {
      lowestFeeAsset = BaseQuoteAsset.WBTC;
    } else if (lowestFeeAsset === "weth") {
      lowestFeeAsset = BaseQuoteAsset.WETH;
    } else if (lowestFeeAsset === "usdc") {
      lowestFeeAsset = BaseQuoteAsset.USDC;
    } else if (lowestFeeAsset === "honey") {
      lowestFeeAsset = "HONEY";
    }

    setLowestFeeAsset(lowestFeeAsset as NetworkQuoteAsset<SupportedChains>);
    setLowestFee(lowestFee / 100);
  }, [olpMetricsData, selectedOrderSide])

  useEffect(() => {
    setOlpPrice(new BigNumber(olpMetricsData[olpKey].price).toString());
    setLoading(false);
  }, [olpMetricsData]);

  useEffect(() => {
    setPayAmount("");
    setReceiveAmount("");
  }, [selectedQuoteAsset, selectedOrderSide])

  useEffect(() => {
    if (spotAssetIndexMap) {
      const data = {
        wbtc: "0",
        weth: "0",
        usdc: "0",
        honey: "0"
      }

      const olpAssetAmounts = olpStats[olpKey].assetAmounts;

      data.wbtc = new BigNumber(olpAssetAmounts.wbtc.depositedAmount).multipliedBy(spotAssetIndexMap.btc).toString();
      data.weth = new BigNumber(olpAssetAmounts.weth.depositedAmount).multipliedBy(spotAssetIndexMap.eth).toString();
      data.usdc = new BigNumber(olpAssetAmounts.usdc.depositedAmount).multipliedBy(spotAssetIndexMap.usdc).toString();

      if (isBerachain) {
        data.honey = new BigNumber(olpAssetAmounts.honey.depositedAmount).multipliedBy(spotAssetIndexMap.honey).toString();
      }

      setOlpDepositedAssetValue(data);
    }
  }, [spotAssetIndexMap, olpStats])

  useEffect(() => {
    if (selectedOrderSide === "Buy") {
      if (selectedQuoteAsset === BaseQuoteAsset.WBTC) {
        setFee(Number(olpMetricsData[olpKey].buyUsdgFee?.wbtc) / 100);
      } else if (selectedQuoteAsset === BaseQuoteAsset.WETH || selectedQuoteAsset === "ETH") {
        setFee(Number(olpMetricsData[olpKey].buyUsdgFee?.weth) / 100);
      } else if (selectedQuoteAsset === BaseQuoteAsset.USDC) {
        setFee(Number(olpMetricsData[olpKey].buyUsdgFee?.usdc) / 100);
      } else if (selectedQuoteAsset === "HONEY") {
        setFee(Number(olpMetricsData[olpKey].buyUsdgFee?.honey) / 100);
      }
    } else {
      if (selectedQuoteAsset === BaseQuoteAsset.WBTC) {
        setFee(Number(olpMetricsData[olpKey].sellUsdgFee?.wbtc) / 100);
      } else if (selectedQuoteAsset === BaseQuoteAsset.WETH || selectedQuoteAsset === "ETH") {
        setFee(Number(olpMetricsData[olpKey].sellUsdgFee?.weth) / 100);
      } else if (selectedQuoteAsset === BaseQuoteAsset.USDC) {
        setFee(Number(olpMetricsData[olpKey].sellUsdgFee?.usdc) / 100);
      } else if (selectedQuoteAsset === "HONEY") {
        setFee(Number(olpMetricsData[olpKey].sellUsdgFee?.honey) / 100);
      }
    }
    
  },[olpMetricsData, selectedQuoteAsset, selectedOrderSide])

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className='flex flex-col'>
      <div className="relative">
        <div className={twJoin(
          isDisabled ? "block" : "hidden",
          "absolute z-10 flex flex-row justify-center items-center w-full h-full bg-[#131415] bg-opacity-90"
        )}>
          <p className="text-[16px] font-semibold text-whitee0">
            {olpKey === "sOlp" ? "Options LP (OLP)" : olpKey === "mOlp" ? "Options LP (OLP)" : "Options LP (OLP)"} is coming soon.
          </p>
        </div>
        <div className={twJoin(
            "flex flex-col",
            'w-[400px] bg-black1a rounded-t-[10px]',
            "shadow-[0px_4px_16px_0_rgba(0,0,0,0.2)]",
            isBerachain
              ? "border-[1px] border-b-0 border-solid border-[rgba(255,198,113,.4)]"
              : "border-[1px] border-b-0 border-solid border-black29",
            isDeprecated ? "pt-[16px] pb-[28px]" : "pb-[24px]"
          )
        }>
          {isDeprecated && (
            <div className="flex flex-row justify-between items-center px-[16px] mb-[26px]">
              <div className="flex flex-row justify-center items-center w-[368px] h-[82px] bg-[rgba(255,182,72,0.1)] border-[1px] border-solid border-[#FFDA47] rounded-[3px] px-[16px] py-[14px]">
                <p className="text-[#FFC848] text-center text-[15px] font-semibold leading-[1.2rem]">sOLP is switching to sell-only mode and will be deactivated after a certain period. Please transfer your sOLP assets to mOLP.</p>
              </div>
            </div>
          )}

          <MyOLPV2 olpKey={olpKey} />
          
          {/* OLP 이름 및 BUY/SELL 영역 */}
          <div className='flex flex-row justify-between items-center px-[28px] mt-[30px]' id={olpKey}>
            <ToggleButton
              id={olpKey}
              size="stretch"
              shape="square"
              items={
                [
                  { value: 'Buy', label: 'Buy', textColor: 'text-green4c', hoverColor: 'hover:!bg-black33 hover:!text-green4c' },
                  { value: 'Sell', label: 'Sell', textColor: 'text-redc7', hoverColor: 'hover:!bg-black33 hover:!text-redc7' }
                ]
              }
              selectedItem={selectedOrderSide}
              setSelectedItem={setSelectedOrderSide}
              isDeprecated={isDeprecated}
            />
          </div>

          {/* 가격 및 APR 영역 */}
          <div className='flex flex-row mt-[28px] px-[28px]'>
            <div className='flex flex-col gap-[6px] flex-1'>
              <p className='h-[18px] text-[13px] text-greenc1 font-semibold'>Price</p>
              <p className='h-[26px] text-[22px] text-whitee0 font-bold leading-[1.8rem]'>{advancedFormatNumber(BigNumber(olpPrice).dividedBy(10**30).toNumber(), 4, "$")}</p>
            </div>
            <div className='flex flex-col gap-[6px] flex-1'>
              {/* Tooltip */}
              <div className="relative group cursor-help w-fit font-semibold">
                <p 
                  className={twJoin(
                    "flex items-center justify-center",
                    "w-[38px] h-[18px] text-center text-black text-[14px] bg-gradient-to-r from-[#F7931A] to-[#FF581B]",
                    "rounded-[3px]",
                  )}
                >
                  APR
                </p>
                <div className={twJoin(
                  "w-max h-[40px] z-30",
                  "absolute hidden px-[11px] py-[6px] bottom-[24px] -left-[12px]",
                  "bg-black1f rounded-[4px] border-[1px] border-[rgba(224,224,224,.1)] shadow-[0_0_8px_0_rgba(10,10,10,.72)]",
                  "group-hover:block"
                )}>
                  <p className="text-[12px] text-gray80 leading-[0.85rem]">
                    Annual yield of rewards (Fees + Risk Premium) <br/>
                    received from staked OLP tokens
                  </p>
                </div>
              </div>

              {/* Tooltip */}
              <div className="relative group cursor-help w-fit font-semibold border-b-[1px] border-dashed border-b-greenc1">
                <p className='h-[26px] text-[22px] text-whitee0 font-bold leading-[1.8rem]'>{advancedFormatNumber((feeApr + riskPremiumApr) * 100, 2, "")}%</p>
                <div className={twJoin(
                  "w-[209px] h-[45px] z-30",
                  "absolute hidden px-[12px] py-[5px] top-[35px]",
                  "bg-black1f rounded-[4px] border-[1px] border-[rgba(224,224,224,.1)] shadow-[0_0_8px_0_rgba(10,10,10,.72)]",
                  "group-hover:block"
                )}>
                  <div className="flex flex-row justify-between items-center h-[15px]">
                    <p className="text-[12px] text-gray80 font-semibold">wETH Reward</p>
                    <p className="text-[12px] text-whitee0 font-semibold">{advancedFormatNumber((feeApr) * 100, 2, "")}%</p>
                  </div>
                  <div className="flex flex-row justify-between items-center h-[15px] mt-[2px]">
                    <p className="text-[12px] text-gray80 font-semibold">Increasing value of OLP</p>
                    <p className="text-[12px] text-whitee0 font-semibold">{advancedFormatNumber((riskPremiumApr) * 100, 2, "")}%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className='mt-[28px] px-[28px]'>
            {selectedOrderSide === "Buy" ? (
              <div className='relative flex flex-col gap-[16px]'>
                <BuyInput
                  payAmount={payAmount}
                  setPayAmount={setPayAmount}
                  receiveAmount={receiveAmount}
                  setReceiveAmount={setReceiveAmount}
                  selectedQuoteAsset={selectedQuoteAsset}
                  setSelectedQuoteAsset={setSelectedQuoteAsset}
                  setSelectedOrderSide={setSelectedOrderSide}
                  olpKey={olpKey}
                  olpPrice={olpPrice}
                  isDisabled={isDisabled}
                  isDeprecated={isDeprecated}
                  />
              </div>
            ) : (
              <div className='relative flex flex-col gap-[16px]'>
                <SellInput
                  payAmount={payAmount}
                  setPayAmount={setPayAmount}
                  receiveAmount={receiveAmount}
                  setReceiveAmount={setReceiveAmount}
                  selectedQuoteAsset={selectedQuoteAsset}
                  setSelectedQuoteAsset={setSelectedQuoteAsset}
                  setSelectedOrderSide={setSelectedOrderSide}
                  olpKey={olpKey}
                  olpPrice={olpPrice}
                  isDisabled={isDisabled}
                  isDeprecated={isDeprecated}
                  />
              </div>
            )}
          </div>

        </div>

        {/* Fee 및 디테일 영역 */}
        <div className={twJoin(
          'bg-black17',
          "rounded-b-[10px]",
          isBerachain
            ? "border-[1px] border-t-0 border-solid border-[rgba(255,198,113,.4)]"
            : "border-[1px] border-t-0 border-solid border-black29"
        )}>
          <div className={twJoin(
            'group cursor-pointer flex flex-row justify-between items-center w-full h-[50px] px-[28px]',
            "active:opacity-80 active:bg-black14",
            detailOpened ? "" : "hover:bg-black1a",
            isBerachain
              ? "hover:rounded-b-[10px]"
              : "hover:rounded-b-[4px]"
          )} onClick={() => setDetailOpened(!detailOpened)}>
            <div className="flex flex-row justify-between items-center gap-[12px]">
              <div className='flex flex-row items-center gap-[4px] text-[12px] text-gray98 font-semibold h-[22px]'>
                <p>Fee</p>
                <p>{advancedFormatNumber(fee, 2, "", true)}%</p>
              </div>
              <div
                className={twJoin(
                "cursor-pointer flex flex-row items-center justify-between w-fit h-[22px] bg-black29 rounded-[11px] px-[8px] py-[4px]",
                "hover:bg-black33",
                "active:opacity-80 active:bg-black14"
                )}
                onClick={(e) => {
                  setSelectedQuoteAsset(lowestFeeAsset);
                  e.stopPropagation();
                }}
              >
                <p
                  className="text-[12px] font-semibold bg-clip-text text-transparent"
                  style={{
                    backgroundImage: "linear-gradient(90deg, #0AF 0%, #CF0 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent"
                  }}
                >{advancedFormatNumber(lowestFee, 2, "", true)}%</p>
                <div className="w-[1px] h-[10px] mx-[6px] bg-gray52"/>
                <p className="text-whitee0 text-[12px] font-semibold">{`Pay with ${lowestFeeAsset}`}</p>
              </div>
            </div>
            <div className='flex flex-row gap-[8px] text-[12px] text-gray98 font-semibold'>
              {!detailOpened ?
              <>
                <p className="group-hover:text-greenc1">Pool Detail</p>
                <img className='cursor-pointer w-[18px] h-[18px] min-w-[18px] min-h-[18px]' src={IconDropdownDown} onClick={() => setDetailOpened(!detailOpened)} />
              </>
              :
              <>
                <p className="text-greenc1">Hide</p>
                <img className='cursor-pointer w-[18px] h-[18px] min-w-[18px] min-h-[18px]' src={IconDropdownUp} onClick={() => setDetailOpened(!detailOpened)} />
              </>
              }
            </div>
          </div>

          {/* 디테일 세부사항 영역 */}
          {detailOpened &&
            <div className={twJoin(
              'flex flex-col w-full h-[467px]',
              isBerachain
                ? "h-[447px]"
                : "h-[417px]"
            )}>
              {/* Pool Asset Ratio 영역 */}
              <div className='mt-[6px] px-[28px]'>
                <p className='text-[13px] text-greenc1 font-semibold'>Pool Composition</p>
              </div>

              <div className='mx-[28px] mt-[8px] h-[1px] bg-black29'/>

              <PoolAssetRatioTableHead />
              <div className='mx-[28px] my-[5px] h-[1px] bg-black29'/>
              <PoolAssetRatioTableBody olpMetrics={olpMetricsData[olpKey]} olpDepositedAssetValue={olpDepositedAssetValue} isBuy={selectedOrderSide === "Buy"}/>

              <div className='mx-[28px] mt-[5px] h-[1px] bg-black29'/>

              {/* Real-time Greeks 영역 */}
              <div className='flex flex-col mt-[24px] px-[28px]'>
                <p className='text-[13px] text-greenc1 font-semibold'>Real-time Greeks</p>
              </div>
              <div className='mx-[28px] mt-[8px] h-[1px] bg-black29'/>
              <RealTimeGreeksTableHead />
              <div className='mx-[28px] mt-[5px] h-[1px] bg-black29'/>
              <RealTimeGreeksTableBody olpKey={olpKey}/>
            </div>
          }
        </div>
      </div>
    </div>
  );
};

export default OLP;
