"use client";

import { createContext, useContext, ReactNode } from "react";
import { useTransactionHistory, type Transaction, type TransactionStatus } from "@/hooks/useTransactionHistory";

interface TransactionHistoryContextType {
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, "id" | "timestamp">) => string;
  updateTransaction: (id: string, updates: Partial<Omit<Transaction, "id" | "timestamp">>) => void;
  clearHistory: () => void;
  getByStatus: (status: TransactionStatus) => Transaction[];
  isLoaded: boolean;
}

const TransactionHistoryContext = createContext<TransactionHistoryContextType | undefined>(undefined);

export function TransactionHistoryProvider({ children }: { children: ReactNode }) {
  const transactionHistory = useTransactionHistory();

  return (
    <TransactionHistoryContext.Provider value={transactionHistory}>
      {children}
    </TransactionHistoryContext.Provider>
  );
}

export function useTransactionHistoryContext() {
  const context = useContext(TransactionHistoryContext);
  if (context === undefined) {
    throw new Error("useTransactionHistoryContext must be used within a TransactionHistoryProvider");
  }
  return context;
}


