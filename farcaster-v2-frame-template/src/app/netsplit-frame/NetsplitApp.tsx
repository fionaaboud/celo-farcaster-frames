
"use client";

import { useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import UserSearch from "../../components/farcaster/SearchUser";
import { Button } from "../../components/ui/Button";

interface GroupMember {
  fid: number;
  username: string;
  display_name?: string;
  pfp_url?: string;
  eth_address: string;
}

export default function NetsplitApp() {
  const { isConnected, address } = useAccount();
  const [group, setGroup] = useState<GroupMember[]>([]);
  const [selectedUser, setSelectedUser] = useState<GroupMember | null>(null);
  const [expense, setExpense] = useState("");
  const [splitResult, setSplitResult] = useState<{ [username: string]: number } | null>(null);
  const [manualWalletInput, setManualWalletInput] = useState("");
  const [splitMode, setSplitMode] = useState<'even' | 'custom'>('even');
  const [customSplits, setCustomSplits] = useState<{ [username: string]: string }>({});

  // Handler to add user to group
  const handleAddUserToGroup = (user: any) => {
    if (!group.find((u) => u.fid === user.fid)) {
      setGroup([...group, {
        fid: user.fid,
        username: user.username,
        display_name: user.display_name,
        pfp_url: user.pfp_url,
        eth_address: user.verified_addresses.eth_addresses[0] || "",
      }]);
    }
  };

  // Handler to remove user from group
  const handleRemoveUserFromGroup = (fid: number) => {
    setGroup(group.filter((u) => u.fid !== fid));
  };

  // Handler for manual wallet/ENS entry
  const handleAddManualWallet = () => {
    const trimmed = manualWalletInput.trim();
    if (!trimmed) return;
    // Use a negative fid for manual entries to avoid collision
    const manualFid = -1 * (group.filter(u => u.fid < 0).length + 1);
    setGroup([
      ...group,
      {
        fid: manualFid,
        username: trimmed,
        display_name: "Manual Entry",
        pfp_url: undefined,
        eth_address: trimmed,
      },
    ]);
    setManualWalletInput("");
  };


  // Handler to split the bill
  const handleSplitBill = () => {
    const total = parseFloat(expense);
    if (!total || group.length === 0) return;
    if (splitMode === 'even') {
      const perPerson = parseFloat((total / group.length).toFixed(2));
      const result: { [username: string]: number } = {};
      group.forEach((user) => {
        result[user.username] = perPerson;
      });
      setSplitResult(result);
    } else {
      // Custom split: parse customSplits
      let sum = 0;
      const result: { [username: string]: number } = {};
      group.forEach((user) => {
        const val = parseFloat(customSplits[user.username] || '0');
        result[user.username] = val;
        sum += val;
      });
      if (Math.abs(sum - total) > 0.01) {
        alert(`Custom splits must sum to the total (${total})`);
        return;
      }
      setSplitResult(result);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <h1 className="text-3xl font-bold mb-6">Netsplit Bill Splitter</h1>
      <p className="mb-4 text-gray-600">Connect your wallet and split bills with friends on Farcaster!</p>
      <div className="mb-6">
        <ConnectButton />
      </div>
      {isConnected && (
        <div className="w-full max-w-md bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-xl font-semibold mb-2">1. Search and add Farcaster users</h2>
          <UserSearch onSelectUser={handleAddUserToGroup} hideSendTip hideTokenSelector />

          {/* Manual wallet/ENS entry */}
          <div className="mt-4">
            <label className="block font-medium mb-1">Or enter wallet address or ENS name</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="0x... or alice.eth"
                value={manualWalletInput}
                onChange={e => setManualWalletInput(e.target.value)}
                className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Button onClick={handleAddManualWallet} disabled={!manualWalletInput.trim()}>
                Add
              </Button>
            </div>
          </div>

          <div className="mt-4">
            <h3 className="font-medium mb-2">Group Members:</h3>
            {group.length === 0 && <p className="text-gray-400">No members yet</p>}
            <ul className="space-y-2">
              {group.map((user) => (
                <li key={user.fid} className="flex items-center gap-3 bg-gray-100 rounded p-2">
                  {user.pfp_url && (
                    <img src={user.pfp_url} alt={user.username} className="w-8 h-8 rounded-full" />
                  )}
                  <span className="font-medium">{user.display_name || user.username}</span>
                  <span className="text-xs text-gray-500 ml-2">@{user.username}</span>
                  <Button className="ml-auto px-2 py-1 text-xs" onClick={() => handleRemoveUserFromGroup(user.fid)}>
                    Remove
                  </Button>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-2">2. Enter total expense</h2>
            <input
              type="number"
              value={expense}
              min="0"
              step="0.01"
              onChange={(e) => setExpense(e.target.value)}
              placeholder="Total amount (e.g. 100)"
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
            />
            {/* Split mode selection */}
            <div className="flex gap-2 mb-2">
              <Button
                className={splitMode === 'even' ? 'bg-blue-600' : 'bg-gray-400'}
                onClick={() => setSplitMode('even')}
                type="button"
              >
                Split Evenly
              </Button>
              <Button
                className={splitMode === 'custom' ? 'bg-blue-600' : 'bg-gray-400'}
                onClick={() => setSplitMode('custom')}
                type="button"
              >
                Custom Split
              </Button>
            </div>
            {/* Custom split UI */}
            {splitMode === 'custom' && (
              <div className="mb-2 space-y-2">
                <p className="text-xs text-gray-500 mb-1">Assign an amount to each member (must sum to total)</p>
                {group.map(user => (
                  <div key={user.username} className="flex items-center gap-2">
                    <span className="w-24">@{user.username}</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={customSplits[user.username] || ''}
                      onChange={e => setCustomSplits(cs => ({ ...cs, [user.username]: e.target.value }))}
                      className="w-24 p-1 border border-gray-300 rounded-md"
                    />
                  </div>
                ))}
              </div>
            )}
            <Button className="w-full" onClick={handleSplitBill} disabled={!expense || group.length === 0}>
              Split Bill
            </Button>
          </div>
          {splitResult && (
            <div className="mt-6">
              <h3 className="font-medium mb-2">Split Result:</h3>
              <ul className="space-y-1">
                {Object.entries(splitResult).map(([username, amount]) => (
                  <li key={username} className="flex justify-between items-center">
                    <span>@{username}</span>
                    <span>{amount}</span>
                    <Button
                      className="ml-2 px-2 py-1 text-xs"
                      onClick={() => alert(`Settle with @${username} for ${amount}`)}
                    >
                      Settle
                    </Button>
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-xs text-gray-500">Click "Settle" to pay each member their share.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
