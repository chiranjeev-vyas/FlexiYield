/**
 * FlexiYield Constants - TESTNET MODE ONLY
 * 
 * This file contains all contract addresses, chain IDs, and other constants
 * used throughout the application.
 * 
 * 🧪 CONFIGURED FOR TESTNET
 */

/**
 * App Mode Configuration
 */
export const IS_TESTNET = true;
export const IS_MAINNET = false;
export const APP_MODE = "TESTNET";

/**
 * Supported Chain IDs (TESTNET)
 */
export const CHAIN_IDS = {
  ETHEREUM: 11155111,  // Sepolia
  POLYGON: 80002,      // Polygon Amoy (Mumbai replacement)
  ARBITRUM: 421614,    // Arbitrum Sepolia
  BASE: 84532,         // Base Sepolia
} as const;

/**
 * Type for supported chain IDs
 */
export type SupportedChainId = (typeof CHAIN_IDS)[keyof typeof CHAIN_IDS];

/**
 * Chain Names mapped to their IDs (TESTNET)
 */
export const CHAIN_NAMES: Record<SupportedChainId, string> = {
  [CHAIN_IDS.ETHEREUM]: "Sepolia",
  [CHAIN_IDS.POLYGON]: "Polygon Amoy",
  [CHAIN_IDS.ARBITRUM]: "Arbitrum Sepolia",
  [CHAIN_IDS.BASE]: "Base Sepolia",
} as const;

/**
 * USDC Token Contract Addresses (TESTNET)
 * USDC has 6 decimals on all chains
 * ⚠️ IMPORTANT: For Aave supply to work on Sepolia, you MUST use Aave's official test USDC
 * Get test USDC here: https://staging.aave.com/faucet/
 */
export const USDC_ADDRESSES: Record<SupportedChainId, `0x${string}`> = {
  [CHAIN_IDS.ETHEREUM]: "0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8",  // Aave Sepolia USDC (Official - REQUIRED for Aave)
  [CHAIN_IDS.POLYGON]: "0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582",   // Amoy USDC
  [CHAIN_IDS.ARBITRUM]: "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d", // Arbitrum Sepolia USDC
  [CHAIN_IDS.BASE]: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",      // Base Sepolia USDC
} as const;

/**
 * Aave V3 Pool Contract Addresses (TESTNET)
 * ✅ Aave V3 is deployed on: Sepolia, Arbitrum Sepolia, Base Sepolia
 * ⚠️ NOT on Polygon Amoy
 * 
 * Official Aave Testnet Addresses:
 * - Sepolia: https://sepolia.etherscan.io/address/0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951
 * - Arbitrum Sepolia: https://sepolia.arbiscan.io/address/0xBfC91D59fdAA134A4ED45f7B584cAf96D7792Eff
 * - Base Sepolia: https://sepolia.basescan.org/address/0x07eA79F68B2B3df564D0A34F8e19D9B1e339814b
 */
export const AAVE_V3_POOL_ADDRESSES: Record<SupportedChainId, `0x${string}`> = {
  [CHAIN_IDS.ETHEREUM]: "0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951",  // ✅ Sepolia Aave V3 Pool
  [CHAIN_IDS.POLYGON]: "0x0000000000000000000000000000000000000000",   // ⚠️ NOT AVAILABLE on Amoy
  [CHAIN_IDS.ARBITRUM]: "0xBfC91D59fdAA134A4ED45f7B584cAf96D7792Eff", // ✅ Arbitrum Sepolia Aave V3 Pool
  [CHAIN_IDS.BASE]: "0x07eA79F68B2B3df564D0A34F8e19D9B1e339814b",      // ✅ Base Sepolia Aave V3 Pool
} as const;

/**
 * Check if Aave V3 is available on a specific chain
 */
export const AAVE_SUPPORTED_CHAINS: number[] = [
  CHAIN_IDS.ETHEREUM,
  CHAIN_IDS.ARBITRUM,
  CHAIN_IDS.BASE,
];

/**
 * Chain Metadata for UI Display (TESTNET)
 */
export const CHAIN_METADATA: Record<
  SupportedChainId,
  {
    name: string;
    logo: string;
    color: string;
    explorer: string;
    explorerName: string;
    faucetUrl: string;
  }
> = {
  [CHAIN_IDS.ETHEREUM]: {
    name: "Sepolia",
    logo: "https://icons.llamao.fi/icons/chains/rsz_ethereum.jpg",
    color: "bg-blue-500",
    explorer: "https://sepolia.etherscan.io",
    explorerName: "Sepolia Etherscan",
    faucetUrl: "https://staging.aave.com/faucet/", // ⚠️ MUST use Aave faucet for USDC that works with Aave
  },
  [CHAIN_IDS.POLYGON]: {
    name: "Polygon Amoy",
    logo: "https://icons.llamao.fi/icons/chains/rsz_polygon.jpg",
    color: "bg-purple-500",
    explorer: "https://amoy.polygonscan.com",
    explorerName: "Amoy Polygonscan",
    faucetUrl: "https://faucet.polygon.technology/",
  },
  [CHAIN_IDS.ARBITRUM]: {
    name: "Arbitrum Sepolia",
    logo: "https://icons.llamao.fi/icons/chains/rsz_arbitrum.jpg",
    color: "bg-blue-400",
    explorer: "https://sepolia.arbiscan.io",
    explorerName: "Arbitrum Sepolia Scan",
    faucetUrl: "https://faucet.quicknode.com/arbitrum/sepolia",
  },
  [CHAIN_IDS.BASE]: {
    name: "Base Sepolia",
    logo: "https://icons.llamao.fi/icons/chains/rsz_base.jpg",
    color: "bg-blue-600",
    explorer: "https://sepolia.basescan.org",
    explorerName: "Base Sepolia Scan",
    faucetUrl: "https://faucet.quicknode.com/base/sepolia",
  },
} as const;

/**
 * USDC Token Decimals (same on all chains)
 */
export const USDC_DECIMALS = 6;

/**
 * Aave V3 Referral Code (0 = no referral)
 */
export const AAVE_REFERRAL_CODE = 0;

/**
 * Helper Functions
 */

/**
 * Check if a chain ID is supported
 */
export function isSupportedChain(chainId: number): chainId is SupportedChainId {
  return Object.values(CHAIN_IDS).includes(chainId as SupportedChainId);
}

/**
 * Get chain name by ID
 */
export function getChainName(chainId: number): string {
  return (CHAIN_NAMES as any)[chainId] || `Chain ${chainId}`;
}

/**
 * Get USDC address for a chain
 */
export function getUSDCAddress(chainId: number): `0x${string}` | undefined {
  return (USDC_ADDRESSES as any)[chainId];
}

/**
 * Get Aave V3 Pool address for a chain
 */
export function getAavePoolAddress(chainId: number): `0x${string}` | undefined {
  return (AAVE_V3_POOL_ADDRESSES as any)[chainId];
}

/**
 * Get chain metadata for a chain
 */
export function getChainMetadata(chainId: number) {
  return (CHAIN_METADATA as any)[chainId];
}

/**
 * Get block explorer URL for a chain
 */
export function getExplorerUrl(chainId: number): string {
  return getChainMetadata(chainId)?.explorer || "";
}

/**
 * Get transaction explorer URL
 */
export function getTxExplorerUrl(chainId: number, txHash: string): string {
  return `${getExplorerUrl(chainId)}/tx/${txHash}`;
}

/**
 * Get address explorer URL
 */
export function getAddressExplorerUrl(chainId: number, address: string): string {
  return `${getExplorerUrl(chainId)}/address/${address}`;
}

/**
 * Check if Aave V3 is available on a specific chain
 */
export function isAaveAvailable(chainId: number): boolean {
  return AAVE_SUPPORTED_CHAINS.includes(chainId);
}

/**
 * Format USDC amount (6 decimals)
 */
export function formatUSDCAmount(amount: string | number): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return num.toFixed(USDC_DECIMALS);
}

/**
 * Convert USDC to wei (multiply by 10^6)
 */
export function parseUSDCToWei(amount: string | number): bigint {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return BigInt(Math.floor(num * Math.pow(10, USDC_DECIMALS)));
}

/**
 * Convert USDC from wei (divide by 10^6)
 */
export function parseUSDCFromWei(amountWei: string | bigint): string {
  const amount = typeof amountWei === "string" ? BigInt(amountWei) : amountWei;
  return (Number(amount) / Math.pow(10, USDC_DECIMALS)).toString();
}

/**
 * All supported chains as an array
 */
export const SUPPORTED_CHAINS: number[] = [
  CHAIN_IDS.ETHEREUM,
  CHAIN_IDS.POLYGON,
  CHAIN_IDS.ARBITRUM,
  CHAIN_IDS.BASE,
];

/**
 * Protocol Names
 */
export const PROTOCOLS = {
  AAVE_V3: "Aave V3",
} as const;

/**
 * Token Symbols
 */
export const TOKENS = {
  USDC: "USDC",
} as const;
