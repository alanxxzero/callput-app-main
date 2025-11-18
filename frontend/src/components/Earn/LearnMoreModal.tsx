import React, { useState, useRef } from 'react';
import { twJoin } from 'tailwind-merge';
import RewardsComponent from './rewards/RewardsComponent';
import ArchitectureItem from './VaultInfo/ArchitectureItem';
import Button from '../Common/Button';
import RisksSection from './VaultInfo/RisksSection';
import OptionsStrategy from './VaultInfo/OptionsStrategy';

type Props = {
  className?: string;
  apyIngredients: any[];
  vaultInfo: any;
}

const LearnMoreModal: React.FC<Props> = ({ 
  apyIngredients,
  className,
  vaultInfo,
}) => {
  const [activeTab, setActiveTab] = useState('Rewards');
  const scrollRef = useRef<HTMLDivElement>(null);

  const optionsApy = apyIngredients?.find((cur: any) => cur.key === "MOBY")?.apy || 0
  
  const tabs = [
    'Rewards',
    'Vaults Architecture',
    'Options Strategy',
    'Risks'
  ];

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);

    if (scrollRef.current) {
      const tabElements = scrollRef.current.querySelectorAll('button');
      const tabIndex = tabs.indexOf(tab);
      
      if (tabElements[tabIndex]) {
        const tabElement = tabElements[tabIndex];
        const container = scrollRef.current;
        const containerWidth = container.offsetWidth;
        
        // Calculate the scroll position to center the tab in the container
        const scrollLeft = tabElement.offsetLeft - (containerWidth / 2) + (tabElement.offsetWidth / 2);
        
        // Smooth scroll to the calculated position
        container.scrollTo({
          left: scrollLeft,
          behavior: 'smooth'
        });
      }
    }
  };

  return (
    <div className={twJoin("bg-black text-white rounded-[16px] px-[28px]", className)}>
      {/* Tabs Navigation */}
      <div className="relative mb-[24px]">
        <div 
          ref={scrollRef}
          className="flex overflow-x-auto py-[8px] gap-[24px]"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {tabs.map((tab) => (
            <button
              key={tab}
              className={twJoin(
                "whitespace-nowrap text-[18px] font-bold transition-colors duration-200 min-w-max border-0 bg-transparent cursor-pointer px-0 py-[4px]",
                activeTab === tab ? "text-white" : "text-[#888888] hover:text-[#AAAAAA]"
              )}
              onClick={() => handleTabClick(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        <div
          className={twJoin(
            "mt-[24px]",
            "max-h-[480px]",
            "dt:max-h-[600px] overflow-y-auto",
          )}
        >
          {activeTab == "Rewards" && <RewardsComponent apyIngredients={apyIngredients} />}
          {activeTab == "Vaults Architecture" && (
            <>
              <p
                className={twJoin(
                  "text-[13px] font-[500] text-grayb3 leading-[18px] mb-[24px]"
                )}
              >
                Assets deposited in Vault are automatically compounded on BeraHub and Infrared. A small portion of the assets is allocated to execute options strategies within Moby.
              </p>
              <ArchitectureItem 
                title="Asset Allocation"
                imgSrc={vaultInfo.allocationImgSrc}
              />
              <ArchitectureItem 
                title="Architecture"
                imgSrc={vaultInfo.architectureImgSrc}
              />
              <Button
                name="Learn More"
                color=""
                className={twJoin(
                  "mt-[24px]",
                  "h-[40px]",
                  "text-gray80 border border-gray80",
                )}
                onClick={() => {
                  window.open("https://docs.moby.trade/how-its-built/defi-options-vault/berachain-defi-options-vault/architecture", "_blank")
                }}
              />
            </>
          )}
          {activeTab == "Options Strategy" && (
            <OptionsStrategy
              strategy={vaultInfo.strategy}
              underlying={vaultInfo.underlying}
              apy={optionsApy}
            />
          )}
          {activeTab == "Risks" && <RisksSection />}
        </div>

        {/* Active indicator line */}
        {/* <div className="mt-[8px] h-[4px] bg-[#2A2A2A] rounded-[4px] relative">
          <div 
            className="h-[4px] bg-[#4CAF50] rounded-[4px] absolute transition-all duration-300 ease-in-out"
            style={{
              width: `${100 / tabs.length}%`,
              left: `${tabs.indexOf(activeTab) * (100 / tabs.length)}%`
            }}
          />
        </div> */}
      </div>
    </div>
  );
};

export default LearnMoreModal;