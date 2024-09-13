import "dotenv/config";
import bs58 from "bs58";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { AGENT_HOST, CANISTER_ID, DEVNET_RPC } from "../constants/index.js";
import {
  createSignerFromKeypair,
  signerIdentity,
} from "@metaplex-foundation/umi";
import { HttpAgent, Actor } from "@dfinity/agent";
import { idlFactory } from "../constants/did.js";
import { S3Client } from "@aws-sdk/client-s3";
import { dasApi } from "@metaplex-foundation/digital-asset-standard-api";
import Groq from "groq-sdk";

const canisterId = CANISTER_ID;
const agent = HttpAgent.createSync({
  host: AGENT_HOST,
  verifyQuerySignatures: false,
});

export const ACTOR = Actor.createActor(idlFactory, { agent, canisterId });

export const PRIVATE_KEY = process.env.PRIVATE_KEY;
export const SECRET_KEY = bs58.decode(PRIVATE_KEY);

const umi0 = createUmi(DEVNET_RPC);
const keypair = umi0.eddsa.createKeypairFromSecretKey(SECRET_KEY);
const signer = createSignerFromKeypair(umi0, keypair);
umi0.use(signerIdentity(signer));

const umi1 = createUmi(process.env.DEVNET_HELIUS_RPC);
umi1.use(dasApi());

const umi2 = createUmi(process.env.DEVNET_QUIKNODE_RPC);
umi2.use(dasApi());

export const S3 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

export const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export const PASSWORD = process.env.PASSWORD;
export const UMI0 = umi0;
export const UMI1 = umi1;
export const UMI2 = umi2;
export const PORT = process.env.PORT;
export const AKASH_API_KEY = process.env.AKASH_API_KEY;
