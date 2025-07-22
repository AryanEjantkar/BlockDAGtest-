import { useState, useEffect } from "react";
import { PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { ethers } from "ethers";

const AddTransaction = ({ chain }: { chain: "solana" | "ethereum" }) => {
  // Shared state
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  // Solana hooks
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();

  // Ethereum state
  const [ethAccount, setEthAccount] = useState<string | null>(null);

  // Fetch Ethereum account if on Ethereum chain
  useEffect(() => {
    if (chain === "ethereum" && window.ethereum) {
      window.ethereum.request({ method: "eth_requestAccounts" }).then((accounts: string[]) => {
        setEthAccount(accounts[0]);
      });
    }
  }, [chain]);

  const sendSolana = async () => {
    if (!publicKey) {
      setStatus("Connect your Solana wallet first.");
      return;
    }

    try {
      setStatus("Sending SOL...");
      const recipientPubKey = new PublicKey(recipient);
      const lamports = Math.floor(parseFloat(amount) * 1e9);

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: recipientPubKey,
          lamports,
        })
      );

      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature, "confirmed");
      setStatus(`SOL Transaction confirmed! Signature: ${signature}`);
    } catch (error: any) {
      setStatus("Error: " + error.message);
    }
  };

  const sendEthereum = async () => {
    if (!ethAccount || !recipient || !amount) {
      setStatus("Missing input or MetaMask not connected");
      return;
    }

    try {
      setStatus("Sending ETH...");
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const tx = await signer.sendTransaction({
        to: recipient,
        value: ethers.parseEther(amount),
      });

      await tx.wait();
      setStatus("ETH Transaction confirmed! Hash: " + tx.hash);
    } catch (err: any) {
      setStatus("Error: " + err.message);
    }
  };

  const handleSend = () => {
    if (chain === "solana") {
      sendSolana();
    } else if (chain === "ethereum") {
      sendEthereum();
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: 400 }}>
      <h2>Send {chain === "solana" ? "SOL" : "ETH"}</h2>
      <input
        type="text"
        placeholder="Recipient Address"
        value={recipient}
        onChange={(e) => setRecipient(e.target.value)}
        style={{ width: "100%", marginBottom: 10, padding: 8 }}
      />
      <input
        type="number"
        placeholder={`Amount in ${chain === "solana" ? "SOL" : "ETH"}`}
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        style={{ width: "100%", marginBottom: 10, padding: 8 }}
        min="0"
        step="0.0001"
      />
      <button onClick={handleSend} style={{ width: "100%", padding: 10 }}>
        Send {chain === "solana" ? "SOL" : "ETH"}
      </button>
      {status && <p style={{ marginTop: 10 }}>{status}</p>}
    </div>
  );
};

export default AddTransaction;
