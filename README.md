<div align="center">

<img src="docs/logo.png" alt="" width="140" />

# DnD Campaign Manager

**A campaign manager for D&D 5e: character sheets, live sessions, and a combat tracker that stays in sync across everyone at the table.**

[![CI](https://github.com/0x5450L/dnd-campaign-manager/actions/workflows/ci.yml/badge.svg)](https://github.com/0x5450L/dnd-campaign-manager/actions/workflows/ci.yml)

</div>

---

## Try it

**[Live demo](#)** — the login screen has two buttons, no signup needed.

Enter as the **Dungeon Master** and as a **player**, and compare what each of them sees: the DM runs the initiative order and can see the creature waiting in ambush; the player sees only their own party's view and can edit only their own character. That split is the point of the project, and it is easier to click than to describe.

| Account | Password | Role |
| --- | --- | --- |
| `dm@demo.local` | `demo1234` | Dungeon Master |
| `mira@demo.local` | `demo1234` | Player — wizard |
| `borin@demo.local` | `demo1234` | Player — fighter |
| `eli@demo.local` | `demo1234` | Player — rogue |

The demo data is shared and can be reset with `npm run db:seed -w server`.

---

## What it does

**Character sheets** for player characters, NPCs and monsters — ability scores, saves, skills, attacks, spell slots, and abilities with four kinds of cost: recharge on a die roll, uses per day, a shared resource pool, and spell slots with upcasting.

**Live sessions** — the DM opens a session, players join, and everyone sees attendance, dice rolls and session events as they happen.

**Combat tracker** — initiative order, HP and conditions, turn advancement that rerolls recharge abilities and refills per-turn resources. Participants can be hidden from players, and a hidden monster still takes its turn.

**SRD reference and AI tools** — spells, creatures, items and conditions pulled from two public SRD sources with fallback between them, plus generators for encounters and loot.

---

## Why it is built this way

**Two realtime transports on purpose.** Notifications (invites, members joining) go over **SSE**: one-way, server to client, and a plain `EventSource` is all it needs. Live sessions and combat go over **WebSocket** (socket.io), because there the traffic is two-way, frequent and shared by several participants at once. Using one mechanism for both would mean either overpaying for notifications or underserving combat.

**State is split by what owns it, not by convenience.** Server data lives in **TanStack Query**; UI state such as toasts and modals lives in **Zustand**; the live-session state machine is a pure reducer called from a Zustand store, so its transitions can be tested without React while subscriptions stay selector-scoped.

**A shared package, not a shared folder.** `@dnd/shared` holds DTOs and the game rules used by both sides — turn order, ability costs, spell slots. It builds to both CommonJS and ESM because the server requires and the bundler imports.

**Fail at boot, not at request time.** The environment is parsed once against a schema at startup, so a missing variable stops the process instead of surfacing when the first user presses "log in".

**One origin in production.** The server hands out the built client itself, which means no CORS and an auth cookie that keeps `SameSite=Lax`. Setting `CORS_ORIGINS` switches the whole thing — CORS and cookie flags together — to a two-origin deployment.

---

## Stack

**Backend** — Node.js, Express 5, TypeScript, Prisma 7, PostgreSQL 16, socket.io, JWT, zod
**Frontend** — React 19, TypeScript, Vite 7, React Router 7, Tailwind CSS 4, TanStack Query, Zustand
**Testing** — Vitest, Supertest
**Tooling** — npm workspaces, ESLint 9, Docker, GitHub Actions

---

## Tests

159 tests across three levels, all run on CI.

**Unit** — the pure rules: turn order when the acting participant is removed mid-encounter, the four ability cost types and their bounds, spell slot upcasting, the live-session reducer, environment parsing, and SRD source fallback.

**Integration** — the app over HTTP against a real Postgres: authentication, and the DM/player permissions that unit tests structurally cannot reach. They assert the stored row is untouched on refusal, so "returned 403 but wrote anyway" cannot pass.

```bash
npm test                          # unit
docker compose up -d postgres_test
npm run test:integration -w server
```

---

## Running it locally

Requires Node 22 and Docker.

```bash
git clone https://github.com/0x5450L/dnd-campaign-manager.git
cd dnd-campaign-manager

npm install
cp server/.env.example server/.env      # set JWT_SECRET

docker compose up -d postgres
npm run db:migrate -w server
npm run db:seed -w server

npm run dev
```

The client is on `http://localhost:5173`, the API on `3001`.

`npm install` runs at the repository root only — this is an npm workspaces monorepo, and installing inside a package would create a competing lockfile.

### As a container

```bash
docker build -t dnd .
docker run --rm -p 3001:3001 \
  -e DATABASE_URL="postgresql://user:pass@host:5432/db" \
  -e JWT_SECRET="..." \
  dnd
```

The image serves the API and the built client together on one port.

---

## Repository layout

```
client/     React app
server/     Express API, Prisma schema and migrations
shared/     @dnd/shared — DTOs and game rules used by both
```

| Command | What it does |
| --- | --- |
| `npm run dev` | shared in watch mode, API and client together |
| `npm test` | unit tests in every workspace |
| `npm run typecheck` | typecheck every workspace |
| `npm run lint` | lint every workspace |
| `npm run build` | production build of all three |
| `npm run db:migrate -w server` | apply migrations |
| `npm run db:seed -w server` | reset the demo data |

---

## Status

A portfolio project, built to be read as much as used. Known gaps and deferred decisions are tracked as I go: NPCs currently render the full player sheet, magic item mechanics are text only, and the legacy `cs-*` styles still await migration to Tailwind utilities.
