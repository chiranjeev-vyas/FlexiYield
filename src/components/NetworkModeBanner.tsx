"use client";

import { ExternalLink, Droplet, AlertTriangle } from "lucide-react";

const NetworkModeBanner = () => {
  const faucets = [
    { name: "Sepolia", url: "https://app.aave.com/faucet/", icon: "💎" },
    { name: "Base", url: "https://faucet.circle.com/", icon: "🔵" },
    { name: "Arbitrum", url: "https://faucet.circle.com/", icon: "🔷" },
    { name: "Polygon", url: "https://faucet.polygon.technology/", icon: "🟣" },
  ];

  return (
    <div className="relative bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border-b-2 border-amber-200 shadow-sm" style={{ zIndex: 10000 }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Testnet Warning */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="flex-shrink-0 w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center animate-pulse">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-amber-900 text-base">TESTNET MODE</span>
                  <span className="px-2 py-0.5 text-xs font-medium bg-amber-200 text-amber-800 rounded-full">Demo Only</span>
                </div>
                <p className="text-xs text-amber-700 mt-0.5">
                  For Aave supply, get USDC from Aave faucet first
                </p>
              </div>
              <div className="sm:hidden">
                <span className="font-bold text-amber-900 text-sm">TESTNET</span>
              </div>
            </div>
          </div>

          {/* Right: Faucet Links */}
          <div className="flex items-center gap-2">
            {/* Desktop Faucets */}
            <div className="hidden lg:flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm border border-amber-200">
              <Droplet className="w-4 h-4 text-blue-500" />
              <span className="text-xs font-semibold text-gray-700">Get USDC:</span>
              <div className="flex gap-1.5">
                {faucets.map((faucet) => (
                  <a
                    key={faucet.name}
                    href={faucet.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-md transition-all hover:shadow-sm border border-blue-200"
                    title={`Get test USDC on ${faucet.name}`}
                  >
                    <span>{faucet.icon}</span>
                    <span className="hidden xl:inline">{faucet.name}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ))}
              </div>
            </div>

            {/* Mobile/Tablet: Condensed Faucets */}
            <div className="lg:hidden flex items-center gap-1.5">
              {faucets.map((faucet) => (
                <a
                  key={faucet.name}
                  href={faucet.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center w-8 h-8 text-sm bg-white hover:bg-blue-50 rounded-lg transition-all hover:shadow-sm border border-amber-200"
                  title={`Get USDC: ${faucet.name}`}
                >
                  {faucet.icon}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NetworkModeBanner;
