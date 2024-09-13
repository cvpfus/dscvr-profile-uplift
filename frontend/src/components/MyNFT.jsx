import { useGetAssetsByOwnerQuery } from "@/hooks/useGetAssetsByOwnerQuery.js";
import { Loader2, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button.jsx";
import { useUmi } from "@/hooks/useUmi.js";
import { useRemoveAssetMutation } from "@/hooks/useRemoveAssetMutation.js";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Card } from "@/components/ui/card.jsx";
import { Explorer } from "@/components/Explorer.jsx";
import { useCanvasClient } from "@/hooks/useCanvasClient.js";
import { CustomPagination } from "@/components/CustomPagination.jsx";

export const MyNFT = () => {
  const { umi } = useUmi();

  const [visiblePages, setVisiblePages] = useState([]);

  const getAssetsByOwnerQuery = useGetAssetsByOwnerQuery();

  const { page, setPage } = getAssetsByOwnerQuery;

  const { isBurning, ...removeAssetMutation } = useRemoveAssetMutation();

  const { client } = useCanvasClient();

  const { publicKey } = useWallet();

  const address = publicKey ? publicKey.toString() : null;

  const assetsByOwnerData =
    getAssetsByOwnerQuery.data?.assets.length > 0
      ? getAssetsByOwnerQuery.data.assets
      : null;

  const isAssetsEmpty = getAssetsByOwnerQuery.data?.assets.length === 0;

  const maxPage = getAssetsByOwnerQuery.data
    ? getAssetsByOwnerQuery.data.maxPage
    : null;

  useEffect(() => {
    if (isAssetsEmpty && page > 1) {
      setPage((prev) => prev - 1);

      const newVisiblePages = visiblePages.slice(0, visiblePages - 1);
      setVisiblePages(newVisiblePages);
    }
  }, [isAssetsEmpty]);

  useEffect(() => {
    if (assetsByOwnerData) {
      if (maxPage === 1) setVisiblePages([1]);
      else if (maxPage === 2) setVisiblePages([1, 2]);
      else {
        if (page <= 2) setVisiblePages([1, 2, 3]);
        else if (page >= maxPage - 1)
          setVisiblePages([maxPage - 2, maxPage - 1, maxPage]);
        else setVisiblePages([page - 1, page, page + 1]);
      }
    }
  }, [assetsByOwnerData]);

  const handleBurn = async (asset) => {
    try {
      await removeAssetMutation.mutate({
        umi,
        asset,
        page,
        getAssetsByOwnerQuery,
      });
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleShare = async (asset) => {
    const html = `
    <p>Wow.. I got compliments from AI 😎</p>
    <p>Here's the result:</p>
    <img src=${asset.imageUri} alt=""/>
    <p>Now it's your turn. Try it here and mint the NFT!</p>
    <embedded-canvas url="https://uplift-ui.cvpfus.xyz"></embedded-canvas>
    `;

    await client.createPost(html);
  };

  return (
    <div>
      {!address ? <div>Connect your wallet first.</div> : null}
      {(getAssetsByOwnerQuery.isLoading ||
        getAssetsByOwnerQuery.isPlaceholderData) && (
        <div className="flex justify-center">
          <Loader2 className="animate-spin" />
        </div>
      )}

      {address && isAssetsEmpty && <div>You currently have no NFTs.</div>}

      {address && assetsByOwnerData && (
        <>
          <h2 className="text-md text-center">Danger Zone: If you burn the NFT, you still won't be able to mint a new one.</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            {assetsByOwnerData.map((asset) => {
              return (
                <Card
                  key={asset.publicKey}
                  className="p-1 flex flex-col items-center justify-center min-h-[200px]"
                >
                  {!asset.burnt && (
                    <div>
                      {!asset.imageUri && (
                        <h3 className="text-md text-center text-xs">
                          [Image not available]
                        </h3>
                      )}
                      <img
                        src={asset.imageUri}
                        alt={
                          asset.attributes
                            ? asset.attributes.attributeList.filter(
                                (attribute) => attribute.key === "upliftResult",
                              )[0]?.value
                            : asset.name
                        }
                        className={`text-center ${!asset.imageUri ? "my-4 text-xs" : ""}`}
                      />
                      <Explorer publicKey={asset.publicKey} />
                      <div className="flex mt-2">
                        <Button
                          variant="destructive"
                          onClick={() => handleBurn(asset)}
                          className="flex-1 mr-0.5"
                          disabled={isBurning}
                        >
                          {isBurning === asset.publicKey ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            "🔥"
                          )}

                          <span className="ml-2">Burn</span>
                        </Button>
                        <Button
                          onClick={() => handleShare(asset)}
                          className="flex-1 ml-0.5"
                        >
                          <Share2 className="h-4 w-4" />
                          <span className="ml-2">Share</span>
                        </Button>
                      </div>
                    </div>
                  )}
                  {asset.burnt && <div>Asset is burned</div>}
                </Card>
              );
            })}
          </div>
          <CustomPagination
            page={page}
            maxPage={maxPage}
            visiblePages={visiblePages}
            setPage={setPage}
          />
        </>
      )}
    </div>
  );
};
