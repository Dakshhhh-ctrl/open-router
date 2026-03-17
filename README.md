# OpenRouter Chat

A full-stack AI chat application built with **Next.js**, **Turborepo**, and **OpenRouter** — supporting 400+ AI models in one unified interface.

## Features

- 🚀 **Streaming responses** — word-by-word output like ChatGPT
- 🤖 **Model switcher** — GPT-4o, Claude, Gemini, Llama, Mistral, and more
- 💬 **Chat history** — persisted in localStorage, survives page refreshes
- 🌗 **Dark / Light mode**
- 👤 **User personalization** — AI addresses you by name
- ⚙️ **Custom system prompt** — control the AI's behavior
- 🏗️ **Turborepo monorepo** — shared UI components and configs

## Project Structure

```
openrouter-chat/
├── apps/
│   └── web/                    # Next.js chat application
│       ├── app/
│       │   ├── api/chat/       # Streaming API route (server-side)
│       │   ├── components/     # React UI components
│       │   ├── hooks/          # useChat hook (core logic)
│       │   └── lib/            # Types, models, storage utils
│       └── ...config files
└── packages/
    ├── ui/                     # Shared React components
    ├── eslint-config/          # Shared ESLint rules
    └── typescript-config/      # Shared TypeScript settings
```

## Getting Started

### 1. Clone and install

```bash
git clone <your-repo>
cd openrouter-chat
bun install
```

### 2. Get your OpenRouter API key

1. Go to [https://openrouter.ai](https://openrouter.ai)
2. Sign up for a free account
3. Navigate to **Keys** → **Create Key**
4. Copy your key

### 3. Set up environment variables

```bash
cp apps/web/.env.example apps/web/.env.local
```

Edit `apps/web/.env.local`:
```
OPENROUTER_API_KEY=sk-or-v1-your-key-here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Run the development server

```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

## How It Works

```
User types message
        ↓
Next.js page.tsx (client)
        ↓
POST /api/chat  ← your API key stays safe here (server-side)
        ↓
OpenRouter API  ← routes to GPT-4o, Claude, Gemini, etc.
        ↓
Streaming response chunks
        ↓
UI updates word-by-word
```

## Adding More Models

Edit `apps/web/app/lib/models.ts` and add entries to `AVAILABLE_MODELS`.
Find model IDs at [https://openrouter.ai/models](https://openrouter.ai/models).

## Tech Stack

| | |
|---|---|
| Monorepo | Turborepo |
| Package manager | Bun |
| Frontend | Next.js 14 + TypeScript |
| Styling | Tailwind CSS |
| AI routing | OpenRouter (openai SDK compatible) |
| Storage | localStorage (no database needed) |
