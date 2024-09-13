import { useMutation } from "@tanstack/react-query";
import assetService from "../services/asset.js";
import toast from "react-hot-toast";

export const useAddAssetMutation = () => {
  return useMutation({
    mutationKey: ["asset"], // TODO: add new query key
    mutationFn: assetService.addAsset,
    retry: false,
    onError: (error) => {
      console.error(error);
      toast.error(error.message || "Failed to add an asset");
    },
  });
};
