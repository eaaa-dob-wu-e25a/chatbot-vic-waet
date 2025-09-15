const chatMessages = document.getElementById("msg-bubble");
const form = document.getElementById("chat-form");
const input = document.getElementById("user-input");
const resetBtn = document.getElementById("reset-btn");
const errorDiv = document.getElementById("error");

async function fetchChats() {
    const res = await fetch("http://localhost:3300/api/v1/chats"); // server.js serverer endpoint = (/api/v1/chats), chat.js skal kalde blot "/" for endpoints
    if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
    const data = res.json();
    console.log(data);
}