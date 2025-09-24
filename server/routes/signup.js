import express from "express";
import { sanitizeInputAdv, createAvatar } from "../scripts/helperFunctions.js";
import { randomUUID } from "crypto";
import path from "path";
import { readFile, writeFile } from "fs/promises";
import { fileURLToPath } from "url";

const router = express.Router();
let users = []; // { id, fullname, avatar }

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const USERS_PATH = path.resolve(__dirname, "../data/users.json");

async function loadUsers() {
  try {
    const txt = await readFile(USERS_PATH, "utf8");
    users = JSON.parse(txt);
    return users;
  } catch (err) {
    console.error(err);
    users = [];
    return users;
  }
}
async function saveUsers() {
  await writeFile(USERS_PATH, JSON.stringify(users, null, 2), "utf8");
}
await loadUsers();

// GET one user by id
router.get("/:id", async (req, res) => {
  try {
    await loadUsers();
    const user = users.find((u) => u.id === req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    return res.json({ user });
  } catch (err) {
    console.error(err);
  }
});

// GET all users
router.get("/", async (req, res) => {
  await loadUsers();
  res.json({ users });
});

// POST /api/v1/signup
router.post("/", async (req, res) => {
  try {
    // read and sanitize
    const rawText = req.body?.name ?? "";
    const name = sanitizeInputAdv(rawText).trim();

    // input validation
    if (!name)
      return res
        .status(400)
        .json({ error: "Please enter a username to continue." });
    if (name.length < 2)
      return res
        .status(400)
        .json({ error: "Username must be at least 2 characters long." });
    if (name.length > 40)
      return res
        .status(400)
        .json({ error: "Username is limited to 40 characters." });
    if (users.some((u) => u.name.toLowerCase() === name.toLowerCase())) {
      // http status existing state
      return res.status(409).json({ error: "Username is already taken." });
    }

    // create user
    const user = {
      id: randomUUID(),
      name,
      avatar: createAvatar(name),
    };

    users.push(user);
    await saveUsers();
    req.session.user = user;

    // http created status
    return res.status(201).json({ user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Signup failed. Try again." });
  }
});

router.get("/me", (req, res) => {
  const user = req.session?.user;
  if (!user) return res.status(401).json({ error: "Not signed in" });
  return res.json({ user });
});

router.delete("/:id", async (req, res) => {
  try {
    await loadUsers();

    // find id for user
    const idx = users.findIndex((u) => u.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: "User not found." });

    // remove user from array and save to disk
    users.splice(idx, 1);
    await saveUsers();

    //clear session if currentuser
    if (req.session?.user?.id === req.params.id) {
      req.session.destroy(() => {})
    }

    return res.status(200).json({
      message: "User deleted successfully",
      deletedId: req.params.id,
    })
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to delete user" });
  }
});

//clear all
router.delete("/clear", (req, res) => {
  // http status 204 no content
  req.session?.destroy(() => res.status(204).end());
});

export default router;
