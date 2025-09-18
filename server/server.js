//BACKEND
import express from "express"; // Import express framework
import cors from "cors"
import chatRoutes from "./routes/chat.js";
import signupRoutes from "./routes/signup.js";
import messagesRoutes from "./routes/messages.js";
import session from "express-session";

const server = express(); // Create an instance of express
server.use(cors())
server.use(express.json())
server.use(express.static("./scripts"));
server.use(express.static("../client/styles"));
server.use(express.static("./public"));
server.use(
  session({
    secret: "dev-only-secret", // NOTE - change in prod
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 60 }, // 1h
  })
);

// Root endpoint
server.get("/", (req, res) => {
  res.send("Node.js Express Chatbot API 🎉");
});

// SECTION - Routes
let api_v = "v1"; // api version
const api_path = `api/${api_v}`;

server.use(`/${api_path}/chats`, chatRoutes);
server.use(`/${api_path}/signup`, signupRoutes);
server.use(`/${api_path}/chats`, messagesRoutes);

// Listen on port 3300
const port = 3300;
server.listen(port, () => {
  console.log(`Server running on https://localhost:${port}/${api_path}/chats`);
});
