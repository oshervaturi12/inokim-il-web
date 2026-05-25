import { io } from "socket.io-client";

const socketUrl =  "http://localhost:3000";

export default class Chat {
  constructor() {
    this.socket = io(socketUrl, {
      transports: ["websocket"],
      withCredentials: true, // Allow cookies for authentication if needed
    });

    this.chatToggle = document.getElementById("chatToggle");
    this.chatWindow = document.getElementById("chatWindow");
    this.closeChat = document.querySelector(".close-chat");
    this.sendChat = document.getElementById("sendChat");
    this.chatInput = document.getElementById("chatInput");
    this.chatMessages = document.getElementById("chatMessages");

    this.init();
  }

  /** ✅ Initialize Chat */
  init() {
    if (!this.chatToggle || !this.chatWindow) {
      console.error("⚠️ Chat elements not found!");
      return;
    }

    // ✅ Open/Close Chat
    this.chatToggle.addEventListener("click", () => this.chatWindow.classList.toggle("hidden"));
    this.closeChat.addEventListener("click", () => this.chatWindow.classList.add("hidden"));

    // ✅ Send Message
    this.sendChat.addEventListener("click", () => this.sendMessage());
    this.chatInput.addEventListener("keypress", (event) => {
      if (event.key === "Enter") this.sendMessage();
    });

    // ✅ Listen for AI Responses
    this.socket.on("chat message", (message) => this.appendMessage("🤖 בוט", message, "bot-message"));

    // ✅ Check Connection Status
    this.socket.on("connect", () => console.log("✅ Connected to WebSocket!"));
    this.socket.on("disconnect", () => console.warn("⚠️ Disconnected from WebSocket!"));
    this.socket.on("connect_error", (err) => console.error("❌ WebSocket Error:", err));
  }

  /** ✅ Send User Message */
  sendMessage() {
    const message = this.chatInput.value.trim();
    if (!message) return;

    this.appendMessage("🧑 אתה", message, "user-message");
    this.chatInput.value = "";

    // ✅ Send message to backend via WebSocket
    this.socket.emit("chat message", message);
  }

  /** ✅ Append Message to Chat */
  appendMessage(sender, text, className) {
    const msgElement = document.createElement("div");
    msgElement.className = `message ${className}`;
    msgElement.innerHTML = `<strong>${sender}:</strong> ${text}`;
    this.chatMessages.appendChild(msgElement);
    this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
  }
}
