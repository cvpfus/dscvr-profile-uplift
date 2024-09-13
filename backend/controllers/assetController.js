import { generateSigner, publicKey } from "@metaplex-foundation/umi";
import {
  create,
  ExternalPluginAdapterSchema,
} from "@metaplex-foundation/mpl-core";

import { S3, UMI0 } from "../config/index.js";
import { COLLECTION_ADDRESS, TEST_ADDRESS } from "../constants/index.js";
import {
  decodeSvg,
} from "../utils/asset.js";
import { PutObjectCommand, DeleteObjectsCommand } from "@aws-sdk/client-s3";
import puppeteer from "puppeteer";
import { EMBED_FONT, HTML_TEMPLATE } from "../template/template.js";
import * as htmlToImage from "html-to-image";
import { generateUplift } from "../utils/uplift.js";
import { getUmi } from "../utils/umi.js";
import {
  checkUserNft,
  formatFollowerCount,
  getFirstTwoLetters,
  validatedUserInfo,
} from "../utils/user.js";
import { utf8 } from "@metaplex-foundation/umi/serializers";

const mintAsset = async (req, res) => {
  try {
    const body = req.body;
    const missingFields = [];

    if (!body.userAddress) missingFields.push("userAddress");
    if (!body.username) missingFields.push("username");
    if (!body.signature) missingFields.push("signature");

    if (missingFields.length > 0)
      return res
        .status(400)
        .json({ error: `${missingFields.join(", ")} not provided` });

    let dataUrl;
    let browser;
    let uplift;

    try {
      const userInfo = await validatedUserInfo(body.username);
      await checkUserNft();

      if (!userInfo.wallets.includes(body.userAddress.toLowerCase()))
        return res.status(400).json({
          error:
            "The connected wallet is either not paired or the 'Allow Frames' setting is turned off",
        });

      const signature = new Uint8Array(body.signature);
      const userPublicKey = publicKey(body.userAddress);

      const isSignatureCorrect = UMI0.eddsa.verify(
        utf8.serialize(body.username),
        signature,
        userPublicKey,
      );

      if (!isSignatureCorrect)
        return res.status(401).json({ error: "Signature is incorrect" });

      uplift = await generateUplift(body.username);

      if (!uplift?.content)
        return res.status(500).json({ error: "Failed to generate uplift" });

      browser = await puppeteer.launch({
        args: [
          "--disable-web-security",
          "--disable-features=IsolateOrigins",
          "--disable-site-isolation-trials",
          "--no-sandbox",
          "--disable-setuid-sandbox",
        ],
        ignoreDefaultArgs: ["--disable-extensions"],
      });
      const page = await browser.newPage();

      await page.setContent(HTML_TEMPLATE);

      await page.addStyleTag({ path: "./template/output.css" });

      dataUrl = await page.evaluate(
        async ({
          embedFont,
          username,
          uplift,
          iconUrl,
          followers,
          userMonogram,
        }) => {
          const header = document.getElementById("header");
          const content = document.getElementById("content");

          header.innerHTML = `
          <img src=${iconUrl} alt=${userMonogram} class="w-9 h-9 bg-white rounded-full flex items-center justify-center"/>
          <div class="flex flex-col text-xs text-white items-center">
            <span class="text-yellow-300">${username}</span>
            <span>${followers}</span>
          </div>
          `;

          content.innerHTML = uplift;
          const node = document.getElementById("container");
          return await htmlToImage.toSvg(node, {
            fontEmbedCSS: embedFont,
          });
        },
        {
          embedFont: EMBED_FONT,
          username: body.username,
          uplift: uplift.content,
          iconUrl: userInfo.iconUrl,
          followers: formatFollowerCount(userInfo.followerCount),
          userMonogram: getFirstTwoLetters(body.username),
        },
      );

      await browser.close();
    } catch (error) {
      if (browser) await browser.close();
      return res
        .status(500)
        .json({ error: error.message || "An unknown error occurred" });
    }

    const owner = publicKey(body.userAddress);

    const assetSigner = generateSigner(UMI0);

    const imagePath = `image/${assetSigner.publicKey}.svg`;
    const jsonPath = `metadata/${assetSigner.publicKey}.json`;

    await create(UMI0, {
      asset: assetSigner,
      collection: {
        publicKey: COLLECTION_ADDRESS,
      },
      owner: owner,
      name: `${body.username} - UpliftMeAI NFT`,
      uri: `https://storage.cvpfus.xyz/${jsonPath}`,
      plugins: [
        {
          type: "Attributes",
          attributeList: [
            { key: "owner", value: body.username },
            { key: "modelName", value: uplift.modelName },
            { key: "upliftResult", value: uplift.content },
          ],
        },
        {
          type: "AppData",
          dataAuthority: {
            type: "Address",
            address: publicKey(TEST_ADDRESS),
          },
          schema: ExternalPluginAdapterSchema.Json,
        },
      ],
    }).sendAndConfirm(UMI0);

    const imageParams = {
      Bucket: process.env.R2_BUCKET_NAME,
      Key: imagePath,
      Body: decodeSvg(dataUrl),
      ContentType: "image/svg+xml",
    };

    const jsonParams = {
      Bucket: process.env.R2_BUCKET_NAME,
      Key: jsonPath,
      Body: JSON.stringify({
        name: `${body.username} - UpliftMeAI NFT`,
        description: `Uplift result for a DSCVR profile`,
        image: `https://storage.cvpfus.xyz/${imagePath}`,
        external_url: "https://cvpfus.xyz",
        attributes: [
          { trait_type: "owner", value: body.username },
          { trait_type: "modelName", value: uplift.modelName },
          { trait_type: "upliftResult", value: uplift.content },
        ],
      }),
      ContentType: "application/json",
    };

    await S3.send(new PutObjectCommand(imageParams));
    await S3.send(new PutObjectCommand(jsonParams));

    return res.json({
      message: {
        imageUri: `https://storage.cvpfus.xyz/${imagePath}`,
        publicKey: assetSigner.publicKey,
      },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ error: error.message || "An unknown error occurred" });
  }
};

export const deleteOffchainData = async (req, res) => {
  const body = req.body;
  if (!body.publicKey)
    return res.status(400).json({ error: "publicKey not provided" });

  const umi = getUmi();

  try {
    const asset = await umi.rpc.getAsset(publicKey(body.publicKey));

    if (!asset.burnt)
      return res.status(500).json({
        error: "Failed to delete offchain data",
      });

    const deleteParams = {
      Bucket: process.env.R2_BUCKET_NAME,
      Delete: {
        Objects: [
          { Key: `metadata/${body.publicKey}.json` },
          { Key: `image/${body.publicKey}.svg` },
        ],
        Quiet: false,
      },
    };

    await S3.send(new DeleteObjectsCommand(deleteParams));

    return res.json({ message: "Offchain data has been successfully deleted" });
  } catch (error) {
    console.log("error", error.message);
    return res
      .status(500)
      .json({ error: error.message || "An unknown error occurred" });
  }
};

export default { mintAsset, deleteOffchainData };
