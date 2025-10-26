"use client";

import { useState } from "react";
import { useTransactionHistoryContext } from "@/providers/TransactionHistoryProvider";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  ArrowRight, 
  ExternalLink,
  Trash2
} from "lucide-react";
import { CHAIN_METADATA } from "@/lib/constants";

type SupportedChainId = number;

const TransactionHistory = () => {
  const { transactions, clearHistory, isLoaded } = useTransactionHistoryContext();
  const [showAll, setShowAll] = useState(false);

  // Format timestamp to readable date
  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  };

  // Shorten transaction hash
  const shortenHash = (hash: string) => {
    if (!hash) return "N/A";
    return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
  };

  // Get status icon and color
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case "pending":
        return {
          icon: <Loader2 className="w-4 h-4 animate-spin" />,
          badge: <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Pending</Badge>,
          color: "text-blue-600",
        };
      case "success":
        return {
          icon: <CheckCircle2 className="w-4 h-4" />,
          badge: <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Success</Badge>,
          color: "text-green-600",
        };
      case "failed":
        return {
          icon: <XCircle className="w-4 h-4" />,
          badge: <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Failed</Badge>,
          color: "text-red-600",
        };
      default:
        return {
          icon: <Clock className="w-4 h-4" />,
          badge: <Badge variant="outline">Unknown</Badge>,
          color: "text-gray-600",
        };
    }
  };

  // Get chain logo
  const getChainLogo = (chainId: number) => {
    const metadata = CHAIN_METADATA[chainId as SupportedChainId];
    return metadata?.logo || "https://via.placeholder.com/24";
  };

  if (!isLoaded) {
    return null;
  }

  const displayedTransactions = showAll ? transactions : transactions.slice(0, 5);

  return (
    <Card className="w-full bg-white/80 backdrop-blur-sm shadow-lg border-gray-200">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Clock className="w-5 h-5 text-gray-600" />
            <span>Transaction History</span>
          </CardTitle>
          {transactions.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearHistory}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 w-full sm:w-auto"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 text-sm">No transactions yet</p>
            <p className="text-gray-400 text-xs mt-1">
              Your cross-chain transactions will appear here
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {displayedTransactions.map((tx) => {
                const statusDisplay = getStatusDisplay(tx.status);

                return (
                  <div
                    key={tx.id}
                    className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:border-teal-300 transition-colors bg-white"
                  >
                    {/* Header: Status and Timestamp */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
                      <div className="flex items-center gap-2">
                        <div className={statusDisplay.color}>
                          {statusDisplay.icon}
                        </div>
                        {statusDisplay.badge}
                      </div>
                      <span className="text-xs text-gray-500">
                        {formatTimestamp(tx.timestamp)}
                      </span>
                    </div>

                    {/* Chain Route */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <img
                          src={getChainLogo(tx.sourceChainId)}
                          alt={tx.sourceChain}
                          className="w-6 h-6 rounded-full flex-shrink-0"
                          onError={(e) => {
                            e.currentTarget.src = "https://via.placeholder.com/24";
                          }}
                        />
                        <span className="text-sm font-medium text-gray-700 truncate">
                          {tx.sourceChain}
                        </span>
                      </div>
                      
                      <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0 hidden sm:block" />
                      <div className="flex sm:hidden w-full justify-center">
                        <ArrowRight className="w-4 h-4 text-gray-400 rotate-90" />
                      </div>
                      
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <img
                          src={getChainLogo(tx.destinationChainId)}
                          alt={tx.destinationChain}
                          className="w-6 h-6 rounded-full flex-shrink-0"
                          onError={(e) => {
                            e.currentTarget.src = "https://via.placeholder.com/24";
                          }}
                        />
                        <span className="text-sm font-medium text-gray-700 truncate">
                          {tx.destinationChain}
                        </span>
                      </div>
                    </div>

                    {/* Amount and Hash */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm">
                      <div>
                        <span className="text-gray-500">Amount: </span>
                        <span className="font-semibold text-gray-900">
                          {tx.amount} USDC
                        </span>
                      </div>
                      {tx.explorerUrl && (
                        <a
                          href={tx.explorerUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-teal-600 hover:text-teal-700 font-mono text-xs"
                        >
                          {shortenHash(tx.explorerUrl)}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                      {!tx.explorerUrl && tx.hash && (
                        <span className="font-mono text-xs text-gray-500">
                          {shortenHash(tx.hash)}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Show More/Less Button */}
            {transactions.length > 5 && (
              <div className="mt-4 text-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAll(!showAll)}
                  className="text-teal-600 hover:text-teal-700 hover:bg-teal-50"
                >
                  {showAll
                    ? "Show Less"
                    : `Show ${transactions.length - 5} More`}
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default TransactionHistory;

