import express from "express";
import { readChats, writeChats } from "../scripts/script.js";
import chatMessagesRouter from "./messages.js";
import signUpRouter from "./signup.js"
import { randomUUID } from 'crypto';

const router = express.Router();
let chats = [];
// --- IGNORE ---
// SECTION - Endpoints
// Base path: /api/v1/chats
// GET /chats (get all chats) - implemented
// POST /chats (new chat) - implemented
// GET /chats/:id (get chat by id) - implemented
// GET /chats/all (get all chats with titles) - implemented
// DELETE /chats (delete all chats) - implemented
// DELETE /chats/:id (delete chat by id) - implemented

// GET /api/v1/chats
router.get("/", async (_req, res) => {
  try {
    chats = await readChats();
    //return a list
    const list = chats.map((c) => {
      //const last = c.messages?.[c.messages.length - 1];
      return {
        id: c.id,
        title: c.title,
        date: c.date,
        messageCount: c.messages?.length ?? 0,
        // lastPreview: last ? last.text : "",
        // lastAt: last ? last.date : c.date,
      };
    });
    res.json({ chats: list }); // object-literal, key = chats, value = list
  } catch (err) {
    console.error(err);
  }
});

// GET /api/v1/chats/:id | Display one chat with messages
router.get("/:id", async (req, res) => {
  try {
    chats = await readChats();
    const chat = chats.find((c) => c.id === req.params.id);
    if (!chat) return res.status(404).json({ error: "Chat not found" });
    res.json({ chat });
  } catch (err) {
    console.error(err);
  }
});

// POST /api/v1/chats
router.post("/", async (req, res) => {
  try {
    const title = (req.body?.title ?? "Untitled")

    chats = await readChats();
    const newChat = {
      id: randomUUID(),
      title: title,
      date: new Date().toISOString(),
      messages: [],
    };
    chats.push(newChat);
    await writeChats(chats);
    return res.status(201).json({ chat: newChat });
  } catch (err) {
    console.error(err);
  }
});

// delete chat by id
router.delete("/:id", async (req, res) => {
  chats = await readChats();
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
router.delete("/", async (req, res) => {
  try {
    await writeChats([]);
    res.json({ message: "All chats deleted" });
  } catch (err) {
    console.error(err);
  }
});

// use /api/v1/chats/:id -- show chats messages. user og bot svar
router.use("/:id", chatMessagesRouter);
// router.use("/:id", signUpRouter);

export default router;
