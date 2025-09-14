import express from "express"; // Import express framework
import cors from "cors"
import chatRoutes from "./routes/chat.js";
import signupRoutes from "./routes/signup.js";
import session from "express-session";

const server = express(); // Create an instance of express

server.use(express.static("./scripts"));
server.use(express.static("./client/styles"));
server.use(express.static("./public"));
server.use(
  session({
    secret: "dev-only-secret", // NOTE - change in prod
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 60 }, // 1h
  })
);

// SECTION - Routes
let api_v = "v1";

server.use("/chat", chatRoutes);
server.use("/signup", signupRoutes);

// Listen on port 3300
const port = 3300;
server.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
