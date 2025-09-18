import { readFile, writeFile } from "fs/promises";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_PATH = path.resolve(__dirname, "../data/chats.json");

// --- helpers: read / write local JSON (async/await) ---
export async function readChats() {
  const txt = await readFile(DATA_PATH, "utf8");
  return JSON.parse(txt);
}

export async function writeChats(chats) {
  await writeFile(DATA_PATH, JSON.stringify(chats, null, 2), "utf8");
}
