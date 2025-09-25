const newChatForm = document.getElementById("new-chat-form");
const chatTitleInput = document.getElementById("chat-title-input");
const messageForm = document.getElementById("message-form");
const messageInput = document.getElementById("chat-message-input");
const resetBtn = document.getElementById("reset-btn");
const signupForm = document.getElementById("signup-form");
const logoutBtn = document.getElementById("logout-btn");

export default function lockUI(locked) {
    // forms
    newChatForm && (newChatForm.style.pointerEvents = locked ? "none" : "");
    newChatForm && (newChatForm.style.opacity = locked ? "0.5" : "1");

    messageForm && (messageForm.style.pointerEvents = locked ? "none" : "");
    messageForm && (messageForm.style.opacity = locked ? "0.5" : "1");

    // inputs/knapper
    chatTitleInput && (chatTitleInput.disabled = locked);
    messageInput && (messageInput.disabled = locked);
    resetBtn && (resetBtn.disabled = locked);

    // signup vises kun når locked
    signupForm && (signupForm.style.display = locked ? "block" : "none");
    logoutBtn && (logoutBtn.style.display = locked ? "none" : "inline-flex");
}