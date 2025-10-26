/**
 * FlexiYield Constants - TESTNET MODE ONLY
 */

export const IS_TESTNET = true;

export const CHAIN_IDS = {
  ETHEREUM: 11155111,  // Sepolia
  POLYGON: 80002,      // Polygon Amoy
  ARBITRUM: 421614,    // Arbitrum Sepolia
  BASE: 84532,         // Base Sepolia
} as const;

export type SupportedChainId = (typeof CHAIN_IDS)[keyof typeof CHAIN_IDS];

export const CHAIN_NAMES: Record<SupportedChainId, string> = {
  [CHAIN_IDS.ETHEREUM]: "Sepolia",
  [CHAIN_IDS.POLYGON]: "Polygon Amoy",
  [CHAIN_IDS.ARBITRUM]: "Arbitrum Sepolia",
  [CHAIN_IDS.BASE]: "Base Sepolia",
} as const;

/**
 * USDC Token Addresses - TESTNET
 * ⚠️ For Sepolia, you MUST use Aave's official test USDC: 0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8
 * Get it from: https://staging.aave.com/faucet/
 */
export const USDC_ADDRESSES: Record<SupportedChainId, `0x${string}`> = {
  [CHAIN_IDS.ETHEREUM]: "0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8",  // Aave Sepolia USDC
  [CHAIN_IDS.POLYGON]: "0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582",
  [CHAIN_IDS.ARBITRUM]: "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d",
  [CHAIN_IDS.BASE]: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
} as const;

export const AAVE_V3_POOL_ADDRESSES: Record<SupportedChainId, `0x${string}`> = {
  [CHAIN_IDS.ETHEREUM]: "0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951",
  [CHAIN_IDS.POLYGON]: "0x0000000000000000000000000000000000000000",
  [CHAIN_IDS.ARBITRUM]: "0xBfC91D59fdAA134A4ED45f7B584cAf96D7792Eff",
  [CHAIN_IDS.BASE]: "0x07eA79F68B2B3df564D0A34F8e19D9B1e339814b",
} as const;

export interface ChainMetadata {
  name: string;
  logo: string;
  color: string;
  explorer: string;
  explorerName: string;
  faucetUrl: string;
}

export const CHAIN_METADATA: Record<SupportedChainId, ChainMetadata> = {
  [CHAIN_IDS.ETHEREUM]: {
    name: "Sepolia",
    logo: "https://icons.llamao.fi/icons/chains/rsz_ethereum.jpg",
    color: "bg-blue-500",
    explorer: "https://sepolia.etherscan.io",
    explorerName: "Sepolia Etherscan",
    faucetUrl: "https://staging.aave.com/faucet/",
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

export const AAVE_SUPPORTED_CHAINS: number[] = [CHAIN_IDS.ETHEREUM, CHAIN_IDS.ARBITRUM, CHAIN_IDS.BASE];
export const SUPPORTED_CHAINS: SupportedChainId[] = [CHAIN_IDS.ETHEREUM, CHAIN_IDS.POLYGON, CHAIN_IDS.ARBITRUM, CHAIN_IDS.BASE];
export const USDC_DECIMALS = 6;
export const AAVE_REFERRAL_CODE = 0;

export function isAaveAvailable(chainId: number): boolean {
  return AAVE_SUPPORTED_CHAINS.includes(chainId);
}

export function isSupportedChain(chainId: number): chainId is SupportedChainId {
  return Object.values(CHAIN_IDS).includes(chainId as SupportedChainId);
}

export function getChainName(chainId: number): string {
  if (isSupportedChain(chainId)) {
    return CHAIN_NAMES[chainId];
  }
  return `Chain ${chainId}`;
}

export function getUSDCAddress(chainId: number): `0x${string}` | undefined {
  if (isSupportedChain(chainId)) {
    return USDC_ADDRESSES[chainId];
  }
  return undefined;
}

export function getAavePoolAddress(chainId: number): `0x${string}` | undefined {
  if (isSupportedChain(chainId)) {
    return AAVE_V3_POOL_ADDRESSES[chainId];
  }
  return undefined;
}

export function getChainMetadata(chainId: number): ChainMetadata | undefined {
  if (isSupportedChain(chainId)) {
    return CHAIN_METADATA[chainId];
  }
  return undefined;
}

export function getExplorerUrl(chainId: number): string {
  return getChainMetadata(chainId)?.explorer || "";
}

export function getTxExplorerUrl(chainId: number, txHash: string): string {
  return `${getExplorerUrl(chainId)}/tx/${txHash}`;
}

export const PROTOCOLS = { AAVE_V3: "Aave V3" } as const;
export const TOKENS = { USDC: "USDC" } as const;

