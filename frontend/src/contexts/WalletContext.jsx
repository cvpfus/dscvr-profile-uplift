import { createContext, useState } from "react";
import { useCanvasClient } from "@/hooks/useCanvasClient.js";
import { DEVNET_CHAIN_ID } from "@/constants/index.js";
import { utf8 } from "@metaplex-foundation/umi/serializers";
import { CanvasInterface } from "@dscvr-one/canvas-wallet-adapter";
import { useWallet } from "@solana/wallet-adapter-react";

export const WalletContext = createContext(null);

export const WalletProvider = ({ children }) => {
  const { client } = useCanvasClient();

  const wallet = useWallet();

  const [address, setAddress] = useState("");
  const [walletName, setWalletName] = useState("");

  const connect = async () => {
    if (client) {
      try {
        // const response = await client.connectWallet(DEVNET_CHAIN_ID);
        await wallet.connect();

        if (!wallet.publicKey) {
            throw new Error("Failed to connect wallet");
        }

        setAddress(wallet.publicKey.toString());

        // if (!response?.untrusted.success) {
        //   console.error(response?.untrusted.error);
        //   throw new Error("Failed to connect wallet");
        // }
        // setAddress(response.untrusted.address);
        // setWalletName(response.untrusted.walletName);
      } catch (error) {
        throw new Error(error.message);
      }
    } else {
      throw new Error("CanvasClient is not initialized");
    }
  };

  const disconnect = async () => {
    try {
      const canvasResponse = await client.sendMessageAndWaitResponse(
        {
          type: "wallet:disconnect-request",
          payload: {
            name: walletName,
          },
        },
        CanvasInterface.disconnectResponseSchema,
      );

      if (!canvasResponse?.untrusted.success) {
        console.error(canvasResponse?.untrusted.error);
        throw new Error("Failed to disconnect wallet");
      }

      setAddress("");
      setWalletName("");
    } catch (error) {
      throw new Error(error.message);
    }
  };

  const signMessage = async (message) => {
    try {
      const canvasResponse = await client.sendMessageAndWaitResponse(
        {
          type: "wallet:sign-message-request",
          payload: {
            name: walletName,
            unsignedMessage: utf8.serialize(message),
          },
        },
        CanvasInterface.signMessageResponseSchema,
      );

      if (!canvasResponse.untrusted.success) {
        console.error(canvasResponse?.untrusted.error);
        throw new Error("Failed to sign message");
      }

      return Array.from(canvasResponse.untrusted.signedMessage);
    } catch (error) {
      throw new Error(error.message);
    }
  };

  return (
    <WalletContext.Provider
      value={{ connect, disconnect, signMessage, address }}
    >
      {children}
    </WalletContext.Provider>
  );
};
