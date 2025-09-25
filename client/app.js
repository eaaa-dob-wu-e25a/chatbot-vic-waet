import lockUI from "./front/lockUI.js";
import toast from "./ui/toast.js";
//FRONTEND
const newChatForm = document.getElementById("new-chat-form");
const chatsList = document.getElementById("chats-list");
const chatMessages = document.getElementById("msg-bubble");
const chatTitleInput = document.getElementById("chat-title-input");
const messageForm = document.getElementById("message-form");
const messageInput = document.getElementById("chat-message-input");
const resetBtn = document.getElementById("reset-btn");
const errorDiv = document.getElementById("error");
const signupForm = document.getElementById("signup-form");
const signupInput = document.getElementById("signup-input");
const greeting = document.getElementById("greet-user");
const logoutBtn = document.getElementById("logout-btn");
const authBtn = document.getElementById("signup")
const loginTxt = document.getElementById("login-info");

const chatHeader = document.getElementById("active-chat");
const chatTotal = document.getElementById("chats-list-total");

const chatsUrl = "/api/v1/chats";
const signupUrl = "/api/v1/profile";
//const signupUrl = "/api/v1/signup";
let currentChatId = null;
let titleEl = document.getElementById("active-chat-title");

window.addEventListener("DOMContentLoaded", initiate);
signupForm.addEventListener("submit", handleSignup);
messageForm.addEventListener("submit", handleSubmitMessage);
// resetBtn.addEventListener("click", handleResetChat);
newChatForm.addEventListener("submit", createNewChat);
chatsList.addEventListener("click", handleDeleteChat);
logoutBtn.addEventListener("click", handleLogout);

const defaultGreeting = ""
const defaultSignupTxt = "Create username";

async function initiate() {
  const res = await fetch(`${signupUrl}/me`, { credentials: "same-origin" });
  if (res.ok) {
    const { user } = await res.json();
    window.currentUser = user;

    //ui
    greeting && (greeting.textContent = `Hello ${user.name}`);
    lockUI(false);
    await loadChatList();

    const first = chatsList.querySelector("[data-chat-id]");
    if (first) first.click();
  } else {
    loggedOutUI()
    lockUI(true);
  }
}

function enterLoginMode() {
  window.authMode = "login";
  if (signupInput) {
    greeting && (greeting.textContent = "");
    loginTxt && (loginTxt.innerHTML = "")

    signupInput.placeholder = "Enter username to log in";
    signupInput.focus();
  }
  if (authBtn) authBtn.innerHTML = `<i class="fa-solid fa-arrow-right-to-bracket"></i>`;
}

async function handleSignup(e) {
  e.preventDefault();
  const name = (signupInput?.value || "").trim();
  if (!name) return toast({ error: "Enter a username" });

  try {
    let res;

    // if authentication mode is login or if user exists => login
    if (window.authMode === "login") {
      res = await fetch(`${signupUrl}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ name }),
      });
    } else {
      //create username
      res = await fetch(signupUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ name: name.substring(0, 40) }),
      })
    }

    // if username already exists = login (for DEMO purposes only)
    // if (res.status === 409) {
    //   res = await fetch(`${signupUrl}/login`, {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json" },
    //     credentials: "same-origin",
    //     body: JSON.stringify({ name }),
    //   });
    // }

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      toast({ error: data.error || `Authentication failed (${res.status})` });
      return;
    }
    // save new user globally
    window.currentUser = data.user;

    signupInput.value = "";
    greeting && (greeting.textContent = `Hello, ${data.user.name}!`);
    loginTxt && (loginTxt.innerHTML = "")
    lockUI(false)
    toast({ success: "Signed in successfully!" })

    await loadChatList();
    const first = chatsList.querySelector("[data-chat-id]");
    if (first) first.click();

    //reset mode
    window.authMode = undefined;
    if (authBtn) authBtn.textContent = "Sign up";
    signupInput.placeholder = "Create username";
  } catch {
    toast({ error: "Network error" })
  }
}

function loggedOutUI() {
  window.currentUser = null;
  currentChatId = null;

  // lock ui
  lockUI(true);
  greeting && (greeting.textContent = defaultGreeting);
  titleEl && (titleEl.textContent = "")
  // reset chats list
  chatTotal && (chatTotal.textContent = "");
  chatsList.innerHTML =
    "<div class='flx-center-col' style='height:100%; width: 100%; align-items:center'>" +
    "<p>You must login to chat.</p>" +
    "</div>";
  loginTxt.innerHTML = "<div style='height:100%; width: 100%; align-items:center'>" +
    "<p>..or <a class='link js-login-trigger'>log in</a> to chat.</p>" +
    "</div>";

  chatMessages.innerHTML = "";
  signupInput.placeholder = defaultSignupTxt;
  document
    .querySelectorAll('#chats-list .chat-list-item.is-active')
    .forEach(el => el.classList.remove('is-active'));

  document.addEventListener("click", (e) => {
    if (e.target.closest(".js-login-trigger")) {
      enterLoginMode();
    }
  });

}

// logout
async function handleLogout(e) {
  e.preventDefault();
  const id = window.currentUser?.id;
  if (!id) {
    if (errorDiv) {
      toast({ error: "No user is signed in" })
    }
    return;
  }

  try {
    const res = await fetch(`${signupUrl}/clear`, { method: "DELETE", credentials: "same-origin" });
    if (!(res.ok)) {
      let msg = `Error ${res.status}`
      try {
        const j = await res.json()
        if (j?.error) msg = j.error;
      } catch { }
      return toast({ error: msg });
    }

    window.currentUser = null;
    renderMessages([]);

    lockUI(true);
    toast({ success: "Logged out" });
    loggedOutUI();
  } catch (err) {
    console.error(err);
    toast({ error: "Logout failed" })

  }
}

async function loadChatList() {
  try {
    const res = await fetch(chatsUrl, { credentials: "same-origin" });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    const totalChats = data.chats.length;

    if (totalChats > 0) {
      chatTotal.innerHTML = `<h1><strong style="color: var(--primary)">Total chats: </strong> ${totalChats}</h1>`;
    } else {
      chatTotal.innerHTML = `<h1 style="font-weight: 500;">Get started by creating a chat!</h1>`;
    }

    renderChatList(data.chats);
  } catch (error) {
    console.error(error);
    chatsList.innerHTML = "<div>Could not fetch chats.</div>";
    chatTotal && (chatTotal.textContent = "");
  }
}

function renderChatList(chats) {
  chatsList.innerHTML = chats
    .map(
      (c) => `

  <div class="chat-row">
      <button type="button"
        class="chat-list-item ${c.id === currentChatId ? "is-active" : ""}"
        data-chat-id="${c.id}">
        <div class="title">${c.title ?? "Untitled"}</div>
        <div class="meta">
          <p class="caption">${new Date(c.lastAt ?? c.date).toLocaleString()}</p>
          <p class="caption msg-count">${c.messageCount} messages</p>
        </div>
        <div class="preview">${(c.lastPreview ?? "").slice(0, 60)}</div>
      </button>
      <button type="button" id="chat-item-del" class="chat-del-btn" data-chat-id="${c.id}" aria-label="Delete chat ‘${c.title ?? "Untitled"}’">
        <i class="fa-regular fa-trash-can"></i>
      </button>
    </div>
`
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
      credentials: "same-origin",
      body: JSON.stringify({ title: chatTitle.substring(0, 50) }),
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);

    const data = await res.json(); // { chat }
    chatTitleInput.value = "";
    toast({ success: "Chat created successfully" });

    await loadChatList(); //refresh sidebar chatlist
    await openChat(data.chat.id); //open created chat
  } catch (err) {
    console.error(err);
    toast({ error: "Couldn't create chat" });
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

  if (titleEl) {
    const t = btn?.querySelector(".title")?.textContent?.trim();
    if (t) titleEl.textContent = t;
  }
}

async function fetchMessages(chatId) {
  try {
    const res = await fetch(`${chatsUrl}/${chatId}`, { credentials: "same-origin" });
    if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
    const data = await res.json(); // {chat}
    currentChatId = data.chat.id;
    renderMessages(data.chat.messages);
  } catch (error) {
    console.error(error);
    chatMessages.innerHTML = `<div>Could not get messages.</div>`;
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
      credentials: "same-origin",
      body: JSON.stringify({ text: message }),
    });
    if (!res.ok) throw new Error(`HTTP error: ${res.status}`);

    const data = await res.json();
    renderMessages(data.chat.messages);
    messageInput.value = "";
    await loadChatList();
  } catch {
    toast({ error: "Could not send message." });
  }
}

async function handleResetChat() {
  try {
    const res = await fetch(`${chatsUrl}/${currentChatId}`, {
      method: "DELETE",
      credentials: "same-origin"
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    await loadChatList();
    renderMessages([]);
    currentChatId = null;
  } catch {
    toast({ error: "Could not reset chat." });
  }
}

async function handleDeleteChat(e) {
  const delBtn = e.target.closest(".chat-del-btn");
  if (delBtn) {
    e.stopPropagation(); // Avoid opening chat
    const id = delBtn.dataset.chatId; // using button ID

    try {
      const res = await fetch(`${chatsUrl}/${id}`, { method: "DELETE", credentials: "same-origin" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      if (res.status !== 204) {
        await res.json();
      }
      if (id === currentChatId) {
        currentChatId = null; //
        renderMessages([]); // clear messages
      }
      toast({ success: "Chat deleted succesfully" });

      await loadChatList(); // sync/load list
      const first = chatsList.querySelector("[data-chat-id]");
      if (first) {
        openChat(first.dataset.chatId);
      } else {
        currentChatId = null;
        renderMessages([]);
        document.querySelector(".title") && (document.querySelector(".title").textContent = "");
        chatMessages.innerHTML = `<div>No chats yet. Create a new chat to get started.</div>`;
      }
      return;
    } catch (err) {
      console.error(err);
      toast({ error: "Could not delete chat" });
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
