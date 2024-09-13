import express from "express";
import pluginController from "../controllers/pluginController.js";
const router = express.Router();

router.route("/").post(pluginController.addReaction);
router.route("/").delete(pluginController.removeReaction);

export default router;