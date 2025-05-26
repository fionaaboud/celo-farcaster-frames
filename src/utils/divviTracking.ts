import { encodeFunctionData, parseAbi } from 'viem';

// Divvi tracking utilities
export interface DivviTrackingData {
  action: 'group_created' | 'expense_added' | 'payment_made' | 'wallet_connected';
  userAddress: string;
  builderAddress: string;
  metadata?: {
    groupId?: string;
    expenseId?: string;
    amount?: string;
    currency?: string;
    memberCount?: number;
    splitType?: 'equal' | 'custom';
  };
}

// Create referral metadata for transactions
export const createReferralMetadata = (builderAddress: string): `0x${string}` => {
  try {
    return encodeFunctionData({
      abi: parseAbi(['function netsplitReferral(address builder) external']),
      functionName: 'netsplitReferral',
      args: [builderAddress as `0x${string}`],
    });
  } catch (error) {
    console.error('Error creating referral metadata:', error);
    return '0x';
  }
};

// Enhance transaction data with Divvi referral metadata
export const enhanceTransactionWithDivvi = (
  originalData: `0x${string}`,
  builderAddress: string
): `0x${string}` => {
  if (!builderAddress) return originalData;
  
  const referralMetadata = createReferralMetadata(builderAddress);
  if (referralMetadata === '0x') return originalData;
  
  // Append referral metadata to original transaction data
  return `${originalData}${referralMetadata.slice(2)}` as `0x${string}`;
};

// Log user action for Divvi analytics
export const logDivviAction = (data: DivviTrackingData) => {
  const logEntry = {
    ...data,
    timestamp: new Date().toISOString(),
    source: 'netsplit-frame',
    version: '1.0.0',
  };
  
  // Log to console for development
  console.log('Divvi Action Tracked:', logEntry);
  
  // In production, you might want to send this to an analytics service
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'divvi_action', {
      action: data.action,
      user_address: data.userAddress,
      builder_address: data.builderAddress,
      custom_parameters: data.metadata,
    });
  }
};

// Convert string to bytes32 for Solidity
export const stringToBytes32 = (str: string): `0x${string}` => {
  const hex = Buffer.from(str.slice(0, 32), 'utf8').toString('hex');
  return `0x${hex.padEnd(64, '0')}` as `0x${string}`;
};

// Common campaign IDs (you'll get these from Divvi onboarding)
export const DIVVI_CAMPAIGNS = {
  // Example campaign IDs - replace with actual ones from your Divvi onboarding
  CELO_DEFI: stringToBytes32('celo-defi'),
  VALORA_ECOSYSTEM: stringToBytes32('valora-ecosystem'),
  NETSPLIT_REFERRALS: stringToBytes32('netsplit-referrals'),
} as const;

// Divvi Registry contract details
export const DIVVI_REGISTRY = {
  ADDRESS: '0xEdb51A8C390fC84B1c2a40e0AE9C9882Fa7b7277' as `0x${string}`,
  CHAIN_ID: 10, // Optimism
  ABI: [
    'function registerReferral(address user, bytes32 providerId, bytes32 consumerId, bytes32 transactionHash) external',
    'function isUserReferredToProvider(address user, bytes32 providerId) external view returns (bool)',
    'function getReferringConsumer(address user, bytes32 providerId) external view returns (address)',
  ] as const,
} as const;

export default {
  createReferralMetadata,
  enhanceTransactionWithDivvi,
  logDivviAction,
  stringToBytes32,
  DIVVI_CAMPAIGNS,
  DIVVI_REGISTRY,
};
