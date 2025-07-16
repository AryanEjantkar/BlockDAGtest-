// AIWalletAssistant.tsx with Groq Integration
import React, { useState, useEffect } from "react";
import { ethers } from "ethers";

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

export default function AIWalletAssistant() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Array<{ sender: string; content: string }>>([]);
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [autoSend, setAutoSend] = useState(false);

  useEffect(() => {
    console.log("API Key Status:", GROQ_API_KEY ? "Loaded" : "Missing");
  }, []);

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        setStatus("Connecting to wallet...");
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        setWalletAddress(accounts[0]);
        setStatus(`Connected: ${accounts[0]}`);
        addMessage("system", "Wallet connected. How can I help?");
      } catch (err) {
        console.error("Wallet connection error:", err);
        setStatus("Failed to connect wallet");
      }
    } else {
      setStatus("Please install MetaMask");
    }
  };

  const addMessage = (sender: string, content: string) => {
    setMessages((prev) => [...prev, { sender, content }]);
  };

  const processCommand = async (command: string) => {
    if (!command.trim()) {
      setStatus("Please enter a command");
      return;
    }

    setIsLoading(true);
    addMessage("user", command);
    setStatus("Processing your request...");

    try {
      if (command.toLowerCase().includes("invest") || command.toLowerCase().includes("which crypto")) {
        await getCryptoAdvice();
        return;
      }

      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama3-70b-8192",
          messages: [
            {
              role: "system",
              content: `You are a crypto wallet assistant. Extract: action (send, receive, etc.), amount (in ETH), and recipient address. 
              Return ONLY JSON: {action, amount, to}. No explanations. Current user wallet: ${walletAddress}`,
            },
            { role: "user", content: command },
          ],
          temperature: 0.3,
          max_tokens: 100,
        }),
      });

      const data = await res.json();
      console.log("API response:", data);

      if (!res.ok) {
        throw new Error(data.error?.message || "API request failed");
      }

      const rawResponse = data.choices[0].message.content;
      const parsed = JSON.parse(rawResponse);

      if (!parsed.action || !parsed.amount || !parsed.to) {
        throw new Error("Incomplete response from AI");
      }

      addMessage("assistant", `I'll ${parsed.action} ${parsed.amount} ETH to ${parsed.to}`);

      if (autoSend) {
        await executeTransaction(parsed);
      } else {
        setStatus("Ready to execute. Click Send to confirm.");
      }
    } catch (error: any) {
      console.error("Error:", error);
      addMessage("assistant", `Error: ${error.message}`);
      setStatus("Failed to process command");
    } finally {
      setIsLoading(false);
    }
  };

  const getCryptoAdvice = async () => {
    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama3-70b-8192",
          messages: [
            {
              role: "system",
              content:
                "You're a crypto expert. Suggest 3 cryptocurrencies to invest in with brief reasons (max 100 words total). Format: 1. BTC - store of value... 2. ETH - smart contracts... etc.",
            },
            { role: "user", content: "Which cryptocurrencies should I invest in?" },
          ],
          temperature: 0.7,
          max_tokens: 150,
        }),
      });

      const data = await res.json();
      addMessage("assistant", data.choices[0].message.content);
      setStatus("Here are some suggestions");
    } catch (error) {
      addMessage("assistant", "Failed to get crypto advice");
      console.error(error);
    }
  };

  const executeTransaction = async (txDetails: any) => {
    if (!walletAddress) {
      setStatus("Wallet not connected");
      return;
    }

    setIsLoading(true);
    setStatus("Sending transaction...");

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const tx = await signer.sendTransaction({
        to: txDetails.to,
        value: ethers.parseEther(txDetails.amount.toString()),
      });

      addMessage("system", `Transaction sent! Hash: ${tx.hash}`);
      setStatus("Transaction completed");
    } catch (error: any) {
      addMessage("system", `Failed: ${error.message}`);
      setStatus("Transaction failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    processCommand(input);
    setInput("");
  };

  return (
    <div className="p-6 max-w-xl mx-auto space-y-4 font-sans bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-blue-600">🧠 AI Crypto Assistant</h1>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="mb-6">
          <button
            onClick={connectWallet}
            disabled={isLoading}
            className={`px-4 py-2 rounded-md text-white ${walletAddress ? "bg-green-500" : "bg-blue-500 hover:bg-blue-600"} ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {walletAddress ? `Connected: ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : "Connect Wallet"}
          </button>
        </div>

        <div className="mb-4 h-64 overflow-y-auto border border-gray-200 rounded-md p-3 bg-gray-50">
          {messages.map((msg, i) => (
            <div key={i} className={`mb-2 p-2 rounded-md ${msg.sender === "user" ? "bg-blue-100 ml-auto w-3/4" : msg.sender === "assistant" ? "bg-green-100 mr-auto w-3/4" : "bg-gray-100"}`}>
              <strong>{msg.sender}:</strong> {msg.content}
            </div>
          ))}
        </div>

        <div className="flex items-center mb-4">
          <input
            type="checkbox"
            id="autoSend"
            checked={autoSend}
            onChange={() => setAutoSend(!autoSend)}
            className="mr-2"
          />
          <label htmlFor="autoSend">Auto-send transactions (no confirmation)</label>
        </div>

        <form onSubmit={handleSubmit} className="flex space-x-3">
          <input
            className="flex-1 border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Type a message or 'Which crypto should I invest in?'"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={!walletAddress || isLoading}
          />
          <button
            type="submit"
            disabled={!walletAddress || isLoading || !input.trim()}
            className={`px-4 py-2 rounded-md text-white ${!walletAddress || isLoading || !input.trim() ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"}`}
          >
            {isLoading ? "..." : "Send"}
          </button>
          <button
            type="button"
            onClick={getCryptoAdvice}
            disabled={!walletAddress || isLoading}
            className={`px-4 py-2 rounded-md text-white ${!walletAddress || isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-green-500 hover:bg-green-600"}`}
          >
            Ask Crypto Advice
          </button>
        </form>

        {status && (
          <div className={`p-3 rounded-md mt-4 ${status.includes("failed") ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"}`}>{status}</div>
        )}
      </div>
    </div>
  );
}