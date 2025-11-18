import React, { useEffect, useRef, useState } from "react";
import { twJoin } from "tailwind-merge";
import { useAccount } from "wagmi";
import { advancedFormatNumber, getOlpKeyByVaultIndex } from "@/utils/helper";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { writeCreateClosePosition } from "@/utils/contract";
import { loadBalance } from "@/store/slices/UserSlice";
import { FlattenedPosition, NewPosition } from "@/interfaces/interfaces.positionSlice";
import { NetworkState } from "@/networks/types";
import { CONTRACT_ADDRESSES } from "@/networks/addresses";
import { getUnderlyingAssetIndexByTicker, getUnderlyingAssetTickerByIndex } from "@/networks/helpers";
import {
  BaseQuoteAsset,
  calculateRiskPremiumRate,
  calculateUnderlyingFutures,
  FEE_RATES,
  FuturesAssetIndexMap,
  isCallStrategy,
  isVanillaCallStrategy,
  NetworkQuoteAsset,
  parseOptionTokenId,
  RiskFreeRateCollection,
  SpotAssetIndexMap,
  TRADE_FEE_CALCULATION_LIMIT_RATE,
  VolatilityScore,
} from "@moby/shared";
import {
  QA_INFO,
  UA_TICKER_TO_ADDRESS,
  UA_TICKER_TO_DECIMAL,
  UA_TICKER_TO_QA_TICKER,
} from "@/networks/assets";

import IconClose from "@assets/icon-close.svg";
import Button from "@/components/Common/Button";
import { BN } from "@/utils/bn";
import { getMainAndPairedOptionData } from "../utils/options";

interface ClosePositionModalProps {
  position: FlattenedPosition;
  closeModal: () => void;
}

export const ClosePositionModal: React.FC<ClosePositionModalProps> = ({ position, closeModal }) => {
  const dispatch = useAppDispatch();
  const { address } = useAccount();
  const { chain } = useAppSelector((state) => state.network) as NetworkState;

  const spotAssetIndexMap = useAppSelector((state: any) => state.market.spotAssetIndexMap) as SpotAssetIndexMap;
  const futuresAssetIndexMap = useAppSelector(
    (state: any) => state.market.futuresAssetIndexMap
  ) as FuturesAssetIndexMap;
  const riskFreeRateCollection = useAppSelector((state: any) => state.market.riskFreeRateCollection) as RiskFreeRateCollection;
  const olpStats = useAppSelector((state: any) => state.market.olpStats);
  const optionsInfo = useAppSelector((state: any) => state.market.optionsInfo);
  const volatilityScore = useAppSelector((state: any) => state.market.volatilityScore) as VolatilityScore;

  const optionTokenId = BigInt(position.optionTokenId);
  const { underlyingAssetIndex, strategy, vaultIndex } = parseOptionTokenId(optionTokenId);
  const underlyingAsset = getUnderlyingAssetTickerByIndex(chain, underlyingAssetIndex);

  const underlyingAssetSpotIndex = spotAssetIndexMap[underlyingAsset];
  const underlyingAssetFuturesIndex = futuresAssetIndexMap[underlyingAsset];
  const usdcSpotIndex = spotAssetIndexMap.usdc;
  const underlyingAssetVolatilityScore = volatilityScore[underlyingAsset];

  const instrument = position.metadata.instrument;
  const expiry = position.metadata.expiry;
  const isVanilla = position.metadata.optionStrategy === "Vanilla";
  const isCall = position.metadata.optionDirection === "Call";
  const isBuy = position.metadata.optionOrderSide === "Buy";

  const [isButtonLoading, setIsButtonLoading] = useState<boolean>(false);

  // Token Related
  const [availableOptionSize, setAvailableOptionSize] = useState<number>(0);
  const [closeSize, setCloseSize] = useState<string>(position.size); // Close 물량
  const [closeSizeParsed, setCloseSizeParsed] = useState<string>(String(position.metadata.size)); // Close 물량

  const [getAmount, setGetAmount] = useState<number>(0); // Get 물량 (Buy일 때 옵션 가격에 대한 가치를 USDC로 받고, Sell일 때 옵션 가격에 대한 가치를 제외한 Collateral을 받음)
  const [closingPrice, setClosingPrice] = useState<number>(0);
  const [isExceededCollateral, setIsExceededCollateral] = useState<boolean>(false);

  useEffect(() => {
    const { mainOption, pairedOption } = getMainAndPairedOptionData({
      position,
      strategy,
      optionsInfo,
    });

    const olpKey = getOlpKeyByVaultIndex(vaultIndex);
    const olpGreeks = olpStats[olpKey].greeks[underlyingAsset];
    const olpUtilityRatio = {
      sOlp: {
        utilizedUsd: olpStats.sOlp.utilityRatio.utilizedUsd,
        depositedUsd: olpStats.sOlp.utilityRatio.depositedUsd,
      },
      mOlp: {
        utilizedUsd: olpStats.mOlp.utilityRatio.utilizedUsd,
        depositedUsd: olpStats.mOlp.utilityRatio.depositedUsd,
      },
      lOlp: {
        utilizedUsd: olpStats.lOlp.utilityRatio.utilizedUsd,
        depositedUsd: olpStats.lOlp.utilityRatio.depositedUsd,
      },
    };

    const underlyingFutures = calculateUnderlyingFutures(
      underlyingAsset,
      expiry,
      futuresAssetIndexMap,
      riskFreeRateCollection
    );

    const { RP_rate: rpRateForVanilla } = calculateRiskPremiumRate({
      underlyingAsset: underlyingAsset,
      expiry: expiry,
      isOpen: false,
      orderSide: isBuy ? "Buy" : "Sell",
      optionDirection: isCall ? "Call" : "Put",
      mainOption: mainOption,
      pairedOption: null,
      size: Number(closeSizeParsed),
      underlyingFutures,
      underlyingAssetSpotIndex,
      underlyingAssetVolatilityScore,
      olpKey,
      olpGreeks,
      olpUtilityRatio,
    });

    const { RP_rate: rpRateForSpread } = calculateRiskPremiumRate({
      underlyingAsset: underlyingAsset,
      expiry: expiry,
      isOpen: false,
      orderSide: isBuy ? "Buy" : "Sell",
      optionDirection: isCall ? "Call" : "Put",
      mainOption: mainOption,
      pairedOption: pairedOption,
      size: Number(closeSizeParsed),
      underlyingFutures,
      underlyingAssetSpotIndex,
      underlyingAssetVolatilityScore,
      olpKey,
      olpGreeks,
      olpUtilityRatio,
    });

    const closingPrice = isVanilla
      ? isBuy
        ? position.metadata.lastPrice * (1 - rpRateForVanilla)
        : position.metadata.lastPrice * (1 + rpRateForVanilla)
      : isBuy
      ? position.metadata.lastPrice * (1 - rpRateForSpread)
      : position.metadata.lastPrice * (1 + rpRateForSpread);

    setClosingPrice(closingPrice);

    let availableOptionSize = 0;
    const olpAssetAmounts = olpStats[olpKey].assetAmounts;

    if (isBuy) {
      // Buy Call, Buy Put, Buy CallSpread, Buy PutSpread
      const usdcAvailableAmounts = new BN(olpAssetAmounts.usdc.availableAmount).toNumber();
      availableOptionSize = new BN(usdcAvailableAmounts)
        .multipliedBy(usdcSpotIndex)
        .div(closingPrice)
        .toNumber();
    } else if (!isBuy && isVanillaCallStrategy(strategy)) {
      // Sell Call
      const underlyingAssetAvailableAmounts = new BN(
        underlyingAsset === "BTC"
          ? olpAssetAmounts.wbtc.availableAmount
          : olpAssetAmounts.weth.availableAmount
      ).toNumber();
      const paybackValue = new BN(underlyingAssetSpotIndex).minus(closingPrice).toNumber();

      if (paybackValue <= 0) {
        availableOptionSize = 0;
        setIsExceededCollateral(true);
      } else {
        availableOptionSize = new BN(underlyingAssetAvailableAmounts)
          .multipliedBy(underlyingAssetSpotIndex)
          .div(paybackValue)
          .toNumber();
        setIsExceededCollateral(false);
      }
    } else {
      // Sell Put, Sell CallSpread, Sell PutSpread
      const usdcAvailableAmounts = new BN(olpAssetAmounts.usdc.availableAmount).toNumber();
      const collateralUsd = isVanilla
        ? new BN(position.mainOptionStrikePrice).toNumber()
        : new BN(position.mainOptionStrikePrice).minus(position.pairedOptionStrikePrice).abs().toNumber();
      const paybackValue = new BN(collateralUsd).minus(closingPrice).toNumber();

      if (paybackValue <= 0) {
        availableOptionSize = 0;
        setIsExceededCollateral(true);
      } else {
        availableOptionSize = new BN(usdcAvailableAmounts)
          .multipliedBy(usdcSpotIndex)
          .div(paybackValue)
          .toNumber();
        setIsExceededCollateral(false);
      }
    }

    setAvailableOptionSize(availableOptionSize);
  }, [closeSize, underlyingAssetFuturesIndex, position.metadata.lastPrice]);

  // Slider Related
  const sliderRef = useRef<any>();
  const [sliderValue, setSliderValue] = useState<number>(100);

  // Initializing
  useEffect(() => {
    const closePayoffUsdWithSize = new BN(closeSizeParsed).multipliedBy(closingPrice).toNumber();

    const closePayoffAmountWithSize =
      !isBuy && isVanillaCallStrategy(strategy)
        ? new BN(closePayoffUsdWithSize).dividedBy(underlyingAssetSpotIndex).toNumber() // Sell Call
        : new BN(closePayoffUsdWithSize).dividedBy(usdcSpotIndex).toNumber(); // Buy Call, Buy Put, Sell Put, Buy CallSpread, Sell CallSpread, Buy PutSpread, Sell PutSpread

    const feeRate = isVanilla ? FEE_RATES.CLOSE_NAKED_POSITION : FEE_RATES.CLOSE_COMBO_POSITION;
    const feeUsd = new BN(closeSizeParsed)
      .multipliedBy(underlyingAssetSpotIndex)
      .multipliedBy(feeRate)
      .toNumber();
    const maxFeeUsd = new BN(closePayoffUsdWithSize)
      .multipliedBy(TRADE_FEE_CALCULATION_LIMIT_RATE)
      .toNumber();
    const appliedFeeUsd = Math.min(feeUsd, maxFeeUsd);

    const feeAmount =
      !isBuy && isVanillaCallStrategy(strategy)
        ? new BN(appliedFeeUsd).dividedBy(underlyingAssetSpotIndex).toNumber()
        : new BN(appliedFeeUsd).dividedBy(usdcSpotIndex).toNumber();

    let getAmount;

    if (isBuy) {
      // Buy Call, Buy Put, Buy CallSpread, Buy PutSpread
      // Close 물량에 대한 가치를 USDC로 계산 (= 받아야 할 돈)
      getAmount = new BN(closePayoffAmountWithSize).minus(feeAmount).toNumber();
    } else {
      // Close 물량에 대한 가치 계산 후 받아야 할 Collateral에서 제외하는 계산 (= 받아야 할 돈)
      const collateralAmount = isVanilla
        ? isVanillaCallStrategy(strategy)
          ? Number(closeSizeParsed)
          : new BN(position.mainOptionStrikePrice).multipliedBy(closeSizeParsed).toNumber()
        : new BN(position.mainOptionStrikePrice)
            .minus(position.pairedOptionStrikePrice)
            .abs()
            .multipliedBy(closeSizeParsed)
            .toNumber();
      const collateralMinusClosePayoffAmount = new BN(collateralAmount)
        .minus(closePayoffAmountWithSize)
        .toNumber();

      if (collateralMinusClosePayoffAmount <= 0) {
        getAmount = 0;
      } else {
        getAmount = new BN(collateralMinusClosePayoffAmount).minus(feeAmount).toNumber();
      }
    }

    setGetAmount(getAmount);
  }, [closeSize, closingPrice]);

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Math.min(Number(e.target.value), 100);

    setSliderValue(newValue);

    const newCloseSize = new BN(position.size).multipliedBy(newValue).div(100).toFixed(0);
    const newCloseSizeParsed = BN(position.metadata.size)
      .multipliedBy(newValue)
      .div(100)
      .toFixed(UA_TICKER_TO_DECIMAL[chain][underlyingAsset]);

    setCloseSize(newCloseSize);
    setCloseSizeParsed(newCloseSizeParsed);
  };

  const calculateSliderPercentagePosition = () => {
    if (sliderRef.current) {
      const sliderWidth = 200;
      const thumbWidth = sliderWidth / sliderRef.current.max; // Assume the thumb is 1/max of the slider
      const thumbPosition = thumbWidth * sliderValue;

      return thumbPosition - thumbWidth / 2; // Center it
    }

    return 0;
  };

  const [sliderPercentagePosition, setSliderPercentagePosition] = useState(calculateSliderPercentagePosition);

  // Update position whenever the slider value changes
  useEffect(() => {
    setSliderPercentagePosition(calculateSliderPercentagePosition());
  }, [sliderValue]);

  const closePayoff = isBuy
    ? new BN(closingPrice).minus(position.metadata.avgPrice).toNumber()
    : new BN(position.metadata.avgPrice).minus(closingPrice).toNumber();

  let pnl = 0;
  let roi = 0;

  if (isBuy) {
    pnl = new BN(closePayoff).multipliedBy(position.metadata.size).toNumber();
    roi = new BN(closePayoff).div(position.metadata.avgPrice).multipliedBy(100).toNumber();
  } else {
    let maxClosePayoff = 0;

    if (isVanillaCallStrategy(strategy)) {
      maxClosePayoff = closePayoff < 0 ? Math.max(closePayoff, -underlyingAssetSpotIndex) : closePayoff;
    } else {
      const collateralUsd = isVanilla
        ? new BN(position.mainOptionStrikePrice).toNumber()
        : new BN(position.mainOptionStrikePrice).minus(position.pairedOptionStrikePrice).abs().toNumber();

      maxClosePayoff = closePayoff < 0 ? Math.max(closePayoff, -collateralUsd) : closePayoff;
    }

    pnl = new BN(maxClosePayoff).multipliedBy(position.metadata.size).toNumber();
    roi = new BN(maxClosePayoff).div(position.metadata.avgPrice).multipliedBy(100).toNumber();
  }

  const realizedPnl = BN(pnl).multipliedBy(closeSizeParsed).div(position.metadata.size).toNumber();

  const handleCreateClosePosition = async () => {
    setIsButtonLoading(true);

    const closedCollateralToken = isBuy
      ? ""
      : isVanillaCallStrategy(strategy)
        ? UA_TICKER_TO_QA_TICKER[chain][underlyingAsset]
        : BaseQuoteAsset.USDC;

    const txInfo: NewPosition = {
      isOpen: false,
      underlyingAsset: underlyingAsset,
      underlyingAssetAddress: position.underlyingAsset,
      expiry: expiry,
      optionTokenId: String(optionTokenId),
      length: position.length,
      mainOptionStrikePrice: position.mainOptionStrikePrice,
      pairedOptionStrikePrice: position.pairedOptionStrikePrice,
      isBuys: position.isBuys,
      strikePrices: position.strikePrices,
      isCalls: position.isCalls,
      optionNames: position.optionNames,
      size: closeSize,
      executionPrice: "0",
      closedCollateralToken: closedCollateralToken,
      closedCollateralAmount: "0",
      lastProcessBlockTime: "0",
    };

    const quoteToken =
      !isBuy && isVanillaCallStrategy(strategy)
        ? UA_TICKER_TO_ADDRESS[chain][underlyingAsset]
        : CONTRACT_ADDRESSES[chain].USDC;

    const result = await writeCreateClosePosition(
      getUnderlyingAssetIndexByTicker(chain, underlyingAsset),
      String(optionTokenId),
      BigInt(closeSize),
      [quoteToken],
      BigInt(0),
      BigInt(0),
      false,
      txInfo,
      chain
    );

    if (result && address) {
      dispatch(loadBalance({ chain, address }));
      closeModal();
    }

    setIsButtonLoading(false);
  };

  const renderButton = () => {
    if (isButtonLoading) return <Button name="..." color="default" disabled onClick={() => {}} />;

    let buttonName = isBuy ? "Close Buy Position" : "Close Sell Position";

    const isButtonDisabled =
      !address || !closeSize || BN(closeSize).lte(0) || BN(closeSize).gt(position.size);

    const isAvaialbleExceeded = new BN(closeSize).gt(
      new BN(availableOptionSize).multipliedBy(10 ** UA_TICKER_TO_DECIMAL[chain][underlyingAsset])
    );
    const isInsufficientBalance = new BN(closeSize).gt(position.size);
    const isButtonError = isExceededCollateral || isAvaialbleExceeded || isInsufficientBalance;

    if (isButtonError) {
      if (isExceededCollateral) {
        buttonName = `Closing Premium Exceeds Collateral`;
      } else if (isAvaialbleExceeded) {
        buttonName = `Exceeded Available Option Size`;
      } else if (isInsufficientBalance) {
        buttonName = `Insufficient Option Token Balance`;
      }
    } else if (!closeSize || Number(closeSize) === 0) {
      buttonName = `Enter or Increase Amount to Close`;
    }

    return (
      <Button
        name={buttonName}
        color="default"
        isError={isButtonError}
        disabled={isButtonDisabled}
        onClick={handleCreateClosePosition}
      />
    );
  };

  return (
    <div
      className={twJoin(
        "flex flex-col",
        "w-[372px] h-[720px]",
        "rounded-[4px] shadow-[0px_0px_32px_0_rgba(0,0,0,0.5)] bg-black1a"
      )}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="relative flex flex-row justify-center items-center w-full h-[50px]">
        <div className="text-greenc1 text-[14px] font-bold">Closing</div>
        <img
          className="absolute right-[14px] cursor-pointer w-[24px] h-[24px] w-min-[24px] h-min-[24px]"
          src={IconClose}
          onClick={closeModal}
        />
      </div>

      <div className="w-full h-[1px] bg-black29" />

      <div
        className={twJoin(
          "mt-[26px] px-[24px] flex flex-row gap-[4px] w-full h-[39px]",
          "text-[13px] text-gray8b font-semibold text-center"
        )}
      >
        <div className="w-[232px] flex flex-col justify-center">
          <div>Instrument</div>
          <div className="flex flex-row items-center justify-center gap-[6px]">
            <p className="text-[14px] font-bold text-whitee0 ">{instrument}</p>
            {!isVanilla && (
              <p
                className={twJoin(
                  "text-[10px]",
                  isCallStrategy(strategy)
                    ? "border-t-[1.4px] border-t-gray80"
                    : "border-b-[1.4px] border-b-gray80"
                )}
              >
                {position.pairedOptionStrikePrice}
              </p>
            )}
          </div>
        </div>
        <div className="w-[80px] flex flex-col justify-center">
          <div>Position</div>
          {isBuy ? (
            <div className="text-[16px] font-bold text-green4c">Buy</div>
          ) : (
            <div className="text-[16px] font-bold text-redc7">Sell</div>
          )}
        </div>
      </div>

      <div
        className={twJoin(
          "mt-[22px] mx-[24px] py-[12px] flex flex-col",
          "w-[324px] h-[185px] rounded-[4px] bg-black1f text-[13px]",
          "border-[1px] border-black29"
        )}
      >
        <div className="flex flex-row justify-between items-center font-semibold h-[18px] pl-[24px] pr-[18px]">
          {/* Tooltip */}
          <div className="relative group cursor-help w-fit font-semibold border-b-[1px] border-dashed border-b-greenc1">
            <p className="text-gray8b text-[13px] hover:text-greenc1 ">Order Price</p>
            <div
              className={twJoin(
                "w-max h-[26px] z-20",
                "absolute hidden px-[11px] py-[6px] bottom-[24px] -left-[12px]",
                "bg-black1f rounded-[4px] border-[1px] border-[rgba(224,224,224,.1)] shadow-[0_0_8px_0_rgba(10,10,10,.72)]",
                "group-hover:block"
              )}
            >
              <p className="text-[12px] text-gray80 leading-[0.85rem]">Price of options paid in USD</p>
            </div>
          </div>

          <div className="text-[14px] text-whitee0">
            <p>{advancedFormatNumber(position.metadata.avgPrice, 2, "$")}</p>
          </div>
        </div>
        <div className="flex flex-row justify-between items-center font-semibold h-[18px] mt-[6px] pl-[24px] pr-[18px]">
          <div className="text-gray8b">Closing Price</div>
          <div className="text-[14px] text-whitee0">
            <p>{advancedFormatNumber(closingPrice, 2, "$")}</p>
          </div>
        </div>
        <div className="flex flex-row justify-between items-center font-semibold h-[18px] mt-[6px] pl-[24px] pr-[18px]">
          {/* Tooltip */}
          <div className="relative group cursor-help w-fit font-semibold border-b-[1px] border-dashed border-b-greenc1">
            <p className="text-gray8b text-[13px] hover:text-greenc1 ">Closing Payoff</p>
            <div
              className={twJoin(
                "w-max h-[26px] z-20",
                "absolute hidden px-[11px] py-[6px] bottom-[24px] -left-[12px]",
                "bg-black1f rounded-[4px] border-[1px] border-[rgba(224,224,224,.1)] shadow-[0_0_8px_0_rgba(10,10,10,.72)]",
                "group-hover:block"
              )}
            >
              {isBuy ? (
                <p className="text-[12px] text-gray80 leading-[0.85rem]">Closing Price - Order Price</p>
              ) : (
                <p className="text-[12px] text-gray80 leading-[0.85rem]">Order Price - Closing Price</p>
              )}
            </div>
          </div>

          <div className="text-[14px] text-whitee0">
            {closePayoff === 0 ? (
              <p>$0.00</p>
            ) : (
              <p className={closePayoff > 0 ? "text-green4c" : "text-redc7"}>
                {advancedFormatNumber(closePayoff, 2, "$")}
              </p>
            )}
          </div>
        </div>

        <div className="mt-[14px] w-full h-[1px] bg-black29" />

        <div className="flex flex-row justify-between items-center font-semibold h-[18px] mt-[11px] pl-[24px] pr-[18px]">
          <div className="text-gray8b">Quantity</div>
          <div className="text-[14px]">{advancedFormatNumber(position.metadata.size, 4, "")}</div>
        </div>
        <div className="flex flex-row justify-between items-center font-semibold h-[18px] mt-[6px] pl-[24px] pr-[18px]">
          {/* Tooltip */}
          <div className="relative group cursor-help w-fit font-semibold border-b-[1px] border-dashed border-b-greenc1">
            <p className="text-gray8b text-[13px] hover:text-greenc1 ">Position P&L</p>
            <div
              className={twJoin(
                "w-max h-[26px] z-20",
                "absolute hidden px-[11px] py-[6px] bottom-[24px] -left-[12px]",
                "bg-black1f rounded-[4px] border-[1px] border-[rgba(224,224,224,.1)] shadow-[0_0_8px_0_rgba(10,10,10,.72)]",
                "group-hover:block"
              )}
            >
              <p className="text-[12px] text-gray80 leading-[0.85rem]">Closing Payoff × Qty.</p>
            </div>
          </div>

          <div className="text-[14px]">
            {pnl === 0 ? (
              <p>$0.00</p>
            ) : (
              <p className={pnl > 0 ? "text-green4c" : "text-redc7"}>{advancedFormatNumber(pnl, 2, "$")}</p>
            )}
          </div>
        </div>
        <div className="flex flex-row justify-between items-center font-semibold h-[18px] mt-[6px] pl-[24px] pr-[18px]">
          {/* Tooltip */}
          <div className="relative group cursor-help w-fit font-semibold border-b-[1px] border-dashed border-b-greenc1">
            <p className="text-gray8b text-[13px] hover:text-greenc1 ">ROI</p>
            <div
              className={twJoin(
                "w-max h-[26px] z-20",
                "absolute hidden px-[11px] py-[6px] bottom-[24px] -left-[12px]",
                "bg-black1f rounded-[4px] border-[1px] border-[rgba(224,224,224,.1)] shadow-[0_0_8px_0_rgba(10,10,10,.72)]",
                "group-hover:block"
              )}
            >
              <p className="text-[12px] text-gray80 leading-[0.85rem]">Closing Payoff / Order Price × 100</p>
            </div>
          </div>

          <div className="text-[14px]">
            {roi === 0 ? (
              <p>0.00%</p>
            ) : (
              <p className={roi > 0 ? "text-green4c" : "text-redc7"}>{advancedFormatNumber(roi, 2, "")}%</p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-[23px] mx-[24px]">
        <div
          className={twJoin(
            "flex flex-col",
            "w-full h-[157px]",
            "rounded-[6px] bg-black12",
            "px-[18px] py-[18px]"
          )}
        >
          <div className="flex flex-row justify-between items-center h-[20px]">
            <p className="text-[14px] text-gray80 font-semibold">
              <span>Closing Quantity</span>
            </p>
            <div className="flex flex-row justify-end">
              <div
                className={twJoin(
                  "relative group cursor-help",
                  "border-b-[1px] border-dashed border-b-greenc1",
                  "flex flex-row justify-center items-center",
                  "text-[12px] text-whitee0 font-semibold",
                  "hover:text-greenc1"
                )}
              >
                <p>Available: </p>
                {isExceededCollateral ? (
                  <p className="ml-[6px]">-</p>
                ) : (
                  <p className="ml-[6px]">{advancedFormatNumber(availableOptionSize, 4, "")}</p>
                )}
                <div
                  className={twJoin(
                    "absolute hidden w-[334px] h-[54px] px-[11px] py-[6px] bottom-[24px] -left-[12px]",
                    "bg-black1f rounded-[4px] border-[1px] border-[rgba(224,224,224,.1)] shadow-[0_0_8px_0_rgba(10,10,10,.72)]",
                    "group-hover:block"
                  )}
                >
                  <p className="text-gray80 leading-[0.85rem]">
                    Max Amount OLPs allowed for traders to close positions <br />
                    depending on free liquidity. This amount may be smaller <br />
                    than positions you have opened.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-row justify-center items-center mt-[20px] h-[24px]">
            <input
              value={closeSizeParsed}
              placeholder="0"
              className={twJoin(
                "w-full",
                "text-[20px] text-greenc1 font-bold bg-transparent",
                "focus:outline-none",
                "placeholder:text-[20px] placeholder-gray80 placeholder:font-bold"
              )}
              onChange={(e) => {
                if (e.target.value.includes(" ")) return;
                if (isNaN(Number(e.target.value))) return;

                const closeSizeParsed = e.target.value.replace(/^0+(?=\d)/, "");
                let closeSize = new BN(closeSizeParsed)
                  .multipliedBy(10 ** UA_TICKER_TO_DECIMAL[chain][underlyingAsset])
                  .toFixed(0);

                setCloseSizeParsed(e.target.value.replace(/^0+(?=\d)/, ""));
                setCloseSize(closeSize);

                // calculate slider value
                let newSliderValue = BN(e.target.value)
                  .div(position.metadata.size)
                  .multipliedBy(100)
                  .toNumber();
                if (BN(newSliderValue).isGreaterThan(100)) newSliderValue = 100;
                if (isNaN(newSliderValue)) newSliderValue = 0;

                setSliderValue(Math.round(newSliderValue));
              }}
              onFocus={handleFocus}
            />
            <div>
              <p className="ml-[16px] text-[16px] text-[#525252] font-semibold">Contracts</p>
            </div>
          </div>

          <div className="relative mt-[32px] flex flex-row justify-between items-center text-[12px] text-gray8b font-semibold">
            <div className="w-[17px]">0%</div>
            <input
              type="range"
              ref={sliderRef}
              min="0"
              max="100"
              value={sliderValue}
              className="slider"
              id="myRange"
              onChange={handleSliderChange}
              style={{
                background: `linear-gradient(90deg, #E6FC8D ${sliderValue}%, #3d3d3b ${sliderValue}%)`,
              }}
            />
            <div className="w-[33px]">100%</div>
            <div
              style={{ left: `${sliderPercentagePosition + 8}px` }}
              className="absolute top-[25px] w-[58px] h-[28px]"
            >
              <div
                style={{}}
                className={twJoin(
                  "relative",
                  "w-full h-full bg-black21 border-[1px] border-black33",
                  "flex flex-row justify-center items-center text-[12px] text-greenc1 font-semibold rounded-[4px]"
                )}
              >
                {sliderValue}%
                <div className="absolute top-0 left-1/2 w-0 h-0 border-[6px] border-solid border-transparent border-b-black33  border-t-0 ml-[-6px] mt-[-6px]"></div>
                <div className="absolute top-0 left-1/2 w-0 h-0 border-[4px] border-solid border-transparent border-b-black21  border-t-0 ml-[-4px] mt-[-4px]"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-[24px] w-full h-[1px] bg-black29" />

      <div className="flex flex-col mt-[25px] mx-[24px]">
        <>
          <div className="flex flex-row justify-between items-center h-[18px]">
            {/* Tooltip */}
            <div className="relative group cursor-help w-fit font-semibold border-b-[1px] border-dashed border-b-greenc1">
              <p className="text-gray8b text-[14px] hover:text-greenc1 ">You'll get</p>
              <div
                className={twJoin(
                  "w-max z-20",
                  "absolute hidden px-[11px] py-[6px] bottom-[24px] -left-[12px]",
                  "bg-black1f rounded-[4px] border-[1px] border-[rgba(224,224,224,.1)] shadow-[0_0_8px_0_rgba(10,10,10,.72)]",
                  "group-hover:block"
                )}
              >
                {isBuy ? (
                  <>
                    <p className="text-[12px] text-gray80 leading-[0.85rem]">
                      Estimated token amount to get after trade fee.
                    </p>
                    <p className="text-[11px] text-[#666] font-normal">
                      Closing Price × Closing Qty. - Total Trade Fee
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-[12px] text-gray80 leading-[0.85rem]">
                      Estimated token amount to get after trade fee.
                    </p>
                    <p className="text-[11px] text-[#666] font-normal">
                      (Collateral per Option - Closing Price) × Closing Qty. - Total Trade Fee
                    </p>
                  </>
                )}
              </div>
            </div>

            <div className="flex flex-row items-center text-[18px] text-whitee0 font-semibold">
              <div>{isExceededCollateral ? "-" : advancedFormatNumber(getAmount, 4, "")}</div>
              {!isBuy && isVanillaCallStrategy(strategy) ? (
                <img
                  src={
                    QA_INFO[chain][
                      UA_TICKER_TO_QA_TICKER[chain][
                        underlyingAsset
                      ] as keyof (typeof NetworkQuoteAsset)[typeof chain]
                    ].src
                  }
                  className="w-[20px] h-[20px] min-w-[20px] min-h-[20px] ml-[8px]"
                />
              ) : (
                <img
                  src={QA_INFO[chain][NetworkQuoteAsset[chain].USDC].src}
                  className="w-[20px] h-[20px] min-w-[20px] min-h-[20px] ml-[8px]"
                />
              )}
            </div>
          </div>
          <div className="flex flex-row justify-end text-[14px] text-gray80 font-normal mt-[3px]">
            {isExceededCollateral ? (
              <p>-</p>
            ) : !isBuy && isVanillaCallStrategy(strategy) ? (
              <p>
                ~
                {advancedFormatNumber(
                  new BN(getAmount).multipliedBy(underlyingAssetSpotIndex).toNumber(),
                  2,
                  "$"
                )}
              </p>
            ) : (
              <p>~{advancedFormatNumber(new BN(getAmount).multipliedBy(usdcSpotIndex).toNumber(), 2, "$")}</p>
            )}
          </div>
        </>

        <div className="mt-[6px]">
          <div className="flex flex-row justify-between items-center h-[18px]">
            {/* Tooltip */}
            <div className="relative group cursor-help w-fit font-semibold border-b-[1px] border-dashed border-b-greenc1">
              <p className="text-gray8b text-[14px] hover:text-greenc1 ">Realized P&L</p>
              <div
                className={twJoin(
                  "w-max h-[26px] z-20",
                  "absolute hidden px-[11px] py-[6px] bottom-[24px] -left-[12px]",
                  "bg-black1f rounded-[4px] border-[1px] border-[rgba(224,224,224,.1)] shadow-[0_0_8px_0_rgba(10,10,10,.72)]",
                  "group-hover:block"
                )}
              >
                <p className="text-[12px] text-gray80 leading-[0.85rem]">P&L × Partial Closing Ratio</p>
              </div>
            </div>

            <div className="flex flex-row justify-end text-[14px] text-gray80 font-normal">
              {isExceededCollateral ? (
                <p>-</p>
              ) : realizedPnl === 0 ? (
                <p>$0.00</p>
              ) : (
                <p>
                  {advancedFormatNumber(
                    BN(realizedPnl).multipliedBy(closeSizeParsed).div(position.metadata.size).toNumber(),
                    2,
                    "$"
                  )}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="w-[324px] h-[48px] mt-[25px] mx-[24px]">{renderButton()}</div>
    </div>
  );
};
