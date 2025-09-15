import express from "express";
import { sanitizeInputAdv, createAvatar } from "../scripts/helperFunctions.js";
import RESPONSES from "../data/responses.js";

const router = express.Router();
let messages = [];
// const default_path = `${api_path}/chats`;
// const id_path = `${default_path}/chats/:id`;
// const responses_api = "../data/responses.json";

router.get("/", (req, res) => {
  res.json({ messages }); //chats historik json
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
    botReply = "That's okay. No harm done.";
  } else {
    //Responses
    let lowerMessage = userMessage.toLowerCase().trim();
    let foundResponse = false;

    //Loop igennem
    for (const response of RESPONSES) {
      if (response.label === "fallback") continue;
      //Check if any keywords match
      if (response.keywords.some((keyword) => lowerMessage.includes(keyword))) {
        const randomIndex = Math.floor(Math.random() * response.answers.length);
        botReply = response.answers[randomIndex];
        console.log(
          `Chosen answer ${randomIndex + 1} of ${
            response.answers.length
          } possible`
        );
        foundResponse = true;
        break;
      } else if (!foundResponse) {
        //if no keywords matches
        const fallback = RESPONSES.find((item) => item.label === "fallback");
        botReply = fallback
          ? fallback.answers[
              Math.floor(Math.random() * fallback.answers.length)
            ]
          : "I don’t know what to say 🤔";
      }
    }
  }

  if (!error) {
    messages.push({
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      text: userMessage,
      sender: currentUser.name || "Guest",
      avatar: currentUser.avatar || createAvatar("Guest"),
    });
    messages.push({
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      text: botReply,
      sender: "Bot",
      avatar: createAvatar("Bot"),
    });
  }
  res.json(messages, botReply, error);
  console.log(error); // TEST
});

router.get("/:id", (req, res) => {
  const chat = RESPONSES.find((c) => c.id === req.params.id);
  if (!chat) return res.status(404).json({ error: "Chat not found" });
  res.json(chat);
});

router.delete("/", (req, res) => {
  messages = [];
  res.json({ messages });
});

export default router;
