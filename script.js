// Basic state
let chats = [];
let currentChatId = null;

const contentEl = document.getElementById("content");
const chatListEl = document.getElementById("chatList");
const sidebar = document.getElementById("sidebar");
const sidebarOverlay = document.getElementById("sidebarOverlay");
const menuBtn = document.getElementById("menuBtn");
const newChatBtn = document.getElementById("newChatBtn");
const inp = document.getElementById("inp");
const sendBtn = document.getElementById("sendBtn");
const micBtn = document.getElementById("micBtn");

// ---------- STORAGE ----------
function loadChats() {
  try {
    const raw = localStorage.getItem("mega_ai_chats");
    if (!raw) {
      chats = [];
      currentChatId = null;
      return;
    }
    chats = JSON.parse(raw) || [];
    if (chats.length) currentChatId = chats[0].id;
  } catch {
    chats = [];
    currentChatId = null;
  }
}

function saveChats() {
  localStorage.setItem("mega_ai_chats", JSON.stringify(chats));
}

// ---------- HELPERS ----------
function createChat(title = "New chat") {
  const id = Date.now().toString();
  const chat = { id, title, messages: [] };
  chats.unshift(chat); // newest on top
  currentChatId = id;
  saveChats();
  renderAll();
}

function getCurrentChat() {
  return chats.find(c => c.id === currentChatId) || null;
}

function setChatTitleFromFirstMessage(chat) {
  if (!chat || !chat.messages.length) return;
  const first = chat.messages.find(m => m.role === "user");
  if (!first) return;
  let t = first.text.trim();
  if (t.length > 40) t = t.slice(0, 40) + "…";
  chat.title = t || "New chat";
}

function openSidebar(open) {
  if (open) {
    sidebar.classList.add("open");
    sidebarOverlay.classList.add("open");
  } else {
    sidebar.classList.remove("open");
    sidebarOverlay.classList.remove("open");
  }
}

// ---------- RENDER ----------
function renderSidebar() {
  chatListEl.innerHTML = "";
  if (!chats.length) {
    chatListEl.innerHTML = `<div style="font-size:13px;color:#6b7280;">No chats yet. Start one from the main screen.</div>`;
    return;
  }
  chats.forEach(chat => {
    const div = document.createElement("div");
    div.className = "chat-item" + (chat.id === currentChatId ? " active" : "");
    div.onclick = () => { currentChatId = chat.id; renderAll(); openSidebar(false); };

    const titleSpan = document.createElement("span");
    titleSpan.className = "chat-title";
    titleSpan.textContent = chat.title || "New chat";

    const acts = document.createElement("div");
    acts.className = "chat-actions";
    const rename = document.createElement("span");
    rename.textContent = "✏️";
    rename.onclick = (e) => {
      e.stopPropagation();
      const newName = prompt("Chat title:", chat.title || "");
      if (newName !== null) {
        chat.title = newName.trim() || chat.title;
        saveChats();
        renderSidebar();
      }
    };
    const del = document.createElement("span");
    del.textContent = "🗑️";
    del.onclick = (e) => {
      e.stopPropagation();
      chats = chats.filter(c => c.id !== chat.id);
      if (!chats.length) currentChatId = null;
      else if (currentChatId === chat.id) currentChatId = chats[0].id;
      saveChats();
      renderAll();
    };
    acts.appendChild(rename);
    acts.appendChild(del);

    div.appendChild(titleSpan);
    div.appendChild(acts);
    chatListEl.appendChild(div);
  });
}

function renderHome() {
  contentEl.innerHTML = `
    <div class="home-hero">
      <div class="home-title">What can I help with?</div>
      <div class="chip-row">
        <div class="chip">Explain <strong>code</strong></div>
        <div class="chip">Plan <strong>study routine</strong></div>
        <div class="chip">Write <strong>SEO blog</strong></div>
      </div>
      <div class="quick-grid">
        <div class="quick-card" onclick="quickPrompt('Create a thumbnail idea for my YouTube channel about tech tips.')">
          <div class="quick-title">Create image ideas</div>
          <div class="quick-desc">Ask AI for thumbnail or logo concepts.</div>
        </div>
        <div class="quick-card" onclick="quickPrompt('Summarize this text in simple Hinglish: ')">
          <div class="quick-title">Summarize text</div>
          <div class="quick-desc">Make anything short & easy.</div>
        </div>
        <div class="quick-card" onclick="quickPrompt('Make a weekly schedule to learn web development from scratch.')">
          <div class="quick-title">Study planner</div>
          <div class="quick-desc">Perfect plan for your goals.</div>
        </div>
        <div class="quick-card" onclick="quickPrompt('Give me 10 YouTube video ideas for a movie review channel.')">
          <div class="quick-title">Content ideas</div>
          <div class="quick-desc">Boost your channel & socials.</div>
        </div>
      </div>
    </div>
  `;
}

function renderMessages() {
  const chat = getCurrentChat();
  if (!chat || !chat.messages.length) {
    renderHome();
    return;
  }
  const wrapper = document.createElement("div");
  wrapper.className = "messages";

  chat.messages.forEach(msg => {
    const row = document.createElement("div");
    row.className = "msg-row " + (msg.role === "user" ? "user" : "bot");

    const avatar = document.createElement("div");
    avatar.className = "msg-avatar " + (msg.role === "user" ? "" : "bot");
    avatar.textContent = msg.role === "user" ? "You" : "AI";

    const bubble = document.createElement("div");
    bubble.className = "bubble";
    bubble.textContent = msg.text;

    if (msg.role === "user") {
      row.appendChild(bubble);
      row.appendChild(avatar);
    } else {
      row.appendChild(avatar);
      row.appendChild(bubble);
    }

    wrapper.appendChild(row);
  });

  contentEl.innerHTML = "";
  contentEl.appendChild(wrapper);
  contentEl.scrollTop = contentEl.scrollHeight;
}

function addTypingBubble() {
  const wrapper = contentEl.querySelector(".messages");
  if (!wrapper) {
    const m = document.createElement("div");
    m.className = "messages";
    contentEl.innerHTML = "";
    contentEl.appendChild(m);
  }
  const container = contentEl.querySelector(".messages");
  const row = document.createElement("div");
  row.className = "msg-row bot";
  row.id = "typing-row";

  const avatar = document.createElement("div");
  avatar.className = "msg-avatar bot";
  avatar.textContent = "AI";

  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.innerHTML = `
    <span class="typing-dot"></span>
    <span class="typing-dot"></span>
    <span class="typing-dot"></span>
  `;

  row.appendChild(avatar);
  row.appendChild(bubble);
  container.appendChild(row);
  contentEl.scrollTop = contentEl.scrollHeight;
}

function removeTypingBubble() {
  const row = document.getElementById("typing-row");
  if (row) row.remove();
}

// render दोनों side
function renderAll() {
  renderSidebar();
  renderMessages();
}

// quick-card se prompt
window.quickPrompt = function (text) {
  inp.value = text;
  sendMessage();
};

// ---------- SEND / API ----------
async function sendMessage() {
  const text = inp.value.trim();
  if (!text) return;
  inp.value = "";

  if (!currentChatId) {
    createChat();
  }
  const chat = getCurrentChat();
  chat.messages.push({ role: "user", text });
  if (!chat.title || chat.title === "New chat") {
    setChatTitleFromFirstMessage(chat);
  }
  saveChats();
  renderMessages();

  // call API
  addTypingBubble();
  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: text })
    });
    const data = await res.json();
    removeTypingBubble();
    const reply = data.reply || "Sorry, response error aa gaya.";
    chat.messages.push({ role: "assistant", text: reply });
    saveChats();
    renderMessages();
  } catch (e) {
    removeTypingBubble();
    chat.messages.push({ role: "assistant", text: "Network error: " + e.message });
    saveChats();
    renderMessages();
  }
}

// ---------- VOICE ----------
function startVoice() {
  try {
    const rec = new webkitSpeechRecognition();
    rec.lang = "en-IN";
    rec.onresult = (e) => {
      const txt = e.results[0][0].transcript;
      inp.value = txt;
      sendMessage();
    };
    rec.start();
  } catch (e) {
    alert("Voice input is not supported in this browser.");
  }
}

// ---------- EVENTS ----------
menuBtn.onclick = () => openSidebar(true);
sidebarOverlay.onclick = () => openSidebar(false);
newChatBtn.onclick = () => { createChat(); openSidebar(false); };
sendBtn.onclick = () => sendMessage();
micBtn.onclick = () => startVoice();
inp.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

// PWA service worker (if sw.js present)
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js").catch(() => {});
}

// --------- INIT ---------
loadChats();
if (!chats.length) {
  createChat("New chat");
}
renderAll();
