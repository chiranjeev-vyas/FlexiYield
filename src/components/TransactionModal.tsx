"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import {
  CheckCircle2,
  XCircle,
  Loader2,
  ExternalLink,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  txStatus: "idle" | "approving" | "bridging" | "supplying" | "success" | "error";
  txHash: string | null;
  error: string | null;
  destinationChain: string;
  amount: string;
  onRetry?: () => void;
  isCrossChain?: boolean; // NEW: to distinguish cross-chain vs same-chain
}

type StepStatus = "pending" | "active" | "success" | "error" | "idle";

interface Step {
  id: number;
  title: string;
  description: string;
  status: StepStatus;
}

const TransactionModal = ({
  isOpen,
  onClose,
  txStatus,
  txHash,
  error,
  destinationChain,
  amount,
  onRetry,
  isCrossChain = true, // Default to true for backwards compatibility
}: TransactionModalProps) => {
  // Map transaction status to step statuses
  const getStepStatus = (stepId: number): StepStatus => {
    // For same-chain: approving -> supplying -> success (3 steps)
    // For cross-chain: approving -> bridging -> supplying -> success (4 steps)
    const statusMap: Record<string, number> = isCrossChain
      ? {
          idle: 0,
          approving: 1,
          bridging: 2,
          supplying: 3,
          success: 4,
          error: -1,
        }
      : {
          idle: 0,
          approving: 1,
          supplying: 2,
          success: 3,
          error: -1,
        };

    const currentStep = statusMap[txStatus];
    const maxSteps = isCrossChain ? 4 : 3;

    if (txStatus === "error") {
      return "error";
    }

    // Special case: when transaction is successful, all steps including the final one should show success
    if (txStatus === "success" && stepId <= maxSteps) {
      return "success";
    }

    if (stepId < currentStep) {
      return "success";
    } else if (stepId === currentStep) {
      return "active";
    } else if (stepId > currentStep) {
      return "pending";
    }

    return "idle";
  };

  // Dynamically build steps based on whether it's cross-chain or not
  const steps: Step[] = isCrossChain
    ? [
        {
          id: 1,
          title: "Approve Transaction",
          description: "Confirm the transaction in your wallet",
          status: getStepStatus(1),
        },
        {
          id: 2,
          title: "Bridge USDC",
          description: `Bridging ${amount} USDC to ${destinationChain}`,
          status: getStepStatus(2),
        },
        {
          id: 3,
          title: "Supply to Aave",
          description: "Depositing USDC into Aave V3 pool",
          status: getStepStatus(3),
        },
        {
          id: 4,
          title: txStatus === "error" ? "Transaction Failed" : "Complete",
          description:
            txStatus === "error"
              ? "Your transaction encountered an error"
              : "Your USDC is now earning yield!",
          status: getStepStatus(4),
        },
      ]
    : [
        {
          id: 1,
          title: "Approve & Supply",
          description: "Confirm the transaction in your wallet",
          status: getStepStatus(1),
        },
        {
          id: 2,
          title: "Supply to Aave V3",
          description: `Depositing ${amount} USDC to Aave on ${destinationChain}`,
          status: getStepStatus(2),
        },
        {
          id: 3,
          title: txStatus === "error" ? "Transaction Failed" : "Complete",
          description:
            txStatus === "error"
              ? "Your transaction encountered an error"
              : "Your USDC is now earning yield!",
          status: getStepStatus(3),
        },
      ];

  const StepIcon = ({ status }: { status: StepStatus }) => {
    switch (status) {
      case "success":
        return (
          <CheckCircle2 className="w-6 h-6 text-green-600 animate-in fade-in zoom-in duration-300" />
        );
      case "error":
        return (
          <XCircle className="w-6 h-6 text-red-600 animate-in fade-in zoom-in duration-300" />
        );
      case "active":
        return (
          <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
        );
      case "pending":
        return (
          <div className="w-6 h-6 rounded-full border-2 border-gray-300 bg-gray-100" />
        );
      default:
        return (
          <div className="w-6 h-6 rounded-full border-2 border-gray-300 bg-white" />
        );
    }
  };

  const getExplorerUrl = () => {
    if (!txHash) return null;
    
    // If txHash is already a full URL, return it as is
    if (txHash.startsWith("http")) {
      return txHash;
    }
    
    // Otherwise, construct the URL based on chain name
    // Map chain names to testnet explorer URLs
    const explorers: Record<string, string> = {
      "Sepolia": `https://sepolia.etherscan.io/tx/${txHash}`,
      "Polygon Amoy": `https://amoy.polygonscan.com/tx/${txHash}`,
      "Arbitrum Sepolia": `https://sepolia.arbiscan.io/tx/${txHash}`,
      "Base Sepolia": `https://sepolia.basescan.org/tx/${txHash}`,
    };
    return explorers[destinationChain] || null;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl font-bold">
            {txStatus === "success"
              ? "🎉 Transaction Successful"
              : txStatus === "error"
              ? "❌ Transaction Failed"
              : "Processing Transaction"}
          </DialogTitle>
          <DialogDescription className="text-sm">
            {txStatus === "success"
              ? "Your transaction has been completed successfully"
              : txStatus === "error"
              ? "Your transaction could not be completed"
              : "Please wait while we process your transaction"}
          </DialogDescription>
        </DialogHeader>

        {/* Progress Stepper */}
        <div className="py-6">
          <div className="space-y-6">
            {steps.map((step, index) => (
              <div key={step.id} className="relative">
                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      "absolute left-3 top-8 w-0.5 h-12 transition-colors duration-500",
                      step.status === "success"
                        ? "bg-green-600"
                        : step.status === "active"
                        ? "bg-blue-600"
                        : "bg-gray-300"
                    )}
                  />
                )}

                {/* Step Content */}
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="flex-shrink-0 mt-0.5">
                    <StepIcon status={step.status} />
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <h4
                      className={cn(
                        "text-sm font-semibold transition-colors",
                        step.status === "success"
                          ? "text-green-700"
                          : step.status === "error"
                          ? "text-red-700"
                          : step.status === "active"
                          ? "text-blue-700"
                          : "text-gray-500"
                      )}
                    >
                      {step.title}
                    </h4>
                    <p
                      className={cn(
                        "text-xs mt-1 transition-colors",
                        step.status === "active"
                          ? "text-gray-700"
                          : "text-gray-500"
                      )}
                    >
                      {step.description}
                    </p>
                  </div>

                  {/* Time indicator for active step */}
                  {step.status === "active" && (
                    <div className="flex-shrink-0">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                        Processing
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Testnet Delay Warning */}
        {txStatus === "bridging" && (
          <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="rounded-lg bg-amber-50 border border-amber-200 p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-amber-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-amber-800">
                    ⏳ Testnet Bridging in Progress
                  </h3>
                  <p className="text-sm text-amber-700 mt-1">
                    Testnet bridges can take <strong>2-10 minutes</strong> to complete. This is normal!
                  </p>
                  <p className="text-xs text-amber-600 mt-2">
                    💡 Tip: Check your browser console (F12) for detailed logs
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    🔄 MetaMask Interaction Required
                  </h3>
                  <p className="text-sm text-blue-700 mt-1">
                    1. <strong>Network Switch:</strong> Approve when MetaMask asks to switch networks<br/>
                    2. <strong>Bridge Transaction:</strong> Approve the bridge transaction popup<br/>
                    3. <strong>If no popup:</strong> Check your browser console (F12) for errors
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {txStatus === "error" && error && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-4">
            <div className="flex">
              <XCircle className="h-5 w-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-red-800">
                  Transaction Error
                </h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Transaction Hash */}
        {txHash && (
          <div className="rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 p-4 shadow-sm">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-900">
                  🔗 Transaction Details
                </p>
                {txStatus === "success" && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    ✓ Confirmed
                  </span>
                )}
              </div>
              
              <div className="bg-white rounded-md p-3 border border-gray-200">
                <p className="text-xs font-medium text-gray-600 mb-1.5">Transaction Hash:</p>
                <p className="text-xs font-mono text-gray-800 break-all leading-relaxed">
                  {txHash.startsWith("http") ? txHash.split("/tx/")[1] || txHash : txHash}
                </p>
              </div>

              {getExplorerUrl() && (
                <a
                  href={getExplorerUrl()!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <ExternalLink className="w-4 h-4" />
                  View on Block Explorer
                  <ArrowRight className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        )}

        {/* Success Info */}
        {txStatus === "success" && (
          <div className="rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 p-5 shadow-md animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex flex-col items-center text-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-500 shadow-lg">
                <CheckCircle2 className="h-7 w-7 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-green-900 mb-1">
                  🎉 Transaction Complete!
                </h3>
                <p className="text-base text-green-800 font-medium">
                  <span className="font-bold text-green-900">{amount} USDC</span> has been successfully supplied to Aave V3 on{" "}
                  <span className="font-bold text-green-900">{destinationChain}</span>
                </p>
                <p className="text-sm text-green-700 mt-2">
                  💰 You're now earning yield! Check your position on{" "}
                  <a 
                    href="https://staging.aave.com/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="underline hover:text-green-900 font-medium"
                  >
                    Aave Dashboard
                  </a>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          {txStatus === "error" && onRetry && (
            <Button
              variant="outline"
              onClick={() => {
                onClose();
                setTimeout(() => onRetry(), 300);
              }}
              className="flex-1 w-full border-teal-600 text-teal-600 hover:bg-teal-50"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry Transaction
            </Button>
          )}
          <Button
            onClick={onClose}
            className={cn(
              "flex-1 w-full",
              txStatus === "error" ? "bg-red-600 hover:bg-red-700 text-white" : ""
            )}
            disabled={
              txStatus !== "success" && txStatus !== "error"
            }
          >
            {txStatus === "success" || txStatus === "error"
              ? "Close"
              : "Processing..."}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TransactionModal;

