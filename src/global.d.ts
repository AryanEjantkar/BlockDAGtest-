export {};

declare global {
  interface Window {
    phantom?: {
      solana?: {
        isPhantom?: boolean;
        connect: () => Promise<{ publicKey: { toString: () => string } }>;
        signTransaction?: (transaction: any) => Promise<any>;
      };
    };
    ethereum?: any;
  }
}
