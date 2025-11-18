import React from 'react'
import { twMerge, twJoin } from 'tailwind-merge'

type Props = {
  title: string,
  imgSrc: string
}

const ArchitectureItem = ({ title, imgSrc }: Props) => {
  return (
    <div
      className={twJoin(
        "flex flex-col",
      )}
    >
      <p
        className={twJoin(
          "text-[16px] font-[600]",
          "mb-[16px]",
        )}
      >
        {title}
      </p>
      <img
        className={twJoin(
          "dt:h-[200px] dt:mb-0",
          "mb-[24px]",
        )}
        src={imgSrc} 
      />
    </div>
  )
}

export default ArchitectureItem