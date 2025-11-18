import React from 'react'
import { twJoin, twMerge } from 'tailwind-merge'

type AssetAllocation = {
  title: string;
  ratio: number;
}

type Props = {
  assetAllocations: AssetAllocation[];
}

const AssetAllocation = ({ assetAllocations }: Props) => {

  return (
    <div className="w-full">
      <div className="flex h-[4px] mb-[10px]">
        {assetAllocations.map(({ title, ratio }, index) => {
          const isFirst = index === 0
          return (
            <div
              key={title}
              className={twMerge(
                "h-full",
                isFirst ? "bg-[#DA5D19]" : "bg-greene6"
              )}
              style={{ width: `${ratio}%` }}
            />
          )
        })}
      </div>

      <div
        className={twJoin(
          "flex justify-between text-grayb3 text-[13px] font-[600]",
          "dt:text-[15px]"
        )}
      >
        {assetAllocations.map(({ title, ratio }) => (
          <div 
            key={title}
            className={twJoin(
              "dt:font-graphie",
              "font-plex-mono",
            )}
          >
            {title} <span className="text-white">{ratio}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default AssetAllocation