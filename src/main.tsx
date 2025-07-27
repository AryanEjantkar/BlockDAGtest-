import React from "react";
import { createRoot } from "react-dom/client";
import { Buffer } from "buffer"; // Correct named import

// Make Buffer globally available
if (!window.Buffer) window.Buffer = Buffer;

import App from "./App";
import SolanaWalletProvider from "./SolanaWalletProvider";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <SolanaWalletProvider>
      <App />
    </SolanaWalletProvider>
  </React.StrictMode>
);
