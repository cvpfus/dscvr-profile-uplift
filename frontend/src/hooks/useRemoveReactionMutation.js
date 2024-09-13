import { useMutation, useQueryClient } from "@tanstack/react-query";
import pluginService from "../services/plugin.js";
import toast from "react-hot-toast";

export const useRemoveReactionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: pluginService.removeReaction,
    retry: false,
    onMutate: async ({ assetAddress, username }) => {
      await queryClient.cancelQueries({ queryKey: ["assets"] });

      const previousAssets = queryClient.getQueryData(["assets"]);

      queryClient.setQueryData(["assets"], (old) => {
        return old.map((asset) => {
          if (asset.publicKey.toLowerCase() === assetAddress.toLowerCase()) {
            return {
              ...asset,
              appDatas: {
                ...asset.appDatas,
                [username]: "",
              },
            };
          }

          return asset;
        });
      });

      return { previousAssets };
    },
    onError: (err, _, context) => {
      queryClient.setQueryData(["assets"], context.previousAssets);
      toast.error(err.message || "Failed to remove reaction");
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ["assets"] });
    },
  });
};
