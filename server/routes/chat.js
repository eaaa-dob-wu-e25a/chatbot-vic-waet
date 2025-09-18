import express from "express";
import { sanitizeInputAdv, createAvatar } from "../scripts/helperFunctions.js";
import RESPONSES from "../data/responses.js";

const router = express.Router();
let messages = []; // Array to store messages
let chats = []; // Array to store chats

// --- IGNORE ---
// SECTION - Endpoints
// Base path: /api/v1/chats
// GET /chats (get all chats) - implemented
// POST /chats (send message + get bot reply) - implemented
// GET /chats/:id (get chat by id) - implemented
// GET /chats/all (get all chats with titles) - implemented
// DELETE /chats (delete all chats) - implemented
// DELETE /chats/:id (delete chat by id) - implemented

// GET /chat
router.get("/", (req, res) => {
  res.json({ chats });
});

// POST /chat
//SECTION - ChatBot msg
router.post("/", (req, res) => {
  let userMessage = req.body.message; // Fetches messages from forminput
  //Sanitize FIRST
  userMessage = sanitizeInputAdv(userMessage);
  const currentUser = req.session.user || {
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
    // Check keywords in RESPONSES
    let found = false;
    for (let resp of RESPONSES) {
      for (let keyword of resp.keywords) {
        if (userMessage.toLowerCase().includes(keyword.toLowerCase())) {
          // Random answer from array
          botReply =
            resp.answers[Math.floor(Math.random() * resp.answers.length)] ||
            "I'm not sure how to respond to that.";
          found = true;
          break;
        }
      }
      if (found) break;
    }
    // Fallback if no keywords matched
    if (!found) {
      const fallback = RESPONSES.find((r) => r.label === "fallback");
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
  res.json(messages, botReply, error);
  console.log(error); // TEST
});

router.get("/:id", async (req, res) => {
  const chatId = req.params.id;
  const chat = chats.find((c) => c.id === chatId);
  if (chat) {
    res.json({ chat });
  } else {
    res.status(404).json({ error: "Chat not found" });
  }
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

export default router;
