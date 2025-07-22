import React, { useMemo, useState } from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import {WalletModalProvider} from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import { clusterApiUrl } from "@solana/web3.js";
import WalletSend from "./Walletsend";

import "@solana/wallet-adapter-react-ui/styles.css";

const App: React.FC = () => {
  const [walletType, setWalletType] = useState<"phantom" | "metamask" | null>(null);
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [showWalletOptions, setShowWalletOptions] = useState(false);

  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);

  const connectPhantom = async () => {
    if (!window.solana || !window.solana.isPhantom) {
      alert("Phantom wallet not found");
      return;
    }
    try {
      const resp = await window.solana.connect();
      setWalletAddress(resp.publicKey.toString());
      setWalletType("phantom");
      setStatus(`Connected to Phantom: ${resp.publicKey.toString()}`);
    } catch (err) {
      console.error(err);
      setStatus("Failed to connect Phantom wallet.");
    }
  };

  const connectMetaMask = async () => {
    if (!window.ethereum) {
      alert("MetaMask not found");
      return;
    }
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setWalletAddress(accounts[0]);
      setWalletType("metamask");
      setStatus(`Connected to MetaMask: ${accounts[0]}`);
    } catch (err) {
      console.error(err);
      setStatus("Failed to connect MetaMask wallet.");
    }
  };

  const handleWalletSelect = async (type: "phantom" | "metamask") => {
    setShowWalletOptions(false);
    if (type === "phantom") {
      await connectPhantom();
    } else {
      await connectMetaMask();
    }
  };

  return (
    <ConnectionProvider endpoint={clusterApiUrl("devnet")}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white gap-4 p-4">
            <h1 className="text-3xl font-bold">KryptaNator</h1>

            {/* Connect Wallet Button */}
            <div className="relative">
              <button
                onClick={() => setShowWalletOptions(!showWalletOptions)}
                className="bg-blue-600 px-6 py-2 rounded-md hover:bg-blue-700"
              >
                {walletAddress ? "Wallet Connected" : "Connect Wallet"}
              </button>

              {showWalletOptions && !walletAddress && (
                <div className="absolute mt-2 bg-gray-800 rounded shadow-lg w-48 z-10">
                  <button
                    onClick={() => handleWalletSelect("phantom")}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-700"
                  >
                    Phantom (Solana)
                  </button>
                  <button
                    onClick={() => handleWalletSelect("metamask")}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-700"
                  >
                    MetaMask (Ethereum)
                  </button>
                </div>
              )}
            </div>

            {/* Status message */}
            {status && (
              <p className="mt-4 p-2 bg-yellow-700 rounded text-center max-w-md">
                {status}
              </p>
            )}

            {/* Always render WalletSend */}
            <WalletSend
              walletAddress={walletAddress}
              walletType={walletType}
              setStatus={setStatus}
            />
          </div>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default App;
