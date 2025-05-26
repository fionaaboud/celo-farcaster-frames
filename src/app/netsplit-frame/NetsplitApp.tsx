"use client";

import { useEffect, useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useBalance, useSendTransaction } from "wagmi";
import sdk, { type Context } from "@farcaster/frame-sdk";
import { parseEther, formatEther } from "viem";
import { celo, celoAlfajores } from "wagmi/chains";
import WalletInfo from "@/components/WalletInfo";
import { useDivviContext } from '@/components/providers/DivviProvider';
import { useDivvi } from '@/hooks/useDivvi';
import { logDivviAction } from '@/utils/divviTracking';

interface GroupMember {
  fid: number;
  username: string;
  display_name?: string;
  pfp_url?: string;
  eth_address: string;
  amount_owed?: number;
}

interface Expense {
  id: string;
  title: string;
  amount: number;
  currency: string;
  paidBy: string;
  splitAmong: string[];
  splitType: 'equal' | 'custom';
  customAmounts?: { [address: string]: number };
  date: Date;
}

interface Group {
  id: string;
  name: string;
  members: GroupMember[];
  expenses: Expense[];
}

export default function NetsplitApp() {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [context, setContext] = useState<Context.FrameContext>();
  const [currentView, setCurrentView] = useState<'home' | 'create-group' | 'group-detail' | 'add-expense' | 'balances'>('home');
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupMembers, setNewGroupMembers] = useState<string[]>([]);
  const [memberInput, setMemberInput] = useState('');
  const [newExpense, setNewExpense] = useState({
    title: '',
    amount: '',
    currency: 'cUSD',
    paidBy: '',
    splitType: 'equal' as 'equal' | 'custom'
  });
  const [customSplitAmounts, setCustomSplitAmounts] = useState<{ [address: string]: string }>({});

  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({
    address,
    chainId: celo.id,
  });

  const { sendTransaction } = useSendTransaction();

  // Divvi integration
  const { config: divviConfig, isEnabled: isDivviEnabled } = useDivviContext();
  const { trackUserAction, isConfigured: isDivviConfigured } = useDivvi(divviConfig);

  useEffect(() => {
    const load = async () => {
      try {
        const context = await sdk.context;
        setContext(context);
        setIsSDKLoaded(true);
        sdk.actions.ready({});
      } catch (error) {
        console.error("Failed to load Farcaster SDK:", error);
        setIsSDKLoaded(true); // Still show the app even if SDK fails
      }
    };

    if (sdk && !isSDKLoaded) {
      load();
    }
  }, [isSDKLoaded]);

  // Track wallet connection for Divvi
  useEffect(() => {
    if (isConnected && address && isDivviEnabled && isDivviConfigured) {
      logDivviAction({
        action: 'wallet_connected',
        userAddress: address,
        builderAddress: divviConfig?.builderAddress || '',
        metadata: {
          timestamp: new Date().toISOString(),
        },
      });
    }
  }, [isConnected, address, isDivviEnabled, isDivviConfigured, divviConfig?.builderAddress]);

  // Helper function to validate if input is a valid Ethereum address
  const isValidAddress = (input: string): boolean => {
    return /^0x[a-fA-F0-9]{40}$/.test(input);
  };

  // Helper function to validate if input looks like a Farcaster username
  const isValidUsername = (input: string): boolean => {
    return /^[a-zA-Z0-9_-]+$/.test(input) && input.length >= 2 && input.length <= 20;
  };

  // Function to add a member to the group
  const addMember = () => {
    if (!memberInput.trim()) return;

    const input = memberInput.trim();

    // Check if it's a valid address or username
    if (isValidAddress(input) || isValidUsername(input)) {
      // Avoid duplicates
      if (!newGroupMembers.includes(input)) {
        setNewGroupMembers([...newGroupMembers, input]);
        setMemberInput('');
      }
    } else {
      alert('Please enter a valid Farcaster username or wallet address');
    }
  };

  // Function to remove a member from the group
  const removeMember = (member: string) => {
    setNewGroupMembers(newGroupMembers.filter(m => m !== member));
  };

  const createGroup = () => {
    if (!newGroupName.trim()) return;

    // Create members array starting with the current user
    const members: GroupMember[] = [];

    // Add current user as the first member
    if (address) {
      members.push({
        fid: context?.user?.fid || 0,
        username: context?.user?.username || 'user',
        display_name: context?.user?.displayName,
        pfp_url: context?.user?.pfpUrl,
        eth_address: address,
      });
    }

    // Add other members from the input
    newGroupMembers.forEach((member, index) => {
      if (isValidAddress(member)) {
        // It's a wallet address
        members.push({
          fid: 0, // Unknown FID for wallet addresses
          username: `wallet_${index}`,
          display_name: `${member.slice(0, 6)}...${member.slice(-4)}`,
          eth_address: member,
        });
      } else {
        // It's a Farcaster username - we'll need to resolve the address later
        // For now, we'll store it as a placeholder
        members.push({
          fid: 0, // Will be resolved later
          username: member,
          display_name: member,
          eth_address: `pending_${member}`, // Placeholder until resolved
        });
      }
    });

    const newGroup: Group = {
      id: Date.now().toString(),
      name: newGroupName,
      members,
      expenses: [],
    };

    setGroups([...groups, newGroup]);
    setNewGroupName('');
    setNewGroupMembers([]);
    setCurrentView('home');

    // Track group creation for Divvi
    if (isDivviEnabled && isDivviConfigured && address) {
      logDivviAction({
        action: 'group_created',
        userAddress: address,
        builderAddress: divviConfig?.builderAddress || '',
        metadata: {
          groupId: newGroup.id,
          memberCount: newGroup.members.length,
          groupName: newGroup.name,
        },
      });
    }
  };

  const addExpense = () => {
    if (!selectedGroup || !newExpense.title || !newExpense.amount) return;

    // Only include members with valid wallet addresses in the split
    const validMembers = selectedGroup.members.filter(m => !m.eth_address.startsWith('pending_'));
    const paidBy = newExpense.paidBy || address || '';

    // Validate custom split amounts if using custom split
    if (newExpense.splitType === 'custom') {
      const totalCustomAmount = Object.values(customSplitAmounts).reduce((sum, amount) => sum + parseFloat(amount || '0'), 0);
      const expenseAmount = parseFloat(newExpense.amount);

      if (Math.abs(totalCustomAmount - expenseAmount) > 0.01) {
        alert(`Custom split amounts (${totalCustomAmount.toFixed(2)}) must equal the total expense amount (${expenseAmount.toFixed(2)})`);
        return;
      }
    }

    // For equal split, everyone in the group (including the payer) should be included in the split
    // The payer will get credited for the full amount, then debited for their share
    const splitAmong = newExpense.splitType === 'equal'
      ? validMembers.map(m => m.eth_address)  // Everyone splits equally
      : Object.keys(customSplitAmounts).filter(addr => customSplitAmounts[addr] && parseFloat(customSplitAmounts[addr]) > 0);

    const expense: Expense = {
      id: Date.now().toString(),
      title: newExpense.title,
      amount: parseFloat(newExpense.amount),
      currency: newExpense.currency,
      paidBy: paidBy,
      splitAmong: splitAmong,
      splitType: newExpense.splitType,
      customAmounts: newExpense.splitType === 'custom' ?
        Object.fromEntries(Object.entries(customSplitAmounts).map(([addr, amount]) => [addr, parseFloat(amount || '0')])) :
        undefined,
      date: new Date(),
    };

    const updatedGroup = {
      ...selectedGroup,
      expenses: [...selectedGroup.expenses, expense],
    };

    setGroups(groups.map(g => g.id === selectedGroup.id ? updatedGroup : g));
    setSelectedGroup(updatedGroup);
    setNewExpense({ title: '', amount: '', currency: 'cUSD', paidBy: '', splitType: 'equal' });
    setCustomSplitAmounts({});
    setCurrentView('group-detail');

    // Track expense addition for Divvi
    if (isDivviEnabled && isDivviConfigured && address) {
      logDivviAction({
        action: 'expense_added',
        userAddress: address,
        builderAddress: divviConfig?.builderAddress || '',
        metadata: {
          groupId: selectedGroup.id,
          expenseId: expense.id,
          amount: expense.amount.toString(),
          currency: expense.currency,
          splitType: expense.splitType,
          memberCount: validMembers.length,
        },
      });
    }
  };

  const calculateBalances = (group: Group) => {
    const balances: { [address: string]: number } = {};

    // Initialize balances only for members with valid addresses
    group.members.forEach(member => {
      if (!member.eth_address.startsWith('pending_')) {
        balances[member.eth_address] = 0;
      }
    });

    // Calculate balances from expenses
    group.expenses.forEach(expense => {
      // Person who paid gets credited (only if they have a valid address)
      if (!expense.paidBy.startsWith('pending_')) {
        balances[expense.paidBy] = (balances[expense.paidBy] || 0) + expense.amount;
      }

      // Calculate how much each person owes based on split type
      if (expense.splitType === 'custom' && expense.customAmounts) {
        // Use custom amounts
        Object.entries(expense.customAmounts).forEach(([address, amount]) => {
          if (!address.startsWith('pending_')) {
            balances[address] = (balances[address] || 0) - amount;
          }
        });
      } else {
        // Equal split among valid members
        const validSplitMembers = expense.splitAmong.filter(addr => !addr.startsWith('pending_'));
        const splitAmount = validSplitMembers.length > 0 ? expense.amount / validSplitMembers.length : 0;

        validSplitMembers.forEach(address => {
          if (!address.startsWith('pending_')) {
            balances[address] = (balances[address] || 0) - splitAmount;
          }
        });
      }
    });

    return balances;
  };

  const payDebt = async (toAddress: string, amount: number) => {
    if (!isConnected || !address) return;

    try {
      const txHash = await sendTransaction({
        to: toAddress as `0x${string}`,
        value: parseEther(amount.toString()),
      });

      // Track payment for Divvi
      if (isDivviEnabled && isDivviConfigured && txHash) {
        logDivviAction({
          action: 'payment_made',
          userAddress: address,
          builderAddress: divviConfig?.builderAddress || '',
          metadata: {
            amount: amount.toString(),
            currency: 'CELO',
            toAddress,
            transactionHash: txHash,
          },
        });

        // Register referral with Divvi if configured
        if (divviConfig?.campaignIds && divviConfig.campaignIds.length > 0) {
          try {
            await trackUserAction('payment_made', address, txHash, {
              amount: amount.toString(),
              currency: 'CELO',
              toAddress,
            });
          } catch (error) {
            console.error('Failed to track payment with Divvi:', error);
          }
        }
      }
    } catch (error) {
      console.error("Payment failed:", error);
    }
  };

  const renderHome = () => (
    <div className="space-y-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Netsplit</h1>
        <p className="text-gray-700 mb-4">Split bills with friends on Celo</p>
        {!isConnected && (
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-3">
              Connect your wallet to start splitting bills
            </p>
            <ConnectButton />
            <WalletInfo />
          </div>
        )}
      </div>

      {isConnected && (
        <>
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold text-gray-800">Connected Wallet</h3>
              <ConnectButton />
            </div>
            <p className="text-sm text-gray-700 mb-2 font-medium">
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </p>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Balance:</span>
              <span className="font-medium text-gray-800">
                {balance ? formatEther(balance.value) : '0'} {balance?.symbol || 'CELO'}
              </span>
            </div>
          </div>

          <button
            onClick={() => setCurrentView('create-group')}
            className="w-full btn-primary"
          >
            Create New Group
          </button>

          <div className="space-y-2">
            <h3 className="font-semibold text-gray-800">Your Groups</h3>
            {groups.length === 0 ? (
              <p className="text-gray-600 text-center py-4">No groups yet. Create one to get started!</p>
            ) : (
              groups.map(group => (
                <div
                  key={group.id}
                  onClick={() => {
                    setSelectedGroup(group);
                    setCurrentView('group-detail');
                  }}
                  className="bg-white rounded-lg p-3 shadow-sm border cursor-pointer hover:bg-gray-50"
                >
                  <h4 className="font-medium text-gray-800">{group.name}</h4>
                  <p className="text-sm text-gray-700">{group.members.length} members • {group.expenses.length} expenses</p>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );

  const renderCreateGroup = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">Create Group</h2>
        <button onClick={() => setCurrentView('home')} className="text-gray-500">✕</button>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2 text-gray-800">Group Name</label>
        <input
          type="text"
          value={newGroupName}
          onChange={(e) => setNewGroupName(e.target.value)}
          className="w-full p-3 border rounded-lg text-gray-800"
          placeholder="Enter group name"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2 text-gray-800">Add Members</label>
        <div className="flex space-x-2">
          <input
            type="text"
            value={memberInput}
            onChange={(e) => setMemberInput(e.target.value)}
            className="flex-1 p-3 border rounded-lg text-gray-800"
            placeholder="Farcaster username or wallet address"
            onKeyPress={(e) => e.key === 'Enter' && addMember()}
          />
          <button
            onClick={addMember}
            className="btn-secondary px-4 py-3"
          >
            Add
          </button>
        </div>
        <p className="text-xs text-gray-600 mt-1">
          Enter @username or 0x... wallet address
        </p>
      </div>

      {newGroupMembers.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-2 text-gray-800">Members to Add:</h4>
          <div className="space-y-2">
            {newGroupMembers.map((member, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-lg">
                <div className="flex items-center space-x-2">
                  <span className="text-sm">
                    {isValidAddress(member) ? '👛' : '👤'}
                  </span>
                  <span className="text-sm text-gray-800 font-medium">
                    {isValidAddress(member)
                      ? `${member.slice(0, 6)}...${member.slice(-4)}`
                      : `@${member}`
                    }
                  </span>
                </div>
                <button
                  onClick={() => removeMember(member)}
                  className="text-red-500 text-sm font-medium"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-blue-50 p-3 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> You'll be added as the group creator. Members added by username will need to connect their wallets to participate in payments.
        </p>
      </div>

      <button
        onClick={createGroup}
        className="w-full btn-primary"
        disabled={!newGroupName.trim()}
      >
        Create Group ({newGroupMembers.length + 1} member{newGroupMembers.length !== 0 ? 's' : ''})
      </button>
    </div>
  );

  const renderGroupDetail = () => {
    if (!selectedGroup) return null;

    const balances = calculateBalances(selectedGroup);

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">{selectedGroup.name}</h2>
          <button onClick={() => setCurrentView('home')} className="text-gray-500">✕</button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setCurrentView('add-expense')}
            className="btn-primary text-sm py-2"
          >
            Add Expense
          </button>
          <button
            onClick={() => setCurrentView('balances')}
            className="btn-secondary text-sm py-2"
          >
            View Balances
          </button>
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold text-gray-800">Group Members ({selectedGroup.members.length})</h3>
          <div className="space-y-1">
            {selectedGroup.members.map((member, index) => (
              <div key={index} className="flex items-center space-x-2 text-sm bg-gray-50 p-2 rounded">
                <span>{member.pfp_url ? '🖼️' : (member.eth_address.startsWith('pending_') ? '👤' : '👛')}</span>
                <span className="flex-1 text-gray-800 font-medium">
                  {member.display_name || member.username}
                  {member.eth_address.startsWith('pending_') && (
                    <span className="text-orange-600 text-xs ml-1 font-normal">(pending wallet)</span>
                  )}
                </span>
                {!member.eth_address.startsWith('pending_') && (
                  <span className="text-xs text-gray-600 font-medium">
                    {member.eth_address.slice(0, 4)}...{member.eth_address.slice(-4)}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold text-gray-800">Recent Expenses</h3>
          {selectedGroup.expenses.length === 0 ? (
            <p className="text-gray-600 text-center py-4">No expenses yet</p>
          ) : (
            selectedGroup.expenses.slice(-5).reverse().map(expense => (
              <div key={expense.id} className="bg-gray-50 rounded-lg p-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-gray-800">{expense.title}</h4>
                    <p className="text-sm text-gray-700">
                      Paid by {expense.paidBy.slice(0, 6)}...{expense.paidBy.slice(-4)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-800">{expense.amount} {expense.currency}</p>
                    <p className="text-xs text-gray-600">
                      {expense.date.toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  const renderAddExpense = () => {
    if (!selectedGroup) return null;

    const validMembers = selectedGroup.members.filter(m => !m.eth_address.startsWith('pending_'));
    const totalCustomAmount = Object.values(customSplitAmounts).reduce((sum, amount) => sum + parseFloat(amount || '0'), 0);
    const expenseAmount = parseFloat(newExpense.amount || '0');

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">Add Expense</h2>
          <button onClick={() => setCurrentView('group-detail')} className="text-gray-500">✕</button>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-gray-800">Expense Title</label>
          <input
            type="text"
            value={newExpense.title}
            onChange={(e) => setNewExpense({...newExpense, title: e.target.value})}
            className="w-full p-3 border rounded-lg text-gray-800"
            placeholder="e.g., Dinner at restaurant"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-gray-800">Amount</label>
          <input
            type="number"
            step="0.01"
            value={newExpense.amount}
            onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
            className="w-full p-3 border rounded-lg text-gray-800"
            placeholder="0.00"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-gray-800">Currency</label>
          <select
            value={newExpense.currency}
            onChange={(e) => setNewExpense({...newExpense, currency: e.target.value})}
            className="w-full p-3 border rounded-lg text-gray-800"
          >
            <option value="cUSD">cUSD</option>
            <option value="cEUR">cEUR</option>
            <option value="cREAL">cREAL</option>
            <option value="CELO">CELO</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-gray-800">Who Paid?</label>
          <select
            value={newExpense.paidBy || address || ''}
            onChange={(e) => setNewExpense({...newExpense, paidBy: e.target.value})}
            className="w-full p-3 border rounded-lg text-gray-800"
          >
            {validMembers.map((member) => (
              <option key={member.eth_address} value={member.eth_address}>
                {member.display_name || member.username}
                {member.eth_address === address && ' (You)'}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-gray-800">Split Type</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setNewExpense({...newExpense, splitType: 'equal'})}
              className={`p-3 rounded-lg border text-sm font-medium ${
                newExpense.splitType === 'equal'
                  ? 'bg-green-500 text-white border-green-500'
                  : 'bg-white text-gray-700 border-gray-300'
              }`}
            >
              Split Equally
            </button>
            <button
              onClick={() => setNewExpense({...newExpense, splitType: 'custom'})}
              className={`p-3 rounded-lg border text-sm font-medium ${
                newExpense.splitType === 'custom'
                  ? 'bg-green-500 text-white border-green-500'
                  : 'bg-white text-gray-700 border-gray-300'
              }`}
            >
              Custom Split
            </button>
          </div>
        </div>

        {newExpense.splitType === 'equal' && (
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Equal Split:</strong> Each member will pay {expenseAmount > 0 ? (expenseAmount / validMembers.length).toFixed(2) : '0.00'} {newExpense.currency}
            </p>
            <div className="mt-2 space-y-1">
              {validMembers.map((member) => (
                <div key={member.eth_address} className="flex justify-between text-sm">
                  <span className="text-gray-700">{member.display_name || member.username}</span>
                  <span className="font-medium text-blue-700">
                    {expenseAmount > 0 ? (expenseAmount / validMembers.length).toFixed(2) : '0.00'} {newExpense.currency}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {newExpense.splitType === 'custom' && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-800">Custom Amounts</h4>
            {validMembers.map((member) => (
              <div key={member.eth_address} className="flex items-center space-x-2">
                <span className="flex-1 text-sm text-gray-700">
                  {member.display_name || member.username}
                </span>
                <input
                  type="number"
                  step="0.01"
                  value={customSplitAmounts[member.eth_address] || ''}
                  onChange={(e) => setCustomSplitAmounts({
                    ...customSplitAmounts,
                    [member.eth_address]: e.target.value
                  })}
                  className="w-20 p-2 border rounded text-sm text-gray-800"
                  placeholder="0.00"
                />
                <span className="text-sm text-gray-600">{newExpense.currency}</span>
              </div>
            ))}
            <div className="bg-yellow-50 p-3 rounded-lg">
              <div className="flex justify-between text-sm">
                <span className="text-gray-700">Total Custom Amount:</span>
                <span className={`font-medium ${Math.abs(totalCustomAmount - expenseAmount) < 0.01 ? 'text-green-600' : 'text-red-600'}`}>
                  {totalCustomAmount.toFixed(2)} {newExpense.currency}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-700">Expense Amount:</span>
                <span className="font-medium text-gray-800">{expenseAmount.toFixed(2)} {newExpense.currency}</span>
              </div>
              {Math.abs(totalCustomAmount - expenseAmount) > 0.01 && (
                <p className="text-xs text-red-600 mt-1">
                  Amounts must equal the total expense amount
                </p>
              )}
            </div>
          </div>
        )}

        <button
          onClick={addExpense}
          className="w-full btn-primary"
          disabled={!newExpense.title || !newExpense.amount ||
            (newExpense.splitType === 'custom' && Math.abs(totalCustomAmount - expenseAmount) > 0.01)}
        >
          Add Expense
        </button>
      </div>
    );
  };

  const renderBalances = () => {
    if (!selectedGroup) return null;

    const balances = calculateBalances(selectedGroup);

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">Balances</h2>
          <button onClick={() => setCurrentView('group-detail')} className="text-gray-500">✕</button>
        </div>

        <div className="space-y-3">
          {selectedGroup.members.map(member => {
            const balance = balances[member.eth_address] || 0;
            const isOwed = balance > 0;
            const owes = balance < 0;

            return (
              <div key={member.eth_address} className="bg-white rounded-lg p-4 border">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium text-gray-800">{member.username}</h4>
                    <p className="text-xs text-gray-600 font-medium">
                      {member.eth_address.slice(0, 6)}...{member.eth_address.slice(-4)}
                    </p>
                  </div>
                  <div className="text-right">
                    {balance === 0 ? (
                      <span className="text-green-600 font-medium">Settled up</span>
                    ) : isOwed ? (
                      <span className="text-green-600 font-medium">
                        +{Math.abs(balance).toFixed(2)} cUSD
                      </span>
                    ) : (
                      <div className="space-y-2">
                        <span className="text-red-600 font-medium">
                          -{Math.abs(balance).toFixed(2)} cUSD
                        </span>
                        {member.eth_address !== address && (
                          <button
                            onClick={() => payDebt(member.eth_address, Math.abs(balance))}
                            className="btn-primary text-xs px-2 py-1"
                          >
                            Pay
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div
      className="frame-container"
      style={{
        paddingTop: context?.client.safeAreaInsets?.top ?? 0,
        paddingBottom: context?.client.safeAreaInsets?.bottom ?? 0,
        paddingLeft: context?.client.safeAreaInsets?.left ?? 0,
        paddingRight: context?.client.safeAreaInsets?.right ?? 0,
      }}
    >
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md mx-auto">
          <div className="card rounded-xl shadow-lg p-6">
            {currentView === 'home' && renderHome()}
            {currentView === 'create-group' && renderCreateGroup()}
            {currentView === 'group-detail' && renderGroupDetail()}
            {currentView === 'add-expense' && renderAddExpense()}
            {currentView === 'balances' && renderBalances()}
          </div>
        </div>
      </div>
    </div>
  );
}
