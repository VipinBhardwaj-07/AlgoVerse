// ==========================================
// CONFIGURATION & DYNAMIC ENVIRONMENT DETECTOR
// ==========================================
const isLocalHost = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
const isFileProtocol = window.location.protocol === 'file:';

// Automatically maps to port 5000 locally, and securely maps to the production URL on Vercel
const BACKEND_URL = (isLocalHost || isFileProtocol) ? 'http://127.0.0.1:5000' : window.location.origin;

// ==========================================
// DOM ELEMENTS
// ==========================================
const chatInput = document.querySelector('.chat-input textarea');
const sendChatBtn = document.querySelector('.chat-input span');
const chatbox = document.querySelector('.chatbox');
const chatToggler = document.querySelector('.chatbot-toggler');
const closeBtn = document.querySelector('.close-btn');

let userMessage = null; 

// ==========================================
// HELPER FUNCTIONS
// ==========================================
const createChatLi = (message, className) => {
  const chatLi = document.createElement("li");
  chatLi.classList.add("chat", `${className}`);
  let chatContent = className === "outgoing" ? `<p></p>` : `<span class="material-symbols-outlined">smart_toy</span><p></p>`;
  chatLi.innerHTML = chatContent;
  chatLi.querySelector("p").textContent = message;
  return chatLi;
};

// ==========================================
// API CONNECTION AND CHAT EXECUTION
// ==========================================
const generateResponse = async (chatLi) => {
  const messageElement = chatLi.querySelector("p");

  // Constructing full dynamic target URL
  const requestUrl = `${BACKEND_URL}/chat`;

  try {
    const response = await fetch(requestUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ message: userMessage })
    });

    const data = await response.json();

    if (!response.ok) {
      // Catch specific backend error structures (like Rate Limits)
      throw new Error(data.error || `Server responded with status ${response.status}`);
    }

    // Set the AI response text
    messageElement.textContent = data.reply;

  } catch (error) {
    console.error("Chat API error:", error);
    messageElement.classList.add("error");
    
    // Provide a descriptive error fallback on screen
    if (error.message.includes("Too many requests")) {
      messageElement.textContent = "Vera is cooling down. Too many requests, please wait a bit!";
    } else {
      messageElement.textContent = "Sorry, Vera is currently unavailable. Please check if the backend is running.";
    }
  } finally {
    chatbox.scrollTo(0, chatbox.scrollHeight);
  }
};

const handleChat = () => {
  userMessage = chatInput.value.trim();
  if (!userMessage) return;

  // Clear input textarea and reset height
  chatInput.value = "";
  chatInput.style.height = `40px`;

  // Append user's outgoing message to chatbox
  chatbox.appendChild(createChatLi(userMessage, "outgoing"));
  chatbox.scrollTo(0, chatbox.scrollHeight);

  // Set up thinking delay indicator
  setTimeout(() => {
    const incomingChatLi = createChatLi("Thinking...", "incoming");
    chatbox.appendChild(incomingChatLi);
    chatbox.scrollTo(0, chatbox.scrollHeight);
    generateResponse(incomingChatLi);
  }, 600);
};

// ==========================================
// EVENT LISTENERS & INTERACTION HANDLERS
// ==========================================
chatInput.addEventListener("input", () => {
  // Dynamically auto-grow input textarea height based on typing load
  chatInput.style.height = `40px`;
  chatInput.style.height = `${chatInput.scrollHeight}px`;
});

chatInput.addEventListener("keydown", (e) => {
  // Allow Enter key to trigger transmission, unless Shift key is held down
  if (e.key === "Enter" && !e.shiftKey && window.innerWidth > 800) {
    e.preventDefault();
    handleChat();
  }
});

sendChatBtn.addEventListener("click", handleChat);
closeBtn.addEventListener("click", () => document.body.classList.remove("show-chatbot"));
chatToggler.addEventListener("click", () => document.body.classList.toggle("show-chatbot"));