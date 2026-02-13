# Trading Journal API

A Node.js + Express REST API for a trading journal application.

Provides authentication, daily log management, trade management, and analytics endpoints.

---

## 🚀 Features

### Authentication
- Register
- Login
- JWT-based authentication
- Password hashing (bcrypt)

Authorization header:

```
Authorization: Bearer <token>
```

---

### Daily Logs
- Create
- Read
- Update
- Delete
- Pagination support (`page`, `limit`)
- Notes fields:
  - keyLevels
  - feelings
  - reflections

---

### Trades
- Create trade under daily log
- Update trade (PATCH)
- Delete trade
- Optional metadata fields:
  - optionType (CALL / PUT)
  - outcomeColor (GREEN / RED)
  - strategy (ORB15 / ORB5 / 3CONF)
  - contractsCount
  - dripPercent
  - amountLeveraged

---

### Analytics
- Summary totals (date range)
- Weekly rollups
- Strategy performance breakdown

---

### Validation
- Zod request validation middleware

---

## 🛠 Tech Stack

- Node.js
- Express
- PostgreSQL
- Prisma ORM
- Zod
- JWT
- bcrypt

---

## 📂 Project Structure

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
```

---

## ⚙️ Environment Variables

Create a `.env` file:

```
DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/trading_journal
JWT_SECRET=your_secret_key
PORT=3000
```

---

## 🧪 Run Locally

```bash
npm install
npx prisma migrate dev
npm run dev
```

Server runs at:

```
http://localhost:3000
```

---

## Architecture

React (Frontend)
        ↓
Express API (Backend)
        ↓
PostgreSQL Database


## 🔗 Related Repository

Frontend UI:
https://github.com/KaylaArnold/trading-journal-ui
