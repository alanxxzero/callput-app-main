import React, { useContext } from 'react'
import { twMerge, twJoin } from 'tailwind-merge'

import BackIcon from '@assets/icon-back2.svg?react';
import EarnBeraImage from '@/assets/earn-bera-image.svg?react'

import VaultTag from './VaultTag';
import { advancedFormatNumber } from '@/utils/helper';
import BigNumber from 'bignumber.js';
import DesktopOnly from '../Common/DesktopOnly';
import MobileOnly from '../Common/MobileOnly';
import Mobile from '../Mobile';
import Button from '../Common/Button';
import Column from './Column';
import APY from './APY';
import { DOV_ASSET_INFO } from '@/utils/assets';
import { ModalContext } from '../Common/ModalContext';
import LearnMoreModal from './LearnMoreModal';

type Props = {
  selectVault: (...args: any[]) => void;
  vaultInfo: any;
  apyIngredients: any;
}

const EarnDetailHeader = ({ selectVault, vaultInfo, apyIngredients }: Props) => {

  const { openModal } = useContext(ModalContext);

  return (
    <div
      className={twJoin(
        "grid gap-x-[25px] items-center",
        "dt:grid-cols-[auto,200px] dt:px-0 dt:mb-[48px]",
        "mb-[36px] px-[12px]",
      )}
    >
      <div className="flex flex-col">
        <div
          className={twJoin(
            "flex items-center",
            "relative",
            "dt:mb-[8px]",
            "mb-[12px]",
          )}
        >
          <BackIcon
            className={twJoin(
              "dt:absolute dt:top-[50%] dt:transform dt:-translate-y-1/2 dt:left-[-48px]",
              "cursor-pointer",
            )}
            onClick={() => {
              selectVault(null)
            }}
          />
          <div
            className={twJoin(
              "flex items-center justify-between",
              "h-[56px]",
              "w-full",
              "dt:text-[32px] dt:h-auto",
              "text-[24px] font-[700]"
            )}
          >
            <span>{vaultInfo?.title}</span>
            <MobileOnly>
              <div
                className={twJoin(
                  "flex items-center"
                )}
              >
                {DOV_ASSET_INFO[vaultInfo?.stakingToken?.symbol]?.srcList?.map((src, idx) => {
                  return (
                    <img 
                      className={twJoin(
                        "relative",
                        "w-[32px] h-[32px]",
                        idx > 0 && "ml-[0px]",
                      )}
                      src={src} 
                    />
                )})}
              </div>
            </MobileOnly>
          </div>
        </div>
        <p
          className={twJoin(
            "text-[13px] font-[600] text-gray80 leading-[18px]",
            "dt:mb-[24px] dt:text-[14px]",
            "mb-[12px]",
          )}
        >
          Boost returns with auto-compounding and options strategies
        </p>
        <div
          className={twJoin(
            "flex items-center gap-[6px]",
          )}
        >
          {vaultInfo?.tags?.map((name: string) => <VaultTag key={name} className="dt:h-[32px] h-[20px]" name={name} />)}
          <DesktopOnly className="dt:flex gap-[6px]">
            <div
              className={twJoin(
                "bg-transparent",
                "flex items-center",
                "h-[32px] rounded-[3px]",
                "py-[6px] px-[8px]",
                "border border-black29",
              )}
            >
              <span
                className={twJoin(
                  "text-[16px] text-greenE6 font-[600]",
                  "mr-[6px]",
                )}
              >
                Strategy
              </span>
              {vaultInfo.strategy}
            </div>
            <div
              className={twJoin(
                "bg-transparent",
                "flex items-center",
                "h-[32px] rounded-[3px]",
                "py-[6px] px-[8px]",
                "border border-black29",
              )}
            >
              <span
                className={twJoin(
                  "text-[16px] text-greenE6 font-[600]",
                  "mr-[6px]",
                )}
              >
                TVL
              </span>
              {advancedFormatNumber(BigNumber(vaultInfo?.tvl).toNumber(), 0, "$")}
            </div>
          </DesktopOnly>
        </div>

        <MobileOnly>
          <div
            className={twJoin(
              "flex items-center gap-[12px]",
              "mt-[24px]",
            )}
          >
            <Column 
              className="flex-1" 
              title="Strategy" 
              value={vaultInfo.strategy} 
              valueClassName={twJoin(
                "dt:font-graphie",
                "font-plex-mono",
              )}
            />
            <Column 
              className="flex-1" 
              title="Total Value Locked" 
              value={advancedFormatNumber(BigNumber(vaultInfo?.tvl).toNumber(), 0, "$")} 
              valueClassName={twJoin(
                "dt:font-graphie",
                "font-plex-mono",
              )}
            />
          </div>
          <div 
            className={twJoin(
              "flex items-center justify-between",
              "mt-[16px]",
            )}
          >
            <Column 
              title="Total Projected Yield(APY)" 
              value={<APY 
                  valueClassName={twJoin(
                    "text-[15px]",
                    "dt:font-graphie",
                    "font-plex-mono",
                  )}
                  apyIngredients={apyIngredients} 
                />}
            />
            <Button 
              name="Learn More" 
              color="orangef793" 
              className={twJoin(
                "w-[124px] h-[42px]",
              )}
              onClick={() => {
                openModal(
                  <LearnMoreModal
                    apyIngredients={apyIngredients}
                    vaultInfo={vaultInfo}
                  />,
                  {
                    modalClassName: [
                      "backdrop-blur-none",
                      "p-0",
                    ],
                    contentClassName: [
                      "pb-0",
                    ]
                  }
                )
              }} 
            />
          </div>
        </MobileOnly>
      </div>
      <DesktopOnly>
        <EarnBeraImage
          className={twMerge(
            "dt:w-[200px] dt:h-[200px]",
            "relative right-[60px]",
          )}
        />
      </DesktopOnly>
    </div>
  )
}

export default EarnDetailHeader