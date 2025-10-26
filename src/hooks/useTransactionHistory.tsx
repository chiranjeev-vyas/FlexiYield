"use client";

import { useState, useEffect, useCallback } from "react";

export type TransactionStatus = "pending" | "success" | "failed";

export interface Transaction {
  id: string;
  hash: string | null;
  explorerUrl: string | null;
  sourceChain: string;
  sourceChainId: number;
  destinationChain: string;
  destinationChainId: number;
  amount: string;
  status: TransactionStatus;
  timestamp: number;
}

const STORAGE_KEY = "flexiyield_transaction_history";
const MAX_TRANSACTIONS = 50; // Keep last 50 transactions

export function useTransactionHistory() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load transactions from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Transaction[];
        setTransactions(parsed);
      }
    } catch (error) {
      console.error("Failed to load transaction history:", error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save transactions to localStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
      } catch (error) {
        console.error("Failed to save transaction history:", error);
      }
    }
  }, [transactions, isLoaded]);

  // Add a new transaction
  const addTransaction = useCallback((transaction: Omit<Transaction, "id" | "timestamp">) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };

    setTransactions((prev) => {
      const updated = [newTransaction, ...prev];
      // Keep only the most recent transactions
      return updated.slice(0, MAX_TRANSACTIONS);
    });

    return newTransaction.id;
  }, []);

  // Update an existing transaction
  const updateTransaction = useCallback((id: string, updates: Partial<Omit<Transaction, "id" | "timestamp">>) => {
    setTransactions((prev) =>
      prev.map((tx) =>
        tx.id === id
          ? { ...tx, ...updates }
          : tx
      )
    );
  }, []);

  // Clear all transactions
  const clearHistory = useCallback(() => {
    setTransactions([]);
  }, []);

  // Get transactions by status
  const getByStatus = useCallback((status: TransactionStatus) => {
    return transactions.filter((tx) => tx.status === status);
  }, [transactions]);

  return {
    transactions,
    addTransaction,
    updateTransaction,
    clearHistory,
    getByStatus,
    isLoaded,
  };
}


