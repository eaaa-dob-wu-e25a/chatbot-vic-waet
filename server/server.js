//BACKEND
import express from "express"; // Import express framework
import cors from "cors"
import chatRoutes from "./routes/chat.js";
import signupRoutes from "./routes/signup.js";
import session from "express-session";
import path from 'path';
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const server = express(); // Create an instance of express
server.use(cors())
server.use(express.json())
server.use(express.static(path.resolve(__dirname, "../client"))); // directory = client
server.use(express.static("./scripts"));
server.use(express.static("../client/styles"));

server.use(
  session({
    secret: "dev-only-secret",
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 60 * 24 }, // 1 day
  })
);


// SECTION - Routes
let api_v = "v1"; // api version
const api_path = `api/${api_v}`;

server.use(`/${api_path}/chats`, chatRoutes);
//server.use(`/${api_path}/signup`, signupRoutes);


// Listen on port 3300
const port = 3000;
server.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
