# PromptBattle ⚔️

**Live Demo:** https://prompt-battle-mu.vercel.app/

A web application where users compare AI prompts in head-to-head battles with community voting.

![PromptBattle Screenshot](https://via.placeholder.com/800x400?text=PromptBattle+Screenshot)

## Overview

PromptBattle lets users:
1. **Create Battles** - Enter two different prompts for the same task
2. **See AI Responses** - Gemini generates responses for both prompts side-by-side
3. **Vote** - Choose which prompt produced the better output
4. **Learn** - Discover which prompting techniques work best

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18 + Vite + TypeScript |
| **Styling** | Tailwind CSS + Framer Motion |
| **Backend** | Vercel Serverless Functions (Node.js) |
| **AI** | Google Gemini 2.5 Flash |
| **Storage** | localStorage (client) + In-memory (server) |

## Features

- **Real-time AI Generation** - Parallel prompt processing with Gemini API
- **Glassmorphism UI** - Modern, polished design with animations
- **Keyboard Shortcuts** - Press 1, 2, or 3 to vote quickly
- **Mobile Responsive** - Works on all device sizes
- **Battle History** - Recent battles stored locally in browser
- **Error Handling** - Retry logic for API failures with user-friendly messages

## Quick Start

### Prerequisites
- Node.js 18+
- Google Gemini API key ([Get one here](https://aistudio.google.com/apikey))

### Installation

```bash
# Clone the repo
git clone https://github.com/SemiAutomat1c/prompt-battle.git
cd prompt-battle

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Add your GEMINI_API_KEY to .env

# Run locally
npm run dev
```

### Deploy to Vercel

1. Push to GitHub
2. Import project at [vercel.com/new](https://vercel.com/new)
3. Add environment variable: `GEMINI_API_KEY`
4. Deploy!

## Project Structure

```
promptbattle/
├── api/                    # Vercel Serverless Functions
│   ├── _lib/
│   │   ├── gemini.js      # Gemini API with retry logic
│   │   └── storage.js     # In-memory battle storage
│   ├── battles/
│   │   ├── index.js       # POST/GET /api/battles
│   │   └── [id]/
│   │       ├── index.js   # GET /api/battles/:id
│   │       └── vote.js    # POST /api/battles/:id/vote
│   └── health.js          # Health check endpoint
├── src/                    # React Frontend
│   ├── components/
│   │   ├── HeroSection.tsx
│   │   ├── BattleCreator.tsx
│   │   ├── BattleResults.tsx
│   │   ├── VoteBar.tsx
│   │   ├── Leaderboard.tsx
│   │   └── LoadingStates.tsx
│   ├── api.ts             # API client
│   ├── constants.ts       # Example battles
│   └── App.tsx            # Main app
├── vercel.json            # Vercel configuration
└── package.json
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/battles` | Create a new battle |
| `GET` | `/api/battles` | List recent battles |
| `GET` | `/api/battles/:id` | Get battle details |
| `POST` | `/api/battles/:id/vote` | Cast a vote |
| `GET` | `/api/health` | Health check |

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | Yes | Google Gemini API key |

## Known Limitations

- **Serverless Storage** - Battles are stored in-memory and may not persist across function invocations. Client-side localStorage is used as backup.
- **Rate Limits** - Gemini free tier has 15 RPM limit
- **No Authentication** - Anyone can create battles and vote

## Future Improvements

- [ ] Add persistent database (Vercel KV or Postgres)
- [ ] User authentication
- [ ] Battle categories and tags
- [ ] Prompt templates library
- [ ] Share battles via URL

## Built For

SFL AI-Assisted Developer Role Assessment (January 2026)

## License

MIT
