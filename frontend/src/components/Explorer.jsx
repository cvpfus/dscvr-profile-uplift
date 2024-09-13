import toast from "react-hot-toast";
import { useCanvasClient } from "@/hooks/useCanvasClient.js";

export const Explorer = ({ publicKey, isCollection }) => {
  const { client } = useCanvasClient();

  const handleOpenExplorer = (publicKey, isCollection) => {
    if (publicKey) {
      client.openLink(
        `https://core.metaplex.com/explorer/${isCollection ? "collection/" : ""}${publicKey}?env=devnet`,
      );
    } else {
      toast.error("Public key not found");
    }
  };

  return (
    <div className="text-center">
      <a
        className="cursor-pointer text-xs my-1 border-b-2 hover:border-orange-400"
        onClick={() => handleOpenExplorer(publicKey, isCollection)}
      >
        View in Metaplex Explorer
      </a>
    </div>

  );
};
