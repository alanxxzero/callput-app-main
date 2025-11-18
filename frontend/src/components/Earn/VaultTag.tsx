import React from 'react'
import { twMerge, twJoin } from 'tailwind-merge'

import AutofarmChip from '@/assets/chip-autofarm.svg'
import BexChip from '@/assets/chip-bex.svg'
import BerpsChip from '@/assets/chip-berps.svg'
import InfraredChip from '@/assets/chip-infrared.svg'


type Props = {
  name: string;
  className?: string;
}

const chipMap: any = {
  "Autofarm": AutofarmChip,
  "BERAHUB": BexChip,
  "INFRARED": InfraredChip,
  "BERPS": BerpsChip,
}

const VaultTag = ({ name, className }: Props) => {
  return (
    <img
      className={twMerge(
        twJoin(
          "w-auto h-[20px]",
          "dt:h-[23px]"
        ),
        className,
      )}
      src={chipMap[name]}
    />
  )
}

export default VaultTag