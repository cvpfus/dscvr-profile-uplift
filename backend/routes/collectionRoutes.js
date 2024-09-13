import express from "express";
import collectionController from "../controllers/collectionController.js";

const router = express.Router();

router.route("/").post(collectionController.addCollection);
router.route("/all").get(collectionController.getCollections);

export default router;
