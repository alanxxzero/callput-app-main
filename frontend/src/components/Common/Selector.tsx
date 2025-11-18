import React from 'react'
import { twJoin, twMerge } from 'tailwind-merge'

type Props = {
  items: any[],
  className?: string
}

const Selector: React.FC<Props> = ({ items, className }) => {
  return (
    <div
      className={twMerge(
        twJoin(
          "flex items-center gap-[8px]",
          "w-[180px] h-[34px] p-[4px]",
          "bg-black17",
          "rounded-[17px]",
        ),
        className,
      )}
    >
      {items.map(({ value, onClick, isActive }) => {
        return (
          <div
            key={value}
            className={twJoin(
              "flex flex-1 h-[26px] justify-center items-center",
              "text-center cursor-pointer",
              "text-[12px] font-[600] leading-[14px]",
              isActive && [
                "text-greene6",
                "bg-black29",
                "rounded-[16px]",
              ],
            )}
            onClick={onClick}
          >
            {value}
          </div>
        )
      })}
    </div>
  )
}

export default Selector