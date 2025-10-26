/**
 * Nexus SDK Diagnostic Utility
 * 
 * This script helps diagnose what features are available in the Nexus SDK
 * and whether they work properly on testnet.
 */

import type { NexusSDK } from "@avail-project/nexus-core";

export interface NexusDiagnostics {
  sdkVersion?: string;
  isInitialized: boolean;
  availableMethods: string[];
  testnetSupported: boolean;
  bridgeAndExecuteSupported: boolean;
  recommendations: string[];
}

/**
 * Diagnose the Nexus SDK to understand its capabilities
 */
export async function diagnoseNexusSDK(sdk: NexusSDK | null): Promise<NexusDiagnostics> {
  const diagnostics: NexusDiagnostics = {
    isInitialized: false,
    availableMethods: [],
    testnetSupported: false,
    bridgeAndExecuteSupported: false,
    recommendations: [],
  };

  if (!sdk) {
    diagnostics.recommendations.push("❌ SDK is null - not initialized");
    return diagnostics;
  }

  // Check if initialized
  diagnostics.isInitialized = sdk.isInitialized?.() ?? false;
  if (!diagnostics.isInitialized) {
    diagnostics.recommendations.push("❌ SDK exists but not initialized - call await sdk.init()");
  }

  // Check available methods
  const sdkObj = sdk as any;
  const knownMethods = [
    'init',
    'isInitialized',
    'getUnifiedBalances',
    'bridge',
    'sendCallsSync',
    'sendCalls',
    'executeCalls',
    'bridgeAndExecute',
    'getConfig',
    'getSupportedChains',
    'getSupportedTokens',
  ];

  for (const method of knownMethods) {
    if (typeof sdkObj[method] === 'function') {
      diagnostics.availableMethods.push(method);
    }
  }

  // Check for Bridge & Execute support
  const bridgeAndExecuteMethods = [
    'sendCallsSync',
    'sendCalls',
    'executeCalls',
    'bridgeAndExecute',
  ];

  diagnostics.bridgeAndExecuteSupported = bridgeAndExecuteMethods.some(
    method => diagnostics.availableMethods.includes(method)
  );

  // Check SDK configuration
  try {
    const config = sdkObj.config || sdkObj.getConfig?.() || {};
    diagnostics.testnetSupported = config.network === 'testnet' || config.isTestnet === true;
    
    if (config.network) {
      diagnostics.recommendations.push(`ℹ️  Network: ${config.network}`);
    }
  } catch (error) {
    diagnostics.recommendations.push("⚠️  Could not read SDK config");
  }

  // Generate recommendations
  if (!diagnostics.bridgeAndExecuteSupported) {
    diagnostics.recommendations.push(
      "❌ Bridge & Execute NOT supported - no sendCallsSync/sendCalls/bridgeAndExecute methods found"
    );
    diagnostics.recommendations.push(
      "✅ Solution: Use separate bridge + manual Aave supply (current fallback)"
    );
  } else {
    diagnostics.recommendations.push(
      `✅ Bridge & Execute MAY be supported - found: ${bridgeAndExecuteMethods.filter(m => diagnostics.availableMethods.includes(m)).join(', ')}`
    );
  }

  if (!diagnostics.availableMethods.includes('bridge')) {
    diagnostics.recommendations.push(
      "❌ CRITICAL: Basic bridge() method not found!"
    );
  }

  return diagnostics;
}

/**
 * Log diagnostics in a readable format
 */
export function logDiagnostics(diagnostics: NexusDiagnostics): void {
  console.log("=" .repeat(70));
  console.log("🔍 AVAIL NEXUS SDK DIAGNOSTICS");
  console.log("=" .repeat(70));
  
  console.log("\n📊 Status:");
  console.log(`   • Initialized: ${diagnostics.isInitialized ? '✅ Yes' : '❌ No'}`);
  console.log(`   • Testnet Support: ${diagnostics.testnetSupported ? '✅ Yes' : '⚠️  Unknown'}`);
  console.log(`   • Bridge & Execute: ${diagnostics.bridgeAndExecuteSupported ? '✅ Supported' : '❌ Not Supported'}`);
  
  console.log("\n🔧 Available Methods:");
  if (diagnostics.availableMethods.length > 0) {
    diagnostics.availableMethods.forEach(method => {
      console.log(`   • ${method}`);
    });
  } else {
    console.log("   ❌ No methods detected");
  }

  console.log("\n💡 Recommendations:");
  diagnostics.recommendations.forEach(rec => {
    console.log(`   ${rec}`);
  });

  console.log("\n" + "=" .repeat(70));
}

/**
 * Test if the bridge method works (without actually executing)
 */
export async function testBridgeAvailability(sdk: NexusSDK | null): Promise<{
  available: boolean;
  error?: string;
}> {
  try {
    if (!sdk || !sdk.isInitialized()) {
      return { available: false, error: "SDK not initialized" };
    }

    // Check if bridge method exists
    if (typeof (sdk as any).bridge !== 'function') {
      return { available: false, error: "bridge() method not found" };
    }

    return { available: true };
  } catch (error) {
    return {
      available: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Run full diagnostic suite
 */
export async function runFullDiagnostics(sdk: NexusSDK | null): Promise<void> {
  console.log("\n🏥 Running Nexus SDK Diagnostics...\n");

  // 1. Basic SDK check
  const diagnostics = await diagnoseNexusSDK(sdk);
  logDiagnostics(diagnostics);

  // 2. Test bridge availability
  console.log("\n🌉 Testing Bridge Availability...");
  const bridgeTest = await testBridgeAvailability(sdk);
  console.log(`   Bridge Available: ${bridgeTest.available ? '✅ Yes' : '❌ No'}`);
  if (bridgeTest.error) {
    console.log(`   Error: ${bridgeTest.error}`);
  }

  // 3. Check SDK prototype for hidden methods
  console.log("\n🔬 Checking SDK Prototype...");
  if (sdk) {
    const proto = Object.getPrototypeOf(sdk);
    const protoMethods = Object.getOwnPropertyNames(proto)
      .filter(name => typeof (proto as any)[name] === 'function')
      .filter(name => !name.startsWith('_'));
    
    console.log("   Available prototype methods:");
    protoMethods.forEach(method => {
      console.log(`   • ${method}`);
    });
  }

  console.log("\n" + "=" .repeat(70));
  console.log("📋 SUMMARY");
  console.log("=" .repeat(70));
  
  if (!diagnostics.bridgeAndExecuteSupported) {
    console.log("\n⚠️  BRIDGE & EXECUTE NOT SUPPORTED");
    console.log("\nYour options:");
    console.log("1. ✅ Use current implementation (bridge + manual supply)");
    console.log("2. 🔄 Check for Nexus SDK updates that support Bridge & Execute");
    console.log("3. 📧 Contact Avail team to confirm Bridge & Execute availability on testnet");
    console.log("4. 🔧 For mainnet: Test if Bridge & Execute works better on production");
  } else {
    console.log("\n✅ Bridge & Execute methods detected!");
    console.log("\nNext steps:");
    console.log("1. Test if these methods actually work on testnet");
    console.log("2. Check Nexus SDK documentation for correct usage");
    console.log("3. Verify method signatures match our implementation");
  }

  console.log("\n" + "=" .repeat(70) + "\n");
}


