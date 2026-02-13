# Trading Journal API

A Node.js + Express REST API for a trading journal application.  
Includes JWT authentication, Daily Logs + Trades CRUD, and analytics endpoints (summary/weekly/strategies).

## Features

- **Auth**
  - Register + Login
  - JWT-based auth (`Authorization: Bearer <token>`)
  - Password hashing (bcrypt)

- **Daily Logs**
  - CRUD operations
  - Pagination support (`page`, `limit`)
  - Notes fields: `keyLevels`, `feelings`, `reflections`

- **Trades**
  - CRUD operations
  - Trades are scoped to a Daily Log (create via `/daily-logs/:id/trades`)
  - Supports tagging fields like:
    - `optionType` (CALL/PUT)
    - `outcomeColor` (GREEN/RED)
    - `strategy` (ORB15/ORB5/3CONF)
    - Optional stats fields (e.g., contracts, drip %, leveraged)

- **Analytics**
  - Summary totals for a date range
  - Weekly rollups
  - Strategy performance table

- **Validation**
  - Zod validation middleware on request bodies

## Tech Stack

- Node.js + Express
- PostgreSQL
- Prisma ORM
- Zod validation
- JWT Auth

## Repo Structure

```txt
prisma/
  migrations/
src/
  api/
  controllers/
  middleware/
  routes/
  utils/
  validation/
