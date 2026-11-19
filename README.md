# AI Chatbot (Netlify + Groq)

A clean, modern AI chatbot powered by **Llama 3.1** via Groq's free API.

## Features

- Beautiful dark-mode chat UI
- Conversation history (saved in browser)
- Serverless function keeps your API key secret
- Fast responses thanks to Groq
- Fully free to host on Netlify

## Quick Deploy to Netlify

### 1. Get a free Groq API key
1. Go to [https://console.groq.com](https://console.groq.com)
2. Sign up / log in
3. Create an API key

### 2. Deploy

**Option A – Netlify Drop (easiest)**
1. Zip the whole project folder
2. Go to [https://app.netlify.com/drop](https://app.netlify.com/drop)
3. Drag the zip file
4. After deploy → Site settings → Environment variables → Add `GROQ_API_KEY`

**Option B – Git + Netlify (recommended)**
1. Push this folder to a GitHub repository
2. In Netlify: "Add new site" → Import from Git
3. Select the repo
4. Add environment variable: `GROQ_API_KEY` = your key
5. Deploy

### 3. Test
Open the Netlify URL and start chatting!

## Local Development

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Run locally (will use .env)
echo "GROQ_API_KEY=your_key_here" > .env
netlify dev
```

## Project Structure

```
├── index.html
├── styles.css
├── app.js
├── netlify.toml
└── netlify/
    └── functions/
        └── chat.js      ← calls Groq API
```

## Changing the model

In `netlify/functions/chat.js` you can switch the model, for example:

- `llama-3.1-8b-instant` (default, very fast)
- `llama-3.3-70b-versatile` (smarter, slightly slower)
- `mixtral-8x7b-32768`

Enjoy!
