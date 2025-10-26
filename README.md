# FlexiYield 🚀

<div align="center">
  <img src="public/avail-logo.png" alt="FlexiYield Logo" width="200"/>
  
  **Cross-chain USDC Yield Optimizer**
  
  [![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
  [![Next.js](https://img.shields.io/badge/Next.js-15.5-black)](https://nextjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
  [![Powered by Avail Nexus](https://img.shields.io/badge/Powered%20by-Avail%20Nexus-purple)](https://www.availproject.org/)

  Find the best USDC lending rates across multiple chains and deposit with **one click** using Avail Nexus SDK.

  [Live Demo](#) • [Report Bug](https://github.com/chiranjeev-vyas/FlexiYield/issues) • [Request Feature](https://github.com/chiranjeev-vyas/FlexiYield/issues)
</div>

---

## 📖 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Usage Guide](#usage-guide)
- [Supported Networks](#supported-networks)
- [Smart Contract Integration](#smart-contract-integration)
- [How It Works](#how-it-works)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgments](#acknowledgments)

---

## 🎯 Overview

**FlexiYield** is a cross-chain USDC yield optimization platform that helps users find and access the best lending rates across multiple blockchain networks. Built with **Avail Nexus SDK**, it enables seamless cross-chain transactions, combining bridging and Aave V3 deposits into a **single atomic transaction**.

### 🏆 Built for ETHGlobal ETHOnline 2025

This project was developed as part of the ETHGlobal ETHOnline 2025 hackathon, showcasing the power of Avail's Nexus SDK for cross-chain interoperability.

> **📝 Development Note**: This project's foundation (Next.js + Web3 setup) was initialized before the hackathon using Avail's Nexus SDK template. All sponsor-specific work, including Nexus SDK integration, cross-chain bridging, Bridge & Execute functionality, Aave V3 integration, and the comprehensive [AVAIL_FEEDBACK.md](AVAIL_FEEDBACK.md) (759 lines), were developed specifically for ETHOnline 2025. See recent commits (dcac55f → present) for hackathon work.

---

## ✨ Features

### 🔍 **Real-Time Yield Comparison**
- Live APY data from Aave V3 across multiple chains
- Automatic highlighting of the best yields
- Real-time TVL (Total Value Locked) tracking

### 🌉 **Cross-Chain Bridging**
- Powered by **Avail Nexus SDK**
- Bridge USDC between Ethereum, Polygon, Arbitrum, and Base
- Atomic transactions: Bridge + Supply in one click

### 💰 **Aave V3 Integration**
- Direct supply to Aave V3 lending pools
- Automatic approval and deposit flow
- Transaction progress tracking with detailed status

### 📊 **Portfolio Management**
- Track your USDC balance across all chains
- Unified balance view powered by Nexus SDK
- Transaction history with localStorage persistence

### 📱 **Responsive Design**
- Mobile-first UI with Tailwind CSS
- Beautiful gradient backgrounds
- Smooth animations and transitions

### 🔔 **Smart Notifications**
- Toast notifications for all actions
- Error handling with retry functionality
- Detailed transaction status updates

### 🧪 **Testnet Support**
- Full testnet implementation
- Easy-to-access faucet links for all chains
- Safe testing environment

---

## 🛠️ Tech Stack

### **Frontend**
- [Next.js 15](https://nextjs.org/) - React framework with App Router
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Shadcn UI](https://ui.shadcn.com/) - UI components

### **Blockchain & Web3**
- [Avail Nexus SDK](https://docs.availproject.org/) - Cross-chain messaging
- [Wagmi](https://wagmi.sh/) - React hooks for Ethereum
- [Viem](https://viem.sh/) - TypeScript interface for Ethereum
- [ConnectKit](https://docs.family.co/connectkit) - Wallet connection UI

### **Smart Contracts**
- [Aave V3](https://aave.com/) - Lending protocol
- ERC20 USDC tokens across multiple chains

### **Additional Libraries**
- [React Hot Toast](https://react-hot-toast.com/) - Notifications
- [Lucide React](https://lucide.dev/) - Icons
- [date-fns](https://date-fns.org/) - Date formatting

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      FlexiYield Frontend                     │
│                   (Next.js + TypeScript)                     │
└─────────────┬───────────────────────────────────┬───────────┘
              │                                   │
              ▼                                   ▼
    ┌─────────────────┐              ┌─────────────────────┐
    │  Avail Nexus SDK │              │   Wagmi + Viem     │
    │  (Cross-chain)   │              │  (Direct on-chain) │
    └────────┬─────────┘              └──────────┬─────────┘
             │                                   │
             │                                   │
    ┌────────▼───────────────────────────────────▼─────────┐
    │                                                       │
    │           Supported Networks (Testnet)                │
    │                                                       │
    │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────┐│
    │  │ Sepolia  │  │ Polygon  │  │ Arbitrum │  │ Base ││
    │  │          │  │  Amoy    │  │ Sepolia  │  │Sepol.││
    │  └──────────┘  └──────────┘  └──────────┘  └──────┘│
    │                                                       │
    └───────────────────────────┬───────────────────────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │     Aave V3 Pools     │
                    │  (Lending Protocol)   │
                    └───────────────────────┘
```

### **Transaction Flow**

1. **User selects destination chain** with the best APY
2. **FlexiYield checks** if bridging is needed
3. **If same chain**: Direct deposit to Aave V3
4. **If cross-chain**: 
   - Nexus SDK bridges USDC to destination
   - Automatically supplies to Aave V3 (atomic transaction)
5. **Transaction confirmed** and added to history

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or pnpm
- MetaMask or compatible wallet

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/chiranjeev-vyas/FlexiYield.git
   cd FlexiYield
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
   ```

   Get your WalletConnect Project ID from [WalletConnect Cloud](https://cloud.walletconnect.com/)

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 📘 Usage Guide

### 1. **Connect Your Wallet**
- Click "Connect Wallet" button
- Select your wallet (MetaMask, WalletConnect, etc.)
- Approve the connection

### 2. **Initialize Nexus SDK**
- Click "Connect Nexus" button
- This enables cross-chain functionality

### 3. **Get Test USDC**
- Click on faucet links in the banner
- Get USDC on your preferred testnet:
  - **Sepolia**: [Aave Faucet](https://app.aave.com/faucet/)
  - **Base/Arbitrum**: [Circle Faucet](https://faucet.circle.com/)
  - **Polygon**: [Polygon Faucet](https://faucet.polygon.technology/)

### 4. **Find Best Yield**
- Compare APY rates across all chains
- Best rate is highlighted in green

### 5. **Supply USDC**
- Enter amount or click "Max"
- Click "Supply" button
- Confirm transactions in your wallet:
  - Approval transaction (if needed)
  - Supply/Bridge transaction

### 6. **Track Your Transaction**
- Watch real-time progress in the modal
- View transaction on block explorer
- Check your balance and transaction history

---

## 🌐 Supported Networks

FlexiYield currently supports **testnet** on the following chains:

| Network | Chain ID | Aave V3 | USDC Address |
|---------|----------|---------|--------------|
| **Sepolia** | 11155111 | ✅ | `0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8` |
| **Polygon Amoy** | 80002 | ❌ | `0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582` |
| **Arbitrum Sepolia** | 421614 | ✅ | `0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d` |
| **Base Sepolia** | 84532 | ✅ | `0x036CbD53842c5426634e7929541eC2318f3dCF7e` |

> ⚠️ **Note**: Sepolia Aave V3 testnet currently has issues with deposits. Try Base Sepolia or Arbitrum Sepolia for testing.

---

## 🔗 Smart Contract Integration

### **Aave V3 Pool Addresses (Testnet)**

```typescript
{
  Sepolia: "0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951",
  Arbitrum Sepolia: "0xBfC91D59fdAA134A4ED45f7B584cAf96D7792Eff",
  Base Sepolia: "0x07eA79F68B2B3df564D0A34F8e19D9B1e339814b"
}
```

### **Key Functions Used**

- `approve(address spender, uint256 amount)` - Approve USDC spending
- `supply(address asset, uint256 amount, address onBehalfOf, uint16 referralCode)` - Supply USDC to Aave

---

## ⚙️ How It Works

### **Same-Chain Supply**
```typescript
1. User on Sepolia → Supply to Sepolia Aave
   ├─ Approve USDC
   └─ Call supply() on Aave Pool
```

### **Cross-Chain Supply** (Powered by Nexus SDK)
```typescript
1. User on Sepolia → Supply to Base Aave
   ├─ Nexus SDK bridges USDC: Sepolia → Base
   └─ Automatically supplies to Base Aave (atomic)
```

### **Transaction Status Tracking**
- `approving` - Waiting for token approval
- `bridging` - USDC being bridged (cross-chain only)
- `supplying` - Depositing to Aave V3
- `success` - Transaction complete
- `error` - Transaction failed (with retry option)

---

## 📁 Project Structure

```
FlexiYield/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Home page
│   │   ├── globals.css         # Global styles
│   │   └── icon.png            # Favicon
│   ├── components/             # React components
│   │   ├── YieldTable.tsx      # Main yield comparison table
│   │   ├── TransactionModal.tsx # Transaction progress UI
│   │   ├── NetworkModeBanner.tsx # Testnet banner
│   │   ├── USDCBalance.tsx     # Balance display
│   │   ├── TransactionHistory.tsx # Tx history
│   │   ├── blocks/             # Reusable blocks
│   │   │   ├── connect-wallet.tsx
│   │   │   ├── chain-select.tsx
│   │   │   └── token-select.tsx
│   │   └── ui/                 # Shadcn UI components
│   ├── lib/                    # Utility functions
│   │   ├── constants.ts        # Contract addresses & chain IDs
│   │   ├── aave-helper.ts      # Aave APY fetching
│   │   ├── aave-supply.ts      # Aave supply logic
│   │   ├── nexus-helper.ts     # Nexus SDK wrapper
│   │   └── error-handler.ts    # Error parsing
│   ├── providers/              # React Context providers
│   │   ├── Web3Provider.tsx    # Wagmi + ConnectKit
│   │   ├── NexusProvider.tsx   # Nexus SDK initialization
│   │   └── TransactionHistoryProvider.tsx
│   └── hooks/                  # Custom React hooks
│       ├── useTransactionHistory.tsx
│       └── useListenTransactions.tsx
├── public/                     # Static assets
│   └── avail-logo.png          # Avail logo
└── package.json                # Dependencies
```

---

## 🔧 Environment Variables

Create a `.env.local` file with:

```env
# WalletConnect (Required)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here

# Optional: RPC URLs (uses public RPCs by default)
NEXT_PUBLIC_SEPOLIA_RPC=https://...
NEXT_PUBLIC_BASE_SEPOLIA_RPC=https://...
NEXT_PUBLIC_ARBITRUM_SEPOLIA_RPC=https://...
NEXT_PUBLIC_POLYGON_AMOY_RPC=https://...
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **[Avail Project](https://www.availproject.org/)** - For the amazing Nexus SDK
- **[Aave](https://aave.com/)** - For the lending protocol
- **[ETHGlobal](https://ethglobal.com/)** - For organizing ETHOnline 2025
- **[Shadcn UI](https://ui.shadcn.com/)** - For beautiful UI components
- **[Wagmi](https://wagmi.sh/)** & **[Viem](https://viem.sh/)** - For Web3 React hooks

---

## 🐛 Known Issues

- **Sepolia Aave V3**: Currently experiencing issues with deposits (error '51'). Use Base or Arbitrum Sepolia for testing.
- **Testnet RPCs**: May be rate-limited during high usage. Retry functionality is built-in.
- **Nexus SDK**: Bridge & Execute feature is not available in v0.0.1. Basic bridging is implemented.

---

## 🗺️ Roadmap

- [ ] Mainnet support
- [ ] More lending protocols (Compound, Euler)
- [ ] More chains (Optimism, zkSync)
- [ ] Auto-compounding yields
- [ ] Portfolio analytics
- [ ] Gas optimization strategies
- [ ] Mobile app (React Native)

---

## 📞 Contact

**Chiranjeev Vyas**

- GitHub: [@chiranjeev-vyas](https://github.com/chiranjeev-vyas)
- Project: [FlexiYield](https://github.com/chiranjeev-vyas/FlexiYield)

---

<div align="center">
  
  **⭐ Star this repo if you find it helpful!**
  
  Made with ❤️ for ETHGlobal ETHOnline 2025
  
</div>
