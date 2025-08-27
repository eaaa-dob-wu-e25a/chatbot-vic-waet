import express from "express"; // Import express framework
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
    botReply: "",
  }); // NOTE - sending all required params
});

server.get("/chat", (req, res) => {
  // GET - render the chat page
  res.render("chat", {
    name: "",
    age: "",
    error: "",
    names,
    messages,
    botReply: "",
  });
});

//SECTION - ChatBot msg
server.post("/chat", (req, res) => {
  const userMessage = req.body.message; // Fetches messages from forminput
  let botReply = "";

  // Check if msg is empty else respond
  if (!userMessage || userMessage.trim() === "") {
    botReply = "How can I help you?";
  } else {
    botReply = `Your request: "${userMessage}"`;
  }

  // Saving user and bot msg
  messages.push({ sender: "User", text: userMessage });
  messages.push({ sender: "Kami", text: botReply });

  // Send data to ESJ template
  res.render("index", { messages, botReply });
});

// Listen on port 3000
const port = 3300;
server.listen(port, () =>
  console.log(`Server running at http://localhost:${port}`)
);
