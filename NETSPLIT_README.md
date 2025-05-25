# Netsplit - Bill Splitting Frame for Farcaster

A decentralized bill splitting application built as a Farcaster Frame, integrated with Celo blockchain and WalletConnect for seamless payments.

## Features

- 🔗 **Farcaster Frame Integration**: Native frame experience within Farcaster
- 💰 **Celo Blockchain**: Built on Celo for fast, low-cost transactions
- 🔐 **Universal Wallet Support**: Connect with MetaMask, Valora, Coinbase Wallet, and any WalletConnect-compatible wallet
- 👥 **Group Management**: Create and manage expense groups
- 💸 **Bill Splitting**: Split expenses equally among group members
- 🏦 **Multi-Currency**: Support for cUSD, cEUR, cREAL, and CELO
- 📱 **Mobile-First**: Optimized for mobile frame experience
- ⚡ **Real-time Balances**: Track who owes what in real-time
- 💳 **Direct Payments**: Pay debts directly through connected wallets
- 🌐 **Cross-Platform**: Works with any wallet that supports Celo network

## Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Blockchain**: Celo, Viem, Wagmi
- **Wallet**: WalletConnect, RainbowKit
- **Frame**: Farcaster Frame SDK
- **State Management**: React Hooks

## Getting Started

### Prerequisites

- Node.js 20+
- A WalletConnect Cloud Project ID
- A Farcaster account for testing

### Installation

1. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` and add your configuration:
   ```env
   NEXT_PUBLIC_URL=http://localhost:3000
   NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_wallet_connect_project_id
   ```

3. **Get a WalletConnect Project ID**
   - Go to [WalletConnect Cloud](https://cloud.walletconnect.com/)
   - Create a new project
   - Copy the Project ID to your `.env.local` file

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open the app**
   - Visit [http://localhost:3000](http://localhost:3000)
   - The app will redirect to `/netsplit-frame`

## Frame Development

### Testing the Frame

1. **Local Testing with ngrok**
   ```bash
   # Install ngrok if you haven't already
   npm install -g ngrok

   # Expose your local server
   ngrok http 3000
   ```

   Update your `.env.local` with the ngrok URL:
   ```env
   NEXT_PUBLIC_URL=https://your-ngrok-url.ngrok-free.app
   ```

2. **Frame Debugger**
   - Use the [Farcaster Frame Debugger](https://warpcast.com/~/developers/frames)
   - Enter your frame URL to test functionality

## Usage

### Creating a Group

1. Connect your wallet using WalletConnect
2. Click "Create New Group"
3. Enter a group name
4. Start adding expenses

### Adding Expenses

1. Open a group
2. Click "Add Expense"
3. Enter expense details (title, amount, currency)
4. The expense will be split equally among group members

### Viewing Balances

1. In a group, click "View Balances"
2. See who owes what to whom
3. Click "Pay" to settle debts directly

### Making Payments

1. Payments are made through your connected wallet
2. Transactions are processed on the Celo blockchain
3. Balances update automatically after successful payments

## Architecture

```
src/
├── app/
│   ├── .well-known/farcaster.json/    # Frame configuration
│   ├── api/webhook/                   # Webhook handlers
│   ├── netsplit-frame/               # Main frame app
│   ├── globals.css                   # Global styles
│   ├── layout.tsx                    # Root layout
│   ├── page.tsx                      # Main entry point
│   └── providers.tsx                 # App providers
├── components/
│   ├── providers/                    # Wallet providers
│   └── ui/                          # UI components
public/                              # Static assets
```

## Supported Wallets

The app supports a wide range of wallets through WalletConnect and direct integrations:

### 🔗 **Wallet Options**
- **MetaMask**: Popular browser extension and mobile wallet
- **Valora**: Mobile-first wallet built specifically for Celo
- **Coinbase Wallet**: Self-custody wallet with excellent mobile support
- **Any WalletConnect-compatible wallet**: 300+ wallets supported

### ⚡ **Key Features**
- Automatic wallet detection within Farcaster frames
- Seamless connection flow optimized for mobile
- Support for both browser extension and mobile wallets
- Direct integration with Celo's stablecoin ecosystem (cUSD, cEUR, cREAL)
- Real-time balance updates and transaction confirmations

### 📱 **Mobile Wallet Setup**
1. Install your preferred wallet (Valora recommended for Celo)
2. Add Celo network if not already configured
3. Fund your wallet with Celo stablecoins
4. Open the Netsplit frame in Farcaster
5. Connect your wallet and start splitting bills!

## Deployment

The app can be deployed to any platform that supports Next.js:
- Vercel (recommended)
- Netlify
- Railway
- DigitalOcean App Platform

Make sure to set the environment variables in your deployment platform.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License

## Roadmap

- [ ] Add support for custom split amounts
- [ ] Implement expense categories
- [ ] Add expense photos/receipts
- [ ] Multi-group management
- [ ] Export expense reports
- [ ] Integration with other Celo DeFi protocols
