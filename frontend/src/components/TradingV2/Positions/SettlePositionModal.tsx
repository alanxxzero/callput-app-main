import React, { useEffect, useState } from "react";

import { advancedFormatNumber } from "@/utils/helper";
import { twJoin } from "tailwind-merge";

import IconClose from "@assets/icon-close.svg";
import { useAccount } from "wagmi";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { loadBalance } from "@/store/slices/UserSlice";
import { writeSettlePosition } from "@/utils/contract";
import { FlattenedPosition, SettlePosition } from "@/interfaces/interfaces.positionSlice";
import { NetworkState } from "@/networks/types";
import { MSA_INFO, QA_INFO, UA_INFO, UA_TICKER_TO_ADDRESS, UA_TICKER_TO_QA_TICKER } from "@/networks/assets";
import { getUnderlyingAssetIndexByTicker, getUnderlyingAssetTickerByIndex } from "@/networks/helpers";
import { FEE_RATES, getPairedOptionName, isVanillaCallStrategy, NetworkQuoteAsset, parseOptionTokenId, SETTLE_FEE_CALCULATION_LIMIT_RATE, SpotAssetIndexMap, UnderlyingAsset } from "@moby/shared";
import { CONTRACT_ADDRESSES } from "@/networks/addresses";
import { BN } from "@/utils/bn";
import Button from "@/components/Common/Button";

interface SettlePositionModalProps {
  position: FlattenedPosition;
  closeModal: () => void;
}

export const SettlePositionModal: React.FC<SettlePositionModalProps> = ({ position, closeModal }) => {
  const dispatch = useAppDispatch();
  const { address } = useAccount();
  const { chain } = useAppSelector(state => state.network) as NetworkState;

  const spotAssetIndexMap = useAppSelector((state: any) => state.market.spotAssetIndexMap) as SpotAssetIndexMap;

  const optionTokenId = BigInt(position.optionTokenId);
  const { underlyingAssetIndex, strategy, strikePrices, vaultIndex } = parseOptionTokenId(optionTokenId);
  const underlyingAsset = getUnderlyingAssetTickerByIndex(chain, underlyingAssetIndex);

  const spotIndex = spotAssetIndexMap[underlyingAsset];
  const usdcSpotIndex = spotAssetIndexMap.usdc;

  const instrument = position.metadata.instrument;
  const optionPairInstrument = getPairedOptionName(BigInt(position.optionTokenId), position.optionNames);

  const expiry = position.metadata.expiry;
  const isVanilla = position.metadata.optionStrategy === "Vanilla";
  const isCall = position.metadata.optionDirection === "Call";
  const isBuy = position.metadata.optionOrderSide === "Buy";
  const settlePrice = position.metadata.settlePrice;

  const [collateralAmount, setCollateralAmount] = useState<number>(0); // Call 일 때는 IndexToken, Put 일 때는 USDC
  const [collateralUsd, setCollateralUsd] = useState<number>(0); // Call 일 때는 IndexToken * AssetPrice, Put 일 때는 USDC

  const [getAmount, setGetAmount] = useState<number>(0);
  const [settlePayoffUsd, setSettlePayoffUsd] = useState<number>(0);

  const [isButtonLoading, setIsButtonLoading] = useState<boolean>(false);

  useEffect(() => {
    const isITM = isCall
      ? Number(position.mainOptionStrikePrice) < settlePrice
      : Number(position.mainOptionStrikePrice) > settlePrice;

    const settlePayoffUsd = isITM
      ? isVanilla
        ? isCall
          ? new BN(settlePrice).minus(position.mainOptionStrikePrice).toNumber()
          : new BN(position.mainOptionStrikePrice).minus(settlePrice).toNumber()
        : isCall
        ? Math.min(
            new BN(settlePrice).minus(position.mainOptionStrikePrice).toNumber(),
            new BN(position.mainOptionStrikePrice).minus(position.pairedOptionStrikePrice).abs().toNumber()
          )
        : Math.min(
            new BN(position.mainOptionStrikePrice).minus(settlePrice).toNumber(),
            new BN(position.mainOptionStrikePrice).minus(position.pairedOptionStrikePrice).abs().toNumber()
          )
      : 0;

    setSettlePayoffUsd(settlePayoffUsd);

    const settlePayoffUsdWithSize = new BN(position.metadata.size).multipliedBy(settlePayoffUsd).toNumber();

    const settlePayoffAmountWithSize = isVanillaCallStrategy(strategy)
      ? new BN(settlePayoffUsdWithSize).dividedBy(spotIndex).toNumber() // Buy Call, Sell Call
      : new BN(settlePayoffUsdWithSize).dividedBy(usdcSpotIndex).toNumber(); // Buy Put, Sell Put, Buy CallSpread, Sell CallSpread, Buy PutSpread, Sell PutSpread

    let beforeFeePaidGetAmount = 0;

    if (isBuy) {
      if (isITM) {
        beforeFeePaidGetAmount = settlePayoffAmountWithSize;
      }
    } else {
      const collateralAmount = isVanilla
        ? isVanillaCallStrategy(strategy)
          ? Number(position.metadata.size)
          : new BN(position.mainOptionStrikePrice).multipliedBy(position.metadata.size).toNumber()
        : new BN(position.mainOptionStrikePrice)
            .minus(position.pairedOptionStrikePrice)
            .abs()
            .multipliedBy(position.metadata.size)
            .toNumber();
      const collateralUsd = isVanillaCallStrategy(strategy)
        ? collateralAmount * spotIndex
        : collateralAmount * usdcSpotIndex;

      if (isITM) {
        beforeFeePaidGetAmount = collateralAmount - settlePayoffAmountWithSize;
      } else {
        beforeFeePaidGetAmount = collateralAmount;
      }

      setCollateralAmount(collateralAmount);
      setCollateralUsd(collateralUsd);
    }

    let getAmount = beforeFeePaidGetAmount;

    if (isITM) {
      const feeUsd = new BN(position.metadata.size)
        .multipliedBy(spotIndex)
        .multipliedBy(FEE_RATES.SETTLE_POSITION)
        .toNumber();

      const feeAmount = isVanillaCallStrategy(strategy)
        ? new BN(feeUsd).div(spotIndex).toNumber()
        : new BN(feeUsd).div(usdcSpotIndex).toNumber();

      const maxFeeAmount = new BN(beforeFeePaidGetAmount)
        .multipliedBy(SETTLE_FEE_CALCULATION_LIMIT_RATE)
        .toNumber();

      const appliedFeeAmount = Math.min(feeAmount, maxFeeAmount);

      getAmount = appliedFeeAmount >= beforeFeePaidGetAmount ? 0 : beforeFeePaidGetAmount - appliedFeeAmount;
    }

    setGetAmount(getAmount);
  }, []);

  const pnlInUnit = isBuy
    ? new BN(settlePayoffUsd).minus(position.metadata.avgPrice).toNumber()
    : new BN(position.metadata.avgPrice).minus(settlePayoffUsd).toNumber();

  const pnl = new BN(pnlInUnit).multipliedBy(position.metadata.size).toNumber();

  const roi = new BN(pnlInUnit).div(position.metadata.avgPrice).multipliedBy(100).toNumber();

  const handleSettlePosition = async () => {
    setIsButtonLoading(true);

    const newPendingTxInfo: SettlePosition = {
      underlyingAssetTicker: underlyingAsset,
      optionTokenId: String(optionTokenId),
      expiry: expiry,
      strategy: strategy,
      mainOptionName: instrument,
      pairedOptionName: optionPairInstrument,
      mainOptionStrikePrice: String(position.mainOptionStrikePrice),
      pairedOptionStrikePrice: String(position.pairedOptionStrikePrice),
      isBuy: isBuy,
      size: position.size,
      settlePrice: String(settlePrice),
      processBlockTime: (Date.now() / 1000).toFixed(0),
    };

    const result = await writeSettlePosition(
      isVanillaCallStrategy(strategy)
        ? [UA_TICKER_TO_ADDRESS[chain][underlyingAsset as UnderlyingAsset]]
        : [CONTRACT_ADDRESSES[chain].USDC],
      getUnderlyingAssetIndexByTicker(chain, underlyingAsset),
      String(optionTokenId),
      0,
      false,
      newPendingTxInfo,
      chain
    );

    if (result && address) {
      dispatch(
        loadBalance({ chain, address })
      );
      closeModal();
    }

    setIsButtonLoading(false);
  };

  const renderButton = () => {
    if (isButtonLoading) return <Button name="..." color="default" disabled onClick={() => {}} />;

    const buttonName = isBuy ? "Settle Position" : "Settle & Redeem Collateral";

    const isButtonDisabled = !address;

    return (
      <Button name={buttonName} color="default" disabled={isButtonDisabled} onClick={handleSettlePosition} />
    );
  };

  return (
    <div
      className={twJoin(
        "flex flex-col",
        "w-[372px]",
        "rounded-[4px] shadow-[0px_0px_32px_0_rgba(0,0,0,0.5)] bg-black1a",
        isBuy ? "h-[555px]" : "h-[581px]"
      )}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="relative flex flex-row justify-center items-center w-full h-[50px]">
        <div className="text-greenc1 text-[14px] font-bold">Settlement</div>
        <img
          className="absolute right-[14px] cursor-pointer w-[24px] h-[24px] w-min-[24px] h-min-[24px]"
          src={IconClose}
          onClick={closeModal}
        />
      </div>

      <div className="w-full h-[1px] bg-black29" />

      <div
        className={twJoin(
          "mt-[26px] px-[24px] flex flex-row gap-[12px] w-full h-[39px]",
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
                  isCall ? "border-t-[1.4px] border-t-gray80" : "border-b-[1.4px] border-b-gray80"
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
            <div className="text-[14px] text-green4c">Buy</div>
          ) : (
            <div className="text-[14px] text-redc7">Sell</div>
          )}
        </div>
      </div>

      <div
        className={twJoin(
          "mt-[22px] mx-[24px] px-[24px] py-[20px] flex flex-col",
          "w-[324px] rounded-[4px] bg-black1f text-[13px]",
          "border-[1px] border-black29",
          isBuy ? "h-[235px]" : "h-[250px]"
        )}
      >
        {/* Collateral */}
        <div className="flex flex-row justify-between items-baseline font-semibold h-fit">
          <div className="text-gray8b">Collateral</div>
          <div className="flex flex-col items-end">
            {isBuy ? (
              <p className="h-[18px]">-</p>
            ) : (
              <div className="h-[35px]">
                <div className="flex flex-row text-[14px] text-whitee0">
                  {`${advancedFormatNumber(collateralAmount, 4, "")} ${
                    isVanillaCallStrategy(strategy)
                      ? UA_INFO[chain][underlyingAsset as UnderlyingAsset].symbol
                      : MSA_INFO[chain]["USDC"].symbol
                  }`}
                </div>
                <div className="text-[12px] text-gray80 text-right">
                  ${advancedFormatNumber(collateralUsd, 2, "")}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Order Price */}
        <div className="flex flex-row justify-between items-center font-semibold h-[18px] mt-[6px]">
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

        {/* Settle Price */}
        <div className="flex flex-row justify-between items-center font-semibold h-[18px] mt-[6px]">
          {/* Tooltip */}
          <div className="relative group cursor-help w-fit font-semibold border-b-[1px] border-dashed border-b-greenc1">
            <p className="text-gray8b text-[13px] hover:text-greenc1 ">Settle Price</p>
            <div
              className={twJoin(
                "w-max h-[40px] z-20",
                "absolute hidden px-[11px] py-[6px] bottom-[24px] -left-[12px]",
                "bg-black1f rounded-[4px] border-[1px] border-[rgba(224,224,224,.1)] shadow-[0_0_8px_0_rgba(10,10,10,.72)]",
                "group-hover:block"
              )}
            >
              <p className="text-[12px] text-gray80 leading-[0.85rem]">
                TWAP of Futures Index <br />
                during 30 minutes to expiry
              </p>
            </div>
          </div>

          <div className="text-[14px] text-whitee0">
            <p>{advancedFormatNumber(settlePrice, 2, "$")}</p>
          </div>
        </div>

        {/* Settle Payoff - Size 1개 기준 */}
        <div className="flex flex-row justify-between items-center font-semibold h-[18px] mt-[6px]">
          {/* Tooltip */}
          <div className="relative group cursor-help w-fit font-semibold border-b-[1px] border-dashed border-b-greenc1">
            <p className="text-gray8b text-[13px] hover:text-greenc1 ">Settle Payoff</p>
            <div
              className={twJoin(
                "w-max h-[40px] z-20",
                "absolute hidden px-[11px] py-[6px] bottom-[24px] -left-[12px]",
                "bg-black1f rounded-[4px] border-[1px] border-[rgba(224,224,224,.1)] shadow-[0_0_8px_0_rgba(10,10,10,.72)]",
                "group-hover:block"
              )}
            >
              {isCall && isBuy && (
                <p className="text-[12px] text-gray80 leading-[0.85rem]">
                  Greater of the two values: <br />
                  Settle Price - Strike Price or 0.
                </p>
              )}
              {isCall && !isBuy && (
                <p className="text-[12px] text-gray80 leading-[0.85rem]">
                  Smaller of the two values: <br />
                  Strike Price - Settle Price or 0.
                </p>
              )}
              {!isCall && isBuy && (
                <p className="text-[12px] text-gray80 leading-[0.85rem]">
                  Greater of the two values: <br />
                  Strike Price - Settle Price or 0.
                </p>
              )}
              {!isCall && !isBuy && (
                <p className="text-[12px] text-gray80 leading-[0.85rem]">
                  Smaller of the two values: <br />
                  Settle Price - Strike Price or 0.
                </p>
              )}
            </div>
          </div>

          <div className="text-[14p]">
            {settlePayoffUsd === 0 ? (
              <p className="text-whitee0">$0.00</p>
            ) : isBuy ? (
              <p className="text-green4c">{advancedFormatNumber(settlePayoffUsd, 2, "$")}</p>
            ) : (
              <p className="text-redc7">{advancedFormatNumber(-settlePayoffUsd, 2, "$")}</p>
            )}
          </div>
        </div>

        <div className="mt-[14px] w-full h-[1px] bg-black29" />

        <div className="flex flex-row items-center justify-between mt-[11px]">
          <div className="text-gray8b text-[13px] font-semibold">Quantity</div>
          <div className="text-[14px] text-whitee0">
            {advancedFormatNumber(position.metadata.size, 4, "")}
          </div>
        </div>

        {/* P&L - Size 반영 */}
        <div className="flex flex-row justify-between items-center font-semibold h-[18px] mt-[6px]">
          {/* Tooltip */}
          <div className="relative group cursor-help w-fit font-semibold border-b-[1px] border-dashed border-b-greenc1">
            <p className="text-gray8b text-[13px] hover:text-greenc1 ">P&L</p>
            <div
              className={twJoin(
                "w-max h-[26px] z-20",
                "absolute hidden px-[11px] py-[6px] bottom-[24px] -left-[12px]",
                "bg-black1f rounded-[4px] border-[1px] border-[rgba(224,224,224,.1)] shadow-[0_0_8px_0_rgba(10,10,10,.72)]",
                "group-hover:block"
              )}
            >
              {isBuy ? (
                <p className="text-[12px] text-gray80 leading-[0.85rem]">
                  (Settle Payoff - Order Price) × OptionSize
                </p>
              ) : (
                <p className="text-[12px] text-gray80 leading-[0.85rem]">
                  (Order Price - Settle Payoff) × Option Size
                </p>
              )}
            </div>
          </div>

          <div className="text-[14px]">
            {pnl === 0 ? (
              <p className="text-whitee0">$0.00</p>
            ) : (
              <p className={pnl > 0 ? "text-green4c" : "text-redc7"}>{advancedFormatNumber(pnl, 2, "$")}</p>
            )}
          </div>
        </div>

        {/* ROI - Size 반영 */}
        <div className="flex flex-row justify-between items-center font-semibold h-[18px] mt-[6px]">
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
              <p className="text-[12px] text-gray80 leading-[0.85rem]">P&L / Order Price × 100</p>
            </div>
          </div>

          <div className="text-[14px]">
            {roi === 0 ? (
              <p className="text-whitee0">0.00%</p>
            ) : (
              <p className={roi > 0 ? "text-green4c" : "text-redc7"}>{advancedFormatNumber(roi, 2, "")}%</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col mt-[24px] mx-[24px]">
        <div className="flex flex-row justify-between items-center">
          <div className="relative group cursor-help border-b-[1px] border-dashed border-b-greenc1">
            <p className="text-gray80 text-[14px] font-semibold hover:text-greenc1 ">You'll get</p>
            <div
              className={twJoin(
                "absolute hidden h-[42px] px-[11px] py-[6px] bottom-[24px] -left-[12px]",
                "bg-black1f rounded-[4px] border-[1px] border-[rgba(224,224,224,.1)] shadow-[0_0_8px_0_rgba(10,10,10,.72)]",
                "group-hover:block",
                isBuy ? "w-[304px]" : "w-[350px]"
              )}
            >
              {isBuy ? (
                <>
                  <p className="text-[12px] text-gray80 leading-[0.85rem]">
                    Estimated token amount to get after settlement fee.
                  </p>
                  <p className="text-[11px] text-[#666] font-normal">
                    Settle Payoff × Qty. - Total Settlement Fee
                  </p>
                </>
              ) : (
                <>
                  <p className="text-[12px] text-gray80 leading-[0.85rem]">
                    Estimated token amount to get after settlement fee.
                  </p>
                  <p className="text-[11px] text-[#666] font-normal">
                    (Collateral per Option - Settle Payoff) × Qty. - Total Settlement Fee
                  </p>
                </>
              )}
            </div>
          </div>
          <div className="flex flex-row items-center text-[18px] text-whitee0 font-semibold">
            <p>{advancedFormatNumber(getAmount, 4, "")}</p>
            {isVanillaCallStrategy(strategy) ? (
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
        <div className="flex flex-row justify-end text-[12px] text-gray80 font-normal">
          {isVanillaCallStrategy(strategy) ? (
            <p>~{advancedFormatNumber(new BN(getAmount).multipliedBy(spotIndex).toNumber(), 2, "$")}</p>
          ) : (
            <p>~{advancedFormatNumber(new BN(getAmount).multipliedBy(usdcSpotIndex).toNumber(), 2, "$")}</p>
          )}
        </div>
      </div>

      <div className="w-[324px] h-[48px] mt-[36px] mx-[24px]">{renderButton()}</div>
    </div>
  );
};
