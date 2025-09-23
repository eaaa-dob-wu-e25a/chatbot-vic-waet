import express from "express";
import { sanitizeInputAdv, createAvatar } from "../scripts/helperFunctions.js";

const router = express.Router();
const users = []; // {name, avatar}

router.post("/signup", async (req, res) => {
  let name = sanitizeInputAdv(req.body.name || "");
  let avatar = createAvatar(name);
  req.session.user = { id, name, gender, avatar };

  // input validation
  let error = "";
  if (!name) {
    error = "Please enter a username to continue.";
  } else if (name.length < 2) {
    error = "Username must be at least 2 characters.";
  } else if (name.length > 40) {
    error = "Username is limited to 40 characters.";
  } else if (users.some((u) => u.name.toLowerCase() === name.toLowerCase())) {
    error = "Username is already taken.";
  }
});

router.post("/signup/clear", (req, res) => {
  users.length = 0;
  req.session.destroy(() => res.redirect("/signup"));
});

export default router;
