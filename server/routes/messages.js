// routes/chatMessages.js
import express from "express";
import { randomUUID } from "crypto";
import { readChats, writeChats } from "../scripts/script.js";

const router = express.Router({ mergeParams: true });
// mergeParams = så :id fra parent (/api/v1/chats/:id/messages) er tilgængelig her

router.post("/", async (req, res, next) => {
  try {
    const { text } = req.body ?? {};
    if (!text || !text.trim()) {
      return res.status(400).json({ error: "Message text is required" });
    }

    const chats = await readChats();
    const chat = chats.find((c) => c.id === req.params.id);
    if (!chat) return res.status(404).json({ error: "Chat not found" });

    // user message
    chat.messages.push({
      id: randomUUID(),
      date: new Date().toISOString(),
      text: text.trim(),
      sender: "user",
    });

    // dummy bot reply
    chat.messages.push({
      id: randomUUID(),
      date: new Date().toISOString(),
      text: "🤖 I have received your message!",
      sender: "chatbot",
    });

    await writeChats(chats);
    res.json({ chat }); // returnér opdateret chat
  } catch (err) {
    next(err);
  }
});

export default router;
