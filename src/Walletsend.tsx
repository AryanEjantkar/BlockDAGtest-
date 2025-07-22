import React, { useState } from "react";
import { ethers } from "ethers";
import {
  Connection,
  PublicKey,
  clusterApiUrl,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";

declare global {
  interface Window {
    ethereum?: any;
    phantom?: {
      solana?: any;
    };
  }
}

interface WalletSendProps {
  walletAddress: string;
  walletType: "metamask" | "phantom" | "rabby" | null;
  setStatus?: React.Dispatch<React.SetStateAction<string>>;
}

const WalletSend: React.FC<WalletSendProps> = ({
  walletAddress,
  walletType,
  setStatus,
}) => {
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");

  const sendTransaction = async () => {
    if (!walletAddress || !walletType) {
      setStatus && setStatus("Please connect your wallet first.");
      return;
    }
    if (!recipient || !amount) {
      setStatus && setStatus("Please enter recipient address and amount.");
      return;
    }

    setStatus && setStatus("Sending transaction...");

    try {
      if (walletType === "metamask" || walletType === "rabby") {
        if (!window.ethereum) {
          setStatus && setStatus("Ethereum wallet not detected.");
          return;
        }

        await window.ethereum.request({ method: "eth_requestAccounts" });

        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();

        const tx = await signer.sendTransaction({
          to: recipient,
          value: ethers.parseEther(amount),
        });

        setStatus && setStatus(`Transaction sent! Hash: ${tx.hash}`);

        const receipt = await tx.wait();
        if (receipt) {
          setStatus && setStatus(`Transaction confirmed! Hash: ${receipt.hash}`);
        } else {
          setStatus && setStatus("Transaction sent, but no confirmation received.");
        }
      } else if (walletType === "phantom") {
        const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
        const fromPubkey = new PublicKey(walletAddress);
        const toPubkey = new PublicKey(recipient);

        const transaction = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey,
            toPubkey,
            lamports: Math.floor(parseFloat(amount) * LAMPORTS_PER_SOL),
          })
        );

        transaction.feePayer = fromPubkey;
        const { blockhash } = await connection.getLatestBlockhash("finalized");
        transaction.recentBlockhash = blockhash;

        if (
          window.phantom?.solana?.signTransaction &&
          typeof window.phantom.solana.signTransaction === "function"
        ) {
          const signed = await window.phantom.solana.signTransaction(transaction);
          const sig = await connection.sendRawTransaction(signed.serialize());
          await connection.confirmTransaction(sig, "confirmed");
          setStatus && setStatus(`Transaction confirmed! Signature: ${sig}`);
        } else {
          setStatus && setStatus("Phantom wallet not available or unable to sign.");
        }
      } else {
        setStatus && setStatus("Unsupported wallet type.");
      }
    } catch (error: any) {
      setStatus && setStatus(`Transaction failed: ${error.message || error}`);
    }
  };

  return (
    <div className="flex flex-col space-y-4 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md max-w-md mx-auto">
      <input
        type="text"
        placeholder="Recipient Address"
        value={recipient}
        onChange={(e) => setRecipient(e.target.value)}
        className="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:text-white dark:border-gray-600"
      />
      <input
        type="number"
        placeholder="Amount"
        min="0"
        step="any"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:text-white dark:border-gray-600"
      />
      <button
        onClick={sendTransaction}
        className="bg-green-600 hover:bg-green-700 text-white py-2 rounded-md font-semibold"
      >
        Send
      </button>
    </div>
  );
};

export default WalletSend;
