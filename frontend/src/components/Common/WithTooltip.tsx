import { useSubscription } from 'observable-hooks';
import React, { ReactNode, useEffect, useRef, useState } from 'react';
import { debounceTime, fromEvent, startWith } from 'rxjs';
import { twJoin, twMerge } from 'tailwind-merge';

interface Props {
  tooltipContent: ReactNode;
  children: ReactNode;
  className?: string;
  tooltipClassName?: string;
}

const WithTooltip = ({
  tooltipContent,
  children,
  className,
  tooltipClassName
}: Props) => {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<'left' | 'right'>('left');

  useSubscription(
    fromEvent(window, 'resize').pipe(
      startWith(null),
      debounceTime(100)
    ),
    () => {
      if (!tooltipRef.current || !containerRef.current) return;

      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const containerRect = containerRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;

      if (containerRect.left + tooltipRect.width > viewportWidth) {
        setPosition('right')
      } else {
        setPosition('left')
      }
    }
  );

  return (
    <div className={twMerge("relative group flex cursor-help", className)} ref={containerRef}>
      {children}
      <div
        ref={tooltipRef}
        className={twMerge(
          twJoin(
            "absolute invisible opacity-0 group-hover:visible group-hover:opacity-100",
            "transition-all duration-200",
            "z-50 bottom-full mb-2",
            position === 'right' ? "right-0" : "left-0",
            "bg-black1f",
            "px-[12px] py-[10px] rounded-[4px]",
            "text-grayb3 text-[12px] font-[600] whitespace-pre-line",
            "shadow-[0px_0px_8px_0px_rgba(10,10,10,0.72)] border border-solid border-[#F5F5F51A]",
          ),
          tooltipClassName,
        )}
      >
        {tooltipContent}
      </div>
    </div>
  );
};

export default WithTooltip;