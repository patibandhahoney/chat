# Realtime Chat (React + Node.js + Express + Socket.io)

A real-time group chat. Messages are sent through a REST API, persisted in SQLite, and broadcast instantly to all connected clients over Socket.io.

## Features
- Send and receive messages instantly (Socket.io, no polling)
- Chat history persisted in SQLite; reloaded after refresh
- Message timestamps and date separators
- Username-based login (dummy auth, remembered in the browser)
- Typing indicator
- Online users list (multi-tab aware)
- Graceful handling of network/API/socket errors and auto-reconnect (history is re-synced on reconnect)

## Project structure
```
server/
  src/
    config/        environment config
    db/            SQLite connection + schema
    services/      business logic + validation
    controllers/   HTTP handlers
    routes/        Express routers
    middleware/    404 + error handler
    sockets/       Socket.io setup (presence, typing)
    app.js         Express app
    index.js       HTTP server entry
client/
  src/
    api/           REST client
    hooks/         useChat (socket + state logic)
    components/    Login, ChatWindow, MessageList, MessageInput, OnlineUsers
```

## Prerequisites
Node.js 18+ and npm.

## Setup and run

### Backend
```bash
cd server
cp .env.example .env
npm install
npm run dev      # or: npm start
```
Runs on `http://localhost:5000`.

### Frontend
```bash
cd client
cp .env.example .env
npm install
npm run dev
```
Open `http://localhost:5173` in two browser windows with different usernames to see real-time messaging.

Production build: `npm run build` (output in `client/dist`).

## Environment variables

**server/.env**
| Variable | Default | Description |
|---|---|---|
| `PORT` | `5000` | Port the server listens on |
| `CLIENT_ORIGIN` | `*` | Comma-separated allowed CORS/Socket origins |
| `DB_PATH` | `./data/chat.db` | SQLite file path |

**client/.env**
| Variable | Default | Description |
|---|---|---|
| `VITE_API_URL` | `http://localhost:5000` | Backend base URL (REST + Socket.io) |

## API

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/messages` | Body `{ "username": "...", "text": "..." }`. Saves the message, broadcasts it, returns it (201). |
| `GET` | `/api/messages?limit=100&before=<id>` | Chat history, oldest first. `limit` max 500; `before` is an id cursor for paging. |
| `GET` | `/health` | Health check |

### Socket events
| Event | Direction | Payload |
|---|---|---|
| `user:join` | client → server | `username` (with ack `{ ok, users }`) |
| `message:new` | server → all | message object |
| `presence:update` | server → all | array of online usernames |
| `typing` | client → server → others | `true/false`, then `{ username, isTyping }` |

## Deployment (Render / Railway)
- **Backend**: root directory `server`, build `npm install`, start `npm start`. Set `CLIENT_ORIGIN` to your frontend URL. SQLite lives on the local disk, so attach a persistent disk and set `DB_PATH` to it (e.g. `/var/data/chat.db`), otherwise history resets on redeploy.
- **Frontend**: deploy `client` to Netlify/Vercel/Render Static Site with build `npm run build`, publish dir `dist`, and `VITE_API_URL` = backend URL.

## Design decisions
- **REST for sending, Socket.io for delivery.** The REST endpoint is the single write path (validation + persistence), and the controller then emits `message:new` to everyone. This keeps one source of truth and makes the API testable with plain HTTP tools.
- **Layered backend** (routes → controllers → services → db) so business logic is independent of transport.
- **SQLite (better-sqlite3)** for zero-setup persistence.
- **`useChat` hook** isolates all socket/API state from UI components.
- **Dedupe by message id** so the sender doesn't see duplicates (REST response + socket broadcast). History is merged on every (re)connect so nothing is lost during network drops.
- **Presence keyed by username**, so a user with several tabs stays online until the last tab closes.
- Server-side validation (required fields, length limits) and a central error handler returning `{ error }` JSON.

## Assumptions
- One shared public chat room.
- Username login is dummy authentication: no passwords, and usernames are not reserved (two people could pick the same name).
- Messages are plain text, max 1000 characters.
- Latest 100 messages are loaded on open; older paging is supported by the API (`before`) but not yet in the UI.
- Message delivered/read receipts were not implemented.
