import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import assetService from "../services/asset.js";
import { useState } from "react";
import { useUmi } from "@/hooks/useUmi.js";
import { useWallet } from "@solana/wallet-adapter-react";

export const useGetAssetsByOwnerQuery = () => {
  const { publicKey } = useWallet();

  const queryClient = useQueryClient();

  const address = publicKey ? publicKey.toString() : null;

  const { umi } = useUmi();

  const [page, setPage] = useState(1);

  const getAssetsByOwnerQuery = useQuery({
    queryKey: ["assets", { address, page }],
    queryFn: () => assetService.getAssetsByOwner({ umi, address, page }),
    refetchOnWindowFocus: false,
    enabled: !!address,
    placeholderData: keepPreviousData,
    refetchInterval: () => {
      const data = queryClient.getQueryData(["assets", { address, page }]);

      if (!data) return false;

      if (data.assets.some((asset) => asset.burnt)) return 1000;
      return false;
    },
  });

  return { ...getAssetsByOwnerQuery, page, setPage };
};
