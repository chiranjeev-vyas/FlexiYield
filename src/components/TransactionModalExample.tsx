"use client";

/**
 * Example Usage of TransactionModal Component
 * 
 * This file demonstrates how to integrate the TransactionModal
 * into your supply/bridge functionality.
 */

import { useState } from "react";
import { Button } from "./ui/button";
import TransactionModal from "./TransactionModal";

type TxStatus = "idle" | "approving" | "bridging" | "supplying" | "success" | "error";

const TransactionModalExample = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [txStatus, setTxStatus] = useState<TxStatus>("idle");
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Simulate transaction flow
  const handleSupply = async () => {
    setIsModalOpen(true);
    setTxStatus("approving");
    setError(null);
    setTxHash(null);

    try {
      // Step 1: Approve (simulate 2s delay)
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setTxStatus("bridging");

      // Step 2: Bridge (simulate 3s delay)
      await new Promise((resolve) => setTimeout(resolve, 3000));
      setTxStatus("supplying");

      // Step 3: Supply (simulate 2s delay)
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      // Success!
      setTxStatus("success");
      setTxHash("0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef");
    } catch (err) {
      setTxStatus("error");
      setError(err instanceof Error ? err.message : "Transaction failed");
    }
  };

  const handleClose = () => {
    setIsModalOpen(false);
    // Reset after modal closes
    setTimeout(() => {
      setTxStatus("idle");
      setTxHash(null);
      setError(null);
    }, 300);
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">Transaction Modal Demo</h2>
      
      <div className="space-y-4">
        <Button onClick={handleSupply}>
          Start Transaction (Success Flow)
        </Button>

        <Button
          variant="destructive"
          onClick={async () => {
            setIsModalOpen(true);
            setTxStatus("approving");
            await new Promise((resolve) => setTimeout(resolve, 1000));
            setTxStatus("bridging");
            await new Promise((resolve) => setTimeout(resolve, 1000));
            setTxStatus("error");
            setError("Insufficient funds to complete transaction");
          }}
        >
          Start Transaction (Error Flow)
        </Button>
      </div>

      <TransactionModal
        isOpen={isModalOpen}
        onClose={handleClose}
        txStatus={txStatus}
        txHash={txHash}
        error={error}
        destinationChain="Polygon"
        amount="1000"
      />

      {/* Integration Example Code */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold mb-2">Integration Code:</h3>
        <pre className="text-xs overflow-x-auto">
{`import TransactionModal from "@/components/TransactionModal";

const YourComponent = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [txStatus, setTxStatus] = useState<TxStatus>("idle");
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSupply = async (chain: string, amount: string) => {
    setIsModalOpen(true);
    
    try {
      // Step 1: Approve
      setTxStatus("approving");
      // ... your approval logic
      
      // Step 2: Bridge
      setTxStatus("bridging");
      const result = await nexusSDK.bridge({ ... });
      setTxHash(result.txHash);
      
      // Step 3: Supply to Aave
      setTxStatus("supplying");
      // ... your supply logic
      
      // Success
      setTxStatus("success");
    } catch (error) {
      setTxStatus("error");
      setError(error.message);
    }
  };

  return (
    <>
      <Button onClick={() => handleSupply("Polygon", "1000")}>
        Supply
      </Button>

      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        txStatus={txStatus}
        txHash={txHash}
        error={error}
        destinationChain="Polygon"
        amount="1000"
      />
    </>
  );
};`}
        </pre>
      </div>
    </div>
  );
};

export default TransactionModalExample;


