import { useContext } from "react";
import { CanvasClientContext } from "@/contexts/CanvasClientContext.jsx";

export function useCanvasClient() {
  const context = useContext(CanvasClientContext);
  if (!context) {
    throw new Error(
      "useCanvasClient must be used within a CanvasClientProvider",
    );
  }
  return context;
}
