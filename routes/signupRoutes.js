import express from "express";
import {
  sanitizeInputAdv,
  createAvatar,
} from "../app/script/helperFunctions.js";

const router = express.Router();
const users = []; // {name, avatar}

//GET /signup
router.get("/", (req, res) => {
  // NOTE: Show signup form + current users
  res.render("signup", {
    error: "",
    success: "",
    name: "",
    users,
  });
});

//POST /signup
router.post("/", (req, res) => {
  let name = sanitizeInputAdv(req.body.name || "");
  let avatar = createAvatar(name); // NOTE - svg data url (hex bg + initials)

  // input validaton
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

  let success = "";
  if (!error) {
    success = "Signup successful!";
    users.push({ name, avatar });
    // Save current user in session
    req.session.user = { name, avatar };
    return res.render("signup", { error, name, users, avatar: "", success });
  }

  if (error) {
    // on error: stay on page /signup and show message
    return res.render("signup", { error, name, users, avatar: "" });
  }


  // redirect to /signup for safe refresh
  return res.redirect("/signup");
  //return res.redirect("/chat"); TODO - enable for prod
});

router.post("/signup/clear", (req, res) => {
  users.length = 0;
  req.session.destroy(() => res.redirect("/signup"));
});

export default router;
