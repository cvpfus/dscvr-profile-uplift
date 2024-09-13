import express from "express";
import collectionRoutes from "./routes/collectionRoutes.js";
import assetRoutes from "./routes/assetRoutes.js";
import llmRoutes from "./routes/llmRoutes.js";
import pluginRoutes from "./routes/pluginRoutes.js";
import { PORT, PRIVATE_KEY, SECRET_KEY } from "./config/index.js";
import cors from "cors";

const app = express();

BigInt.prototype["toJSON"] = function () {
  return this.toString();
};

const trustedProxies = [
  "173.245.48.0/20",
  "103.21.244.0/22",
  "103.22.200.0/22",
  "103.31.4.0/22",
  "141.101.64.0/18",
  "108.162.192.0/18",
  "190.93.240.0/20",
  "188.114.96.0/20",
  "197.234.240.0/22",
  "198.41.128.0/17",
  "162.158.0.0/15",
  "104.16.0.0/13",
  "104.24.0.0/14",
  "172.64.0.0/13",
  "131.0.72.0/22",
];

app.set("trust proxy", trustedProxies);

app.use(express.json());
app.use(cors());

app.use("/api/collection", collectionRoutes);
app.use("/api/asset", assetRoutes);
app.use("/api/llm", llmRoutes);
app.use("/api/plugin", pluginRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
