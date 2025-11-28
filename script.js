/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");

// Cloudflare Worker URL
const WORKER_URL = "YOUR_CLOUDFLARE_WORKER_URL_HERE"; // replace with your deployed Worker URL

// Conversation history for multi-turn interactions
let conversationHistory = [
  {
    role: "system",
    content: "You are a L’Oréal beauty assistant. Only answer questions about L’Oréal products, routines, and recommendations. Politely refuse unrelated questions."
  }
];

// Helper to append messages to chat window
function appendMessage(content, role) {
  const msgDiv = document.createElement("div");
  msgDiv.classList.add("msg", role);
  msgDiv.textContent = content;
  chatWindow.appendChild(msgDiv);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

/* Handle form submit */
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const userMessage = userInput.value.trim();
  if (!userMessage) return;

  // Show user message
  appendMessage(userMessage, "user");

  // Clear input
  userInput.value = "";

  // Add latest question above bot response
  const latestQuestionDiv = document.createElement("p");
  latestQuestionDiv.classList.add("latest-question");
  latestQuestionDiv.textContent = `You asked: ${userMessage}`;
  chatWindow.appendChild(latestQuestionDiv);

  // Add user message to conversation history
  conversationHistory.push({ role: "user", content: userMessage });

  // Call Cloudflare Worker
  try {
    const response = await fetch(WORKER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: conversationHistory })
    });

    const data = await response.json();
    const botMessage = data.choices[0].message.content;

    // Add bot response to conversation history
    conversationHistory.push({ role: "assistant", content: botMessage });

    // Show bot message
    appendMessage(botMessage, "ai");

  } catch (error) {
    console.error("Error:", error);
    appendMessage("Sorry, something went wrong. Please try again.", "ai");
  }
});
