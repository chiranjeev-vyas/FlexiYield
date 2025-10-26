"use client";

import { useState } from "react";
import { X, ExternalLink, Droplet } from "lucide-react";
import { Button } from "./ui/button";
import { CHAIN_METADATA, CHAIN_IDS, IS_TESTNET } from "@/lib/constants";

const TestnetBanner = () => {
  const [isVisible, setIsVisible] = useState(true);

  // Only show in testnet mode
  if (!IS_TESTNET || !isVisible) {
    return null;
  }

  const faucets = [
    {
      name: "Sepolia",
      url: CHAIN_METADATA[CHAIN_IDS.ETHEREUM].faucetUrl,
      chainId: CHAIN_IDS.ETHEREUM,
    },
    {
      name: "Polygon Amoy",
      url: CHAIN_METADATA[CHAIN_IDS.POLYGON].faucetUrl,
      chainId: CHAIN_IDS.POLYGON,
    },
    {
      name: "Arbitrum Sepolia",
      url: CHAIN_METADATA[CHAIN_IDS.ARBITRUM].faucetUrl,
      chainId: CHAIN_IDS.ARBITRUM,
    },
    {
      name: "Base Sepolia",
      url: CHAIN_METADATA[CHAIN_IDS.BASE].faucetUrl,
      chainId: CHAIN_IDS.BASE,
    },
  ];

  return (
    <div className="relative bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-400 border-b-4 border-yellow-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between flex-wrap gap-4">
          {/* Left: Testnet Badge */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
              <span className="text-2xl animate-pulse">🧪</span>
              <div>
                <span className="font-bold text-orange-600 text-lg">TESTNET MODE</span>
                <p className="text-xs text-gray-600">
                  ⚠️ For Aave supply to work, get USDC from Aave faucet!
                </p>
              </div>
            </div>
          </div>

          {/* Right: Faucet Links & Close Button */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Faucet Dropdown/Links */}
            <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-md">
              <Droplet className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-semibold text-gray-700 mr-2">Get Test USDC:</span>
              <div className="flex gap-2 flex-wrap">
                {faucets.map((faucet) => (
                  <a
                    key={faucet.chainId}
                    href={faucet.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                  >
                    {faucet.name}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ))}
              </div>
            </div>

            {/* Close Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVisible(false)}
              className="h-8 w-8 p-0 hover:bg-white/50"
              title="Dismiss banner"
            >
              <X className="w-4 h-4 text-gray-700" />
            </Button>
          </div>
        </div>

        {/* Mobile: Stack faucets */}
        <div className="md:hidden mt-3 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-md">
          <div className="flex items-center gap-2 mb-2">
            <Droplet className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-semibold text-gray-700">Get Test USDC:</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {faucets.map((faucet) => (
              <a
                key={faucet.chainId}
                href={faucet.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1 px-3 py-2 text-xs font-medium text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded transition-colors"
              >
                {faucet.name}
                <ExternalLink className="w-3 h-3" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestnetBanner;


