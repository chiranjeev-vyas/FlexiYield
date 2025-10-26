# Testnet/Mainnet Toggle Feature 🔄

## ✨ What's New

Your FlexiYield app now supports **seamless switching between Testnet and Mainnet** modes!

### Features:
- ✅ **One-Click Toggle** - Switch networks with a single button
- ✅ **Automatic Configuration** - All contracts, addresses, and chain IDs update instantly
- ✅ **Persistent Selection** - Your choice is saved in localStorage
- ✅ **Safety Warnings** - Clear alerts when using real funds on mainnet
- ✅ **Same UI** - Identical interface for both modes
- ✅ **Nexus SDK Adaptation** - SDK automatically switches to correct network

---

## 🎯 Why This Matters

### **Test Nexus SDK on Mainnet**
The Avail Nexus SDK (v0.0.1) has limited testnet support. By switching to mainnet, you can:
- Test if Bridge & Execute (`sendCallsSync`) works better
- See if the basic bridge is more reliable
- Verify if event tracking functions properly
- Get better performance and fewer timeouts

### **Production Ready**
- Users can use real assets when they're confident
- Developers can test with small amounts on mainnet
- Gradual migration from testnet to production

---

## 🎨 UI Components

### 1. **Network Mode Banner** (Top of page)

**Testnet Mode:**
```
🧪 TESTNET MODE
⚠️ For Aave supply to work, get USDC from Aave faucet!
[Toggle] [Faucet Links]
```

**Mainnet Mode:**
```
⚠️ MAINNET MODE - REAL FUNDS  
⚠️ All transactions use real USDC and cost real gas fees!
[Toggle] [Warning]
```

### 2. **Toggle Switch**
```
[Testnet] 🔘━━━━ [Mainnet]
```
- Green/Teal when on testnet
- Blue/Red when on mainnet

### 3. **Safety Dialog**
When switching to mainnet, users see:
```
⚠️ Switch to Mainnet?

You are about to use REAL FUNDS:
- Real USDC will be used
- Transactions cost real gas fees  
- All actions are irreversible
- Use at your own risk

💡 Tip: Test the Nexus SDK's Bridge & Execute on mainnet!

[Cancel] [I Understand, Switch to Mainnet]
```

---

## 🔧 Technical Implementation

### **File Structure**
```
src/
├── contexts/
│   └── NetworkModeContext.tsx          # Manages testnet/mainnet state
├── lib/
│   ├── config/
│   │   ├── testnet-config.ts          # All testnet addresses
│   │   ├── mainnet-config.ts          # All mainnet addresses  
│   │   └── dynamic-config.ts          # Active config switcher
│   └── constants.ts                   # Re-exports from dynamic-config
├── components/
│   ├── NetworkModeBanner.tsx          # Banner with mode indicator
│   └── NetworkModeToggle.tsx          # Toggle switch UI
└── providers/
    ├── NexusProvider.tsx              # Updated to use dynamic network
    └── Web3Provider.tsx               # (Should support both networks)
```

### **Configuration Files**

#### `testnet-config.ts`
```typescript
export const TESTNET_CONFIG = {
  CHAIN_IDS: {
    ETHEREUM: 11155111,  // Sepolia
    POLYGON: 80002,      // Amoy
    ARBITRUM: 421614,    // Arb Sepolia
    BASE: 84532,         // Base Sepolia
  },
  USDC_ADDRESSES: { /* testnet USDC */ },
  AAVE_V3_POOL_ADDRESSES: { /* testnet Aave */ },
  NEXUS_NETWORK: "testnet",
  // ... metadata, explorers, faucets
};
```

#### `mainnet-config.ts`
```typescript
export const MAINNET_CONFIG = {
  CHAIN_IDS: {
    ETHEREUM: 1,
    POLYGON: 137,
    ARBITRUM: 42161,
    BASE: 8453,
  },
  USDC_ADDRESSES: { /* mainnet USDC */ },
  AAVE_V3_POOL_ADDRESSES: { /* mainnet Aave */ },
  NEXUS_NETWORK: "mainnet",
  // ... metadata, explorers
};
```

#### `dynamic-config.ts`
```typescript
export function getCurrentNetworkMode(): "testnet" | "mainnet" {
  const saved = localStorage.getItem("flexiyield-network-mode");
  return saved === "mainnet" ? "mainnet" : "testnet";
}

export function getActiveConfig() {
  return getCurrentNetworkMode() === "mainnet" 
    ? MAINNET_CONFIG 
    : TESTNET_CONFIG;
}

export const CONFIG = getActiveConfig();
export const CHAIN_IDS = CONFIG.CHAIN_IDS;
export const USDC_ADDRESSES = CONFIG.USDC_ADDRESSES;
// ... etc
```

### **Context Provider**

```typescript
// NetworkModeContext.tsx
export function NetworkModeProvider({ children }) {
  const [mode, setMode] = useState<"testnet" | "mainnet">("testnet");
  
  const setModeAndReload = (newMode) => {
    localStorage.setItem("flexiyield-network-mode", newMode);
    window.location.reload(); // Reload to reinitialize everything
  };
  
  return (
    <NetworkModeContext.Provider value={{ mode, setMode: setModeAndReload }}>
      {children}
    </NetworkModeContext.Provider>
  );
}
```

### **Usage in Components**

```typescript
// Before (hard-coded testnet)
import { CHAIN_IDS, USDC_ADDRESSES } from "@/lib/constants";

// After (dynamic, no change needed!)
import { CHAIN_IDS, USDC_ADDRESSES } from "@/lib/constants";
// ^ Now automatically returns testnet or mainnet config!
```

---

## 📊 Configuration Comparison

### **Chain IDs**

| Chain | Testnet | Mainnet |
|-------|---------|---------|
| Ethereum | 11155111 (Sepolia) | 1 |
| Polygon | 80002 (Amoy) | 137 |
| Arbitrum | 421614 (Sepolia) | 42161 |
| Base | 84532 (Sepolia) | 8453 |

### **USDC Addresses**

| Chain | Testnet | Mainnet |
|-------|---------|---------|
| Ethereum | `0x94a9...4C8` (Aave Test USDC) | `0xA0b8...B48` |
| Polygon | `0x41E9...582` | `0x2791...174` |
| Arbitrum | `0x75fa...4d` | `0xaf88...831` |
| Base | `0x036C...7e` | `0x8335...913` |

### **Aave V3 Pool Addresses**

| Chain | Testnet | Mainnet |
|-------|---------|---------|
| Ethereum | `0x6Ae4...951` | `0x8787...4E2` |
| Polygon | N/A (Amoy) | `0x794a...4aD` |
| Arbitrum | `0xBfC9...Eff` | `0x794a...4aD` |
| Base | `0x07eA...14b` | `0xA238...1c5` |

---

## 🚀 How to Use

### **For Users**

1. **Default Mode**: App starts in **Testnet** for safety
2. **Switch to Mainnet**:
   - Click the toggle switch in the banner
   - Read and understand the warning
   - Click "I Understand, Switch to Mainnet"
   - Page reloads in mainnet mode
3. **Switch Back**: Toggle again (no warning needed)

### **For Developers**

#### **Check Current Mode**
```typescript
import { useNetworkMode } from "@/contexts/NetworkModeContext";

function MyComponent() {
  const { mode, isMainnet, isTestnet } = useNetworkMode();
  
  if (isMainnet) {
    console.log("⚠️ Using REAL funds!");
  }
}
```

#### **Get Active Config**
```typescript
import { getActiveConfig, CHAIN_IDS, USDC_ADDRESSES } from "@/lib/config/dynamic-config";

const config = getActiveConfig();
console.log("Network:", config.NEXUS_NETWORK); // "testnet" or "mainnet"
console.log("Eth Chain ID:", CHAIN_IDS.ETHEREUM); // 11155111 or 1
```

#### **Force Reload on Mode Change**
The app automatically reloads when switching modes to ensure:
- NexusSDK reinitializes with correct network
- All components get fresh config
- No stale state from previous mode

---

## 🧪 Testing the Nexus SDK on Mainnet

### **Why Test on Mainnet?**

The Nexus SDK (`@avail-project/nexus-core` v0.0.1) is alpha software. Testnet support is limited:
- ❌ Bridge calls hang after `convertIntent`
- ❌ MetaMask popups don't appear consistently
- ❌ `sendCallsSync` might not exist
- ❌ Event tracking is unreliable

**Mainnet might work better because:**
- ✅ More mature infrastructure
- ✅ Better RPC reliability
- ✅ Active development focus
- ✅ Real liquidity and bridges

### **How to Test Safely**

1. **Start Small**: Use $1-5 USDC for first tests
2. **Same-Chain First**: Test Aave supply without bridging
3. **Then Bridge**: Try bridging small amounts
4. **Finally Bridge & Execute**: Test the atomic feature

### **What to Look For**

1. **MetaMask Popup**: Does it appear immediately?
2. **Transaction Speed**: < 1 minute vs 10+ minutes on testnet?
3. **Event Tracking**: Does `useListenTransaction` work?
4. **Bridge & Execute**: Does `sendCallsSync` exist and work?

### **Expected Results**

| Feature | Testnet | Mainnet (Expected) |
|---------|---------|-----------|
| Same-Chain Supply | ✅ Works | ✅ Should work |
| Basic Bridge | ⚠️ Hangs/Slow | ✅ Might be faster |
| Bridge & Execute | ❌ Not available | ❓ Could work |
| MetaMask Popup | ⚠️ Inconsistent | ✅ Might be reliable |

---

## ⚠️ Safety Considerations

### **Mainnet Risks**
- 💰 **Real Money**: All transactions use real USDC
- ⛽ **Gas Costs**: Pay real ETH/MATIC/ARB/ETH (Base)
- 🚫 **No Refunds**: Irreversible transactions
- 🐛 **Alpha SDK**: v0.0.1 might have bugs

### **Best Practices**
1. ✅ Always start in testnet mode
2. ✅ Test thoroughly on testnet first
3. ✅ Use small amounts on mainnet ($1-10)
4. ✅ Never invest more than you can afford to lose
5. ✅ Double-check addresses before transactions
6. ✅ Keep the SDK diagnostics button for debugging

### **User Warnings**
The app shows warnings:
- 🟡 **Testnet Banner**: Yellow, shows faucet links
- 🔴 **Mainnet Banner**: Red, shows "REAL FUNDS" alert
- ⚠️ **Switch Dialog**: Requires confirmation
- 🔴 **"LIVE" Badge**: Always visible in mainnet mode

---

## 🔍 Debugging

### **Check Current Mode**
Open browser console:
```javascript
localStorage.getItem("flexiyield-network-mode")
// Returns: "testnet" or "mainnet"
```

### **Force Mode Switch**
```javascript
localStorage.setItem("flexiyield-network-mode", "testnet");
location.reload();
```

### **SDK Diagnostics**
1. Switch to desired mode (testnet/mainnet)
2. Initialize Nexus
3. Click "🔍 Check SDK Capabilities"
4. Review console output for available methods

---

## 📝 Migration Notes

### **What Changed**
- ✅ Added testnet/mainnet toggle
- ✅ Split configs into separate files
- ✅ Made `constants.ts` dynamic
- ✅ Updated `NexusProvider` to use active network
- ✅ Added safety warnings for mainnet
- ✅ Created new banner component

### **What Didn't Change**
- ✅ All existing components work without modification
- ✅ Import paths remain the same (`@/lib/constants`)
- ✅ Function signatures unchanged
- ✅ UI/UX stays consistent

### **Backwards Compatibility**
```typescript
// Old code still works!
import { CHAIN_IDS, USDC_ADDRESSES } from "@/lib/constants";

// Now returns active config (testnet or mainnet)
const ethChainId = CHAIN_IDS.ETHEREUM;
```

---

## 🎯 Next Steps

### **Immediate**
1. ✅ Test the toggle in your browser
2. ✅ Try testnet mode (should work as before)
3. ✅ Try mainnet mode with small amounts
4. ✅ Run SDK diagnostics in both modes

### **Short Term**
1. 📊 Test Nexus SDK on mainnet vs testnet
2. 📝 Document which features work where
3. 🐛 Report findings to Avail team
4. 🔄 Update based on SDK improvements

### **Long Term**
1. 🚀 Deploy to production with mainnet support
2. 📈 Monitor SDK updates for Bridge & Execute
3. 🛡️ Add additional safety features (transaction limits, etc.)
4. 🌐 Consider multi-network strategies

---

## 🆘 Troubleshooting

### **Toggle Doesn't Work**
- Check browser console for errors
- Clear localStorage and try again
- Ensure you're on latest code

### **Wrong Network After Toggle**
- The app should auto-reload after switching
- If not, manually refresh (F5)
- Check `localStorage.getItem("flexiyield-network-mode")`

### **Mainnet Transactions Fail**
- Ensure you have USDC on the source chain
- Check gas balance (ETH/MATIC/ARB/ETH)
- Verify contract addresses are correct
- Try same-chain supply first

### **Nexus SDK Still Broken on Mainnet**
- Run diagnostics to confirm available methods
- Check console for specific errors
- Try direct Aave supply (no bridge) first
- Report findings - this helps everyone!

---

## 📚 Resources

- [Aave V3 Docs](https://docs.aave.com/)
- [Avail Nexus GitHub](https://github.com/availproject/nexus)
- [FlexiYield Issues](https://github.com/yourrepo/issues)

---

**Built with ❤️ for the FlexiYield community**


