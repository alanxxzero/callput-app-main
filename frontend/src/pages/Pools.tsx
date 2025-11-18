import OLP from '../components/Pools/OLP';
import { twJoin } from 'tailwind-merge';
import { OlpKey } from '@/utils/enums';
import { useEffect, useState } from 'react';

import OLPDetailParts from '@/components/Pools/OLPDetailParts';
import PoolsHeader from '@/components/Pools/PoolsHeader';
import { from } from 'rxjs';
import { OLP_DETAIL_DATA_API } from '@/networks/apis';
import { NetworkState } from '@/networks/types';
import { useAppSelector } from '@/store/hooks';

interface PoolsProps {
  announcementsLen: number;
}

function Pools({ announcementsLen }: PoolsProps) {
  const { chain, isBerachain } = useAppSelector(state => state.network) as NetworkState;
  
  const [topPadding, setTopPadding] = useState(0);

  const [olpDetailData, setOlpDetailData] = useState<any>({})

  useEffect(() => {
    setTopPadding(announcementsLen * 46 + 46);
  }, [announcementsLen]);

  useEffect(() => {
    from(
      fetch(OLP_DETAIL_DATA_API[chain]).then((res) => res.json())
    ).subscribe((olpDetailDeta) => {
      setOlpDetailData(olpDetailDeta)
    })
  }, [chain])
  
  // @desc: When the popup is necessary, uncomment the following code
  // const [isPopupOpen, setIsPopupOpen] = useState(() => {
  //   const hideUntil = localStorage.getItem('moby:poolPopup:hideUntil')
  //   return !hideUntil || parseInt(hideUntil) < new Date().getTime()
  // });
  // const [hide, setHide] = useState(false)

  return (
    <div
      style={{ paddingTop: `${topPadding}px` }}
      className={twJoin(
        'relative',
        "pb-[64px] w-full h-full",
        'flex flex-col justify-center items-center',
        isBerachain
          ? "bg-black bg-opacity-70 bg-cover bg-center bg-no-repeat bg-[url('@assets/bg-bera-main.png')]"
          : ""
      )}
    >
      {/* @desc: When the popup is necessary, uncomment the following code */}
      {/* {selectedNetwork === SupportedChains.ARBITRUM_ONE && isPopupOpen && (
        <div
          className={twJoin(
            'absolute top-0 w-full h-full bg-black bg-opacity-80 z-20',
            "flex flex-row justify-center items-start pt-[380px]"
          )}
          onClick={() => setIsPopupOpen(false)}
        >
            <div
              className={twJoin(
                'flex flex-col px-[24px] pt-[24px] pb-[28px]', 
                'w-[640px] h-[280px] rounded-[3px] bg-black1f border-[1px] border-solid border-[#1F1F1F] shadow-[0px_0px_24px_0_rgba(10,10,10,0.75)]'
              )}
              onClick={(e) => e.stopPropagation()}
            >
              <div className='flex flex-row items-center gap-[10px]'>
                <p className='text-[36px]'>☝️</p> 
                <p className='text-[24px] font-bold'>Announcement for sOLP Holders</p>
              </div>
              <div className='text-[16px] font-normal leading-[1.37rem] mt-[8px]'>
                <p>sOLP and mOLP are in the process of integration.</p>
                <p>sOLP is switching to sell-only mode and will be deactivated after a certain period.</p>
                <p>Please transfer your sOLP assets to mOLP.</p>
                <p>Any fees incurred during this process will be refunded after the integration.</p>
              </div>
              <div className='flex flex-row justify-between items-center w-full h-[40px] mt-[36px]'>
                <Checkbox 
                  onClick={(e) => {
                    if (hide) {
                      // Remove the hideUntil key from localStorage
                      localStorage.removeItem('moby:poolPopup:hideUntil')
                    } else {
                      // Set the hideUntil key in localStorage to 1 day from now
                      localStorage.setItem('moby:poolPopup:hideUntil', (new Date().getTime() + 86400 * 1000).toString())
                    }

                    e.stopPropagation()
                    setHide(!hide)
                  }}
                  isChecked={hide}
                  text="Don't show for today"
                />
                <div
                  className='cursor-pointer flex flex-row justify-center items-center w-[180px] h-full rounded-[4px] bg-greenc1'
                  onClick={() => setIsPopupOpen(false)}
                >
                  <p className='text-[15px] font-bold text-black12'>OK</p>
                </div>
              </div>
            </div>
        </div>
      )} */}
      <div
        className={twJoin(
          "flex flex-col justify-center gap-[64px]",
          "w-[1280px] max-w-[1280px] min-w-[1280px] min-h-screen pt-[80px]"
        )}
      >
        <PoolsHeader olpKey={OlpKey.sOlp} olpDetailData={olpDetailData} />
        <div className={twJoin(
            "grid grid-cols-[400px,1fr] gap-[28px]",
            "w-[1280px] max-w-[1280px] min-w-[1280px] min-h-screen"
          )}
        >
          <OLP olpKey={OlpKey.sOlp} key={OlpKey.sOlp} isDeprecated={false} />
          <OLPDetailParts olpKey={OlpKey.sOlp} olpDetailData={olpDetailData} />
        </div>
      </div>
    </div>
  )
}

export default Pools;