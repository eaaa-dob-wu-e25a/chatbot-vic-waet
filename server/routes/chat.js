import express from "express";
import { readChats, writeChats } from "../scripts/script.js";
import chatMessagesRouter from "./messages.js";
import signUpRouter from "./signup.js";
import { randomUUID } from "crypto";


const router = express.Router();
let chats = [];

function requireAuth(req, res, next) {
  const activeUser = req.session?.user;
  if (!activeUser) return res.status(401).json({ error: "Not signed in" })
  next();
}

router.use(requireAuth);

// GET /api/v1/chats
router.get("/", async (req, res) => {
  try {
    // show only active users chats
    const activeUser = req.session.user;
    chats = await readChats();
    const activeChats = chats.filter(c => c.ownerId === activeUser.id)

    //return a list
    const list = activeChats.map((c) => {
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
    res.status(500).json({ error: "Failed to load chats" });
  }
});

// GET /api/v1/chats/:id | Display chat with messsages
router.get("/:id", async (req, res) => {
  try {
    const activeUser = req.session.user;
    chats = await readChats();
    const chat = chats.find((c) => c.id === req.params.id && c.ownerId === activeUser.id);
    if (!chat) return res.status(404).json({ error: "Chat not found" });
    res.json({ chat });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load chat" });
  }
});

// POST /api/v1/chats
router.post("/", async (req, res) => {
  try {
    const activeUser = req.session.user;
    const title = (req.body?.title ?? "Untitled").toString().trim().slice(0, 50);

    chats = await readChats();
    const newChat = {
      id: randomUUID(),
      ownerId: activeUser.id,
      title,
      date: new Date().toISOString(),
      messages: [],
    };
    chats.push(newChat);
    await writeChats(chats);
    return res.status(201).json({ chat: newChat });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create chat" });
  }
});


// delete chat by id -- /api/v1/chats/:id
router.delete("/:id", async (req, res) => {
  try {
    const activeUser = req.session.user;
    chats = await readChats();
    const idx = chats.findIndex((c) => c.id === req.params.id && c.ownerId === activeUser.id);
    if (idx === -1) return res.status(404).json({ error: "Chat not found" });

    if (idx !== -1) {
      chats.splice(idx, 1);
      await writeChats(chats);
      res
        .status(200)
        .json({ message: "Chat deleted successfully", deletedId: req.params.id });
    } else {
      res.status(404).json({ error: "Chat not found" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete chat" });
  }
});

// Delete EVERYTHING
router.delete("/", async (req, res) => {
  try {
    const chats = await readChats();
    const activeUser = req.session.user;
    const remaining = chats.filter(c => c.ownerId !== activeUser.id);
    await writeChats(remaining)
    res.json({ message: "All chats deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete chats" });
  }
});

// use /api/v1/chats/:id -- show chats messages. user og bot svar
router.use("/:id", chatMessagesRouter);
// router.use("/:id", signUpRouter);

export default router;
