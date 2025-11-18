import Leaderboard from '@/components/Rewards/Leaderboard';
import Banner from '@/components/Rewards/Banner';
import PNR from '@/components/Rewards/PNR';
import { useEffect, useState } from 'react';
import { twJoin } from 'tailwind-merge';
import { useAccount } from 'wagmi';;
import { LEADERBOARD_API, USER_POINT_INFO_API } from '@/networks/apis';
import { NetworkState } from '@/networks/types';
import { useAppSelector } from '@/store/hooks';

interface RewardsProps {
  announcementsLen: number;
}

function Rewards({ announcementsLen }: RewardsProps) {
  const { address } = useAccount()
  const { chain, isBerachain } = useAppSelector(state => state.network) as NetworkState;

  const [userPointInfo, setUserPointInfo] = useState(null)
  const [leaderboard, setLeaderboard] = useState(null)

  useEffect(() => {
    fetch(LEADERBOARD_API[chain])
      .then((res) => res.json())
      .then((data) => {
        setLeaderboard(data)
      })
  }, [chain])

  useEffect(() => {
    if (!address) {
      setUserPointInfo(null)
      return
    }

    fetch(USER_POINT_INFO_API[chain] + address)
      .then((res) => res.json())
      .then((data) => {
        setUserPointInfo(data)
      })

  }, [address, chain])

  const [topPadding, setTopPadding] = useState(0);

  useEffect(() => {
    setTopPadding(announcementsLen * 46 + 46);
  }, [announcementsLen]);

  return (
    <div
      style={{ paddingTop: `${topPadding}px` }}
      className={twJoin(
        "relative",
        "pb-[72px] w-full h-full",
        'flex flex-row justify-center items-center',
        isBerachain
          ? "bg-black bg-opacity-70 bg-cover bg-center bg-no-repeat bg-[url('@assets/bg-bera-main.png')]"
          : ""
      )}
    > 
      {/* {isBerachain && (
        <div className={twJoin(
          'absolute top-0 w-full h-full bg-black bg-opacity-80 z-20',
          "flex flex-row justify-center items-start pt-[380px]"
        )}>
            <div className={twJoin(
              'flex flex-row justify-between items-center px-[32px] py-[36px]',
              'w-[615px] h-[172px] rounded-[10px] bg-black1f border-[1px] border-solid border-[rgba(255,198,113,0.40)]'
            )}>
              <div className='flex flex-col gap-[20px] w-[379px]'>
                  <p className='text-[14px] font-semibold leading-[1.2rem]'>The Moby Point System is now live on Berachain.</p>
                  <p className='text-[14px] font-semibold leading-[1.2rem]'>Rewards page will be launched Thoon, and all interactions with Moby will be accurately tracked from the very start of the mainnet.</p>
                  <div
                    className='cursor-pointer flex flex-row gap-[12px]'
                    onClick={() => (
                      navigate("/trading")
                    )}
                  >
                    <div className='flex flex-row justify-center items-center w-[26px] h-[26px] rounded-full border-[1px] border-[#F7931A]'>
                      <img className='w-[18px]' src={IconArrowLeftOrange} />
                    </div>
                    <p className='text-[16px] text-[#F7931A] font-semibold'>Interact with Moby to earn exceptional rewards</p>
                  </div>
              </div>
              <img className='w-[128px]' src={IconRewardComingSoon} />
            </div>
        </div>
      )} */}
      <div 
        className={twJoin(
          "flex flex-col gap-[28px]",
          "w-[1280px] max-w-[1280px] min-w-[1280px] min-h-screen pt-[66px]"
        )}
      >
        <div
          className={twJoin(
            "grid grid-cols-[776px,480px] gap-[16px]",
          )}
        >
          <div
            className={twJoin(
              "flex flex-col",
            )}
          >
            <Banner />
            <PNR userPointInfo={userPointInfo} />
          </div>
          <Leaderboard userPointInfo={userPointInfo} leaderboard={leaderboard} />
        </div>
      </div>
    </div>
  )
}

export default Rewards;