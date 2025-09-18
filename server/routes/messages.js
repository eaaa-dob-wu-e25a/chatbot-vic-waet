import express from "express";
import { sanitizeInputAdv, createAvatar } from "../scripts/helperFunctions.js";
import RESPONSES from "../data/responses.js";

const router = express.Router();
let messages = []; // Array to store messages


router.get("/", (req, res) => {
  res.json({ messages });
});

router.post("/", (req, res) => {
});

export default router;