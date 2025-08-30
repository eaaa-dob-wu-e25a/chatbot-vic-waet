import express from "express"; // Import express framework
import { RESPONSES } from "./app/script/data.js";

// Sanitizing input to protect application from malicious code
function sanitizeInputAdv(input) {
  if (typeof input !== "string") return "";

  return input
    .replace(/[<>'""]/g, "") // Removes potential dangerous characters
    .replace(/script/gi, "") // Removes the word "script"
    .replace(/\s+/g, " ") // collapse whitespace
    .slice(0, 500) // Limit length to 500 characters
    .trim();
}

const server = express(); // Create an instance of express

//NOTE - Saving names in array upon submitting
const names = [];
const messages = []; //NOTE - saves messages

server.set("view engine", "ejs"); // Set EJS as the templating engine
server.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded
server.use(express.static("app/script"));
server.use(express.static("app/style"));
server.use(express.static("public"));

server.get("/", (req, res) => {
  // GET - render the index page
  res.render("index", {
    name: "",
    age: "",
    error: "",
    names,
    messages,
    botReply: "",
  }); // NOTE - sending all required params
});

//SECTION - ChatBot msg
server.post("/chat", (req, res) => {
  let userMessage = req.body.message; // Fetches messages from forminput
  //Sanitize FIRST
  userMessage = sanitizeInputAdv(userMessage);

  let botReply = "";
  let error = "";
  let avatar = "";

  // Check if msg is empty else respond
  if (!userMessage || userMessage.trim() === "") {
    error = "Send KamiBo a message to continue.";
    botReply = "How can I help you?";
  } else if (userMessage.length < 2) {
    error = "Message has to be at least 2 characters.";
    botReply = "Your message is too short. Try again.";
  } else if (userMessage.length > 500) {
    error = "Message is too long (max 500 characters)";
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
      }
      if (foundResponse) break;
    }

    //if no keywords matches
    if (!foundResponse) {
      const fallback = RESPONSES.find((item) => item.label === "fallback");
      botReply = fallback ? fallback.answers[Math.floor(Math.random() * fallback.answers.length)] :
      "I don’t know what to say 🤔";
      }

    // cap message history
    function pushMessageSafe(arr, item, max = 100) {
      arr.push(item);
      while (arr.length > max) arr.shift();
    }

    // Only show msgs if no error
    if (!error) {
      // Saving user and bot msg
      pushMessageSafe(messages, {
        sender: "User",
        text: userMessage,
      });

      pushMessageSafe(messages, {
        sender: "Bot",
        text: botReply,
      });
    }
  }

  // Send data to ESJ template
  res.render("chat", { messages, botReply, avatar, error });
  console.log(error);
});

// Listen on port 3300
const port = 3300;
server.listen(port, () =>
  console.log(`Server running at http://localhost:${port}`)
);
