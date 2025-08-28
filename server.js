import express from "express"; // Import express framework
import responses from "./app/script/data.js";

const server = express(); // Create an instance of express// Listen on port 3000

//NOTE - Saving names in array upon submitting
const names = [];
// const ages = [];
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
    botReply: ""
  }); // NOTE - sending all required params
});

//SECTION - ChatBot msg
server.post("/chat", (req, res) => {
  const userMessage = req.body.message; // Fetches messages from forminput
  let botReply = "";
  const avatar = "";


  // Check if msg is empty else respond
  if (!userMessage || userMessage.trim() === "") {
    botReply = "How can I help you?";
  } else {
    //Responses
    const lowerMessage = userMessage.toLowerCase();
    let foundResponse = false;

    //Loop igennem 
    for (let response of responses) {
      //Check if any keywords match
      for (let keyword of response.keywords) {
        if (lowerMessage.includes(keyword)) {
          //Generate response from array
          const randomIndex = Math.floor(
            Math.random() * response.answers.length
          );
          botReply = response.answers[randomIndex];
          foundResponse = true;
          break;
        }
      }
      if (foundResponse) break;
    }

    //if no keywords matches
    if (!foundResponse) {
      botReply = `Unfortunately I don't have an answer for that or try again.`;
    }

  }

  // Saving user and bot msg
  messages.push({ sender: "User", text: userMessage, avatar: "" });
  messages.push({ sender: "Bot", text: botReply, avatar: "/public/_custom-icons/submit.svg" });

  // Send data to ESJ template
  res.render("chat", { messages, botReply });
});

// Listen on port 3000
const port = 3300;
server.listen(port, () =>
  console.log(`Server running at http://localhost:${port}`)
);
