import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { nodePolyfills } from "vite-plugin-node-polyfills";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), nodePolyfills()],
  server: {
    headers: {
      "Content-Security-Policy":
        "connect-src wss://api.devnet.solana.com https://*.cvpfus.xyz https://fonts.googleapis.com https://fonts.gstatic.com https://omen.tail81c24b.ts.net https://*.arweave.net https://arweave.net https://*.solana.com/ https://rpc.hellomoon.io https://simple-server-chi.vercel.app https://actions-registry.dial.to https://proxy.dial.to https://cvpfus.xyz https://edge1-proxy.dscvr.cloud; img-src https://proxy.dial.to https://ui-avatars.com https://images.dscvr.one https://*.arweave.net https://arweave.net https://*.cvpfus.xyz;",
    },
    // proxy: {
    //   "/api": {
    //     target: "http://localhost:3000",
    //     changeOrigin: true,
    //   },
    // },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      'node-fetch': 'isomorphic-fetch',
    },
  },
  base: "./",
});
