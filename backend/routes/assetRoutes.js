import express from "express";
import assetController from "../controllers/assetController.js";

const router = express.Router();

router.route("/").post(assetController.mintAsset);
router.route("/deleteOffchainData").delete(assetController.deleteOffchainData);

export default router;
