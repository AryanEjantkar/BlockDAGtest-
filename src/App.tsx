import { useState } from "react";
import { ethers } from "ethers";

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

export default function AIWalletAssistant() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [response, setResponse] = useState<any>(null);
  const [investmentAdvice, setInvestmentAdvice] = useState<any[]>([]);
  const [status, setStatus] = useState("");

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        setStatus("MetaMask or another wallet extension is required.");
        return;
      }
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      setWalletAddress(accounts[0]);
      setStatus("Wallet connected");
    } catch (error: any) {
      setStatus(`Connection failed: ${error.message || error}`);
    }
  };

  const parseCommand = async (command: string) => {
    setStatus("Parsing...");
    setInvestmentAdvice([]); // Clear investment advice on new command
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4",
          messages: [
            {
              role: "system",
              content:
                "You are a crypto assistant. Extract intent and transaction details from user input. Respond only with JSON.",
            },
            {
              role: "user",
              content: command,
            },
          ],
        }),
      });

      const data = await res.json();
      const parsed = JSON.parse(data.choices[0].message.content);
      setResponse(parsed);
      setStatus("Parsed");
    } catch (error: any) {
      setStatus(`Parsing failed: ${error.message || error}`);
    }
  };

  const sendTransaction = async () => {
    if (!response || !walletAddress) {
      setStatus("No transaction data or wallet connected.");
      return;
    }
    try {
      setStatus("Sending transaction...");
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const tx = await signer.sendTransaction({
        to: response.to,
        value: ethers.parseEther(response.amount.toString()),
      });

      setStatus(`Transaction sent: ${tx.hash}`);
      await tx.wait(); // Wait for confirmation
      setStatus(`Transaction confirmed: ${tx.hash}`);
    } catch (error: any) {
      setStatus(`Transaction failed: ${error.message || error}`);
    }
  };

  const getInvestmentAdvice = async (query: string) => {
    setStatus("Fetching investment advice...");
    setResponse(null); // Clear transaction response on new advice request
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4",
          messages: [
            {
              role: "system",
              content:
                'You are a crypto investment advisor. Given the user query, provide a JSON list of 3 promising cryptocurrencies to invest in right now. Each entry should include "name", "symbol", and "reason".',
            },
            {
              role: "user",
              content: query,
            },
          ],
        }),
      });

      const data = await res.json();
      const advice = JSON.parse(data.choices[0].message.content);
      setInvestmentAdvice(advice);
      setStatus("Investment advice ready");
    } catch (error: any) {
      setStatus(`Failed to get advice: ${error.message || error}`);
    }
  };

  return (
    // The outermost div will now primarily control layout and sizing of its children,
    // assuming the background is applied to body/html
    <div className="min-h-screen flex items-center justify-start p-4"> {/* Changed justify-center to justify-start */}
      <div className="bg-white shadow-lg rounded-2xl p-8 max-w-sm w-full space-y-6"> {/* max-w-sm keeps the card size */}
        <h1 className="text-3xl font-bold text-center flex items-center justify-center gap-2 text-gray-800">
          <span role="img" aria-label="crypto-logo">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-indigo-600"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z" />
              <path d="M10.843 8.7L9.006 7.472 10.605 7l1.799 1.228-1.561.472zm2.146 6.6L14.994 16.528 13.395 17l-1.799-1.228 1.561-.472zm-2.146-3.3L9.006 10.472 10.605 10l1.799 1.228-1.561.472zm2.146 3.3L14.994 13.528 13.395 14l-1.799-1.228 1.561-.472zM12 7.7c-2.316 0-4.2 1.884-4.2 4.2s1.884 4.2 4.2 4.2 4.2-1.884 4.2-4.2-1.884-4.2-4.2-4.2zm0 6.4c-1.215 0-2.2-.985-2.2-2.2s.985-2.2 2.2-2.2 2.2.985 2.2 2.2-.985 2.2-2.2 2.2z" />
            </svg>
          </span>
          Cryptanator
        </h1>

        <div className="flex justify-center">
          <button
            onClick={connectWallet}
            className="bg-indigo-700 hover:bg-indigo-800 transition text-white font-medium px-6 py-3 rounded-lg shadow-md w-full"
          >
            {walletAddress
              ? `Connected: ${walletAddress.slice(0, 6)}...`
              : "Connect Wallet"}
          </button>
        </div>

        <input
          className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-indigo-400"
          placeholder="e.g., Send 0.1 ETH to 0x123..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />

        <button
          onClick={() => parseCommand(input)}
          className="bg-green-600 hover:bg-green-700 transition text-white font-medium px-4 py-3 rounded-lg w-full shadow-md"
        >
          Ask Assistant
        </button>

        <div className="mt-4">
          <button
            onClick={() =>
              getInvestmentAdvice("Suggest 3 cryptocurrencies to invest in right now")
            }
            className="bg-purple-600 hover:bg-purple-700 transition text-white font-medium px-4 py-3 rounded-lg w-full shadow-md"
          >
            Get Crypto Investment Advice
          </button>
        </div>

        {status && (
          <p className="text-center text-gray-700 text-sm">
            <strong>Status:</strong> {status}
          </p>
        )}

        {response && (
          <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-lg space-y-2">
            <p className="text-gray-800">
              <strong>Intent:</strong> {response.action}
            </p>
            <p className="text-gray-800">
              <strong>Amount:</strong> {response.amount} ETH
            </p>
            <p className="text-gray-800">
              <strong>To:</strong> {response.to}
            </p>
            <button
              onClick={sendTransaction}
              className="bg-red-600 hover:bg-red-700 transition text-white px-4 py-2 rounded-lg mt-2 shadow-md"
            >
              Confirm & Send
            </button>
          </div>
        )}

        {investmentAdvice.length > 0 && (
          <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-lg mt-6 space-y-2">
            <h3 className="text-lg font-semibold mb-2 text-gray-800">Investment Recommendations:</h3>
            <ul className="list-disc list-inside text-gray-700">
              {investmentAdvice.map((coin, idx) => (
                <li key={idx}>
                  <strong>
                    {coin.name} ({coin.symbol}):
                  </strong>{" "}
                  {coin.reason}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}