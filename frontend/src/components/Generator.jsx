import { Button } from "@/components/ui/button.jsx";
import { useAddAssetMutation } from "@/hooks/useAddAssetMutation.js";
import { useCanvasClient } from "@/hooks/useCanvasClient.js";
import toast from "react-hot-toast";
import { useWallet } from "@solana/wallet-adapter-react";
import { Loader2, Share2 } from "lucide-react";
import { Explorer } from "@/components/Explorer.jsx";
import { EXAMPLE_IMG_URL } from "@/constants/index.js";
import { Skeleton } from "@/components/ui/skeleton.jsx";
import { useState } from "react";
import { utf8 } from "@metaplex-foundation/umi/serializers";

export const Generator = () => {
  const { publicKey, signMessage } = useWallet();

  const { user, client } = useCanvasClient();

  const { mutate, isPending, data, isSuccess } = useAddAssetMutation();

  const [imgLoading, setImgLoading] = useState(true);

  const address = publicKey ? publicKey.toString() : null;

  const handleMintNFT = async () => {
    if (!address) {
      toast.error("Wallet not connected.");
      return;
    }

    try {
      const signature = Array.from(
        await signMessage(utf8.serialize(user.username)),
      );

      await mutate({
        userAddress: address,
        username: user.username,
        signature,
      });
    } catch (error) {
      toast.error(error.message);
      console.error(error.message);
    }
  };

  const handleShare = async (image) => {
    const html = `
    <p>Wow.. I got compliments from AI 😎</p>
    <p>Here's the result:</p>
    <img src=${image} alt=""/>
    <p>Now it's your turn. Try it here and mint the NFT!</p>
    <embedded-canvas url="https://uplift-ui.cvpfus.xyz"></embedded-canvas>
    `;

    await client.createPost(html);
  };

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-xl text-center">
        Let AI uplift your DSCVR profile! 🌟
      </h2>

      <Button onClick={handleMintNFT} className="mt-2" disabled={isPending}>
        {isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
        Generate & Mint NFT
      </Button>

      <h5 className="text-xs mt-1">(Only 1 mint per user)</h5>

      {!data && !isPending && (
        <div className="flex flex-col justify-center items-center">
          <h2 className="text-xl mt-4 mb-1">Example</h2>
          <img src={EXAMPLE_IMG_URL} alt="example-uplift" />
        </div>
      )}

      {!data && isPending && (
        <div className="w-screen flex flex-col justify-center items-center px-4">
          <Skeleton className="w-24 h-5 mt-4" />
          <div className="rounded-2xl shadow border p-4 flex flex-col items-center mt-3 w-full xs:w-[410px]">
            <Skeleton className="w-36 h-5" />
            <Skeleton className="w-full h-[270px] mt-4" />
            <Skeleton className="w-28 h-5 mt-4" />
          </div>
        </div>
      )}

      {isSuccess && (
        <div className="flex flex-col justify-center items-center">
          <h2 className="text-xl mt-4 mb-1">Result</h2>
          {imgLoading && <Loader2 className="animate-spin my-4" />}
          <img
            src={data.data.message.imageUri}
            alt="generated-uplift"
            onLoad={() => setImgLoading(false)}
          />
          <Explorer publicKey={data.data.message.publicKey} />
          <Button
            onClick={() => handleShare(data.data.message.imageUri)}
            className="my-2"
          >
            <Share2 className="h-4 w-4" />
            <span className="ml-2">Share</span>
          </Button>
        </div>
      )}
    </div>
  );
};
