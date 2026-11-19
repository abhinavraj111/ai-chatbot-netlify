const chatWindow = document.getElementById("chat-window");
const chatForm = document.getElementById("chat-form");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");
const clearBtn = document.getElementById("clear-btn");

// Conversation history (kept in memory + localStorage)
let messages = JSON.parse(localStorage.getItem("chat-history") || "[]");

// Show welcome message if empty
function showWelcome() {
  if (messages.length === 0) {
    chatWindow.innerHTML = `
      <div class="welcome">
        <h2>👋 Hi there!</h2>
        <p>I'm an AI chatbot running on Llama 3.1.<br>
        Ask me anything — coding, ideas, explanations, or just chat.</p>
      </div>
    `;
  }
}

function saveHistory() {
  localStorage.setItem("chat-history", JSON.stringify(messages));
}

function renderMessages() {
  if (messages.length === 0) {
    showWelcome();
    return;
  }

  chatWindow.innerHTML = messages
    .map(
      (msg) => `
      <div class="message ${msg.role}">
        <div class="avatar">${msg.role === "user" ? "👤" : "🤖"}</div>
        <div class="bubble">${escapeHtml(msg.content)}</div>
      </div>
    `
    )
    .join("");

  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function addMessage(role, content) {
  messages.push({ role, content });
  saveHistory();
  renderMessages();
}

function showTyping() {
  const typing = document.createElement("div");
  typing.className = "message bot";
  typing.id = "typing-indicator";
  typing.innerHTML = `
    <div class="avatar">🤖</div>
    <div class="typing">
      <span></span><span></span><span></span>
    </div>
  `;
  chatWindow.appendChild(typing);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function removeTyping() {
  const el = document.getElementById("typing-indicator");
  if (el) el.remove();
}

async function sendMessage(text) {
  if (!text.trim()) return;

  // Add user message
  addMessage("user", text);
  userInput.value = "";
  sendBtn.disabled = true;
  showTyping();

  try {
    const response = await fetch("/.netlify/functions/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: messages.map((m) => ({
          role: m.role === "bot" ? "assistant" : m.role,
          content: m.content,
        })),
      }),
    });

    const data = await response.json();

    removeTyping();

    if (!response.ok) {
      throw new Error(data.error || "Something went wrong");
    }

    addMessage("bot", data.reply);
  } catch (err) {
    removeTyping();
    addMessage(
      "bot",
      `⚠️ Error: ${err.message}\n\nMake sure you have set the GROQ_API_KEY in Netlify environment variables.`
    );
  } finally {
    sendBtn.disabled = false;
    userInput.focus();
  }
}

// Event listeners
chatForm.addEventListener("submit", (e) => {
  e.preventDefault();
  sendMessage(userInput.value);
});

clearBtn.addEventListener("click", () => {
  if (confirm("Clear the entire conversation?")) {
    messages = [];
    saveHistory();
    showWelcome();
  }
});

// Init
renderMessages();
userInput.focus();
