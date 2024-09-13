import { fetchAssetsByOwner } from "@metaplex-foundation/mpl-core";
import { TEST_ADDRESS_2 } from "../constants/index.js";
import { UMI0 } from "../config/index.js";

export const getAllAssets = async () => {
  return await fetchAssetsByOwner(UMI0, TEST_ADDRESS_2);
};

export const getAllAssetsByOwner = async (owner) => {
  return await fetchAssetsByOwner(UMI0, owner);
};

export const decodeSvg = (dataString) => {
  return decodeURIComponent(dataString.split(",")[1]);
};