"use client";

import { useAccount, useReadContracts } from "wagmi";
import { formatUnits } from "viem";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Skeleton } from "./ui/skeleton";
import { USDC_ADDRESSES, USDC_DECIMALS, CHAIN_METADATA, SUPPORTED_CHAINS } from "@/lib/constants";

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

const USDCBalance = () => {
  const { address, isConnected } = useAccount();

  // Setup contract calls for all supported chains
  const contracts = SUPPORTED_CHAINS.map((chainId) => ({
    address: USDC_ADDRESSES[chainId],
    abi: erc20ABI,
    functionName: "balanceOf",
    args: [address as `0x${string}`],
    chainId: chainId,
  }));

  const { data, isError, isLoading } = useReadContracts({
    contracts,
    query: {
      enabled: isConnected && !!address,
      refetchInterval: 10000, // Refetch every 10 seconds
    },
  });

  // Don't show component if wallet is not connected
  if (!isConnected || !address) {
    return null;
  }

  // Calculate total balance
  const calculateTotal = () => {
    if (!data || isError) return "0.00";

    const total = data.reduce((sum, result) => {
      if (result.status === "success" && result.result) {
        return sum + Number(formatUnits(result.result as bigint, USDC_DECIMALS));
      }
      return sum;
    }, 0);

    return total.toFixed(2);
  };

  // Format individual balance
  const formatBalance = (value: bigint | undefined) => {
    if (!value) return "0.00";
    return Number(formatUnits(value, USDC_DECIMALS)).toFixed(2);
  };

  return (
    <Card className="w-full bg-white/80 backdrop-blur-sm shadow-lg border-teal-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">💰</span>
          <span>Your USDC Balance</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Total Balance */}
        <div className="bg-gradient-to-r from-teal-500 to-blue-500 rounded-lg p-4 text-white">
          <p className="text-sm font-medium opacity-90">Total Balance</p>
          {isLoading ? (
            <Skeleton className="h-8 w-32 mt-1 bg-white/20" />
          ) : (
            <p className="text-3xl font-bold">${calculateTotal()}</p>
          )}
        </div>

        {/* Individual Chain Balances */}
        <div className="space-y-3">
          <p className="text-sm font-semibold text-gray-600">By Chain</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {SUPPORTED_CHAINS.map((chainId, index) => {
              const chainInfo = CHAIN_METADATA[chainId];
              const result = data?.[index];

              return (
                <div
                  key={chainId}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-teal-300 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <img
                      src={chainInfo.logo}
                      alt={chainInfo.name}
                      className="w-6 h-6 rounded-full"
                      onError={(e) => {
                        e.currentTarget.src = "https://via.placeholder.com/24";
                      }}
                    />
                    <span className="font-medium text-sm text-gray-700">
                      {chainInfo.name}
                    </span>
                  </div>

                  {isLoading ? (
                    <Skeleton className="h-5 w-16" />
                  ) : isError || result?.status === "failure" ? (
                    <span className="text-xs text-red-500">Error</span>
                  ) : (
                    <span className="font-semibold text-gray-900">
                      ${formatBalance(result?.result as bigint)}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Connected Address */}
        <div className="pt-2 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Connected:{" "}
            <span className="font-mono">
              {address.slice(0, 6)}...{address.slice(-4)}
            </span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default USDCBalance;

