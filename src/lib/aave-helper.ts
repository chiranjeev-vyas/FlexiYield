/**
 * Aave V3 Helper Functions
 * 
 * This file contains functions to interact with Aave V3 protocol:
 * - Fetch APY (Annual Percentage Yield) for lending
 * - Get reserve data
 * - Calculate TVL (Total Value Locked)
 */

import { createPublicClient, http, formatUnits } from "viem";
import { sepolia, arbitrumSepolia, baseSepolia } from "viem/chains";
import { CHAIN_IDS, SupportedChainId } from "./constants";

/**
 * Aave V3 Pool ABI - getReserveData function
 */
const AAVE_POOL_ABI = [
  {
    inputs: [
      {
        internalType: "address",
        name: "asset",
        type: "address",
      },
    ],
    name: "getReserveData",
    outputs: [
      {
        components: [
          {
            components: [
              {
                internalType: "uint256",
                name: "data",
                type: "uint256",
              },
            ],
            internalType: "struct DataTypes.ReserveConfigurationMap",
            name: "configuration",
            type: "tuple",
          },
          {
            internalType: "uint128",
            name: "liquidityIndex",
            type: "uint128",
          },
          {
            internalType: "uint128",
            name: "currentLiquidityRate",
            type: "uint128",
          },
          {
            internalType: "uint128",
            name: "variableBorrowIndex",
            type: "uint128",
          },
          {
            internalType: "uint128",
            name: "currentVariableBorrowRate",
            type: "uint128",
          },
          {
            internalType: "uint128",
            name: "currentStableBorrowRate",
            type: "uint128",
          },
          {
            internalType: "uint40",
            name: "lastUpdateTimestamp",
            type: "uint40",
          },
          {
            internalType: "uint16",
            name: "id",
            type: "uint16",
          },
          {
            internalType: "address",
            name: "aTokenAddress",
            type: "address",
          },
          {
            internalType: "address",
            name: "stableDebtTokenAddress",
            type: "address",
          },
          {
            internalType: "address",
            name: "variableDebtTokenAddress",
            type: "address",
          },
          {
            internalType: "address",
            name: "interestRateStrategyAddress",
            type: "address",
          },
          {
            internalType: "uint128",
            name: "accruedToTreasury",
            type: "uint128",
          },
          {
            internalType: "uint128",
            name: "unbacked",
            type: "uint128",
          },
          {
            internalType: "uint128",
            name: "isolationModeTotalDebt",
            type: "uint128",
          },
        ],
        internalType: "struct DataTypes.ReserveData",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

/**
 * ERC20 ABI - for getting total supply of aTokens (TVL proxy)
 */
const ERC20_ABI = [
  {
    inputs: [],
    name: "totalSupply",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

/**
 * Get the viem chain object for a chain ID
 */
function getViemChain(chainId: SupportedChainId) {
  switch (chainId) {
    case CHAIN_IDS.ETHEREUM:
      return sepolia;
    case CHAIN_IDS.ARBITRUM:
      return arbitrumSepolia;
    case CHAIN_IDS.BASE:
      return baseSepolia;
    default:
      return sepolia;
  }
}

/**
 * Create a public client for a specific chain
 */
function createChainClient(chainId: SupportedChainId) {
  const chain = getViemChain(chainId);
  return createPublicClient({
    chain,
    transport: http(),
  });
}

/**
 * Convert Ray units (1e27) to APY percentage
 * Aave stores rates in Ray format (27 decimals)
 * 
 * Formula: APY = (liquidityRate / 1e27) * 100
 */
function rayToAPY(liquidityRate: bigint): number {
  // Convert from Ray (1e27) to decimal, then to percentage
  const rateDecimal = Number(liquidityRate) / 1e27;
  const apy = rateDecimal * 100;
  return apy;
}

/**
 * Fetch Aave APY for a specific asset on a specific chain
 * 
 * @param chainId - The chain ID (Sepolia, Arbitrum Sepolia, Base Sepolia)
 * @param usdcAddress - The USDC token address on that chain
 * @param poolAddress - The Aave V3 Pool address on that chain
 * @returns APY as a percentage number, or null if failed
 * 
 * @example
 * const apy = await fetchAaveAPY(11155111, "0x94a9...", "0x6Ae4...");
 * console.log(`APY: ${apy}%`); // "APY: 5.2%"
 */
export async function fetchAaveAPY(
  chainId: SupportedChainId,
  usdcAddress: `0x${string}`,
  poolAddress: `0x${string}`
): Promise<number | null> {
  try {
    // Check if pool address is valid (not placeholder)
    if (poolAddress === "0x0000000000000000000000000000000000000000") {
      console.warn(`Aave V3 not deployed on chain ${chainId}`);
      return null;
    }

    console.log(`📊 Fetching Aave APY for chain ${chainId}...`);

    const client = createChainClient(chainId);

    // Call getReserveData to get reserve information
    const reserveData = await client.readContract({
      address: poolAddress,
      abi: AAVE_POOL_ABI,
      functionName: "getReserveData",
      args: [usdcAddress],
    });

    // Extract liquidityRate (currentLiquidityRate is at index 2)
    const liquidityRate = reserveData.currentLiquidityRate;

    // Convert to APY percentage
    const apy = rayToAPY(liquidityRate);

    console.log(`✅ APY for chain ${chainId}: ${apy.toFixed(2)}%`);

    return apy;
  } catch (error) {
    console.error(`❌ Error fetching APY for chain ${chainId}:`, error);
    return null;
  }
}

/**
 * Fetch TVL (Total Value Locked) for USDC in Aave
 * This is approximated by getting the total supply of aUSDC tokens
 * 
 * @param chainId - The chain ID
 * @param aTokenAddress - The aToken (aUSDC) address
 * @returns TVL in USDC (as a formatted string), or null if failed
 */
export async function fetchAaveTVL(
  chainId: SupportedChainId,
  aTokenAddress: `0x${string}`
): Promise<string | null> {
  try {
    if (aTokenAddress === "0x0000000000000000000000000000000000000000") {
      return null;
    }

    const client = createChainClient(chainId);

    // Get total supply of aUSDC tokens
    const totalSupply = await client.readContract({
      address: aTokenAddress,
      abi: ERC20_ABI,
      functionName: "totalSupply",
    });

    // Convert from wei (6 decimals for USDC) to USDC
    const tvl = formatUnits(totalSupply, 6);

    // Format as currency
    const tvlNumber = parseFloat(tvl);
    if (tvlNumber >= 1_000_000) {
      return `$${(tvlNumber / 1_000_000).toFixed(1)}M`;
    } else if (tvlNumber >= 1_000) {
      return `$${(tvlNumber / 1_000).toFixed(1)}K`;
    } else {
      return `$${tvlNumber.toFixed(0)}`;
    }
  } catch (error) {
    console.error(`❌ Error fetching TVL for chain ${chainId}:`, error);
    return "Test Tokens";
  }
}

/**
 * Fetch both APY and TVL for a chain
 * 
 * @param chainId - The chain ID
 * @param usdcAddress - USDC address on that chain
 * @param poolAddress - Aave V3 Pool address
 * @returns Object with apy and tvl
 */
export async function fetchAaveData(
  chainId: SupportedChainId,
  usdcAddress: `0x${string}`,
  poolAddress: `0x${string}`
): Promise<{ apy: number | null; tvl: string | null }> {
  try {
    // First get APY and reserve data
    const client = createChainClient(chainId);

    if (poolAddress === "0x0000000000000000000000000000000000000000") {
      return { apy: null, tvl: null };
    }

    const reserveData = await client.readContract({
      address: poolAddress,
      abi: AAVE_POOL_ABI,
      functionName: "getReserveData",
      args: [usdcAddress],
    });

    // Get APY
    const apy = rayToAPY(reserveData.currentLiquidityRate);

    // Get TVL from aToken
    const aTokenAddress = reserveData.aTokenAddress as `0x${string}`;
    const tvl = await fetchAaveTVL(chainId, aTokenAddress);

    return { apy, tvl };
  } catch (error) {
    console.error(`❌ Error fetching Aave data for chain ${chainId}:`, error);
    return { apy: null, tvl: null };
  }
}

/**
 * Fetch APY data for all supported chains
 * Returns a map of chainId -> APY
 */
export async function fetchAllAaveAPYs(
  chains: Array<{
    chainId: SupportedChainId;
    usdcAddress: `0x${string}`;
    poolAddress: `0x${string}`;
  }>
): Promise<Record<number, { apy: number | null; tvl: string | null }>> {
  console.log("📊 Fetching APY data for all chains...");

  const results = await Promise.allSettled(
    chains.map((chain) =>
      fetchAaveData(chain.chainId, chain.usdcAddress, chain.poolAddress)
    )
  );

  const apyMap: Record<number, { apy: number | null; tvl: string | null }> = {};

  results.forEach((result, index) => {
    const chainId = chains[index].chainId;
    if (result.status === "fulfilled") {
      apyMap[chainId] = result.value;
    } else {
      console.error(`Failed to fetch APY for chain ${chainId}:`, result.reason);
      apyMap[chainId] = { apy: null, tvl: null };
    }
  });

  console.log("✅ APY data fetched:", apyMap);

  return apyMap;
}


