import { fetchCollectionsByUpdateAuthority } from "@metaplex-foundation/mpl-core";
import { UMI0 } from "../config/index.js";
import { publicKey } from "@metaplex-foundation/umi";
import { TEST_ADDRESS } from "../constants/index.js";

export const getAllCollections = async () => {
  return await fetchCollectionsByUpdateAuthority(UMI0, publicKey(TEST_ADDRESS));
};
