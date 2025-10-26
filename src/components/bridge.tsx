import {
  SUPPORTED_CHAINS,
  type SUPPORTED_CHAINS_IDS,
  type SUPPORTED_TOKENS,
} from "@avail-project/nexus-core";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useState } from "react";
import ChainSelect from "./blocks/chain-select";
import TokenSelect from "./blocks/token-select";
import { useNexus } from "@/providers/NexusProvider";
import IntentModal from "./blocks/intent-modal";
import { ArrowBigRight, CircleAlertIcon, AlertCircle } from "lucide-react";
import useListenTransaction from "@/hooks/useListenTransactions";
import { useAccount } from "wagmi";
import toast from "react-hot-toast";

const NexusBridge = () => {
  const [inputs, setInputs] = useState<{
    chain: SUPPORTED_CHAINS_IDS | null;
    token: SUPPORTED_TOKENS | null;
    amount: string | null;
  }>({
    chain: null,
    token: null,
    amount: null,
  });
  const { nexusSDK, intentRefCallback } = useNexus();
  const { isConnected, address } = useAccount();
  const isTestnet = true; // Always on testnet
  const { processing, explorerURL } = useListenTransaction({
    sdk: nexusSDK!,
    type: "bridge",
  });
  const [isLoading, setIsLoading] = useState(false);

  const initiateBridge = async () => {
    // Validation checks
    if (!isConnected || !address) {
      toast.error("Wallet Not Connected - Please connect your wallet to use the bridge");
      return;
    }

    if (!nexusSDK || !nexusSDK.isInitialized()) {
      toast.error("Nexus SDK Not Initialized - Please click 'Initialize Nexus' button first");
      return;
    }

    if (!inputs.chain || !inputs.token || !inputs.amount) {
      toast.error("Missing Information - Please fill in all fields");
      return;
    }

    const amount = parseFloat(inputs.amount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Invalid Amount - Please enter a valid amount greater than 0");
      return;
    }

    setIsLoading(true);
    console.log("🌉 Starting bridge transaction...");
    console.log("   Network Mode: Testnet");
    console.log("   Destination Chain:", inputs.chain);
    console.log("   Token:", inputs.token);
    console.log("   Amount:", inputs.amount);
    console.log("   ⏳ This may take 2-10 minutes on testnet...");

    try {
      const bridgeResult = await nexusSDK.bridge({
        token: inputs.token,
        amount: inputs.amount,
        chainId: inputs.chain,
      });
      
      console.log("🔍 Bridge result:", bridgeResult);

      if (bridgeResult?.success) {
        console.log("✅ Bridge successful!");
        console.log("🔗 Explorer URL:", bridgeResult.explorerUrl);
        toast.success(`Bridge Successful! ${inputs.amount} ${inputs.token} bridged successfully`, {
          duration: 5000,
        });
      } else {
        throw new Error("Bridge transaction failed");
      }
    } catch (error) {
      console.error("❌ Error while bridging:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      toast.error(`Bridge Failed - ${errorMessage}`, {
        duration: 6000,
      });
    } finally {
      setIsLoading(false);
      intentRefCallback.current = null;
    }
  };

  const isSDKInitialized = nexusSDK && nexusSDK.isInitialized();

  return (
    <>
      {/* Warning Banner */}
      {(!isConnected || !isSDKInitialized) && (
        <div className="w-full max-w-lg mx-auto mb-4 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-yellow-600 mr-3 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-yellow-800 mb-1">
                ⚠️ Setup Required
              </h3>
              {!isConnected && (
                <p className="text-sm text-yellow-700 mb-1">
                  • Connect your wallet to use the bridge
                </p>
              )}
              {!isSDKInitialized && (
                <p className="text-sm text-yellow-700">
                  • Initialize Nexus SDK (click the green button above)
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <Card className="w-full max-w-lg items-center mx-auto bg-transparent">
        <CardHeader className="w-full">
          <CardTitle className="text-center">Nexus Bridge</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-5 w-full max-w-md">
          <ChainSelect
            selectedChain={inputs?.chain ?? SUPPORTED_CHAINS.SEPOLIA}
            handleSelect={(chain) => {
              setInputs({ ...inputs, chain });
            }}
            isTestnet={isTestnet}
          />
          <TokenSelect
            selectedChain={(
              inputs?.chain ?? SUPPORTED_CHAINS.SEPOLIA
            ).toString()}
            selectedToken={inputs?.token ?? "ETH"}
            handleTokenSelect={(token) => setInputs({ ...inputs, token })}
            isTestnet={isTestnet}
          />
          <div className="grid gap-3 w-full text-left">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="text"
              className="w-full"
              value={inputs?.amount ?? "0"}
              onChange={(e) => setInputs({ ...inputs, amount: e.target.value })}
            />
          </div>
        </CardContent>
        <CardFooter className="flex-col gap-y-5">
          {/* Network Warning */}
          <div className="w-full p-3 border rounded-lg bg-amber-50 border-amber-200">
            <p className="text-xs text-amber-800">
              ⏳ <strong>Testnet Mode:</strong> Bridges can take 2-10 minutes to complete.
            </p>
          </div>

          <div className="grid gap-3">
            <Button
              type="submit"
              onClick={initiateBridge}
              disabled={
                !isConnected ||
                !isSDKInitialized ||
                !inputs.chain ||
                !inputs.token ||
                !inputs.amount ||
                isLoading
              }
            >
              {isLoading ? (
                <CircleAlertIcon className="size-5 animate-spin" />
              ) : (
                "Send"
              )}
            </Button>
          </div>
          <div className="flex items-center flex-col gap-y-3">
            {intentRefCallback?.current?.intent && (
              <>
                <p className="font-semibold text-lg">
                  Total Steps: {processing?.totalSteps}
                </p>
                <p className="font-semibold text-lg">
                  Status: {processing?.statusText}
                </p>
                <p className="font-semibold text-lg">
                  Progress: {processing?.currentStep}
                </p>
              </>
            )}

            {explorerURL && (
              <a
                href={explorerURL}
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-semibold flex items-center gap-x-2"
              >
                <ArrowBigRight className="size-5" /> View on Explorer
              </a>
            )}
          </div>
        </CardFooter>
      </Card>
      {intentRefCallback?.current?.intent && (
        <IntentModal intent={intentRefCallback?.current} />
      )}
    </>
  );
};

export default NexusBridge;
