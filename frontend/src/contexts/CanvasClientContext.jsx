import { createContext, useEffect, useRef, useState } from "react";
import { CanvasClient } from "@dscvr-one/canvas-client-sdk";
import {
  CANVAS_WALLET_NAME,
  registerCanvasWallet,
} from "@dscvr-one/canvas-wallet-adapter";
import { useWallet } from "@solana/wallet-adapter-react";

export const CanvasClientContext = createContext(null);

export const CanvasClientProvider = ({ children }) => {
  const [state, setState] = useState({
    client: undefined,
    user: undefined,
    content: undefined,
    isReady: false,
  });

  const initializationStartedRef = useRef(false);

  // const { select } = useWallet();

  useEffect(() => {
    if (initializationStartedRef.current) return;

    initializationStartedRef.current = true;

    async function initializeCanvas() {
      try {
        const client = new CanvasClient();
        registerCanvasWallet(client);
        // select(CANVAS_WALLET_NAME);

        const response = await client.ready();
        setState({
          client,
          user: response.untrusted.user,
          content: response.untrusted.content,
          isReady: true,
        });
      } catch (_) {
        setState((prev) => ({ ...prev, isReady: true }));
      }
    }

    initializeCanvas();

    return () => {
      if (state.client) {
        state.client.destroy();
      }
    };
  }, []);

  return (
    <CanvasClientContext.Provider value={state}>
      {children}
    </CanvasClientContext.Provider>
  );
};
