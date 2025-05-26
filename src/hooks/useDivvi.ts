import { useAccount, usePublicClient, useWalletClient } from 'wagmi';
import { useState, useCallback } from 'react';
import { encodeFunctionData, parseAbi } from 'viem';

// Divvi Registry Contract on Optimism
const DIVVI_REGISTRY_ADDRESS = '0xEdb51A8C390fC84B1c2a40e0AE9C9882Fa7b7277';
const DIVVI_REGISTRY_ABI = parseAbi([
  'function registerReferral(address user, bytes32 providerId, bytes32 consumerId, bytes32 transactionHash) external',
  'function isUserReferredToProvider(address user, bytes32 providerId) external view returns (bool)',
  'function getReferringConsumer(address user, bytes32 providerId) external view returns (address)',
]);

// Your Netsplit app identifier (you'll get this from Divvi onboarding)
const NETSPLIT_CONSUMER_ID = '0x6e657473706c69740000000000000000000000000000000000000000000000'; // "netsplit" in bytes32

interface DivviConfig {
  builderAddress: string; // Your registered builder address
  campaignIds: string[]; // Campaign IDs you've joined
}

export const useDivvi = (config?: DivviConfig) => {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const [isRegistering, setIsRegistering] = useState(false);

  // Check if user is already referred to a campaign
  const checkReferralStatus = useCallback(async (userAddress: string, campaignId: string) => {
    if (!publicClient) return false;
    
    try {
      const isReferred = await publicClient.readContract({
        address: DIVVI_REGISTRY_ADDRESS,
        abi: DIVVI_REGISTRY_ABI,
        functionName: 'isUserReferredToProvider',
        args: [userAddress as `0x${string}`, campaignId as `0x${string}`],
      });
      
      return isReferred;
    } catch (error) {
      console.error('Error checking referral status:', error);
      return false;
    }
  }, [publicClient]);

  // Get referring builder for a user
  const getReferringBuilder = useCallback(async (userAddress: string, campaignId: string) => {
    if (!publicClient) return null;
    
    try {
      const referrer = await publicClient.readContract({
        address: DIVVI_REGISTRY_ADDRESS,
        abi: DIVVI_REGISTRY_ABI,
        functionName: 'getReferringConsumer',
        args: [userAddress as `0x${string}`, campaignId as `0x${string}`],
      });
      
      return referrer === '0x0000000000000000000000000000000000000000' ? null : referrer;
    } catch (error) {
      console.error('Error getting referring builder:', error);
      return null;
    }
  }, [publicClient]);

  // Register a referral after a transaction
  const registerReferral = useCallback(async (
    userAddress: string,
    campaignId: string,
    transactionHash: string
  ) => {
    if (!walletClient || !config?.builderAddress) {
      throw new Error('Wallet client or builder address not available');
    }

    setIsRegistering(true);
    
    try {
      // First check if user is already referred
      const isAlreadyReferred = await checkReferralStatus(userAddress, campaignId);
      if (isAlreadyReferred) {
        console.log('User already referred to this campaign');
        return null;
      }

      // Register the referral
      const hash = await walletClient.writeContract({
        address: DIVVI_REGISTRY_ADDRESS,
        abi: DIVVI_REGISTRY_ABI,
        functionName: 'registerReferral',
        args: [
          userAddress as `0x${string}`,
          campaignId as `0x${string}`,
          NETSPLIT_CONSUMER_ID,
          transactionHash as `0x${string}`,
        ],
      });

      return hash;
    } catch (error) {
      console.error('Error registering referral:', error);
      throw error;
    } finally {
      setIsRegistering(false);
    }
  }, [walletClient, config?.builderAddress, checkReferralStatus]);

  // Add referral metadata to transaction data
  const addReferralMetadata = useCallback((originalData: `0x${string}`) => {
    if (!config?.builderAddress) return originalData;

    // Append Netsplit referral identifier to transaction data
    const referralMetadata = encodeFunctionData({
      abi: parseAbi(['function netsplitReferral(address builder) external']),
      functionName: 'netsplitReferral',
      args: [config.builderAddress as `0x${string}`],
    });

    // Combine original data with referral metadata
    return `${originalData}${referralMetadata.slice(2)}` as `0x${string}`;
  }, [config?.builderAddress]);

  // Track user action for Divvi
  const trackUserAction = useCallback(async (
    action: 'group_created' | 'expense_added' | 'payment_made',
    userAddress: string,
    transactionHash?: string,
    metadata?: Record<string, any>
  ) => {
    if (!config?.campaignIds || config.campaignIds.length === 0) return;

    try {
      // Log the action for analytics
      console.log('Divvi: Tracking user action', {
        action,
        userAddress,
        transactionHash,
        metadata,
        timestamp: new Date().toISOString(),
      });

      // If there's a transaction hash, register referral for relevant campaigns
      if (transactionHash) {
        for (const campaignId of config.campaignIds) {
          try {
            await registerReferral(userAddress, campaignId, transactionHash);
          } catch (error) {
            console.error(`Failed to register referral for campaign ${campaignId}:`, error);
          }
        }
      }
    } catch (error) {
      console.error('Error tracking user action:', error);
    }
  }, [config?.campaignIds, registerReferral]);

  return {
    // State
    isRegistering,
    
    // Functions
    checkReferralStatus,
    getReferringBuilder,
    registerReferral,
    addReferralMetadata,
    trackUserAction,
    
    // Utils
    isConfigured: !!config?.builderAddress && !!config?.campaignIds?.length,
  };
};

export default useDivvi;
