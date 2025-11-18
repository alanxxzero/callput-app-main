import React from 'react'
import { twJoin, twMerge } from 'tailwind-merge'

type Props = {
  title: string;
  value: React.ReactNode;
  className?: string;
  valueClassName?: string;
}

const Column: React.FC<Props> = ({ title, value, className, valueClassName }) => {
  return (
    <div 
      className={
        twMerge(
          twJoin(
            "flex flex-col",
            "gap-[4px]",
          ),
          className
        )
      }
    >
      <p
        className={twJoin(
          "text-[12px] font-[600] text-gray80"
        )}
      >
        {title}
      </p>
      <div
        className={twMerge(
          twJoin(
            "text-[15px] font-[600] leading-[22px] text-whitef5"
          ),
          valueClassName
        )}
      >
        {value}
      </div>
    </div>
  )
}

export default Column