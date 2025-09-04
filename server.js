import express from "express"; // Import express framework
import chatRoutes from "./routes/chatRoutes.js";
import signupRoutes from "./routes/signupRoutes.js";
import session from "express-session";

const server = express(); // Create an instance of express

server.set("view engine", "ejs"); // Set EJS as the templating engine
server.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded
server.use(express.static("app/script"));
server.use(express.static("app/style"));
server.use(express.static("public", {
  maxAge: '1d'
}));
server.use(
  session({
    secret: "dev-only-secret", // NOTE - change in prod
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 60 }, // 1h
  })
);

// SECTION - Routes
server.get("/", (req, res) => res.render("index"));
server.use("/chat", chatRoutes);
server.use("/signup", signupRoutes);

// Listen on port 3300
const port = 3300;
server.listen(port, () =>
  console.log(`Server running at http://localhost:${port}`)
);
