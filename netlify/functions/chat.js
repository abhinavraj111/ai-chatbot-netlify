// Netlify serverless function that talks to Groq (Llama 3.1)
// Free API key: https://console.groq.com/keys

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

exports.handler = async (event) => {
  // Only allow POST
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error:
          "GROQ_API_KEY is not set. Go to Netlify → Site settings → Environment variables and add it.",
      }),
    };
  }

  try {
    const { messages } = JSON.parse(event.body);

    if (!messages || !Array.isArray(messages)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid messages format" }),
      };
    }

    // Keep only the last 12 messages to stay within context limits
    const recentMessages = messages.slice(-12);

    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant", // fast & free on Groq
        messages: [
          {
            role: "system",
            content:
              "You are a helpful, friendly, and concise AI assistant. Keep answers clear and useful. You can use light markdown if helpful.",
          },
          ...recentMessages,
        ],
        temperature: 0.7,
        max_tokens: 1024,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Groq error:", data);
      return {
        statusCode: response.status,
        body: JSON.stringify({
          error: data.error?.message || "Failed to get response from AI",
        }),
      };
    }

    const reply = data.choices?.[0]?.message?.content || "No response generated.";

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ reply }),
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal server error: " + err.message }),
    };
  }
};
