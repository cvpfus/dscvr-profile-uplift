import { generateSigner } from "@metaplex-foundation/umi";
import { createCollection } from "@metaplex-foundation/mpl-core";

import { PASSWORD, S3, UMI0 } from "../config/index.js";
import { getAllCollections } from "../utils/collection.js";
import { PutObjectCommand } from "@aws-sdk/client-s3";

const addCollection = async (req, res) => {
  try {
    const body = req.body;
    if (!body.password) return res.status(401).json({ error: "unauthorized" });
    if (body.password !== PASSWORD)
      return res.status(401).json({ error: "wrong password" });

    const collectionSigner = generateSigner(UMI0);

    const jsonPath = `metadata/${collectionSigner.publicKey}.json`;

    await createCollection(UMI0, {
      collection: collectionSigner,
      name: "UpliftMeAI NFT Collection",
      uri: `https://storage.cvpfus.xyz/${jsonPath}`,
    }).sendAndConfirm(UMI0);

    const jsonParams = {
      Bucket: process.env.R2_BUCKET_NAME,
      Key: jsonPath,
      Body: JSON.stringify({
        name: `UpliftMeAI NFT Collection`,
        description: `A collection of UpliftMeAI NFT`,
        image: "https://storage.cvpfus.xyz/UpliftMeAI.png",
        external_url: "https://cvpfus.xyz",
      }),
      ContentType: "application/json",
    };

    await S3.send(new PutObjectCommand(jsonParams));

    res.json({ message: "Collection created", collectionAddress: collectionSigner.publicKey });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getCollections = async (_, res) => {
  try {
    const collections = await getAllCollections();

    res.json(collections);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export default { addCollection, getCollections };
