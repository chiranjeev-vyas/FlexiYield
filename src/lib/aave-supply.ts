/**
 * Aave V3 Supply Functions
 * 
 * Direct contract interactions for supplying assets to Aave V3
 */

import { parseUnits } from "viem";
import type { Address, WalletClient, PublicClient } from "viem";
import { USDC_ADDRESSES, AAVE_V3_POOL_ADDRESSES, USDC_DECIMALS } from "./constants";
import type { SupportedChainId } from "./constants";

// ERC20 ABI for approve function
const ERC20_ABI = [
  {
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

// Aave V3 Pool ABI for supply function and reserve data
const AAVE_POOL_ABI = [
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
  {
    inputs: [{ name: "asset", type: "address" }],
    name: "getReserveData",
    outputs: [
      {
        components: [
          { name: "configuration", type: "uint256" },
          { name: "liquidityIndex", type: "uint128" },
          { name: "currentLiquidityRate", type: "uint128" },
          { name: "variableBorrowIndex", type: "uint128" },
          { name: "currentVariableBorrowRate", type: "uint128" },
          { name: "currentStableBorrowRate", type: "uint128" },
          { name: "lastUpdateTimestamp", type: "uint40" },
          { name: "id", type: "uint16" },
          { name: "aTokenAddress", type: "address" },
          { name: "stableDebtTokenAddress", type: "address" },
          { name: "variableDebtTokenAddress", type: "address" },
          { name: "interestRateStrategyAddress", type: "address" },
          { name: "accruedToTreasury", type: "uint128" },
          { name: "unbacked", type: "uint128" },
          { name: "isolationModeTotalDebt", type: "uint128" },
        ],
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

export interface SupplyToAaveParams {
  chainId: SupportedChainId;
  amount: string; // Human-readable amount (e.g., "100.5")
  userAddress: Address;
  walletClient: WalletClient;
  publicClient: PublicClient;
}

export interface SupplyResult {
  success: boolean;
  approvalHash?: string;
  supplyHash?: string;
  explorerUrl?: string;
  error?: string;
}

/**
 * Utility function to execute a contract write with retry logic for rate limiting
 * Implements exponential backoff for rate-limited requests
 * INCREASED retries and delays for heavily rate-limited testnets
 */
async function executeWithRetry<T>(
  fn: () => Promise<T>,
  actionName: string,
  maxRetries = 5, // Increased from 3 to 5
  initialDelayMs = 5000 // Increased from 3s to 5s
): Promise<T> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      const isRateLimited = 
        errorMsg.includes("rate limit") || 
        errorMsg.includes("429") ||
        errorMsg.includes("too many requests") ||
        errorMsg.includes("reverted"); // Sometimes rate limits cause reverts
      
      if (isRateLimited && attempt < maxRetries - 1) {
        const delay = initialDelayMs * Math.pow(1.5, attempt); // Gentler backoff: 5s, 7.5s, 11.25s, 16.875s, 25.3s
        console.log(`⏳ ${actionName}: Rate limited by testnet RPC, waiting ${(delay/1000).toFixed(1)}s before retry... (Attempt ${attempt + 2}/${maxRetries})`);
        console.log(`   💡 TIP: Testnet RPCs are heavily rate limited. This is normal, please wait...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      // If not rate limited or max retries exceeded, throw the error
      if (isRateLimited && attempt >= maxRetries - 1) {
        throw new Error(`${actionName} failed after ${maxRetries} attempts due to severe RPC rate limiting. Please wait 1-2 minutes and try again. Testnet RPCs have strict limits during high usage.`);
      }
      throw error;
    }
  }
  throw new Error(`Max retries exceeded for ${actionName}`);
}

/**
 * Supply USDC to Aave V3 Pool
 * 
 * This function:
 * 1. Approves Aave pool to spend USDC
 * 2. Calls supply() on Aave pool
 * 3. Waits for both transactions to confirm
 * 4. Includes retry logic for rate-limited requests
 * 
 * @param params - Supply parameters
 * @returns Supply result with transaction hashes
 */
export async function supplyToAave(
  params: SupplyToAaveParams
): Promise<SupplyResult> {
  try {
    const { chainId, amount, userAddress, walletClient, publicClient } = params;

    // Get contract addresses
    const usdcAddress = USDC_ADDRESSES[chainId];
    const aavePoolAddress = AAVE_V3_POOL_ADDRESSES[chainId];

    if (!usdcAddress || !aavePoolAddress) {
      throw new Error(`Contracts not available on chain ${chainId}`);
    }

    // Check if Aave pool is valid (not placeholder)
    if (aavePoolAddress === "0x0000000000000000000000000000000000000000") {
      throw new Error(`Aave V3 is not deployed on this chain`);
    }

    // Convert amount to wei (USDC has 6 decimals)
    const amountWei = parseUnits(amount, USDC_DECIMALS);

    console.log("💰 Starting Aave supply process...");
    console.log("   USDC Address:", usdcAddress);
    console.log("   Aave Pool:", aavePoolAddress);
    console.log("   Amount:", amount, "USDC");
    console.log("   Amount (wei):", amountWei.toString());

    // Check user's USDC balance first
    console.log("🔍 Checking USDC balance...");
    const balance = await publicClient.readContract({
      address: usdcAddress,
      abi: ERC20_ABI,
      functionName: "balanceOf",
      args: [userAddress],
    });

    console.log("   User balance:", balance.toString(), "USDC (wei)");
    
    if (balance < amountWei) {
      throw new Error(`Insufficient USDC balance. You have ${Number(balance) / 1e6} USDC but trying to supply ${amount} USDC`);
    }

    // Additional validation: Check if amount is valid
    if (amountWei <= BigInt(0)) {
      throw new Error(`Invalid amount: ${amount} USDC. Amount must be greater than 0.`);
    }

    // Check reserve status on Aave
    console.log("🔍 Checking Aave reserve status...");
    try {
      const reserveData = await publicClient.readContract({
        address: aavePoolAddress,
        abi: AAVE_POOL_ABI,
        functionName: "getReserveData",
        args: [usdcAddress],
      });
      
      // Check if reserve has an aToken (means it's initialized)
      if (reserveData.aTokenAddress === "0x0000000000000000000000000000000000000000") {
        throw new Error("USDC reserve is not initialized on Aave. This asset may not be supported on this testnet.");
      }
      
      console.log("✅ Reserve is active. aToken:", reserveData.aTokenAddress);
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.warn("⚠️ Could not verify reserve status:", errorMsg);
      console.warn("   Proceeding anyway, but transaction may fail if reserve is not properly configured.");
    }

    // Step 1: Approve USDC spending (with retry for rate limiting)
    console.log("📝 Step 1: Approving USDC spending...");
    
    const approvalHash = await executeWithRetry(
      async () => {
        return await walletClient.writeContract({
          address: usdcAddress,
          abi: ERC20_ABI,
          functionName: "approve",
          args: [aavePoolAddress, amountWei],
          chain: walletClient.chain,
          account: userAddress,
          gas: BigInt(100000), // Set reasonable gas limit for approval
        });
      },
      "Approval"
    );

    console.log("✅ Approval transaction sent:", approvalHash);
    console.log("⏳ Waiting for approval confirmation...");

    // Wait for approval to confirm (with retry for rate limiting)
    const approvalReceipt = await executeWithRetry(
      async () => {
        return await publicClient.waitForTransactionReceipt({
          hash: approvalHash,
        });
      },
      "Approval confirmation"
    );

    if (approvalReceipt.status !== "success") {
      throw new Error("Approval transaction failed");
    }

    console.log("✅ Approval confirmed!");
    
    // Add a delay between transactions to avoid rate limiting (increased for testnet)
    console.log("⏳ Waiting 5s before supply transaction to avoid rate limits...");
    await new Promise(resolve => setTimeout(resolve, 5000)); // Increased from 2s to 5s

    // Step 2: Supply to Aave (with retry for rate limiting)
    console.log("📝 Step 2: Supplying to Aave...");

    const supplyHash = await executeWithRetry(
      async () => {
        return await walletClient.writeContract({
          address: aavePoolAddress,
          abi: AAVE_POOL_ABI,
          functionName: "supply",
          args: [
            usdcAddress, // asset
            amountWei, // amount
            userAddress, // onBehalfOf
            0, // referralCode
          ],
          chain: walletClient.chain,
          account: userAddress,
          gas: BigInt(500000), // Set reasonable gas limit for supply (Aave can be gas-intensive)
        });
      },
      "Supply"
    );

    console.log("✅ Supply transaction sent:", supplyHash);
    console.log("⏳ Waiting for supply confirmation...");

    // Wait for supply to confirm (with retry for rate limiting)
    const supplyReceipt = await executeWithRetry(
      async () => {
        return await publicClient.waitForTransactionReceipt({
          hash: supplyHash,
        });
      },
      "Supply confirmation"
    );

    if (supplyReceipt.status !== "success") {
      throw new Error("Supply transaction failed");
    }

    console.log("✅ Supply confirmed!");
    console.log("🎉 Successfully supplied", amount, "USDC to Aave V3!");

    // Get explorer URL
    const explorerUrl = getExplorerUrl(chainId, supplyHash);

    return {
      success: true,
      approvalHash,
      supplyHash,
      explorerUrl,
    };
  } catch (error) {
    console.error("❌ Error supplying to Aave:", error);
    
    // Extract detailed error message
    let errorMessage = "Unknown error";
    if (error instanceof Error) {
      errorMessage = error.message;
      // Log full error details for debugging
      console.error("Full error details:", {
        message: error.message,
        stack: error.stack,
        error: error,
      });
    }
    
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Get block explorer URL for a transaction
 */
function getExplorerUrl(chainId: SupportedChainId, txHash: string): string {
  const explorers: Record<SupportedChainId, string> = {
    11155111: "https://sepolia.etherscan.io/tx/", // Sepolia
    80002: "https://amoy.polygonscan.com/tx/", // Polygon Amoy
    421614: "https://sepolia.arbiscan.io/tx/", // Arbitrum Sepolia
    84532: "https://sepolia.basescan.org/tx/", // Base Sepolia
  };

  return `${explorers[chainId]}${txHash}`;
}

