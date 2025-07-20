// src/App.tsx

import React, { useMemo, useState } from "react";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider, WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import { clusterApiUrl } from "@solana/web3.js";
import WalletSend from "./Walletsend";

import "@solana/wallet-adapter-react-ui/styles.css";

const App: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);

  const endpoint = useMemo(() => clusterApiUrl("devnet"), []);
  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);

  return (
    <div className={darkMode ? "dark" : ""}>
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>
            <main className="min-h-screen p-6 bg-white text-black dark:bg-gray-900 dark:text-white transition-all duration-500 ease-in-out">
              <div className="max-w-xl mx-auto flex flex-col items-center gap-6">

                {/* App Title */}
                <h1
                  className="text-5xl font-extrabold tracking-wide text-purple-600 dark:text-purple-400 drop-shadow-md text-center"
                  style={{ fontFamily: "Reesha, sans-serif" }}
                >
                  KryptaNator
                </h1>

                {/* Dark Mode Toggle */}
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className="px-5 py-2 rounded-full bg-gray-800 text-white dark:bg-white dark:text-black hover:scale-105 transform transition"
                >
                  {darkMode ? "☀️ Switch to Light Mode" : "🌙 Switch to Dark Mode"}
                </button>

                {/* Wallet Connect Button */}
                <div className="w-full flex justify-center">
                  <WalletMultiButton className="!bg-purple-600 hover:!bg-purple-700 !text-white !font-bold !py-2 !px-6 !rounded-full" />
                </div>

                {/* Wallet Send Component */}
                <div className="w-full bg-white dark:bg-gray-800 shadow-md p-6 rounded-xl transition">
                  <WalletSend />
                </div>

                {/* AI Assistant Placeholder */}
                <div className="w-full p-5 rounded-xl border border-dashed border-gray-400 bg-gray-50 dark:bg-gray-700 text-center transition">
                  <p className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                    🤖 Ask AI Assistant (Coming Soon)
                  </p>
                </div>

              </div>
            </main>
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </div>
  );
};

export default App;
