'use client';

import React, { createContext, useContext, ReactNode } from 'react';

interface DivviConfig {
  builderAddress: string;
  campaignIds: string[];
  enabled: boolean;
}

interface DivviContextType {
  config: DivviConfig | null;
  isEnabled: boolean;
}

const DivviContext = createContext<DivviContextType>({
  config: null,
  isEnabled: false,
});

interface DivviProviderProps {
  children: ReactNode;
  builderAddress?: string;
  campaignIds?: string[];
  enabled?: boolean;
}

export const DivviProvider: React.FC<DivviProviderProps> = ({
  children,
  builderAddress = process.env.NEXT_PUBLIC_DIVVI_BUILDER_ADDRESS || '',
  campaignIds = process.env.NEXT_PUBLIC_DIVVI_CAMPAIGN_IDS?.split(',') || [],
  enabled = process.env.NEXT_PUBLIC_DIVVI_ENABLED === 'true',
}) => {
  const config: DivviConfig | null = builderAddress && campaignIds.length > 0 ? {
    builderAddress,
    campaignIds,
    enabled,
  } : null;

  const value: DivviContextType = {
    config,
    isEnabled: enabled && !!config,
  };

  return (
    <DivviContext.Provider value={value}>
      {children}
    </DivviContext.Provider>
  );
};

export const useDivviContext = () => {
  const context = useContext(DivviContext);
  if (!context) {
    throw new Error('useDivviContext must be used within a DivviProvider');
  }
  return context;
};

export default DivviProvider;
