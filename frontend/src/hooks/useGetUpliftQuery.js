import { useQuery } from "@tanstack/react-query";
import upliftService from "../services/uplift.js";

export const useGetUpliftQuery = (username) => {
  return useQuery({
    queryKey: ["uplift", username],
    queryFn: () => upliftService.generateUplift(username),
    retry: false,
    refetchOnWindowFocus: false,
    enabled: false,
  });
};
