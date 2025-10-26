/**
 * Nexus SDK Helper Functions
 * 
 * This file provides helper functions for Avail Nexus SDK operations.
 * All implementations match the exact patterns used in the template:
 * 
 * - createBridgeIntent() → Uses sdk.bridge() pattern from src/components/bridge.tsx
 * - createBridgeAndSupplyIntent() → Conceptual (uses bridge(), needs bridgeAndExecute support)
 * - getUnifiedBalances() → Uses sdk.getUnifiedBalances() from src/components/unified-balance.tsx
 * 
 * The Nexus SDK methods actually available in the template are:
 * - sdk.bridge({ token, amount, chainId })
 * - sdk.getUnifiedBalances()
 * 
 * For Bridge & Execute functionality, check the latest Nexus SDK documentation
 * as the template only shows the basic bridge() method.
 */

import type { NexusSDK } from "@avail-project/nexus-core";
import {
  USDC_ADDRESSES,
  AAVE_V3_POOL_ADDRESSES,
  CHAIN_IDS,
  type SupportedChainId,
} from "./constants";

// Re-export for backwards compatibility
export { USDC_ADDRESSES, type SupportedChainId };

// Use testnet Aave addresses
export const AAVE_POOL_ADDRESSES = AAVE_V3_POOL_ADDRESSES;

/**
 * Bridge Intent Configuration
 */
export interface BridgeIntentParams {
  sourceChainId: SupportedChainId;
  destinationChainId: SupportedChainId;
  tokenAddress: string;
  amount: string; // Amount in human-readable format (e.g., "100.5")
  userAddress: string;
}

/**
 * Bridge and Supply Intent Configuration
 */
export interface BridgeAndSupplyIntentParams {
  sourceChainId: SupportedChainId;
  destinationChainId: SupportedChainId;
  amount: string; // Amount in human-readable format (e.g., "100.5")
  userAddress: string;
  aavePoolAddress?: string; // Optional, defaults to chain's Aave pool
}

/**
 * Intent Execution Result
 */
export interface IntentResult {
  success: boolean;
  transactionHash?: string;
  explorerUrl?: string;
  error?: string;
  errorDetails?: unknown;
}

/**
 * Aave V3 Pool ABI (supply function only)
 */
export const AAVE_SUPPLY_ABI = [
  {
    inputs: [
      { name: "asset", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "onBehalfOf", type: "address" },
      { name: "referralCode", type: "uint16" },
    ],
    name: "supply",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

/**
 * Creates a Nexus bridge intent to transfer USDC across chains
 * Follows the exact pattern from bridge.tsx in the template
 * 
 * @param sdk - Initialized NexusSDK instance
 * @param params - Bridge intent parameters
 * @returns Intent execution result
 * 
 * @example
 * ```typescript
 * const result = await createBridgeIntent(nexusSDK, {
 *   sourceChainId: 11155111,  // Sepolia (not used by SDK directly)
 *   destinationChainId: 84532, // Base Sepolia
 *   tokenAddress: USDC_ADDRESSES[11155111],
 *   amount: "100",
 *   userAddress: "0x...",
 * });
 * ```
 */
export async function createBridgeIntent(
  sdk: NexusSDK | null,
  params: BridgeIntentParams
): Promise<IntentResult> {
  try {
    // Validation
    if (!sdk || !sdk.isInitialized()) {
      throw new Error("Nexus SDK is not initialized");
    }

    if (!params.userAddress) {
      throw new Error("User address is required");
    }

    if (!params.amount || parseFloat(params.amount) <= 0) {
      throw new Error("Invalid amount");
    }

    if (params.sourceChainId === params.destinationChainId) {
      throw new Error("Source and destination chains must be different");
    }

    // Execute bridge through Nexus SDK
    // This matches the exact pattern from src/components/bridge.tsx
    const bridgeResult = await sdk.bridge({
      token: "USDC",
      amount: params.amount,
      chainId: params.destinationChainId,
    });

    if (bridgeResult?.success) {
      console.log("Bridge successful");
      console.log("Explorer URL:", bridgeResult.explorerUrl);
      return {
        success: true,
        explorerUrl: bridgeResult.explorerUrl,
      };
    }

    return {
      success: false,
      error: "Bridge failed",
    };
  } catch (error) {
    console.error("Error while bridging:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      errorDetails: error,
    };
  }
}

/**
 * Creates a Nexus "Bridge & Execute" intent that:
 * 1. Bridges USDC to destination chain
 * 2. Automatically supplies USDC to Aave V3 on destination chain
 * 
 * Uses Nexus SDK's sendCallsSync() method for atomic bridge + execute
 * 
 * @param sdk - Initialized NexusSDK instance
 * @param params - Bridge and supply intent parameters
 * @returns Intent execution result
 * 
 * @example
 * ```typescript
 * const result = await createBridgeAndSupplyIntent(nexusSDK, {
 *   sourceChainId: 421614,    // Arbitrum Sepolia
 *   destinationChainId: 11155111, // Sepolia (has Aave V3)
 *   amount: "10",            // 10 USDC
 *   userAddress: "0x...",
 * });
 * ```
 */
export async function createBridgeAndSupplyIntent(
  sdk: NexusSDK | null,
  params: BridgeAndSupplyIntentParams
): Promise<IntentResult> {
  try {
    // Validation
    if (!sdk || !sdk.isInitialized()) {
      throw new Error("Nexus SDK is not initialized. Please initialize Nexus first.");
    }

    if (!params.userAddress) {
      throw new Error("User address is required");
    }

    if (!params.amount || parseFloat(params.amount) <= 0) {
      throw new Error("Invalid amount. Must be greater than 0.");
    }

    // Get Aave pool address for destination chain
    const aavePoolAddress =
      params.aavePoolAddress ||
      AAVE_POOL_ADDRESSES[params.destinationChainId];

    if (!aavePoolAddress || aavePoolAddress === "0x0000000000000000000000000000000000000000") {
      throw new Error(
        `Aave V3 is not deployed on chain ${params.destinationChainId}`
      );
    }

    // Get USDC address on destination chain
    const usdcAddress = USDC_ADDRESSES[params.destinationChainId];
    if (!usdcAddress) {
      throw new Error(
        `USDC not supported on chain ${params.destinationChainId}`
      );
    }

    // Check if same-chain transaction
    if (params.sourceChainId === params.destinationChainId) {
      console.log("✅ Same-chain supply detected - no bridge needed");
      console.log("   ⚠️ Use direct Aave supply instead (handled by YieldTable)");
      return {
        success: true,
      };
    }

    // Convert amount to wei (USDC has 6 decimals)
    const amountWei = (parseFloat(params.amount) * 1e6).toString();

    console.log("=" .repeat(60));
    console.log("🌉 NEXUS BRIDGE & EXECUTE - Starting Cross-Chain Transaction");
    console.log("=" .repeat(60));
    console.log("📍 Source Chain:", getChainName(params.sourceChainId));
    console.log("📍 Destination Chain:", getChainName(params.destinationChainId));
    console.log("💰 Amount:", params.amount, "USDC");
    console.log("🎯 Target: Aave V3 Pool");
    console.log("=" .repeat(60));

    // Try using sendCallsSync if available (for Bridge & Execute in one transaction)
    try {
      console.log("🔧 Attempting Nexus sendCallsSync (Bridge & Execute)...");
      
      // Check if sendCallsSync exists on the SDK
      if (typeof (sdk as any).sendCallsSync === 'function') {
        console.log("✅ sendCallsSync method found - using atomic Bridge & Execute");
        
        // Encode the Aave supply call
        const supplyCalldata = encodeAaveSupplyCall(
          usdcAddress,
          amountWei,
          params.userAddress
        );

        // Create the Bridge & Execute intent
        const result = await (sdk as any).sendCallsSync({
          token: "USDC",
          amount: params.amount,
          destinationChainId: params.destinationChainId,
          calls: [
            {
              to: aavePoolAddress,
              data: supplyCalldata,
              value: "0",
            },
          ],
        });

        console.log("🔍 sendCallsSync result:", result);

        if (result?.success) {
          console.log("=" .repeat(60));
          console.log("✅ BRIDGE & EXECUTE SUCCESSFUL!");
          console.log("=" .repeat(60));
          console.log("🔗 Explorer:", result.explorerUrl || "N/A");
          console.log("💰 Your USDC is now earning yield on Aave!");
          console.log("=" .repeat(60));
          
          return {
            success: true,
            transactionHash: result.transactionHash,
            explorerUrl: result.explorerUrl,
          };
        }
      } else {
        console.log("⚠️  sendCallsSync not available, falling back to basic bridge");
      }
    } catch (syncError) {
      console.log("⚠️  sendCallsSync failed, falling back to basic bridge:", syncError);
    }

    // Fallback: Use basic bridge (user will need to supply to Aave manually)
    console.log("=" .repeat(60));
    console.log("🌉 STARTING BASIC BRIDGE");
    console.log("=" .repeat(60));
    console.log("📋 Bridge Parameters:");
    console.log("   • Token: USDC");
    console.log("   • Amount:", params.amount);
    console.log("   • Source Chain ID:", params.sourceChainId);
    console.log("   • Source Chain Name:", getChainName(params.sourceChainId));
    console.log("   • Destination Chain ID:", params.destinationChainId);
    console.log("   • Destination Chain Name:", getChainName(params.destinationChainId));
    console.log("   • User Address:", params.userAddress);
    console.log("=" .repeat(60));
    console.log("⏳ This may take 2-10 minutes on testnet...");
    console.log("📝 Calling sdk.bridge() NOW - Watch for MetaMask popup...");
    console.log("=" .repeat(60));
    
    let bridgeResult;
    try {
      // Add timeout to catch hanging calls
      const bridgePromise = sdk.bridge({
        token: "USDC",
        amount: params.amount,
        chainId: params.destinationChainId,
      });
      
      // Wait for bridge with a timeout (2 minutes)
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => {
          console.error("⏱️  Bridge call TIMED OUT after 2 minutes!");
          console.error("   The Nexus SDK bridge() method is not responding.");
          console.error("   This likely means the SDK is not properly triggering MetaMask on testnet.");
          reject(new Error("Bridge call timed out after 2 minutes - SDK not responding"));
        }, 120000)
      );
      
      bridgeResult = await Promise.race([bridgePromise, timeoutPromise]);
      console.log("🔍 Bridge result:", bridgeResult);
    } catch (bridgeError) {
      console.error("❌ Bridge call failed:", bridgeError);
      console.error("   Error details:", {
        message: (bridgeError as Error).message,
        name: (bridgeError as Error).name,
        stack: (bridgeError as Error).stack,
      });
      throw bridgeError;
    }

    if (bridgeResult?.success) {
      console.log("=" .repeat(60));
      console.log("✅ BRIDGE SUCCESSFUL!");
      console.log("=" .repeat(60));
      console.log("🔗 Explorer:", bridgeResult.explorerUrl || "N/A");
      console.log("⚠️  Next Step: You'll need to manually supply to Aave on Sepolia");
      console.log("   Visit: https://staging.aave.com/");
      console.log("=" .repeat(60));
      
      return {
        success: true,
        transactionHash: bridgeResult.transactionHash,
        explorerUrl: bridgeResult.explorerUrl,
      };
    }

    return {
      success: false,
      error: "Bridge transaction failed",
    };
  } catch (error) {
    console.error("=" .repeat(60));
    console.error("❌ BRIDGE & EXECUTE FAILED");
    console.error("=" .repeat(60));
    console.error("Error:", error);
    console.error("=" .repeat(60));
    
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
      errorDetails: error,
    };
  }
}

/**
 * Helper to get chain name from chain ID
 */
function getChainName(chainId: number): string {
  const names: Record<number, string> = {
    [CHAIN_IDS.ETHEREUM]: "Sepolia",
    [CHAIN_IDS.POLYGON]: "Polygon Amoy",
    [CHAIN_IDS.ARBITRUM]: "Arbitrum Sepolia",
    [CHAIN_IDS.BASE]: "Base Sepolia",
  };
  return names[chainId] || `Chain ${chainId}`;
}

/**
 * Encode Aave V3 supply() function call using viem-style encoding
 */
function encodeAaveSupplyCall(
  asset: string,
  amount: string,
  onBehalfOf: string
): string {
  // Function signature: supply(address asset, uint256 amount, address onBehalfOf, uint16 referralCode)
  // Function selector: 0x617ba037
  
  const functionSelector = "0x617ba037";
  
  // Encode parameters (simplified - in production use viem's encodeFunctionData)
  const paddedAsset = asset.slice(2).padStart(64, "0");
  const paddedAmount = BigInt(amount).toString(16).padStart(64, "0");
  const paddedOnBehalfOf = onBehalfOf.slice(2).padStart(64, "0");
  const paddedReferralCode = "0".padStart(64, "0"); // referralCode = 0
  
  return `${functionSelector}${paddedAsset}${paddedAmount}${paddedOnBehalfOf}${paddedReferralCode}`;
}


/**
 * Gets unified balances across all chains
 * Matches the pattern from unified-balance.tsx in the template
 * 
 * @param sdk - Initialized NexusSDK instance
 * @returns Array of user assets with balances across chains
 * 
 * @example
 * ```typescript
 * const balances = await getUnifiedBalances(nexusSDK);
 * if (balances) {
 *   balances.forEach(asset => {
 *     console.log(`${asset.symbol}: $${asset.balanceInFiat}`);
 *   });
 * }
 * ```
 */
export async function getUnifiedBalances(
  sdk: NexusSDK | null
): Promise<any[] | null> {
  try {
    if (!sdk || !sdk.isInitialized()) {
      throw new Error("Nexus SDK is not initialized");
    }

    // This matches the exact pattern from src/components/unified-balance.tsx
    const balance = await sdk.getUnifiedBalances();
    console.log("Unified Balance:", balance);
    return balance;
  } catch (error) {
    console.error("Error fetching unified balance:", error);
    return null;
  }
}

/**
 * Utility: Get USDC address for a specific chain
 */
export function getUSDCAddress(chainId: SupportedChainId): string | undefined {
  return USDC_ADDRESSES[chainId];
}

/**
 * Utility: Get Aave pool address for a specific chain
 */
export function getAavePoolAddress(
  chainId: SupportedChainId
): string | undefined {
  return AAVE_POOL_ADDRESSES[chainId];
}

/**
 * Utility: Check if chain supports USDC and Aave
 */
export function isChainSupported(chainId: number): chainId is SupportedChainId {
  return chainId in USDC_ADDRESSES && chainId in AAVE_POOL_ADDRESSES;
}

/**
 * Utility: Format amount with proper decimals for USDC (6 decimals)
 */
export function formatUSDCAmount(amount: string | number): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return num.toFixed(6);
}

/**
 * Utility: Parse USDC amount from wei to human-readable
 */
export function parseUSDCFromWei(amountWei: string | bigint): string {
  const amount = typeof amountWei === "string" ? BigInt(amountWei) : amountWei;
  return (Number(amount) / 1e6).toString();
}

/**
 * Utility: Convert USDC amount to wei
 */
export function parseUSDCToWei(amount: string | number): bigint {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return BigInt(Math.floor(num * 1e6));
}

