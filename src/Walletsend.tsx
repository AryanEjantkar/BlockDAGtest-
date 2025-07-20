import React, { useState, useCallback } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { BrowserProvider, parseEther } from "ethers";
import type { JsonRpcSigner } from "ethers";

declare global {
  interface Window {
    ethereum?: any;
  }
}

const WalletSend = () => {
  const { connection } = useConnection();
  const {
    publicKey: solPublicKey,
    sendTransaction,
    connected: solConnected,
    select,
  } = useWallet();

  const [ethProvider, setEthProvider] = useState<BrowserProvider | null>(null);
  const [ethSigner, setEthSigner] = useState<JsonRpcSigner | null>(null);
  const [ethConnected, setEthConnected] = useState(false);
  const [ethAccount, setEthAccount] = useState<string | null>(null);

  const [walletType, setWalletType] = useState<"ethereum" | "solana" | null>(null);
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  const connectEthereum = async () => {
    if (!window.ethereum) return alert("MetaMask not found");

    try {
      const provider = new BrowserProvider(window.ethereum);
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const signer = await provider.getSigner();
      const address = await signer.getAddress();

      setEthProvider(provider);
      setEthSigner(signer);
      setEthConnected(true);
      setEthAccount(address);
      setWalletType("ethereum");
      setStatus(`✅ Ethereum connected: ${address}`);
    } catch (err: any) {
      setStatus("Ethereum connection error: " + err.message);
    }
  };

  const connectSolana = () => {
    select("Phantom" as any);
    setWalletType("solana");
    setStatus("✅ Solana wallet selected (Phantom)");
  };

  const connectWallet = async () => {
    const choice = window.prompt("Type 'eth' to connect Ethereum or 'sol' for Solana:");
    if (choice === "eth") await connectEthereum();
    else if (choice === "sol") connectSolana();
    else alert("Invalid choice. Please type 'eth' or 'sol'.");
  };

  const sendSolana = useCallback(async () => {
    if (!solConnected || !solPublicKey) return setStatus("Please connect your Solana wallet.");
    if (!recipient || !amount) return setStatus("Please enter recipient and amount.");
    if (!sendTransaction) return setStatus("sendTransaction function not available.");

    try {
      const lamports = Math.floor(parseFloat(amount) * 1e9);
      const tx = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: solPublicKey,
          toPubkey: new PublicKey(recipient),
          lamports,
        })
      );
      const signature = await sendTransaction(tx, connection);
      setStatus("Waiting for confirmation...");
      await connection.confirmTransaction(signature, "confirmed");
      setStatus(`✅ SOL sent! Signature: ${signature}`);
    } catch (err: any) {
      setStatus("Solana send error: " + err.message);
    }
  }, [solConnected, solPublicKey, recipient, amount, sendTransaction, connection]);

  const sendEthereum = useCallback(async () => {
    if (!ethSigner) return setStatus("Please connect your Ethereum wallet.");
    if (!recipient || !amount) return setStatus("Please enter recipient and amount.");

    try {
      const tx = await ethSigner.sendTransaction({
        to: recipient,
        value: parseEther(amount),
      });
      setStatus("Waiting for Ethereum confirmation...");
      await tx.wait();
      setStatus(`✅ ETH sent! Tx Hash: ${tx.hash}`);
    } catch (err: any) {
      setStatus("Ethereum send error: " + err.message);
    }
  }, [ethSigner, recipient, amount]);

  const handleSend = async () => {
    if (walletType === "solana") await sendSolana();
    else if (walletType === "ethereum") await sendEthereum();
    else setStatus("Please connect a wallet first.");
  };

  const cryptoTips = [
    "✅ Use hardware wallets like Ledger or Trezor for large amounts.",
    "📊 Track your portfolio with apps like Zapper or DeBank.",
    "🔐 Always verify dApp URLs and avoid phishing links.",
    "🧠 Use separate wallets for testing, trading, and holding.",
    "⏳ Don't FOMO: Buy in parts, especially during volatility.",
    "🎯 Always check gas fees before sending ETH.",
  ];

  return (
    <div className="w-full bg-zinc-900 p-6 rounded-lg text-white shadow-xl">
      <h2 className="text-center text-2xl font-bold mb-4">My Crypto Wallet</h2>

      <button
        onClick={connectWallet}
        className="w-full mb-4 bg-blue-600 hover:bg-blue-500 py-2 rounded font-semibold"
      >
        {walletType ? `Connected: ${walletType.toUpperCase()}` : "Connect Wallet"}
      </button>

      <input
        type="text"
        placeholder="Recipient Address"
        value={recipient}
        onChange={(e) => setRecipient(e.target.value)}
        className="w-full mb-3 px-4 py-2 bg-zinc-800 border border-zinc-700 rounded"
      />
      <input
        type="number"
        placeholder="Amount"
        min="0"
        step="0.0001"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="w-full mb-4 px-4 py-2 bg-zinc-800 border border-zinc-700 rounded"
      />

      <button
        onClick={handleSend}
        className="w-full bg-emerald-600 hover:bg-emerald-500 py-2 rounded font-semibold"
      >
        Send
      </button>

      {status && (
        <p className="mt-4 text-center text-sm break-words text-gray-300">{status}</p>
      )}

      <div className="mt-8 p-4 bg-zinc-800 rounded">
        <h3 className="text-lg font-semibold mb-2">🤖 AI Crypto Assistant Tips</h3>
        <ul className="list-disc pl-5 space-y-1 text-sm text-zinc-300">
          {cryptoTips.map((tip, i) => (
            <li key={i}>{tip}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default WalletSend;
