import React, { useState, useEffect } from "react";
import WalletSend from "./Walletsend";
import { Moon, Sun } from "lucide-react";

// Connect wallet logic
declare global {
  interface Window {
    ethereum?: any;
    phantom?: { solana?: any };
  }
}

const App: React.FC = () => {
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [walletType, setWalletType] = useState<"metamask" | "phantom" | null>(null);
  const [status, setStatus] = useState<string>("");
  const [response, setResponse] = useState<string>("");
  const [darkMode, setDarkMode] = useState<boolean>(true);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  const connectWallet = async () => {
    try {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        setWalletAddress(accounts[0]);
        setWalletType("metamask");
        setStatus("Connected to MetaMask");
      } else if (window.phantom?.solana) {
        const resp = await window.phantom.solana.connect();
        setWalletAddress(resp.publicKey.toString());
        setWalletType("phantom");
        setStatus("Connected to Phantom");
      } else {
        alert("No compatible wallet found.");
      }
    } catch (error) {
      console.error("Wallet connection failed:", error);
      setStatus("Connection failed");
    }
  };

  const askGrokAssistant = async () => {
    setStatus("Asking Assistant...");
    try {
      const res = await fetch("/api/grok", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: "Give advice on improving my crypto investment strategy.",
        }),
      });
      const data = await res.json();
      setResponse(data.message || "No response from Grok.");
      setStatus("Response received");
    } catch (error) {
      console.error("Error calling Grok:", error);
      setStatus("Grok call failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900 transition-colors px-4">
      <div className="p-6 rounded-2xl shadow-2xl bg-gray-100 dark:bg-gray-800 w-full max-w-md text-center">
        
        {/* App Logo and Name */}
        <div className="mb-6 flex flex-col items-center space-y-2">
          {/* Replace the src with your actual logo path */}
          <img
  src="/assets/logo-1_imresizer.png"
  alt="Kryptanator Logo"
  className="w-16 h-16 object-contain mx-auto"
/>

          <h1
            className="text-3xl font-bold text-gray-900 dark:text-white"
            style={{ fontFamily: "'Reesha', cursive" }} // Use your custom font if available
          >
            Kryptanator
          </h1>
        </div>

        {/* Dark mode toggle and Connect Wallet */}
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={toggleDarkMode}
            className="text-xl p-2 rounded-full bg-gray-200 dark:bg-gray-700 transition"
            aria-label="Toggle dark mode"
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <button
            onClick={connectWallet}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl"
          >
            Connect Wallet
          </button>
        </div>

        {/* Wallet Info */}
        <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">
          {walletAddress ? `Connected: ${walletAddress.slice(0, 8)}...` : "Wallet not connected"}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 mb-4">{status}</div>

        {/* Send Section */}
        <WalletSend walletAddress={walletAddress} walletType={walletType} setStatus={setStatus} />

        {/* Assistant Button */}
        <button
          onClick={askGrokAssistant}
          className="mt-6 w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold px-4 py-2 rounded-xl"
        >
          Ask Assistant
        </button>

        {/* Assistant Response */}
        {response && (
          <div className="mt-4 p-3 bg-purple-100 dark:bg-purple-900 text-sm text-purple-800 dark:text-purple-200 rounded-xl">
            {response}
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
