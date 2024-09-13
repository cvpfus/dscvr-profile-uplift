import express from "express";
import collectionRoutes from "./routes/collectionRoutes.js";
import assetRoutes from "./routes/assetRoutes.js";
import pluginRoutes from "./routes/pluginRoutes.js";
import { PORT } from "./config/index.js";
import cors from "cors";

const app = express();

BigInt.prototype["toJSON"] = function () {
  return this.toString();
};


app.use(express.json());
app.use(cors());

app.use("/api/collection", collectionRoutes);
app.use("/api/asset", assetRoutes);
app.use("/api/plugin", pluginRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
