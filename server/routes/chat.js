import express from "express";
import { sanitizeInputAdv, createAvatar } from "../scripts/helperFunctions.js";
import { fileURLToPath } from "url";
import path from "path";
import { readFile } from "fs/promises";
import { readChats } from "../scripts/script.js";
import chatMessagesRouter from "./messages.js"

const router = express.Router();
let messages = []; // Array to store messages
let chats = []; // Array to store chats

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// --- IGNORE ---
// SECTION - Endpoints
// Base path: /api/v1/chats
// GET /chats (get all chats) - implemented
// POST /chats (send message + get bot reply) - implemented
// GET /chats/:id (get chat by id) - implemented
// GET /chats/all (get all chats with titles) - implemented
// DELETE /chats (delete all chats) - implemented
// DELETE /chats/:id (delete chat by id) - implemented

// Load responses.json ONCE (async)
let RESPONSES = [];
async function loadResponses() {
  const filePath = path.resolve(__dirname, "../data/responses.json");
  const text = await readFile(filePath, "utf8");
  RESPONSES = JSON.parse(text);
}
await loadResponses(); // load at module init

// GET /api/v1/chats
router.get("/", async (_req, res, next) => {
try {
  const chats = await readChats();
  //return a list
  const list = chats.map((c) => {
    const last = c.messages?.[c.messages.length - 1];
    return {
      id: c.id,
      title: c.title,
      date: c.date,
      messageCount: c.messages?.length ?? 0,
      lastPreview: last ? last.text : "",
      lastAt: last ? last.date : c.date
    }
  });
  res.json({chats: list}) // object-literal, key = chats, value = list
} catch (err) {
  next(err)
}
});

// GET /api/v1/chats/:id | Display 1 chat with messages
router.get("/:id", async(req, res, next) => {
    try {
    const chats = await readChats();
      const chat = chats.find((c) => c.id === req.params.id);
      if (!chat) return res.status(404).json({error: "Chat not found"})
  } catch (err) {
      next(err);
  }
})

// POST /chat
router.post("/", (req, res) => {
  let userMessage = (req.body?.message ?? "").toString() // Fetches messages from forminput
  //Sanitize FIRST
  userMessage = sanitizeInputAdv(userMessage);
  const currentUser = req.session?.user ?? {
    name: "GUEST",
    avatar: createAvatar("Guest"),
  };

  let botReply = "";
  let error = "";

  const isGuest = (currentUser.name || "GUEST").toUpperCase() === "GUEST";

  // Check if msg is empty else respond
  if (!userMessage || userMessage.trim() === "") {
    error = "Send KamiBo a message to continue.";
    botReply = "How can I help you?";
  } else if (isGuest && messages.length === 0) {
    botReply = "Welcome to KamiBo! How can I assist you today?";
  } else if (!isGuest && messages.length === 0) {
    botReply = `Welcome back, ${currentUser.name}! How can I assist you today?`;
  } else if (userMessage.length < 2) {
    error = "Message has to be at least 2 characters.";
    botReply = "Your message is too short. Try again.";
  } else if (userMessage.length > 250) {
    error = "Message is too long (max 250 characters)";
    botReply = "Oof.. your message is too long. Try again.";
  } else if (
    (userMessage.includes("tak") && userMessage.includes("hjælp")) ||
    (userMessage.includes("thank you") && userMessage.includes("help"))
  ) {
    botReply = "No problem - I am happy to be of help.";
  } else if (
    userMessage.includes("sorry") ||
    userMessage.includes("beklager")
  ) {
    botReply = "No worries - how can I assist you?";
  } else if (
    userMessage.includes("hvad kan du") ||
    userMessage.includes("what can you")
  ) {
    botReply =
      "I am KamiBo, your friendly chatbot! I can assist you with various tasks, answer questions, and provide information. How can I help you today?";
  } else if (
    userMessage.includes("hvordan har du det") ||
    userMessage.includes("how are you")
  ) {
    botReply = "I am just a bunch of code, but thanks for asking!";
  } else {
    // Check keywords in RESPONSES.json
    let lower = userMessage.toLowerCase();
    let found = false;

    for (let resp of RESPONSES) {
      for (let keyword of resp.keywords) {
        if (resp.label?.toLowerCase() === "fallback") continue;

        if (resp.keywords?.(some(k => lower.includes(k.toLowerCase())))) {
          // Random answer from array
          const list = resp.answers ?? [];
          botReply =
            list[Math.floor(Math.random() * list.length)] ||
            "I'm not sure how to respond to that.";
          found = true;
          break;
        }
      }
      if (found) break;
    }
    // Fallback if no keywords matched
    if (!found) {
      const fallback = RESPONSES.find(r => (r.label || "").toLowerCase() === "fallback");
      botReply =
        fallback.answers[Math.floor(Math.random() * fallback.answers.length)] ||
        "I'm not sure how to respond to that.";
    }
  }

  if (!error) {
    //user message
    messages.push({
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      text: userMessage,
      sender: currentUser.name || "Guest",
      avatar: currentUser.avatar || createAvatar("Guest"),
    });
    // bot reply
    messages.push({
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      text: botReply,
      sender: "KamiBo",
      avatar: createAvatar("Bot"),
    });
  }
  res.json(messages, error, botReply);
  console.log(error); // TEST
});

// delete chat by id
router.delete("/:id", async (req, res) => {
  const chats = await fetchChats();
  const chatId = req.params.id;
  const chatIndex = chats.findIndex((c) => c.id === chatId);
  if (chatIndex !== -1) {
    chats.splice(chatIndex, 1);
    res.json({ message: "Chat deleted" });
  } else {
    res.status(404).json({ error: "Chat not found" });
  }
});

// Delete EVERYTHING
router.delete("/", (req, res) => {
  messages = [];
  chats = [];
  res.json({ messages, chats });
});

router.use("/:id/messages", chatMessagesRouter);

export default router;
