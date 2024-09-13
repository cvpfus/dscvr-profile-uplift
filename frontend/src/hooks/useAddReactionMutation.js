import { useMutation, useQueryClient } from "@tanstack/react-query";
import pluginService from "../services/plugin.js";
import toast from "react-hot-toast";

export const useAddReactionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["reaction"], // TODO: add new key
    mutationFn: pluginService.addReaction,
    retry: false,
    onMutate: async ({ reaction, username, assetAddress, page }) => {
      await queryClient.cancelQueries({ queryKey: ["assets", page] });

      const previousAssets = queryClient.getQueryData(["assets", page]);

      queryClient.setQueryData(["assets", page], (old) => {
        return {
          maxPage: old.maxPage,
          assets: old.assets.map((asset) => {
            if (asset.publicKey.toLowerCase() === assetAddress.toLowerCase()) {
              return {
                ...asset,
                appDatas: {
                  ...asset.appDatas,
                  [username]: reaction,
                },
              };
            }

            return asset;
          }),
        };
      });

      return { previousAssets };
    },
    onError: (err, { page }, context) => {
      queryClient.setQueryData(["assets", page], context.previousAssets);
      toast.error(err.message || "Failed to add reaction");
    },
    onSettled: async (_, __, { page }) => {
      await queryClient.invalidateQueries({ queryKey: ["assets", page] });
    },
  });
};
