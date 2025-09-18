import express from "express";
import { sanitizeInputAdv, createAvatar, readData } from "../scripts/helperFunctions.js";
import { randomUUID } from "crypto";

const server = express();
let messages = [];

const data = "../data/responses.json";

server.get("/api/chats", async (req, res) => {
    const messages = await readData(data);
  fetch(messages)
    .then((resp) => resp.json())
    .then((d) => console.log(d))
      .catch((err) => console.error(err));
    return res.json();
});

server.post("/", (req, res) => {
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
    for (const response of data) {
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

  //Message buffer (named function) - caps array size so it never grows bigger than max
  function pushMessageSafe(arr, item, max = 100) {
    arr.push(item);
    while (arr.length > max) arr.shift(); // While loop - remove oldest element until array length <= max
  }

  // Only show msgs if no error
  if (!error) {
    // Saving user and bot msg
    pushMessageSafe(messages, {
      sender: currentUser.name || "Guest",
      avatar: currentUser.avatar || createAvatar("Guest"),
      text: userMessage,
    });

    pushMessageSafe(messages, {
      sender: "Bot",
      avatar: createAvatar("Bot"),
      text: botReply,
    });
  }
  // Send data to ESJ template - Render response view (server-side render)
  res.render("chat", {
    messages,
    botReply,
    avatar: currentUser.avatar,
    error,
    currentUser,
  });
  console.log(error); // TEST
});
