import { keepPreviousData, useQuery } from "@tanstack/react-query";
import assetService from "../services/asset.js";
import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useUmi } from "@/hooks/useUmi.js";

export const useGetAssetsQuery = () => {
  const { publicKey } = useWallet();

  const { umi } = useUmi();

  const [page, setPage] = useState(1);


  const getAssetsQuery = useQuery({
    queryKey: ["assets", page],
    queryFn: () => assetService.getAssets({ umi, page }),
    refetchOnWindowFocus: false,
    enabled: !!publicKey,
    placeholderData: keepPreviousData,
  });

  return { ...getAssetsQuery, page, setPage };
};
