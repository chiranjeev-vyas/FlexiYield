"use client";

import { useState, useMemo, useEffect } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Skeleton } from "./ui/skeleton";
import TransactionModal from "./TransactionModal";
import { useNexus } from "@/providers/NexusProvider";
import { useTransactionHistoryContext } from "@/providers/TransactionHistoryProvider";
// import useListenTransaction from "@/hooks/useListenTransactions";
import { useAccount, useReadContracts, useWalletClient, usePublicClient } from "wagmi";
import { formatUnits } from "viem";
import toast from "react-hot-toast";
import {
  createBridgeAndSupplyIntent,
  type SupportedChainId,
} from "@/lib/nexus-helper";
import { supplyToAave } from "@/lib/aave-supply";
import {
  USDC_ADDRESSES,
  USDC_DECIMALS,
  SUPPORTED_CHAINS,
  isSupportedChain,
  isAaveAvailable,
  getUSDCAddress,
  getAavePoolAddress,
  getChainName,
  getChainMetadata,
} from "@/lib/constants";
import { parseError, logError, isUserRejection } from "@/lib/error-handler";
import { AlertCircle, Loader2 } from "lucide-react";
import { fetchAllAaveAPYs } from "@/lib/aave-helper";

interface YieldData {
  chain: string;
  chainLogo: string;
  protocol: string;
  apy: number;
  tvl: string;
  chainId: number;
}

// Minimal ERC20 ABI for balanceOf
const erc20ABI = [
  {
    inputs: [{ name: "_owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "balance", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

type TxStatus = "idle" | "approving" | "bridging" | "supplying" | "success" | "error";

// Skeleton loader component for table
const YieldTableSkeleton = () => (
  <div className="space-y-4">
    {/* Desktop skeleton */}
    <div className="hidden md:block overflow-x-auto rounded-lg border border-border shadow-lg bg-white">
      <table className="w-full">
        <thead className="bg-muted/50">
          <tr>
            <th className="text-left p-4 font-semibold text-sm">Chain</th>
            <th className="text-left p-4 font-semibold text-sm">Protocol</th>
            <th className="text-right p-4 font-semibold text-sm">APY</th>
            <th className="text-right p-4 font-semibold text-sm">TVL</th>
            <th className="text-left p-4 font-semibold text-sm">Amount (USDC)</th>
            <th className="text-center p-4 font-semibold text-sm">Action</th>
          </tr>
        </thead>
        <tbody className="bg-card">
          {[1, 2, 3, 4].map((i) => (
            <tr key={i} className="border-t border-border">
              <td className="p-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-8 h-8 rounded-full" />
                  <Skeleton className="h-5 w-24" />
                </div>
              </td>
              <td className="p-4">
                <Skeleton className="h-4 w-16" />
              </td>
              <td className="p-4 text-right">
                <div className="flex justify-end">
                  <Skeleton className="h-6 w-16" />
                </div>
              </td>
              <td className="p-4 text-right">
                <Skeleton className="h-5 w-20" />
              </td>
              <td className="p-4">
                <div className="flex gap-1">
                  <Skeleton className="h-9 flex-1" />
                  <Skeleton className="h-9 w-16" />
                </div>
              </td>
              <td className="p-4">
                <div className="flex justify-center">
                  <Skeleton className="h-9 w-20" />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {/* Mobile skeleton */}
    <div className="md:hidden space-y-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="rounded-lg border bg-white p-4 shadow-md">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div>
                <Skeleton className="h-5 w-24 mb-1" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <Skeleton className="h-20 rounded-md" />
            <Skeleton className="h-20 rounded-md" />
          </div>
          <div className="space-y-2 mb-3">
            <Skeleton className="h-4 w-32" />
            <div className="flex gap-2">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 w-16" />
            </div>
          </div>
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
    </div>
  </div>
);

const YieldTable = () => {
  const { nexusSDK, intentRefCallback } = useNexus();
  const { address, isConnected, chain } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const { addTransaction, updateTransaction } = useTransactionHistoryContext();
  
  // Always on testnet
  const isTestnet = true;
  
  // Listen for Nexus SDK transaction events (currently unused but may be needed for future features)
  // const { processing, explorerURL } = useListenTransaction({
  //   sdk: nexusSDK!,
  //   type: "bridge",
  // });

  // Create initial yield data dynamically based on config
  const initialYieldData = useMemo<YieldData[]>(() => {
    return SUPPORTED_CHAINS.map((chainId) => ({
      chain: getChainName(chainId),
      chainLogo: getChainMetadata(chainId)?.logo || "https://via.placeholder.com/24",
      protocol: isAaveAvailable(chainId) ? `Aave V3 ${isTestnet ? "Testnet" : ""}` : "Aave V3 (Not Available)",
      apy: 0,
      tvl: isAaveAvailable(chainId) ? "Loading..." : "Not Available",
      chainId,
    }));
  }, [isTestnet]);

  // Yield data state (will be populated with real APY)
  const [yieldData, setYieldData] = useState<YieldData[]>(initialYieldData);

  // Update yield data when config changes (network mode toggle)
  useEffect(() => {
    setYieldData(initialYieldData);
  }, [initialYieldData]);

  // Amount inputs for each chain (chainId -> amount string)
  const [amounts, setAmounts] = useState<Record<number, string>>({});
  
  // Simulate initial loading state
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  
  // Calculate highest APY dynamically
  const highestAPY = useMemo(() => {
    return Math.max(...yieldData.map((item) => item.apy));
  }, [yieldData]);

  // Transaction state
  const [selectedChain, setSelectedChain] = useState<YieldData | null>(null);
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [txStatus, setTxStatus] = useState<TxStatus>("idle");
  const [txHash, setTxHash] = useState<string | null>(null);
  const [txError, setTxError] = useState<string | null>(null);
  const [loadingChainId, setLoadingChainId] = useState<number | null>(null);
  const [currentTxAmount, setCurrentTxAmount] = useState<string>("0"); // Store amount separately
  const [isCrossChainTx, setIsCrossChainTx] = useState<boolean>(false); // Track if current tx is cross-chain
  const [lastFailedTransaction, setLastFailedTransaction] = useState<{
    yieldData: YieldData;
    amount: string;
  } | null>(null);

  // Get user's USDC balance on their current chain
  const usdcAddress = chain?.id ? USDC_ADDRESSES[chain.id as keyof typeof USDC_ADDRESSES] : undefined;
  
  const { data: balanceData, isLoading: isBalanceLoading, refetch: refetchBalance } = useReadContracts({
    contracts: usdcAddress ? [{
      address: usdcAddress as `0x${string}`,
      abi: erc20ABI,
      functionName: "balanceOf",
      args: [address as `0x${string}`],
      chainId: chain?.id,
    }] : [],
    query: {
      enabled: isConnected && !!address && !!usdcAddress,
      refetchInterval: 30000, // Increased from 10s to 30s to avoid rate limits
      retry: 3, // Retry failed requests
      retryDelay: 2000, // Wait 2s between retries
    },
  });

  // Parse user's balance
  const userBalance = useMemo(() => {
    if (!balanceData?.[0] || balanceData[0].status !== "success") {
      console.log("❌ No balance data or fetch failed:", balanceData);
      return 0;
    }
    const balance = Number(formatUnits(balanceData[0].result as bigint, USDC_DECIMALS));
    console.log(`💰 User Balance on ${chain?.name} (${chain?.id}):`, balance, "USDC");
    console.log(`📍 USDC Address used:`, usdcAddress);
    return balance;
  }, [balanceData, chain, usdcAddress]);

  // Fetch real APY data from Aave V3 on component mount
  useEffect(() => {
    const fetchAPYData = async () => {
      console.log("🔄 Fetching real APY data from Aave V3...");
      
      try {
        // Prepare chain configurations for chains that have Aave
        const chains = SUPPORTED_CHAINS
          .filter(chainId => isAaveAvailable(chainId))
          .map(chainId => ({
            chainId: chainId as SupportedChainId,
            usdcAddress: getUSDCAddress(chainId)!,
            poolAddress: getAavePoolAddress(chainId)!,
          }));

        // Fetch APY data for all chains
        const apyData = await fetchAllAaveAPYs(chains);

        // Update yield data with real APY
        setYieldData((prevData) =>
          prevData.map((item) => {
            const chainAPY = apyData[item.chainId];
            
            if (chainAPY && chainAPY.apy !== null) {
              return {
                ...item,
                apy: chainAPY.apy,
                tvl: chainAPY.tvl || "Test Tokens",
                protocol: "Aave V3 Testnet",
              };
            }
            
            return item;
          })
        );

        console.log("✅ APY data updated successfully");
      } catch (error) {
        console.error("❌ Error fetching APY data:", error);
        // Keep showing initial data if fetch fails
        toast.error("Failed to fetch APY data - Using fallback values", {
          duration: 3000,
        });
      }
    };

    fetchAPYData();
  }, []);

  // Simulate initial data loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  // Update amount for specific chain
  const handleAmountChange = (chainId: number, value: string) => {
    setAmounts(prev => ({ ...prev, [chainId]: value }));
  };

  // Set max amount (user's full balance)
  const handleMaxClick = (chainId: number) => {
    setAmounts(prev => ({ ...prev, [chainId]: userBalance.toString() }));
  };

  // Validate amount for a specific chain
  const validateAmount = (chainId: number): { isValid: boolean; error: string | null } => {
    const amount = amounts[chainId] || "";
    
    if (!amount || amount.trim() === "") {
      return { isValid: false, error: null };
    }

    const amountNum = parseFloat(amount);
    
    if (isNaN(amountNum)) {
      return { isValid: false, error: "Invalid amount" };
    }

    if (amountNum <= 0) {
      return { isValid: false, error: "Amount must be greater than 0" };
    }

    // For cross-chain transactions, check balance on SOURCE chain (current chain)
    // The user can bridge FROM their current chain TO the destination chain
    const isCrossChain = chain?.id !== chainId;
    
    if (isCrossChain) {
      // Cross-chain: Check if user has balance on their CURRENT chain (source)
      if (amountNum > userBalance) {
        return { 
          isValid: false, 
          error: `Insufficient balance on ${chain?.name || 'current chain'} (${userBalance.toFixed(2)} USDC available)` 
        };
      }
    } else {
      // Same-chain: Check if user has balance on the destination chain
      if (amountNum > userBalance) {
        return { 
          isValid: false, 
          error: `Insufficient balance (${userBalance.toFixed(2)} USDC available)` 
        };
      }
    }

    return { isValid: true, error: null };
  };

  // Retry a failed transaction
  const handleRetry = () => {
    if (lastFailedTransaction) {
      handleSupplyClick(lastFailedTransaction.yieldData);
    }
  };

  const handleSupplyClick = async (yieldData: YieldData) => {
    if (!isConnected) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (!nexusSDK || !nexusSDK.isInitialized()) {
      toast.error("Please initialize Nexus SDK first - Click the 'Connect Nexus' button above");
      return;
    }

    // Check if Aave is available on destination chain
    if (!isAaveAvailable(yieldData.chainId)) {
      toast.error(`Aave V3 is not deployed on ${yieldData.chain}. Please select Sepolia instead.`, {
        duration: 6000,
      });
      return;
    }

    // Early validation: Check if user's current chain is supported
    if (!chain || !isSupportedChain(chain.id)) {
      const supportedChainNames = SUPPORTED_CHAINS.map((id) => getChainName(id)).join(", ");
      toast.error(`Unsupported Network - Please switch to ${supportedChainNames}`);
      return;
    }

    // Validate amount
    const validation = validateAmount(yieldData.chainId);
    if (!validation.isValid) {
      if (validation.error) {
        toast.error(validation.error);
      }
      return;
    }

    const amount = amounts[yieldData.chainId];

    // Additional check for cross-chain transactions
    const isCrossChain = chain.id !== yieldData.chainId;
    if (isCrossChain && userBalance === 0) {
      toast.error(`No Balance on ${chain.name}. Switch to a chain where you have USDC to bridge from there.`, {
        duration: 6000,
      });
      return;
    }

    // Show warning about testnet rate limiting
    toast.loading("Starting transaction... Testnet RPCs may be slow due to rate limiting. Please be patient.", {
      duration: 8000,
      id: "tx-start",
    });

    // Start transaction
    setSelectedChain(yieldData);
    setCurrentTxAmount(amount); // Store amount for modal display
    setIsCrossChainTx(chain.id !== yieldData.chainId); // Set cross-chain flag
    setIsTxModalOpen(true);
    setLoadingChainId(yieldData.chainId);
    setTxStatus("approving");
    setTxError(null);
    setTxHash(null);

    // Add transaction to history
    const txId = addTransaction({
      hash: null,
      explorerUrl: null,
      sourceChain: chain.name,
      sourceChainId: chain.id,
      destinationChain: yieldData.chain,
      destinationChainId: yieldData.chainId,
      amount,
      status: "pending",
    });

    try {
      const sourceChainId = chain.id as SupportedChainId;
      const destinationChainId = yieldData.chainId as SupportedChainId;

      console.log("Starting transaction flow...");
      console.log("Source Chain:", chain.name, sourceChainId);
      console.log("Destination Chain:", yieldData.chain, destinationChainId);
      console.log("Amount:", amount, "USDC");

      const aavePoolAddress = getAavePoolAddress(destinationChainId);
      console.log("Aave Pool Address:", aavePoolAddress);

      // Check if same-chain - use direct Aave supply
      const isSameChain = sourceChainId === destinationChainId;

      if (isSameChain) {
        // Direct Aave supply (no bridge needed)
        if (!walletClient || !publicClient) {
          throw new Error("Wallet client not available");
        }

        console.log("✅ Same-chain detected - supplying directly to Aave");
        console.log("📊 Transaction Parameters:");
        console.log("   Amount (string):", amount);
        console.log("   Amount type:", typeof amount);
        console.log("   Amount parsed:", parseFloat(amount));
        console.log("   User Address:", address);
        console.log("   Chain ID:", destinationChainId);
        console.log("   USDC Address:", getUSDCAddress(destinationChainId));
        console.log("   Aave Pool Address:", getAavePoolAddress(destinationChainId));
        console.log("   User Balance (from state):", userBalance);
        console.log("   Connected Chain:", chain.name, chain.id);
        
        // Double-check that we have a valid amount
        const amountFloat = parseFloat(amount);
        if (isNaN(amountFloat) || amountFloat <= 0) {
          throw new Error(`Invalid amount: ${amount}. Please enter a valid number greater than 0.`);
        }
        
        setTxStatus("approving");
        
        // Call actual Aave supply function
        const result = await supplyToAave({
          chainId: destinationChainId,
          amount,
          userAddress: address!,
          walletClient,
          publicClient,
        });

        if (result.success) {
          toast.dismiss("tx-start"); // Dismiss the loading toast
          setTxStatus("success");
          setTxHash(result.explorerUrl || result.supplyHash || null);
          console.log("✅ Supply successful!");
          
          toast.success(`Successfully Supplied ${amount} USDC to Aave! Now earning ${yieldData.apy}% APY`, {
            duration: 8000,
          });
          
          // Update transaction in history
          updateTransaction(txId, {
            status: "success",
            hash: result.supplyHash || null,
            explorerUrl: result.explorerUrl || null,
          });
          
          // Clear the amount after success
          setAmounts(prev => ({ ...prev, [yieldData.chainId]: "" }));
          setLastFailedTransaction(null);
        } else {
          throw new Error(result.error || "Supply failed");
        }
      } else {
        // Cross-chain: use Nexus bridge
        setTxStatus("bridging");

        console.log(`🔍 Starting bridge from ${getChainName(sourceChainId)} → ${getChainName(destinationChainId)}`);
        console.log(`   Note: Nexus SDK may switch your network during the transaction.`);
        console.log(`   This is normal behavior for cross-chain bridging.`);

        const result = await createBridgeAndSupplyIntent(nexusSDK, {
          sourceChainId,
          destinationChainId,
          amount,
          userAddress: address!,
          aavePoolAddress,
        });

        console.log("Transaction result:", result);

        if (result.success) {
          toast.dismiss("tx-start"); // Dismiss the loading toast
          setTxStatus("success");
          setTxHash(result.explorerUrl || result.transactionHash || null);
          console.log("✅ Bridge successful!");
          
          toast.success(`Bridge Successful! ${amount} USDC bridged to ${yieldData.chain}. Visit Aave to supply.`, {
            duration: 8000,
          });
          
          // Update transaction in history
          updateTransaction(txId, {
            status: "success",
            hash: result.transactionHash || null,
            explorerUrl: result.explorerUrl || null,
          });
          
          // Clear the amount after success
          setAmounts(prev => ({ ...prev, [yieldData.chainId]: "" }));
          setLastFailedTransaction(null);
        } else {
          throw new Error(result.error || "Bridge failed");
        }
      }
    } catch (error) {
      toast.dismiss("tx-start"); // Dismiss the loading toast
      
      // Log error for debugging
      logError("handleSupplyClick", error);
      
      // Parse error for user-friendly message
      const errorInfo = parseError(error);
      
      setTxStatus("error");
      setTxError(errorInfo.message);
      
      // Store failed transaction for retry
      setLastFailedTransaction({ yieldData, amount });
      
      // Update transaction in history
      updateTransaction(txId, {
        status: "failed",
      });
      
      // Show error toast (unless user rejected)
      if (!isUserRejection(error)) {
        toast.error(`${errorInfo.title}: ${errorInfo.message}`, {
          duration: 5000,
        });
      } else {
        // Just a simple info toast for user rejection
        toast("Transaction Cancelled - You declined the transaction in your wallet", {
          icon: "ℹ️",
        });
      }
    } finally {
      setLoadingChainId(null);
      intentRefCallback.current = null; // Clean up callback
    }
  };

  const handleCloseTxModal = () => {
    setIsTxModalOpen(false);
    // Reset state after modal closes
    setTimeout(() => {
      setTxStatus("idle");
      setTxHash(null);
      setTxError(null);
      setSelectedChain(null);
      setLoadingChainId(null);
      setIsCrossChainTx(false); // Reset cross-chain flag
    }, 300);
  };

  // Show skeleton while loading
  if (isInitialLoading) {
    return (
      <div className="w-full mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold mb-3 text-gray-900">
            USDC Lending Yields
          </h2>
          <p className="text-lg text-gray-600">
            Compare the best yields across different blockchains
          </p>
        </div>
        <YieldTableSkeleton />
      </div>
    );
  }

  return (
    <div className="w-full mx-auto">
      {/* Header */}
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold mb-3 text-gray-900">
          USDC Lending Yields
        </h2>
        <p className="text-lg text-gray-600">
          Compare the best yields across different blockchains
        </p>
      </div>

      {/* Current Chain & Balance Info */}
      {isConnected && chain && (
        <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-lg">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <div className="text-2xl">🔗</div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Connected to: <span className="font-bold">{chain.name}</span> (Chain ID: {chain.id})
                </p>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-gray-600">
                    Your Balance: <span className="font-bold text-blue-600">{userBalance.toFixed(6)} USDC</span>
                    {isBalanceLoading && <span className="ml-2 text-gray-400">(Loading...)</span>}
                  </p>
                  <button
                    onClick={() => refetchBalance()}
                    className="text-xs text-blue-600 hover:text-blue-800 underline"
                    title="Refresh balance"
                  >
                    🔄 Refresh
                  </button>
                </div>
              </div>
            </div>
            <div className="text-sm text-gray-600 bg-white px-3 py-2 rounded-md border border-blue-200">
              <div className="font-semibold text-blue-800 mb-1">💡 How it works:</div>
              <div className="text-xs">Stay on <strong>this chain</strong> to bridge to another</div>
            </div>
          </div>
          {userBalance === 0 && (
            <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-xs text-yellow-800">
                ⚠️ <strong>No USDC on {chain.name}.</strong> Switch to a chain where you have USDC to start bridging.
              </p>
            </div>
          )}
          <details className="mt-3 text-xs">
            <summary className="cursor-pointer text-blue-700 hover:text-blue-900 font-medium">
              🔍 Debug: Show Expected USDC Token Address
            </summary>
            <div className="mt-2 p-3 bg-white rounded-md border border-blue-200">
              <p className="font-semibold text-gray-900 mb-1">Expected USDC Contract on {chain.name}:</p>
              <p className="font-mono text-xs break-all text-gray-700 bg-gray-50 p-2 rounded border border-gray-200">
                {usdcAddress || "⚠️ Not available on this chain"}
              </p>
              <p className="mt-2 text-blue-600 text-xs">
                ℹ️ <strong>Important:</strong> In MetaMask, click your USDC token and verify the contract address matches above.
                If it&apos;s different, you have the wrong USDC token!
              </p>
            </div>
          </details>
        </div>
      )}

      {/* Unsupported Network Warning */}
      {isConnected && chain && !isSupportedChain(chain.id) && (
        <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-yellow-600 mr-3 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-yellow-800 mb-1">
                ⚠️ Unsupported Network: {chain.name}
              </h3>
              <p className="text-sm text-yellow-700 mb-2">
                FlexiYield only supports testnet chains. Please switch your wallet to:
              </p>
              <p className="text-sm font-medium text-yellow-800">
                Sepolia, Polygon Amoy, Arbitrum Sepolia, or Base Sepolia
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto rounded-lg border border-border shadow-lg bg-white">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-4 font-semibold text-sm">Chain</th>
              <th className="text-left p-4 font-semibold text-sm">Protocol</th>
              <th className="text-right p-4 font-semibold text-sm">APY</th>
              <th className="text-right p-4 font-semibold text-sm">TVL</th>
              <th className="text-left p-4 font-semibold text-sm">Amount (USDC)</th>
              <th className="text-center p-4 font-semibold text-sm">Action</th>
            </tr>
          </thead>
          <tbody className="bg-card">
            {yieldData.map((item) => {
              const isBestRate = item.apy === highestAPY && item.apy > 0;
              const validation = validateAmount(item.chainId);
              const amount = amounts[item.chainId] || "";
              
              return (
                <tr
                  key={item.chainId}
                  className={`border-t border-border hover:bg-muted/30 transition-colors ${
                    isBestRate ? "border-l-4 border-l-green-500" : ""
                  }`}
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.chainLogo}
                        alt={item.chain}
                        className="w-8 h-8 rounded-full"
                        onError={(e) => {
                          e.currentTarget.src =
                            "https://via.placeholder.com/32";
                        }}
                      />
                      <span className="font-medium">{item.chain}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-sm text-muted-foreground">
                      {item.protocol}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <span className="text-lg font-bold text-green-600">
                        {item.apy}%
                      </span>
                      {isBestRate && (
                        <Badge
                          variant="default"
                          className="bg-green-500 hover:bg-green-600 text-white text-xs"
                        >
                          Best Rate
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <span className="text-sm font-medium">{item.tvl}</span>
                  </td>
                  <td className="p-4">
                    <div className="space-y-1">
                      <div className="flex gap-1">
                        <Input
                          type="number"
                          placeholder="0.00"
                          value={amount}
                          onChange={(e) => handleAmountChange(item.chainId, e.target.value)}
                          className={`h-9 ${validation.error ? 'border-red-500' : ''}`}
                          min="0"
                          step="0.01"
                          disabled={!isConnected || !chain || !isSupportedChain(chain.id)}
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleMaxClick(item.chainId)}
                          className="h-9 px-3 text-xs whitespace-nowrap"
                          disabled={!isConnected || userBalance === 0 || isBalanceLoading}
                        >
                          {isBalanceLoading ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            "Max"
                          )}
                        </Button>
                      </div>
                      {validation.error && (
                        <p className="text-xs text-red-500">{validation.error}</p>
                      )}
                      {isConnected && userBalance > 0 && !amount && (
                        <p className="text-xs text-muted-foreground">
                          Available: {userBalance.toFixed(2)} USDC
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col items-center gap-1">
                      <Button
                        size="sm"
                        onClick={() => handleSupplyClick(item)}
                        className="min-w-[80px]"
                        disabled={!validation.isValid || loadingChainId !== null || !isAaveAvailable(item.chainId)}
                      >
                        {loadingChainId === item.chainId ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin mr-1" />
                            <span>Processing...</span>
                          </>
                        ) : (
                          "Supply"
                        )}
                      </Button>
                      {!isAaveAvailable(item.chainId) && (
                        <span className="text-xs text-orange-600 font-medium">
                          Not Available
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {yieldData.map((item) => {
          const isBestRate = item.apy === highestAPY && item.apy > 0;
          const validation = validateAmount(item.chainId);
          const amount = amounts[item.chainId] || "";
          
          return (
            <div
              key={item.chainId}
              className={`rounded-lg border bg-white p-4 shadow-md ${
                isBestRate ? "border-green-500 border-2" : "border-border"
              }`}
            >
              {/* Chain Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <img
                    src={item.chainLogo}
                    alt={item.chain}
                    className="w-10 h-10 rounded-full"
                    onError={(e) => {
                      e.currentTarget.src = "https://via.placeholder.com/40";
                    }}
                  />
                  <div>
                    <h3 className="font-semibold">{item.chain}</h3>
                    <p className="text-sm text-muted-foreground">
                      {item.protocol}
                    </p>
                  </div>
                </div>
                {isBestRate && (
                  <Badge
                    variant="default"
                    className="bg-green-500 hover:bg-green-600 text-white"
                  >
                    Best Rate
                  </Badge>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="bg-muted/50 rounded-md p-3">
                  <p className="text-xs text-muted-foreground mb-1">APY</p>
                  <p className="text-xl font-bold text-green-600">
                    {item.apy}%
                  </p>
                </div>
                <div className="bg-muted/50 rounded-md p-3">
                  <p className="text-xs text-muted-foreground mb-1">TVL</p>
                  <p className="text-lg font-semibold">{item.tvl}</p>
                </div>
              </div>

              {/* Amount Input */}
              <div className="space-y-2 mb-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">
                    Amount (USDC)
                  </label>
                  {isConnected && userBalance > 0 && (
                    <span className="text-xs text-muted-foreground">
                      Available: {userBalance.toFixed(2)}
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => handleAmountChange(item.chainId, e.target.value)}
                    className={validation.error ? 'border-red-500' : ''}
                    min="0"
                    step="0.01"
                    disabled={!isConnected || !chain || !isSupportedChain(chain.id)}
                  />
                  <Button
                    variant="outline"
                    onClick={() => handleMaxClick(item.chainId)}
                    className="px-4 whitespace-nowrap"
                    disabled={!isConnected || userBalance === 0 || isBalanceLoading}
                  >
                    {isBalanceLoading ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      "Max"
                    )}
                  </Button>
                </div>
                {validation.error && (
                  <p className="text-xs text-red-500">{validation.error}</p>
                )}
              </div>

              {/* Action Button */}
              <div>
                <Button
                  onClick={() => handleSupplyClick(item)}
                  className="w-full"
                  disabled={!validation.isValid || loadingChainId !== null || !isAaveAvailable(item.chainId)}
                >
                  {loadingChainId === item.chainId ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    "Supply"
                  )}
                </Button>
                {!isAaveAvailable(item.chainId) && (
                  <p className="text-xs text-orange-600 font-medium text-center mt-2">
                    ⚠️ Aave V3 not available on this testnet
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={handleCloseTxModal}
        txStatus={txStatus}
        txHash={txHash}
        error={txError}
        destinationChain={selectedChain?.chain || ""}
        amount={currentTxAmount}
        onRetry={lastFailedTransaction ? handleRetry : undefined}
        isCrossChain={isCrossChainTx}
      />
    </div>
  );
};

export default YieldTable;

