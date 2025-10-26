"use client";

import ConnectWallet from "@/components/blocks/connect-wallet";
import Nexus from "@/components/nexus";
import NexusInitButton from "@/components/nexus-init";
import YieldTable from "@/components/YieldTable";
import USDCBalance from "@/components/USDCBalance";
import TransactionHistory from "@/components/TransactionHistory";
import NetworkModeBanner from "@/components/NetworkModeBanner";
import { useNexus } from "@/providers/NexusProvider";
import { useAccount } from "wagmi";
import { Card, CardContent } from "@/components/ui/card";
import { Wallet } from "lucide-react";
import { runFullDiagnostics } from "@/lib/nexus-diagnostics";

export default function Home() {
  const { nexusSDK } = useNexus();
  const { isConnected } = useAccount();
  return (
    <div className="font-sans min-h-screen">
      {/* Network Mode Banner */}
      <NetworkModeBanner />
      
      {/* Background Gradient */}
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: `
            radial-gradient(125% 125% at 50% 10%, #ffffff 40%, #14b8a6 100%)
          `,
          backgroundSize: "100% 100%",
        }}
      />

      {/* Content Container */}
      <div className="relative z-10">
        {/* Hero Section */}
        <section className="pt-12 sm:pt-20 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            {/* Gradient Text Heading */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-gray-900 via-teal-800 to-teal-600 bg-clip-text text-transparent px-2">
              FlexiYield - Maximize Your USDC Yields
            </h1>
            
            {/* Subheading */}
            <p className="text-base sm:text-lg md:text-xl text-gray-700 mb-6 sm:mb-8 max-w-3xl mx-auto px-4">
              Find the best lending rates across chains and deposit with one click
            </p>

            {/* Wallet Connection Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-center justify-center mb-6 sm:mb-8 px-4">
              <div className="w-full sm:w-auto">
                <ConnectWallet />
              </div>
              <div className="w-full sm:w-auto">
                <NexusInitButton />
              </div>
            </div>

            {/* Powered by Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full border border-teal-200 shadow-sm text-sm">
              <span className="text-gray-600">Powered by</span>
              <span className="font-semibold text-teal-700">
                Avail Nexus
              </span>
            </div>

            {/* SDK Diagnostics Button (for debugging) */}
            {nexusSDK?.isInitialized() && (
              <button
                onClick={() => runFullDiagnostics(nexusSDK)}
                className="mt-4 px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg border border-gray-300 transition-colors"
                title="Run SDK diagnostics to check available features"
              >
                🔍 Check SDK Capabilities
              </button>
            )}
          </div>
        </section>

        {/* USDC Balance Section */}
        <section className="pb-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            {isConnected ? (
              <USDCBalance />
            ) : (
              <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-teal-200">
                <CardContent className="p-8 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="rounded-full bg-teal-100 p-4">
                      <Wallet className="w-10 h-10 text-teal-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        Connect Your Wallet
                      </h3>
                      <p className="text-gray-600 mb-6">
                        Connect your wallet to view your USDC balance across multiple chains
                      </p>
                      <ConnectWallet />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </section>

        {/* Nexus Integration Section */}
        {nexusSDK?.isInitialized() && (
          <section className="pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
              <Nexus />
            </div>
          </section>
        )}

        {/* How It Works Section */}
        <section className="pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            {/* Section Header */}
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 sm:mb-3">
                How It Works
              </h2>
              <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4">
                Get the best yields across chains in three simple steps
              </p>
            </div>

            {/* 3-Column Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              {/* Step 1 */}
              <div className="relative bg-white/80 backdrop-blur-sm rounded-xl p-6 sm:p-8 shadow-lg border border-teal-200 hover:shadow-xl transition-shadow">
                <div className="flex flex-col items-center text-center">
                  {/* Step Number Badge */}
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-teal-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm shadow-md">
                    1
                  </div>
                  
                  {/* Icon */}
                  <div className="text-5xl sm:text-6xl mb-3 sm:mb-4 mt-2">
                    🔗
                  </div>
                  
                  {/* Title */}
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">
                    Connect Your Wallet
                  </h3>
                  
                  {/* Description */}
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    Connect your wallet to view your USDC balance across all chains
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="relative bg-white/80 backdrop-blur-sm rounded-xl p-6 sm:p-8 shadow-lg border border-teal-200 hover:shadow-xl transition-shadow">
                <div className="flex flex-col items-center text-center">
                  {/* Step Number Badge */}
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-teal-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm shadow-md">
                    2
                  </div>
                  
                  {/* Icon */}
                  <div className="text-5xl sm:text-6xl mb-3 sm:mb-4 mt-2">
                    📊
                  </div>
                  
                  {/* Title */}
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">
                    Compare Yields
                  </h3>
                  
                  {/* Description */}
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    See real-time lending rates across Ethereum, Polygon, Arbitrum, and Base
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="relative bg-white/80 backdrop-blur-sm rounded-xl p-6 sm:p-8 shadow-lg border border-teal-200 hover:shadow-xl transition-shadow">
                <div className="flex flex-col items-center text-center">
                  {/* Step Number Badge */}
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-teal-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm shadow-md">
                    3
                  </div>
                  
                  {/* Icon */}
                  <div className="text-5xl sm:text-6xl mb-3 sm:mb-4 mt-2">
                    ⚡
                  </div>
                  
                  {/* Title */}
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">
                    Supply with One Click
                  </h3>
                  
                  {/* Description */}
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    Bridge and deposit to the best yield in a single transaction
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Yield Table Section */}
        <section className="pb-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <YieldTable />
          </div>
        </section>

        {/* Transaction History Section */}
        <section className="pb-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <TransactionHistory />
          </div>
        </section>

        {/* Footer */}
        <footer className="pb-8 px-4 text-center">
          <p className="text-sm text-gray-600">
            Cross-chain yields powered by Avail Nexus SDK
          </p>
        </footer>
      </div>
    </div>
  );
}
