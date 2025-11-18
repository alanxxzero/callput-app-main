import React from 'react'
import { twMerge, twJoin } from 'tailwind-merge'
import VaultTag from './VaultTag';
import WithTooltip from '../Common/WithTooltip';

type Props = {
  title: string;
  tags: string[];
  images: React.ReactNode[];
  hasStaking?: boolean;
}

const VaultHeader = ({ title, tags, images, hasStaking }: Props) => {

  return (

    <div
      className={twJoin(
        "flex justify-between items-start",
        "mb-[40px]",
        "dt:items-center dt:mb-[28px]",
      )}
    >
      <div>
        <div
          className={twJoin(
            "flex items-start",
            "text-[20px] font-[700]",
            "mb-[6px]",
            "dt:text-[24px] dt:mb-[4px]"
          )}
        >
          {title}
          {hasStaking && (
            <WithTooltip
              tooltipClassName="w-[130px]"
              tooltipContent="Provided Liquidity"
            >
              <div
                className={twJoin(
                  "relative",
                  "left-[4px] top-[4px]",
                  "bg-[#F74143]",
                  "w-[8px] h-[8px] rounded",
                )}
              />
            </WithTooltip>
          )}
        </div>
        <div
          className={twJoin(
            "flex items-center gap-[4px]",
          )}
        >
          {tags.map((name) => <VaultTag key={name} name={name} />)}
        </div>
      </div>
      <div
        className={twJoin(
          "flex items-center",
        )}
      >
        {images.map((image, idx) => (
          <div key={idx}>  
            {image}
          </div>
        ))}
      </div>
    </div>

  )
}

export default VaultHeader