'use client';

import React from 'react';
import { useAccount } from 'wagmi';
import { useDivviContext } from '@/components/providers/DivviProvider';
import { useDivvi } from '@/hooks/useDivvi';
import { logDivviAction } from '@/utils/divviTracking';

export const DivviTestPanel: React.FC = () => {
  const { address, isConnected } = useAccount();
  const { config: divviConfig, isEnabled: isDivviEnabled } = useDivviContext();
  const { isConfigured: isDivviConfigured, trackUserAction } = useDivvi(divviConfig);

  const testDivviAction = (action: 'wallet_connected' | 'group_created' | 'expense_added' | 'payment_made') => {
    if (!address) {
      alert('Please connect your wallet first');
      return;
    }

    logDivviAction({
      action,
      userAddress: address,
      builderAddress: divviConfig?.builderAddress || '',
      metadata: {
        test: true,
        timestamp: new Date().toISOString(),
        action_details: `Test ${action} action`,
      },
    });

    alert(`✅ Divvi action "${action}" logged successfully! Check console for details.`);
  };

  const testTrackUserAction = async () => {
    if (!address) {
      alert('Please connect your wallet first');
      return;
    }

    try {
      await trackUserAction('group_created', address, undefined, {
        test: true,
        groupId: 'test_group_123',
        memberCount: 3,
      });
      alert('✅ Divvi trackUserAction completed! Check console for details.');
    } catch (error) {
      console.error('Divvi trackUserAction error:', error);
      alert('❌ Divvi trackUserAction failed. Check console for details.');
    }
  };

  if (!isDivviEnabled) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">🔧 Divvi Test Panel</h3>
        <p className="text-yellow-700 text-sm">
          Divvi integration is <strong>disabled</strong>. Set <code>NEXT_PUBLIC_DIVVI_ENABLED=true</code> in your environment to enable.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
      <h3 className="text-lg font-semibold text-blue-800 mb-3">🎯 Divvi Integration Test Panel</h3>
      
      <div className="space-y-3">
        {/* Configuration Status */}
        <div className="bg-white rounded p-3 border">
          <h4 className="font-medium text-gray-800 mb-2">Configuration Status</h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Divvi Enabled:</span>
              <span className={isDivviEnabled ? 'text-green-600 font-medium' : 'text-red-600'}>
                {isDivviEnabled ? '✅ Yes' : '❌ No'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Divvi Configured:</span>
              <span className={isDivviConfigured ? 'text-green-600 font-medium' : 'text-red-600'}>
                {isDivviConfigured ? '✅ Yes' : '❌ No'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Builder Address:</span>
              <span className="text-gray-800 font-mono text-xs">
                {divviConfig?.builderAddress ? 
                  `${divviConfig.builderAddress.slice(0, 6)}...${divviConfig.builderAddress.slice(-4)}` : 
                  'Not set'
                }
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Campaign Count:</span>
              <span className="text-gray-800 font-medium">
                {divviConfig?.campaignIds?.length || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Wallet Connected:</span>
              <span className={isConnected ? 'text-green-600 font-medium' : 'text-gray-500'}>
                {isConnected ? '✅ Yes' : '❌ No'}
              </span>
            </div>
          </div>
        </div>

        {/* Test Actions */}
        <div className="bg-white rounded p-3 border">
          <h4 className="font-medium text-gray-800 mb-2">Test Actions</h4>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => testDivviAction('wallet_connected')}
              className="px-3 py-2 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
              disabled={!isConnected}
            >
              Test Wallet Connect
            </button>
            <button
              onClick={() => testDivviAction('group_created')}
              className="px-3 py-2 bg-green-500 text-white rounded text-sm hover:bg-green-600"
              disabled={!isConnected}
            >
              Test Group Created
            </button>
            <button
              onClick={() => testDivviAction('expense_added')}
              className="px-3 py-2 bg-orange-500 text-white rounded text-sm hover:bg-orange-600"
              disabled={!isConnected}
            >
              Test Expense Added
            </button>
            <button
              onClick={() => testDivviAction('payment_made')}
              className="px-3 py-2 bg-purple-500 text-white rounded text-sm hover:bg-purple-600"
              disabled={!isConnected}
            >
              Test Payment Made
            </button>
          </div>
        </div>

        {/* Advanced Test */}
        <div className="bg-white rounded p-3 border">
          <h4 className="font-medium text-gray-800 mb-2">Advanced Test</h4>
          <button
            onClick={testTrackUserAction}
            className="w-full px-3 py-2 bg-indigo-500 text-white rounded text-sm hover:bg-indigo-600"
            disabled={!isConnected || !isDivviConfigured}
          >
            Test trackUserAction Hook
          </button>
        </div>

        {/* Instructions */}
        <div className="bg-gray-50 rounded p-3 border text-xs text-gray-600">
          <p><strong>Instructions:</strong></p>
          <ol className="list-decimal list-inside space-y-1 mt-1">
            <li>Connect your wallet using the ConnectButton above</li>
            <li>Click any test button to trigger a Divvi action</li>
            <li>Open browser console (F12) to see logged actions</li>
            <li>Check that all configuration values are correct</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default DivviTestPanel;
