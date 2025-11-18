import { useEffect, useState } from 'react';
import { usePublicClient } from 'wagmi';
import { useAppSelector } from '@/store/hooks';
import { CONTRACT_ADDRESSES } from '@/networks/addresses';
import { SupportedChains } from '@/networks/constants';
import { OlpKey } from '@/utils/enums';
import PositionValueFeedAbi from '../../../shared/abis/PositionValueFeed.json';

interface OlpOperationsStatus {
  isInProgress: boolean;
  canOperate: boolean;
}

const OLP_KEY_TO_VAULT: Record<OlpKey, 'S_VAULT' | 'M_VAULT' | 'L_VAULT'> = {
  [OlpKey.sOlp]: 'S_VAULT',
  [OlpKey.mOlp]: 'M_VAULT',
  [OlpKey.lOlp]: 'L_VAULT',
};

export const useOlpOperationsStatus = (olpKey: OlpKey): OlpOperationsStatus => {
  const { chain } = useAppSelector(state => state.network);
  const publicClient = usePublicClient();
  
  const [isInProgress, setIsInProgress] = useState(false);
  const [canOperate, setCanOperate] = useState(true);

  useEffect(() => {
    if (!publicClient || !chain) return;

    const checkOperationStatus = async () => {
      try {
        const chainAddresses = CONTRACT_ADDRESSES[chain as SupportedChains];
        const vaultKey = OLP_KEY_TO_VAULT[olpKey];
        const vaultAddress = chainAddresses[vaultKey];
        
        // Try to call getPVAndSign - if it reverts with "position state mismatch", 
        // it means positions are being processed
        try {
          await publicClient.readContract({
            address: chainAddresses.POSITION_VALUE_FEED as `0x${string}`,
            abi: PositionValueFeedAbi,
            functionName: 'getPVAndSign',
            args: [vaultAddress],
          });
          
          // If the call succeeds, operations are available
          setIsInProgress(false);
          setCanOperate(true);
        } catch (error: any) {
          // Check if the error is due to position state mismatch
          const errorMessage = error?.message || '';
          
          if (errorMessage.includes('position state mismatch')) {
            // Positions are being processed
            setIsInProgress(true);
            setCanOperate(false);
          } else if (errorMessage.includes('pv is not being updated')) {
            // PV feed is stale - operations should be disabled
            setIsInProgress(false);
            setCanOperate(false);
          } else {
            // Other error - assume operations are available
            setIsInProgress(false);
            setCanOperate(true);
          }
        }
      } catch (error) {
        console.error('Error checking OLP operation status:', error);
        // On error, assume operations are available
        setIsInProgress(false);
        setCanOperate(true);
      }
    };

    // Check immediately
    checkOperationStatus();

    // Set up interval to check every 5 seconds
    const interval = setInterval(checkOperationStatus, 5000);

    return () => clearInterval(interval);
  }, [publicClient, chain, olpKey]);

  return {
    isInProgress,
    canOperate,
  };
};