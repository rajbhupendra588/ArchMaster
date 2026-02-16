<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# ArchMaster v2 - HLD & LLD Interactive Learning Platform

An interactive system design learning platform that generates exhaustive architecture blueprints (HLD/LLD), Mermaid diagrams, traffic simulations, and multi-language implementations using the Gemini API.

**v2** introduces a FastAPI backend with Supabase caching to eliminate redundant Gemini API calls.

---

## What Changed in v2

### Previous Implementation (v1)

The frontend called the Gemini API **directly from the browser** on every topic click. This caused:

- Redundant API calls (same topic regenerated every time)
- Slow load times (~5-15s per click, every time)
- Gemini API key exposed in browser JavaScript
- Unnecessary API cost

### Solution (v2)

A **Python FastAPI backend** now sits between the frontend and Gemini. Topic data is cached in **Supabase** (PostgreSQL). Repeat requests are served instantly from the database.

```
v1:  Browser ──► Gemini API (every click)

v2:  Browser ──► FastAPI ──► Supabase cache ──► HIT  → instant response
                                              ──► MISS → Gemini API → save to DB → respond
```

### Files Added

| File | Purpose |
|------|---------|
| `backend/main.py` | FastAPI server with Supabase caching + Gemini integration |
| `backend/requirements.txt` | Python dependencies |
| `backend/.env.example` | Template for backend environment variables |



## Architecture

```
┌──────────────┐       /api proxy        ┌──────────────────┐        ┌────────────┐
│   Frontend   │ ──────────────────────► │  FastAPI Backend  │ ─────► │  Supabase  │
│  React/Vite  │  localhost:3000         │  Python/Uvicorn   │        │  (cache)   │
│  port 3000   │ ◄────────────────────── │  port 8000        │ ─────► │            │
└──────────────┘       JSON response     └──────────────────┘        └────────────┘
                                                │
                                                ▼
                                         ┌────────────┐
                                         │ Gemini API │
                                         │ (on miss)  │
                                         └────────────┘
```

## Tech Stack

| Layer        | Technology                                |
|-------------|-------------------------------------------|
| Frontend    | React 19, TypeScript, Vite, Tailwind CSS  |
| Backend     | Python, FastAPI, Uvicorn                  |
| Database    | Supabase (PostgreSQL)                     |
| AI          | Google Gemini API (`google-genai`)        |
| Diagrams    | Mermaid.js                                |
| Voice       | Gemini Live (browser-side, real-time)     |

---

## Prerequisites

- **Node.js** (v18+)
- **Python** (v3.11+)
- **Supabase account** - [supabase.com](https://supabase.com)
- **Gemini API key** - [ai.google.dev](https://ai.google.dev)

---

## Setup (Step by Step)

### Step 1: Clone the repository

### Step 2: Create the Supabase table

1. Go to your Supabase project dashboard
2. Open **SQL Editor**
3. Run the following SQL:

```sql
CREATE TABLE topic_cache (
    topic_id TEXT PRIMARY KEY,
    data JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT now()
);
```

### Step 3: Configure environment variables

**Frontend** - create `.env.local` in the project root:

```
GEMINI_API_KEY=your_gemini_api_key
```

> Note: The frontend `.env.local` is still needed for the Voice Panel (Gemini Live), which connects directly from the browser.

**Backend** - create `.env` in the `backend/` folder:

```
GEMINI_API_KEY=your_gemini_api_key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_supabase_anon_key
```

### Step 4: Install dependencies

**Frontend:**

```bash
npm install
```

**Backend:**

```bash
cd backend
pip install -r requirements.txt
```

### Step 5: Run the application

Open **two terminals**:

**Terminal 1 - Backend:**

```bash
cd backend
uvicorn main:app --reload --port 8000
```

**Terminal 2 - Frontend:**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## How Caching Works

```
User clicks a topic
  → Frontend: GET /api/topics/{topic_id}
  → Vite dev proxy forwards to FastAPI (port 8000)
  → Backend checks Supabase "topic_cache" table
     → CACHE HIT:  returns stored JSONB instantly (no Gemini call)
     → CACHE MISS: calls Gemini API → saves response to Supabase → returns data
  → Frontend renders the architecture blueprint
```

- **First load** of any topic: calls Gemini (~5-15s), stores result in Supabase
- **Every subsequent load** (by any user): served from Supabase cache (instant)
- **Force refresh**: pass `?refresh=true` to bypass the cache and regenerate

---

## API Endpoints

| Method | Endpoint                  | Description                                      |
|--------|--------------------------|--------------------------------------------------|
| GET    | `/api/topics/{topic_id}` | Get topic data (cached or generated)             |
| GET    | `/api/topics/{topic_id}?refresh=true` | Force regenerate and update cache |
| POST   | `/api/chat`              | Send a chat message to the AI mentor             |


## Project Structure

```
ArchMaster-main/
├── backend/
│   ├── main.py              # FastAPI app - routes, caching, Gemini calls
│   ├── requirements.txt     # Python dependencies
│   ├── .env                 # Backend env vars (create manually)
│   └── .env.example         # Template for backend env vars
├── components/
│   ├── MermaidDiagram.tsx    # Mermaid.js diagram renderer
│   ├── SimulationCanvas.tsx  # Traffic simulation component
│   └── VoicePanel.tsx        # Gemini Live voice chat (browser-side)
├── services/
│   └── geminiService.ts      # Frontend API client (calls backend)
├── App.tsx                   # Main React app
├── constants.tsx             # Topic definitions (SYSTEM_TOPICS)
├── types.ts                  # TypeScript interfaces
├── index.tsx                 # React entry point
├── index.html                # HTML shell
├── vite.config.ts            # Vite config with /api proxy
├── package.json              # Node.js dependencies
├── .env.local                # Frontend env vars (Gemini key for Voice)
└── tsconfig.json             # TypeScript config
```
