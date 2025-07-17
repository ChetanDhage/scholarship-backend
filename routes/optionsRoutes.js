import express from "express";
import { getOptions, addOption } from "../controllers/optionsController.js";

const router = express.Router();

router.get("/", getOptions);
router.post("/", addOption); // Ensure only admins can access this in a real app

export default router;
