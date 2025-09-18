//FRONTEND
const chatsList = document.getElementById("chats-list");
const chatMessages = document.getElementById("msg-bubble");
const form = document.getElementById("chat-form");
const chatInput = document.getElementById("chat-message-input");
const resetBtn = document.getElementById("reset-btn");
const errorDiv = document.getElementById("error");
const createChat = document.getElementById("new-chat");
const inputEl = document.getElementById("chat-title-input");

const chatsUrl = "http://localhost:3300/api/v1/chats";
const signupUrl = "http://localhost:3300/api/v1/signup";
let currentChatId = null;

window.addEventListener("DOMContentLoaded", fetchMessages);
form.addEventListener("submit", handleSubmit);
resetBtn.addEventListener("click", handleResetChat);
createChat.addEventListener("click", createNewChat);

function createNewChat() {
  let chatTitle = (inputEl?.value ?? "").trim();
  if (!chatTitle || chatTitle.trim() === "") {
    chatTitle = "New Chat";
  }
  chatTitle = chatTitle.trim().substring(0, 50); // Limit title length
  inputEl && (inputEl.value = "");
  renderMessages([]);
  document.querySelector(".chat-title").textContent = chatTitle;
}

async function initiate() {
  await loadChatList();
  const first = chatsList.querySelector("[data-chat-id]");
  if (first) {
    first.click();
  }
}

async function loadChatList() {
  try {
    const res = await fetch(chatsUrl);
    if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
    const data = await res.json();
    console.log(data);
    renderChatList(data.chats);
  } catch (error) {
    console.error(error);
    chatsList.innerHTML = "<div>Could not fetch chats. Try again later.</div>";
  }
}

function renderChatList(chats) {
  chatsList.innerHTML = chats
    .map(
      (c) => `
    <button class="chat-list-item" data-chat-id="${c.id}">
      <div class="title">${c.title ?? "Untitled"}</div>
      <div class="meta">
        <span>${new Date(c.lastAt ?? c.date).toLocaleString()}</span>
        <span>${c.messageCount} beskeder</span>
      </div>
      <div class="preview">${(c.lastPreview ?? "").slice(0, 60)}</div>
    </button>`
    )
    .join("");

  // click handlers
  chatsList.querySelectorAll("[data-chat-id]").forEach((btn) => {
    btn.addEventListener("click", () => openChat(btn.dataset.chatId));
  });
}

async function fetchMessages(chatId) {
  try {
    const res = await fetch(chatsUrl + "/" + chatId); // server.js serverer endpoint = (/api/v1/chats), chat.js skal kalde blot "/" for endpoints
    if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
    const data = await res.json();
    console.log(data);
    currentChatId = data.chat.id;
    renderMessages(data.chat.messages);
  } catch (error) {
    console.error("Error: ", error);
    chatMessages.innerHTML =
      "<div>Could not fetch messages. Try again later.</div>";
  }
}

function renderMessages(messages) {
  if (!messages?.length) {
    chatMessages.innerHTML = "<div>No messages yet.</div>"
    return
  }else{
    chatMessages.innerHTML = messages
      .map(
        (m) => `
      <div class="message-row ${m.sender}">
      <div class="bubble">
        <div class="meta">
          <span class="who">${m.sender}</span>
          <span class="when">${new Date(m.date).toLocaleString()}</span>
        </div>
        <div class="text">${escapeHtml(m.text)}</div>
      </div>
    </div>`
      )
      .join("");
  }
    chatMessages.scrollTop = chatMessages.scrollHeight;

}

async function handleSubmit(e) {
  e.preventDefault();
  const message = chatInput.value.trim();
  if (!message || !currentChatId) return;
  errorDiv.style.display = "none";
  try {
    const res = await fetch(`${chatsUrl}/${currentChatId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
    if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
    const data = await res.json();
    renderMessages(data.chat.messages);
    if (data.error) {
      errorDiv.textContent = data.error;
      errorDiv.style.display = "block";
    }
    chatInput.value = "";
  } catch (error) {
    errorDiv.textContent = "Server error.";
    errorDiv.style.display = "block";
  }
}

async function handleResetChat() {
  errorDiv.style.display = "none";
  try {
    const res = await fetch(chatsUrl, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error();
    const data = await res.json();
    renderMessages([]);
  } catch {
    errorDiv.textContent = "Kunne ikke nulstille chatten.";
    errorDiv.style.display = "block";
  }
}

// small XSS guard for rendering text
function escapeHtml(s) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
