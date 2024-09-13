import { useCanvasClient } from "./hooks/useCanvasClient.js";
import { useResizeObserver } from "./hooks/useResizeObserver.js";
import { Button } from "@/components/ui/button.jsx";
import { Generator } from "@/components/Generator.jsx";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs.jsx";
import { Collection } from "@/components/Collection.jsx";
import { MyNFT } from "@/components/MyNFT.jsx";
import { Toaster } from "react-hot-toast";
import { useWallet } from "@solana/wallet-adapter-react";
import { Loader2 } from "lucide-react";
import { CANVAS_WALLET_NAME } from "@dscvr-one/canvas-wallet-adapter";

const App = () => {
  const { connect, disconnect, publicKey, select, connecting, connected } =
    useWallet();

  const address = publicKey ? publicKey.toString() : null;

  const { client, user } = useCanvasClient();

  useResizeObserver(client);

  select(CANVAS_WALLET_NAME);

  const handleConnect = async () => {
    try {
      await connect();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="m-4">
      <Toaster position="top-left" />
      <div className="flex justify-end items-center gap-2 mb-4">
        {address && (
          <div>{`${address.substring(0, 4)}...${address.substring(address.length - 4)}`}</div>
        )}
        {connected ? (
          <Button onClick={handleDisconnect}>Disconnect Wallet</Button>
        ) : (
          <Button onClick={handleConnect}>
            {connecting && <Loader2 className="w-4 h-4 animate-spin mr-1" />}
            Connect Wallet
          </Button>
        )}
      </div>
      <div className="flex justify-center">
        <Tabs
          defaultValue="generate-mint"
          className="flex flex-col items-center"
        >
          <TabsList>
            <TabsTrigger value="generate-mint">Generate & Mint</TabsTrigger>
            <TabsTrigger value="my-nft">My NFT</TabsTrigger>
            <TabsTrigger value="collection">Collection</TabsTrigger>
          </TabsList>
          <TabsContent value="generate-mint">
            <Generator user={user} />
          </TabsContent>
          <TabsContent value="my-nft">
            <MyNFT />
          </TabsContent>
          <TabsContent value="collection">
            <Collection />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default App;
