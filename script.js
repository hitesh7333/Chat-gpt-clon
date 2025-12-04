const chatBox = document.getElementById("chat");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");

let messages = [];

// Load messages from storage
function loadMessages() {
  const stored = localStorage.getItem("mega_chat");
  if (stored) {
    messages = JSON.parse(stored);
    messages.forEach(msg => renderMessage(msg.text, msg.role));
    scrollToBottom();
  }
}

// Save messages
function saveMessages() {
  localStorage.setItem("mega_chat", JSON.stringify(messages));
}

// Auto Scroll
function scrollToBottom() {
  setTimeout(() => {
    chatBox.scrollTop = chatBox.scrollHeight;
  }, 100);
}

// Render message bubble
function renderMessage(text, role) {
  const msg = document.createElement("div");
  msg.className = `message ${role}`;
  msg.textContent = text;
  chatBox.appendChild(msg);
  scrollToBottom();
}

async function sendMessage() {
  const text = userInput.value.trim();
  if (!text) return;

  renderMessage(text, "user");
  messages.push({ text, role: "user" });
  saveMessages();

  userInput.value = "";
  scrollToBottom();

  // Typing bubble
  const typing = document.createElement("div");
  typing.className = "message bot";
  typing.textContent = "...";
  chatBox.appendChild(typing);
  scrollToBottom();

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: text })
    });

    const data = await res.json();

    typing.remove();
    const reply = data.reply || "Error loading response!";
    renderMessage(reply, "bot");
    messages.push({ text: reply, role: "bot" });
    saveMessages();
  } catch (error) {
    typing.remove();
    const errMsg = "Network issue — try again!";
    renderMessage(errMsg, "bot");
    messages.push({ text: errMsg, role: "bot" });
    saveMessages();
  }
}

// Event Listeners
sendBtn.addEventListener("click", sendMessage);
userInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") sendMessage();
});

// Auto scroll on keyboard open (mobile fix)
window.addEventListener('resize', scrollToBottom);

// Init
loadMessages();
