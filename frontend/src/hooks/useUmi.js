import { useContext } from "react";
import { UmiContext } from "@/contexts/UmiContext.jsx";

export const useUmi = () => {
  const context = useContext(UmiContext);
  if (!context) {
    throw new Error("useUmi must be used within a UmiProvider");
  }
  return context;
};
