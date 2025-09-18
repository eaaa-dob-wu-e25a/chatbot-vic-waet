//FRONTEND
const chatMessages = document.getElementById("msg-bubble");
const form = document.getElementById("chat-form");
const input = document.getElementById("user-input");
const resetBtn = document.getElementById("reset-btn");
const errorDiv = document.getElementById("error");
const createChat = document.getElementById("new-chat");

const chatsUrl = "http://localhost:3300/api/v1/chats";
const signupUrl = "http://localhost:3300/api/v1/signup";

window.addEventListener("DOMContentLoaded", fetchChats);
form.addEventListener("submit", handleSubmit);
resetBtn.addEventListener("click", handleResetChat);
createChat.addEventListener("click", createNewChat);

function createNewChat() {
  let chatTitle = req.body.title;
  if (!chatTitle || chatTitle.trim() === "") {
    chatTitle = "New Chat";
  }
  chatTitle = chatTitle.trim().substring(0, 50); // Limit title length
  document.querySelector("#chat-title-input").value = "";
  renderMessages([]);
  document.querySelector(".chat-title").textContent = chatTitle;
  fetchGroups(); // Refresh groups list
}

async function fetchChats() {
  try {
    const res = await fetch("http://localhost:3300/api/v1/chats"); // server.js serverer endpoint = (/api/v1/chats), chat.js skal kalde blot "/" for endpoints
    if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
    const data = res.json();
    console.log(data);
    renderChats(data.chats);
  } catch (error) {
    console.error("Error: ", error);
    chatMessages.innerHTML = "<div>Kunne ikke hente chats.</div>";
  }
}

function renderChats(chats) {
  if (chats && chats.length) {
    let chatHTML = "";
    for (let chat of chats) {
      chatHTML += /*html*/ `
            <div class="chat-group-item">
                <div class="chat-title">${chat.title || "No Title"}</div>
                <div class="chat-date">${new Date(
                  chat.date
                ).toLocaleString()}</div>
                <div class="chat-messages"></div>           
                    ${chat.messages
                      .map(
                        (msg) => `
                        <div class="message-row ${
                          msg.sender ? msg.sender.toLowerCase() : "GUEST"
                        }">
                            ${msg.avatar} ${msg.text}
                        </div>
                    `
                      )
                      .join("")}
            </div>`;
    }
    chatMessages.innerHTML = chatHTML;
    chatMessages.scrollTop = chatMessages.scrollHeight;
  } else {
    chatMessages.innerHTML = "Ingen chats tilgængelige.";
  }
}

async function fetchMessages() {
  try {
    const res = await fetch("http://localhost:3300/api/v1/chats"); // server.js serverer endpoint = (/api/v1/chats), chat.js skal kalde blot "/" for endpoints
    if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
    const data = res.json();
    console.log(data);
    renderMessages(data.messages);
  } catch (error) {
    console.error("Error: ", error);
    chatMessages.innerHTML = "<div>Kunne ikke hente beskeder.</div>";
  }
}

function renderMessages(messages) {
  if (messages && messages.length) {
    let chatHTML = "";
    for (let message of messages) {
      chatHTML += /*html*/ `
      <div class="message-row ${
        message.sender ? message.sender.toLowerCase() : "GUEST"
      }">
        ${message.avatar} ${message.text}
      </div>`;
    }

    chatMessages.innerHTML = chatHTML;
    chatMessages.scrollTop = chatMessages.scrollHeight;
  } else {
    chatMessages.innerHTML = "helo";
  }
}

async function handleSubmit(e) {
  e.preventDefault();
  const message = input.value.trim();
  if (!message) return;
  errorDiv.style.display = "none";
  try {
    const res = await fetch(chatsUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
    const data = await res.json();
    renderChats(data.messages);
    if (data.error) {
      errorDiv.textContent = data.error;
      errorDiv.style.display = "block";
    }
    input.value = "";
  } catch (error) {
    errorDiv.textContent = "Der opstod en fejl ved kontakt til serveren.";
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
    renderMessages([]);
  } catch {
    errorDiv.textContent = "Kunne ikke nulstille chatten.";
    errorDiv.style.display = "block";
  }
}

async function fetchGroups() {
  try {
    const res = await fetch("http://localhost:3300/api/v1/chats");
    if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
    const groups = await res.json();
    console.log(groups);
    renderGroups(groups);
  } catch (error) {
    console.error("Error: ", error);
    document.getElementById("chats-list").innerHTML =
      "<div>Kunne ikke hente grupper.</div>";
  }
}

function renderGroups(groups) {
  if (groups && groups.length) {
    let groupsHTML = "";
    for (let group of groups) {
      groupsHTML += /*html*/ `
      <div class="group-item">
        ${group}
      </div>`;
    }

    document.getElementById("chats-list").innerHTML = groupsHTML;
  } else {
    document.getElementById("chats-list").innerHTML =
      "Ingen grupper tilgængelige.";
  }
}
