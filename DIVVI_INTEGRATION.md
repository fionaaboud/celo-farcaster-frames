# 🎯 Divvi Web3 Impact Tracking Integration

This document explains how Netsplit integrates with Divvi to track web3 impact and earn rewards for driving user engagement.

## 🌟 What is Divvi?

Divvi is a blockchain-based protocol that makes it easy to align incentives among participants in on-chain ecosystems. It tracks user activity and rewards builders for driving real impact.

## 🔧 Integration Overview

Netsplit integrates with Divvi to:
- **Track user actions** (wallet connections, group creation, expense additions, payments)
- **Register referrals** when users make their first transaction
- **Earn rewards** based on user engagement and on-chain activity
- **Measure impact** through objective, on-chain metrics

## 📋 Setup Instructions

### 1. Register with Divvi

1. **Visit**: https://app.divvi.xyz/builders/onboarding
2. **Connect your wallet** (this becomes your Divvi Identifier)
3. **Complete onboarding** to get your builder address
4. **Join campaigns** you want to participate in
5. **Get campaign IDs** from your dashboard

### 2. Configure Environment Variables

Add these to your `.env.local` file:

```bash
# Divvi Web3 Impact Tracking Configuration
NEXT_PUBLIC_DIVVI_ENABLED=true
NEXT_PUBLIC_DIVVI_BUILDER_ADDRESS=0x1234567890123456789012345678901234567890
NEXT_PUBLIC_DIVVI_CAMPAIGN_IDS=campaign_id_1,campaign_id_2,campaign_id_3
```

### 3. Deploy and Test

1. **Deploy your app** to production
2. **Test user flows** to ensure tracking works
3. **Monitor your dashboard** for tracked activity
4. **Claim rewards** when available

## 🎯 Tracked Actions

### Wallet Connection
- **Trigger**: User connects wallet to Netsplit
- **Data**: User address, timestamp
- **Purpose**: Track user acquisition

### Group Creation
- **Trigger**: User creates a new bill splitting group
- **Data**: Group ID, member count, group name
- **Purpose**: Track feature usage and engagement

### Expense Addition
- **Trigger**: User adds an expense to a group
- **Data**: Expense amount, currency, split type, member count
- **Purpose**: Track core functionality usage

### Payment Made
- **Trigger**: User makes a payment to settle debt
- **Data**: Amount, currency, recipient, transaction hash
- **Purpose**: Track on-chain value transfer and register referrals

## 🔗 Technical Implementation

### Core Components

1. **DivviProvider** (`src/components/providers/DivviProvider.tsx`)
   - Manages Divvi configuration
   - Provides context to the app

2. **useDivvi Hook** (`src/hooks/useDivvi.ts`)
   - Handles referral registration
   - Manages interaction with Divvi Registry contract

3. **Tracking Utilities** (`src/utils/divviTracking.ts`)
   - Helper functions for logging actions
   - Transaction metadata enhancement

### Contract Integration

- **Divvi Registry**: `0xEdb51A8C390fC84B1c2a40e0AE9C9882Fa7b7277` (Optimism)
- **Functions Used**:
  - `registerReferral()` - Register user referrals
  - `isUserReferredToProvider()` - Check referral status
  - `getReferringConsumer()` - Get referring builder

### Data Flow

1. **User Action** → Netsplit app detects action
2. **Log Action** → Action logged with metadata
3. **Transaction** → If on-chain, transaction includes referral metadata
4. **Register Referral** → Transaction hash registered with Divvi
5. **Track Impact** → Divvi monitors ongoing user activity
6. **Calculate Rewards** → Periodic reward calculation
7. **Claim Rewards** → Builder claims earned rewards

## 📊 Analytics and Monitoring

### Console Logging
All Divvi actions are logged to console for development:
```javascript
console.log('Divvi Action Tracked:', {
  action: 'expense_added',
  userAddress: '0x...',
  builderAddress: '0x...',
  metadata: { ... },
  timestamp: '2025-05-25T...'
});
```

### Google Analytics Integration
If Google Analytics is configured, events are automatically sent:
```javascript
gtag('event', 'divvi_action', {
  action: 'payment_made',
  user_address: '0x...',
  builder_address: '0x...',
  custom_parameters: { ... }
});
```

## 🎁 Reward Mechanisms

### How Rewards Work
1. **Campaigns** define reward structures and KPIs
2. **User activity** is tracked on-chain
3. **Impact metrics** are calculated (e.g., transaction volume, user retention)
4. **Rewards** are distributed based on actual impact
5. **Claims** can be made directly from smart contracts

### Example Campaigns
- **Celo DeFi**: Rewards for driving DeFi usage on Celo
- **Valora Ecosystem**: Rewards for Valora wallet integrations
- **Netsplit Referrals**: Custom campaign for bill splitting activity

## 🔒 Privacy and Security

### Data Handling
- **On-chain data only**: Only public blockchain data is tracked
- **No personal info**: No personal information is collected
- **Wallet addresses**: Only public wallet addresses are used
- **Opt-in**: Users must connect wallets to participate

### Security Measures
- **Contract verification**: All contracts are verified on-chain
- **Open source**: Divvi protocol is open source
- **Audited**: Smart contracts are audited for security

## 🚀 Benefits for Netsplit

### For Builders
- **Earn rewards** for driving user engagement
- **Measure impact** with objective metrics
- **Align incentives** with ecosystem growth
- **Access funding** for continued development

### For Users
- **Better experience** through aligned incentives
- **Ecosystem rewards** for participating
- **Transparent tracking** of contributions
- **No additional costs** or complexity

## 📈 Optimization Tips

### Maximize Rewards
1. **Focus on quality users** who make transactions
2. **Optimize conversion** from connection to payment
3. **Encourage repeat usage** through great UX
4. **Track all relevant actions** comprehensively

### Monitor Performance
1. **Check Divvi dashboard** regularly
2. **Analyze user funnels** for optimization opportunities
3. **Test different campaigns** to find best fit
4. **Iterate based on data** and feedback

## 🔧 Troubleshooting

### Common Issues
- **Environment variables not set**: Check `.env.local` configuration
- **Referral registration fails**: Ensure user has valid wallet connection
- **No rewards showing**: Verify campaign participation and user activity
- **Transaction tracking issues**: Check network connectivity and contract addresses

### Debug Mode
Enable detailed logging by setting:
```bash
NEXT_PUBLIC_DEBUG_DIVVI=true
```

## 📚 Resources

- **Divvi Documentation**: https://docs.divvi.xyz/
- **Builder Onboarding**: https://app.divvi.xyz/builders/onboarding
- **Discord Community**: https://discord.gg/EaxZDhMuDn
- **GitHub Repository**: https://github.com/divvi-xyz/divvi-protocol-v0

---

**Ready to start earning rewards for your web3 impact!** 🎉
