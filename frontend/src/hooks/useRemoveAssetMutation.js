import { useMutation, useQueryClient } from "@tanstack/react-query";
import assetService from "../services/asset.js";
import { useWallet } from "@solana/wallet-adapter-react";
import { useState } from "react";

export const useRemoveAssetMutation = () => {
  const queryClient = useQueryClient();

  const { publicKey } = useWallet();

  const [isBurning, setIsBurning] = useState("");

  const address = publicKey ? publicKey.toString() : null;

  const removeAssetMutation = useMutation({
    mutationFn: assetService.removeAsset,
    onMutate: ({ asset }) => {
      setIsBurning(asset.publicKey);
    },
    onSettled: () => {
      setIsBurning("");
    },
    onSuccess: async (_, { asset, page, getAssetsByOwnerQuery }) => {
      setIsBurning("");
      queryClient.setQueryData(["assets", { address, page }], (old) => {
        return {
          maxPage: old.maxPage,
          assets: old.assets.map((a) => {
            if (a.publicKey && a.publicKey.toLowerCase() === asset.publicKey.toLowerCase())
              return {
                ...a,
                burnt: true,
              };
            return a;
          }),
        };
      });
    },
  });

  return { ...removeAssetMutation, isBurning };
};
