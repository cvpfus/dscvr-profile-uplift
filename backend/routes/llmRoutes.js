import express from "express";
import llmController from "../controllers/llmController.js";
const router = express.Router();

router.route("/").post(llmController.getUplift);

export default router;
