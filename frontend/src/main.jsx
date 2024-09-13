import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CanvasClientProvider } from "@/contexts/CanvasClientContext.jsx";

import "./index.css";
import { UmiProvider } from "@/contexts/UmiContext.jsx";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { clusterApiUrl } from "@solana/web3.js";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";

import "@solana/wallet-adapter-react-ui/styles.css";
import toast from "react-hot-toast";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";

const queryClient = new QueryClient();

const endpoint = clusterApiUrl(WalletAdapterNetwork.Devnet);

BigInt.prototype["toJSON"] = function () {
  return this.toString();
};

createRoot(document.getElementById("root")).render(
  <CanvasClientProvider>
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider
        wallets={[]}
        onError={(error) => {
          if (error.message) toast.error(error.message);
        }}
      >
        <UmiProvider>
          <QueryClientProvider client={queryClient}>
            <App />
          </QueryClientProvider>
        </UmiProvider>
      </WalletProvider>
    </ConnectionProvider>
  </CanvasClientProvider>,
);
