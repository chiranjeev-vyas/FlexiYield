/**
 * Error handling utilities for the FlexiYield app
 * Converts technical errors into user-friendly messages
 */

export interface ErrorInfo {
  title: string;
  message: string;
  canRetry: boolean;
}

/**
 * Parse and format error messages from various sources
 */
export function parseError(error: unknown): ErrorInfo {
  console.error("🔴 Error occurred:", error);

  // Handle string errors
  if (typeof error === "string") {
    return parseErrorString(error);
  }

  // Handle Error objects
  if (error instanceof Error) {
    return parseErrorObject(error);
  }

  // Handle unknown errors
  return {
    title: "Unknown Error",
    message: "An unexpected error occurred. Please try again.",
    canRetry: true,
  };
}

/**
 * Parse string errors
 */
function parseErrorString(errorStr: string): ErrorInfo {
  const lowerError = errorStr.toLowerCase();

  // User rejected transaction
  if (
    lowerError.includes("user rejected") ||
    lowerError.includes("user denied") ||
    lowerError.includes("user cancelled") ||
    lowerError.includes("rejected the request")
  ) {
    return {
      title: "Transaction Rejected",
      message: "You declined the transaction in your wallet.",
      canRetry: true,
    };
  }

  // Insufficient balance
  if (
    lowerError.includes("insufficient") ||
    lowerError.includes("exceeds balance")
  ) {
    return {
      title: "Insufficient Balance",
      message: "You don't have enough USDC to complete this transaction.",
      canRetry: false,
    };
  }

  // Rate limiting errors
  if (
    lowerError.includes("rate limit") ||
    lowerError.includes("too many requests") ||
    lowerError.includes("429")
  ) {
    return {
      title: "Rate Limited",
      message: "Too many requests to the blockchain network. The transaction will automatically retry in a few seconds. Please be patient.",
      canRetry: true,
    };
  }

  // Network errors
  if (
    lowerError.includes("network") ||
    lowerError.includes("connection") ||
    lowerError.includes("timeout") ||
    lowerError.includes("fetch failed")
  ) {
    return {
      title: "Network Error",
      message: "Unable to connect. Please check your internet connection and try again.",
      canRetry: true,
    };
  }

  // Gas errors
  if (
    lowerError.includes("gas") ||
    lowerError.includes("out of gas")
  ) {
    return {
      title: "Transaction Failed",
      message: "Not enough gas to complete the transaction. Please try again.",
      canRetry: true,
    };
  }

  // Contract revert errors
  if (
    lowerError.includes("revert") ||
    lowerError.includes("execution reverted")
  ) {
    return {
      title: "Transaction Reverted",
      message: "The transaction was rejected by the smart contract. Please check your inputs.",
      canRetry: true,
    };
  }

  // Slippage errors
  if (lowerError.includes("slippage")) {
    return {
      title: "Slippage Too High",
      message: "Price moved too much. Please try again with a higher slippage tolerance.",
      canRetry: true,
    };
  }

  // Chain mismatch
  if (
    lowerError.includes("chain") ||
    lowerError.includes("wrong network")
  ) {
    return {
      title: "Wrong Network",
      message: "Please switch to the correct network in your wallet.",
      canRetry: true,
    };
  }

  // Default for other string errors
  return {
    title: "Transaction Failed",
    message: errorStr,
    canRetry: true,
  };
}

/**
 * Parse Error objects
 */
function parseErrorObject(error: Error): ErrorInfo {
  const errorMessage = error.message.toLowerCase();

  // Check error name first
  if (error.name === "UserRejectedRequestError") {
    return {
      title: "Transaction Rejected",
      message: "You declined the transaction in your wallet.",
      canRetry: true,
    };
  }

  // Check for specific error patterns in the message
  if (errorMessage.includes("user rejected") || errorMessage.includes("user denied")) {
    return {
      title: "Transaction Rejected",
      message: "You declined the transaction in your wallet.",
      canRetry: true,
    };
  }

  if (errorMessage.includes("insufficient")) {
    return {
      title: "Insufficient Balance",
      message: "You don't have enough USDC to complete this transaction.",
      canRetry: false,
    };
  }

  if (errorMessage.includes("network") || errorMessage.includes("fetch")) {
    return {
      title: "Network Error",
      message: "Unable to connect. Please check your connection and try again.",
      canRetry: true,
    };
  }

  if (errorMessage.includes("nexus") || errorMessage.includes("sdk")) {
    return {
      title: "Nexus SDK Error",
      message: "There was an issue with the Nexus SDK. Please try again or contact support.",
      canRetry: true,
    };
  }

  // Default error handling
  return {
    title: "Transaction Failed",
    message: error.message || "An error occurred. Please try again.",
    canRetry: true,
  };
}

/**
 * Format error for logging
 */
export function logError(context: string, error: unknown): void {
  console.group(`🔴 Error in ${context}`);
  console.error("Error:", error);
  if (error instanceof Error) {
    console.error("Stack trace:", error.stack);
  }
  console.groupEnd();
}

/**
 * Check if error is a user rejection
 */
export function isUserRejection(error: unknown): boolean {
  if (typeof error === "string") {
    const lowerError = error.toLowerCase();
    return (
      lowerError.includes("user rejected") ||
      lowerError.includes("user denied") ||
      lowerError.includes("user cancelled")
    );
  }

  if (error instanceof Error) {
    const lowerMessage = error.message.toLowerCase();
    return (
      error.name === "UserRejectedRequestError" ||
      lowerMessage.includes("user rejected") ||
      lowerMessage.includes("user denied")
    );
  }

  return false;
}

/**
 * Get short error message for inline display
 */
export function getShortErrorMessage(error: unknown): string {
  const errorInfo = parseError(error);
  return errorInfo.title;
}


