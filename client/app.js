//FRONTEND
const newChatForm = document.getElementById("new-chat-form");
const chatsList = document.getElementById("chats-list");
const chatMessages = document.getElementById("msg-bubble");
const chatTitleInput = document.getElementById("chat-title-input");
const messageForm = document.getElementById("message-form");
const messageInput = document.getElementById("chat-message-input");
const resetBtn = document.getElementById("reset-btn");
const errorDiv = document.getElementById("error");

const chatsUrl = "/api/v1/chats";
//const signupUrl = "/api/v1/signup";
let currentChatId = null;

window.addEventListener("DOMContentLoaded", initiate);
messageForm.addEventListener("submit", handleSubmitMessage);
resetBtn.addEventListener("click", handleResetChat);
newChatForm.addEventListener("submit", createNewChat);

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
    renderChatList(data.chats);
  } catch (error) {
    console.error(error);
    chatsList.innerHTML = "<div>Could not fetch chats.</div>";
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

async function createNewChat() {
  let chatTitle = (chatTitleInput?.value ?? "").trim();
  if (!chatTitle) chatTitle = "Untitled";

  try {
    const res = await fetch(`${chatsUrl}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: chatTitle.substring(0, 50) }),
    });
    if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
    const data = await res.json();
    chatTitleInput && (chatTitleInput.value = "");
    
    await loadChatList(); //refresh sidebar chatlist
    await openChat(data.chat.id); //open created chat
  } catch {
    errorDiv.textContent = "Couldn't create chat.";
    errorDiv.style.display = "block";
  }
}

async function openChat(chatId) {
  // TODO: styling => highlight selected chat
  document
    .querySelectorAll("#chats-list .chat-list-item.is-active")
    .forEach((el) => el.classList.remove("is-active"));
  const btn = document.querySelector(`[data-chat-id="${chatId}"]`);
  if (btn) btn.classList.add("is-active");

  // load + render messages
  await fetchMessages(chatId);

  let titleEl = document.querySelector(".title");
  if (titleEl) {
    const t = btn?.querySelector(".title")?.textContent?.trim();
    if (t) titleEl.textContent = t;
  }
}

async function fetchMessages(chatId) {
  try {
    const res = await fetch(`${chatsUrl}/${chatId}`);
    if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
    const data = await res.json(); // {chat}
    currentChatId = data.chat.id;
    renderMessages(data.chat.messages);
  } catch (error) {
    console.error("Error: ", error);
    chatMessages.innerHTML = `<div class="bubble">Could not fetch messages.</div>`;
  }
}

function renderMessages(messages) {
  if (!messages?.length) {
    chatMessages.innerHTML = "<div>No messages yet.</div>";

  } else {
    
    chatMessages.innerHTML = messages
      .map(
        (m) =>
          `
      <div class="message-row ${m.sender}">
      ${
        m.avatar
          ? `<img class="avatar" src="${m.avatar}" alt="${m.sender}" />`
          : ""
      }
      <div class="bubble">
        <div class="meta">
          <span class="who">${m.sender}</span>
          <span class="when">${new Date(m.date).toISOString()}</span>
        </div>
        <div class="text">${escapeHtml(m.text)}</div>
      </div>
    </div>`
      )
      .join("");
  }
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

async function handleSubmitMessage(e) {
  e.preventDefault();
  let message = messageInput.value.trim();
  if (!message || !currentChatId) return;

  try {
    const res = await fetch(`${chatsUrl}/${currentChatId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: message }),
    });
    if (!res.ok) throw new Error(`HTTP error: ${res.status}`);

    const data = await res.json();
    renderMessages(data.chat.messages);
    messageInput.value = "";
    await loadChatList();
  } catch {
    errorDiv.textContent = "Server error.";
    errorDiv.style.display = "block";
  }
}

async function handleResetChat() {
  try {
    const res = await fetch(`${chatsUrl}/${currentChatId}`);
    if (!res.ok) throw new Error();
    await loadChatList();
    renderMessages([]);
    currentChatId = null;
  } catch {
    errorDiv.textContent = "Could not reset chat.";
    errorDiv.style.display = "block";
  }
}

// small XSS guard for rendering text
function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
