import { publicKey } from "@metaplex-foundation/umi";
import { utf8 } from "@metaplex-foundation/umi/serializers";
import {
  COLLECTION_ADDRESS,
  REACTIONS,
  TEST_ADDRESS,
} from "../constants/index.js";
import { UMI0 } from "../config/index.js";
import { fetchAsset, writeData } from "@metaplex-foundation/mpl-core";
import { validatedUserInfo } from "../utils/user.js";
// TODO: refactor code duplication

const addReaction = async (req, res) => {
  const body = req.body;

  const missingFields = [];

  if (!body.assetAddress) missingFields.push("assetAddress");
  if (!body.username) missingFields.push("username");
  if (!body.signature) missingFields.push("signature");
  if (!body.reaction) missingFields.push("reaction");
  if (!body.userAddress) missingFields.push("userAddress");

  if (missingFields.length > 0)
    return res
      .status(400)
      .json({ error: `${missingFields.join(", ")} not provided` });

  if (!REACTIONS.includes(body.reaction.toLowerCase()))
    return res.status(400).json({ error: "Invalid reaction" });

  try {
    const userInfo = await validatedUserInfo(body.username);

    if (!userInfo.wallets.includes(body.userAddress.toLowerCase()))
      return res.status(400).json({
        error:
          "The connected wallet is either not paired or the 'Allow Frames' setting is turned off",
      });

    const userPublicKey = publicKey(body.userAddress);
    const assetPublicKey = publicKey(body.assetAddress);

    const signature = new Uint8Array(body.signature);

    const isSignatureCorrect = UMI0.eddsa.verify(
      utf8.serialize(body.username),
      signature,
      userPublicKey,
    );

    if (!isSignatureCorrect)
      return res.status(401).json({ error: "Signature is incorrect" });

    const asset = await fetchAsset(UMI0, body.assetAddress);

    const appData = asset.appDatas?.find(
      (data) =>
        data.dataAuthority.address.toLowerCase() === TEST_ADDRESS.toLowerCase(),
    );

    const newData = new TextEncoder().encode(
      JSON.stringify({
        ...appData.data,
        [body.username]: body.reaction,
      }),
    );

    await writeData(UMI0, {
      key: {
        type: "AppData",
        dataAuthority: {
          type: "Address",
          address: publicKey(TEST_ADDRESS),
        },
      },
      collection: {
        publicKey: COLLECTION_ADDRESS,
      },
      authority: UMI0.identity,
      data: newData,
      asset: assetPublicKey,
    }).sendAndConfirm(UMI0);

    return res.json({ message: "Data written to an asset" });
  } catch (error) {
    return res
      .status(400)
      .json({ error: error.message || "An unknown error occurred" });
  }
};

const removeReaction = async (req, res) => {
  const body = req.body;

  const missingFields = [];

  if (!body.assetAddress) missingFields.push("assetAddress");
  if (!body.username) missingFields.push("username");
  if (!body.signature) missingFields.push("signature");
  if (!body.reaction) missingFields.push("reaction");
  if (!body.userAddress) missingFields.push("userAddress");

  if (missingFields.length > 0)
    return res
      .status(400)
      .json({ error: `${missingFields.join(", ")} not provided` });

  if (!REACTIONS.includes(body.reaction.toLowerCase()))
    return res.status(400).json({ error: "Invalid reaction" });

  try {
    const userPublicKey = publicKey(body.userAddress);
    const assetPublicKey = publicKey(body.assetAddress);

    const signature = new Uint8Array(body.signature);

    const isSignatureCorrect = UMI0.eddsa.verify(
      utf8.serialize(body.username),
      signature,
      userPublicKey,
    );

    if (!isSignatureCorrect)
      return res.status(401).json({ error: "signature is incorrect" });

    const asset = await fetchAsset(UMI0, body.assetAddress);

    const appData = asset.appDatas?.find(
      (data) =>
        data.dataAuthority.address.toLowerCase() === TEST_ADDRESS.toLowerCase(),
    );

    const { [body.username]: _, ...newData } = appData.data;

    const newDataTextEncoder = new TextEncoder().encode(
      JSON.stringify(newData),
    );

    await writeData(UMI0, {
      key: {
        type: "AppData",
        dataAuthority: {
          type: "Address",
          address: publicKey(TEST_ADDRESS),
        },
      },
      collection: {
        publicKey: COLLECTION_ADDRESS,
      },
      authority: UMI0.identity,
      data: newDataTextEncoder,
      asset: assetPublicKey,
    }).sendAndConfirm(UMI0);

    return res.json({ message: "Data deleted" });
  } catch (error) {
    return res
      .status(400)
      .json({ error: error.message || "An unknown error occurred" });
  }
};

export default { addReaction, removeReaction };
