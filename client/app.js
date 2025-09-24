//FRONTEND
const newChatForm = document.getElementById("new-chat-form");
const chatsList = document.getElementById("chats-list");
const chatMessages = document.getElementById("msg-bubble");
const chatTitleInput = document.getElementById("chat-title-input");
const messageForm = document.getElementById("message-form");
const messageInput = document.getElementById("chat-message-input");
const resetBtn = document.getElementById("reset-btn");
const errorDiv = document.getElementById("error");
const successDiv = document.getElementById("success");
const signupForm = document.getElementById("signup-form");
const signupInput = document.getElementById("signup-input");
const greeting = document.getElementById("greet-user");
const logoutBtn = document.getElementById("logout-btn");

const chatHeader = document.getElementById("active-chat");
const chatTotal = document.getElementById("chats-list-total");

const chatsUrl = "/api/v1/chats";
const signupUrl = "/api/v1/signup";
//const signupUrl = "/api/v1/signup";
let currentChatId = null;

window.addEventListener("DOMContentLoaded", initiate);
signupForm.addEventListener("submit", handleSignup);
messageForm.addEventListener("submit", handleSubmitMessage);
// resetBtn.addEventListener("click", handleResetChat);
newChatForm.addEventListener("submit", createNewChat);
chatsList.addEventListener("click", handleDeleteChat);
logoutBtn.addEventListener("click", handleLogout);

async function initiate() {
  const res = await fetch(`${signupUrl}/me`);
  if (res.ok) {
    const { user } = await res.json();
    // save user globally
    window.currentUser = user;

    greeting && (greeting.textContent = `Hello ${user.name}`);
    signupForm && (signupForm.style.display = "none");
    logoutBtn && (logoutBtn.style.display = "inline-flex");
  } else {
    greeting && (greeting.textContent = `Signup or log in to continue`);
    signupForm && (signupForm.style.display = "block");
    logoutBtn && (logoutBtn.style.display = "none");
    window.currentUser = null;
  }

  await loadChatList();
  const first = chatsList.querySelector("[data-chat-id]");
  if (first) {
    first.click();
  }
}

async function handleSignup(e) {
  e.preventDefault();
  const name = (signupInput?.value || "").trim();

  errorDiv.style.display = "none";
  successDiv.style.display = "none";
  logoutBtn.style.display = "none";

  if (!name) {
    errorDiv.textContent = "Enter a username.";
    errorDiv.style.display = "block";
    return;
  }
  try {
    const res = await fetch(signupUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.substring(0, 40) }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      errorDiv.textContent = data.error || `Signup failed (${res.status})`;
      errorDiv.style.display = "block";

      return;
    }
    // save new user globally
    window.currentUser = data.user;

    signupInput.value = "";
    greeting.textContent = `Hello ${data.user.name}`;
    signupForm.style.display = "none";
    logoutBtn.style.display = "block";

    successDiv.textContent = "Signed in successfully!";
    successDiv.style.display = "block";

    await loadChatList();
  } catch (err) {
    errorDiv.textContent = "Network error";
    errorDiv.style.display = "block";
  }
}

async function deleteAllUsers(e) {
  e.preventDefault();

  const id = window.currentUser?.id;
  if (!id) {
    if (errorDiv) {
      errorDiv.textContent = "No user is signed in.";
      errorDiv.style.display = "block";
    }
    return;
  }

  try {
    const res = await fetch(`${signupUrl}/clear`, { method: "DELETE" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    currentChatId = null;
    renderMessages([]);
    if (signupForm) signupForm.style.display = "block";
    await loadChatList();
  } catch (err) {
    if (errorDiv) {
      errorDiv.textContent = "Deletion failed. Try again.";
      errorDiv.style.display = "block";
    }
  }
}

// logout
async function handleLogout(e) {
  e.preventDefault();
  const id = window.currentUser?.id;
  if (!id) {
    if (errorDiv) {
      errorDiv.textContent = "No user is signed in.";
      errorDiv.style.display = "block";
    }
    return;
  }

  try {
    const res = await fetch(`${signupUrl}/clear`, { method: "DELETE" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    window.currentUser = null;
    renderMessages([]);

    signupForm && (signupForm.style.display = "block");
    greeting && (greeting.textContent = "Sign in to continue");
    logoutBtn && (logoutBtn.style.display = "none");

    await loadChatList();
  } catch (err) {
    console.error(err);
    if (errorDiv) {
      errorDiv.textContent = "Logout failed. Try again.";
      errorDiv.style.display = "block";
    }
  }
}

async function loadChatList() {
  try {
    const res = await fetch(chatsUrl);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();

    const totalChats = data.chats.length;
    chatTotal.innerHTML = `<strong>Total chats: </strong> ${totalChats}`;

    if (totalChats === 0) {
      chatTotal.innerHTML = `<h1 style="color:white; background-color:red; font-weight: 500;">Create new chat to continue.</h1>`;
    }

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
      <div id="chats-list-container" class="flx-center-row">
    <button type="button" class="chat-list-item" data-chat-id="${c.id}">
      <div class="title">${c.title ?? "Untitled"}</div>
      <div class="meta">
        <span>${new Date(c.lastAt ?? c.date).toLocaleString()}</span>
        <span class="msg-count">${c.messageCount} messages</span>
      </div>
      <div class="preview">${(c.lastPreview ?? "").slice(0, 60)}</div>
    </button>
          <button type="button" aria-label="Delete chat ‘${
            c.title ?? "Untitled"
          }’" id="chat-item-del" class="chat-del-btn" data-chat-id="${
        c.id
      }">x</button>
          </div>`
    )
    .join("");

  // click handlers
  chatsList.querySelectorAll(".chat-list-item").forEach((btn) => {
    btn.addEventListener("click", () => openChat(btn.dataset.chatId));
  });
}

async function createNewChat(e) {
  e.preventDefault();

  let chatTitle = (chatTitleInput?.value ?? "").trim();
  if (!chatTitle) chatTitle = "Untitled";

  try {
    const res = await fetch(`${chatsUrl}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: chatTitle.substring(0, 50) }),
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);

    const data = await res.json(); // { chat }

    chatTitleInput.value = "";

    await loadChatList(); //refresh sidebar chatlist
    await openChat(data.chat.id); //open created chat
  } catch (err) {
    console.error(err);
    errorDiv.textContent = "Couldn't create chat.";
    errorDiv.style.display = "block";
  }
}

async function openChat(chatId) {
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
    console.error(error);
    chatMessages.innerHTML = `<div>Could not fetch messages.</div>`;
  }
}

function renderMessages(messages) {
  if (!messages?.length) {
    chatMessages.innerHTML = "<div>No messages yet.</div>";
  } else {
    chatMessages.innerHTML = messages
      .map((m) => {
        const role = (m.sender || "").toLowerCase();
        const side = role === "user" ? "right-align" : "left-align"; //for layout purposes
        const who = m.name || m.sender || "Unknown";
        return `
      <div class="message-row ${side}">
      ${m.avatar ? `<img class="avatar" src="${m.avatar}" alt="${who}" />` : ""}
      <div class="bubble">
        <div class="meta">
          <span class="who">${escapeHtml(who)}</span>
          <span class="when">
          ${new Intl.DateTimeFormat("da-DK", {
            dataStyle: "medium",
            timeStyle: "short",
            timeZone: "Europe/Copenhagen",
          }).format(new Date(m.date))}
          </span>
        </div>
        <div class="text">${escapeHtml(m.text)}</div>
      </div>
    </div>
    `;
      })
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
    errorDiv.textContent = "Could not send message.";
    errorDiv.style.display = "block";
  }
}

async function handleResetChat() {
  try {
    const res = await fetch(`${chatsUrl}/${currentChatId}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    await loadChatList();
    renderMessages([]);
    currentChatId = null;
  } catch {
    errorDiv.textContent = "Could not reset chat.";
    errorDiv.style.display = "block";
  }
}

async function handleDeleteChat(e) {
  const delBtn = e.target.closest(".chat-del-btn");
  if (delBtn) {
    e.stopPropagation(); // Avoid opening chat
    const id = delBtn.dataset.chatId; // using button ID

    try {
      const res = await fetch(`${chatsUrl}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      if (res.status !== 204) {
        await res.json();
      }
      if (id === currentChatId) {
        currentChatId = null; //
        renderMessages([]); // clear messages
      }

      successDiv.style.display = "block";
      successDiv.textContent = "Chat deleted successfully";
      await loadChatList(); // sync/load list
      return;
    } catch (err) {
      console.error(err);
      errorDiv.style.display = "block";
      errorDiv.textContent = "Could not delete chat.";
    }
  }

  const item = e.target.closest(".chat-list-item");
  if (item) openChat(item.dataset.chatId);
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
