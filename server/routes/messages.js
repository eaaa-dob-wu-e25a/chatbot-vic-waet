// routes/chatMessages.js
import express from "express";
import { randomUUID } from "crypto";
import { readChats, writeChats } from "../scripts/script.js";
import { sanitizeInputAdv, createAvatar } from "../scripts/helperFunctions.js";
import { readFile } from "fs/promises";
import { fileURLToPath } from "url";
import path from "path";

const router = express.Router({ mergeParams: true });
// mergeParams = så :id fra parent (/api/v1/chats/:id/messages) er tilgængelig her

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Load responses.json ONCE (async)
let RESPONSES = [];

async function loadResponses() {
  try {
    const p = path.resolve(__dirname, "../data/responses.json")
    RESPONSES = JSON.parse(await readFile(p, "utf8"))
  } catch {
    RESPONSES = [];
  }
}
await loadResponses(); // load at module init

function gotBotReply(userText) {
  const lower = userText.toLowerCase();
  for (const rep of RESPONSES) {
    if ((rep.label || "").toLowerCase() === "fallback") continue;
    if (rep.keywords?.some(k => lower.includes(k.toLowerCase()))) {
      const list = rep.answers ?? [];
      return list[Math.floor(Math.random() * list.length || "🤖 ...")];
    }
  }
  const fallback = RESPONSES.find(r => (r.label || "").toLowerCase() === "fallback");
  const list = fallback?.answers ?? [];
  return list[Math.floor(Math.random() * list.length || "🤖 ...")];
}

// POST /api/v1/chats/:id/messages -- kun beskeder
router.get("/", async (req, res) => {
  try {
    const chats = await readChats();
    const chat = chats.find((c) => c.id === req.params.id);
    if (!chat) return res.status(404).json({ error: "Chat not found" });
    res.json({ messages: chat.messages ?? [] });
  } catch (err) {
    console.error(err)
  }
});

// POST /api/v1/chats/:id/messages -- +user og bot svar
router.post("/", async (req, res) => {
  try {
    const value = req.body?.text;
    if (typeof value !== "string") {
      return res.status(400).json({ error: "text must be a string" });
    }
    const rawText = value;
    const text = sanitizeInputAdv(rawText).trim();

    const chats = await readChats();
    const chat = chats.find((c) => c.id === req.params.id);
    if (!chat) return res.status(404).json({ error: "Chat not found" });

    const currentUser = req.session?.user ?? {
      name: "GUEST",
      avatar: createAvatar("GUEST")
    };
    // user message
    chat.messages.push({
      id: randomUUID(),
      date: new Date().toISOString(),
      text,
      sender: "user",
      avatar: currentUser.avatar || createAvatar("Guest"),
    });

    // bot reply
    chat.messages.push({
      id: randomUUID(),
      date: new Date().toISOString(),
      text: gotBotReply(text),
      sender: "chatbot",
      avatar: createAvatar("Bot"),
    });

    await writeChats(chats);
    return res.json({ chat }); // returnér opdateret chat
  } catch (err) {
    console.error(err);
  }
});


export default router;
