# 🔐 Trading Journal — Secure REST API

Production-grade REST API powering a full-stack Trading Journal application.

Built with **Node.js, Express, PostgreSQL, and Prisma**, this API enforces strict JWT authentication, ownership validation at the query layer, and structured server-side validation.

Frontend repository:  
https://github.com/KaylaArnold/trading-journal-ui  

**Base URL:**  
https://trading-journal-api-qya8.onrender.com  

**Health Check:**  
https://trading-journal-api-qya8.onrender.com/health  

---

# 🏗 Architecture

## Tech Stack

- Node.js
- Express
- PostgreSQL
- Prisma ORM
- Zod validation
- JWT authentication

## Architectural Principles

- Separation of concerns (routes, middleware, validation, DB)
- Middleware-driven request lifecycle
- Ownership enforcement at the database query layer
- Environment-based configuration
- Centralized error handling
- Production-safe CORS configuration

---

# 🧠 Request Lifecycle

1. Request enters Express
2. CORS validation
3. `requireAuth` verifies JWT (if protected)
4. Zod validates request body/params/query
5. Prisma executes **user-scoped query**
6. Structured JSON response returned
7. Centralized error handler processes failures

---

# 🔐 Security Model

## Authentication

- Stateless JWT authentication
- Tokens signed using `JWT_SECRET`
- Verified on every protected request
- Time-limited (automatic expiration)

Protected routes require:

```
Authorization: Bearer <token>
```

---

## Authorization & Ownership Enforcement

All data access is scoped to the authenticated user.

Example query pattern:

```js
where: { id, userId }
```

This prevents:

- Horizontal privilege escalation
- Cross-user data access
- Unauthorized updates or deletes

Ownership enforcement is implemented at the **database query layer**, not the UI.

---

## Input Validation (Zod)

All inputs validated server-side before database access.

Examples:
- Time format enforcement (H:MM / HH:MM)
- Numeric coercion
- Enum normalization
- Empty PATCH prevention
- UUID parameter validation

Invalid requests return structured errors:

```json
{
  "error": "VALIDATION_ERROR",
  "issues": [
    { "path": "timeIn", "message": "Use H:MM or HH:MM" }
  ]
}
```

No stack traces or raw Prisma errors are exposed in production.

---

# 🗄 Database Design

## Entities

- users
- dailyLogs
- trades

## Relationships

- User → many DailyLogs
- DailyLog → many Trades
- Trade → belongs to User
- Trade → belongs to DailyLog

Dual linkage enables strict relational integrity and ownership validation.

---

# 🧱 REST Resource Design

## Auth

```
POST /auth/register
POST /auth/login
```

## Daily Logs

```
POST   /daily-logs
GET    /daily-logs
GET    /daily-logs/:id
PUT    /daily-logs/:id
DELETE /daily-logs/:id
```

## Trades

```
POST   /daily-logs/:id/trades
PATCH  /trades/:tradeId
DELETE /trades/:tradeId
```

Nested trade creation ensures relational clarity and scoped ownership.

---

# 🌍 Deployment

- Deployed on Render Web Service
- Prisma migrations executed during deploy
- Secrets managed via environment variables
- CORS restricted to approved origins
- `.env` excluded via `.gitignore`

---

# ⚙️ Environment Variables

Local `.env`:

```
DATABASE_URL=
JWT_SECRET=
PORT=3000
```

Production secrets configured via Render dashboard.

---

# 🛡 CORS Strategy

- Allows approved frontend origins
- Reflects valid request origin when valid
- Allows no-Origin requests (Postman / Thunder Client)
- Supports credentials and Authorization headers

Designed to balance browser security with API testing flexibility.

---

# 🧩 Engineering Decisions

- Middleware-first architecture
- Ownership enforcement embedded in queries
- Nested REST structure for relational clarity
- Centralized validation and error handling
- Structured JSON error responses
- Production-aware CORS configuration

---

# 🔮 Future Improvements

- Refresh token rotation
- Rate limiting
- Role-Based Access Control (RBAC)
- Structured logging (Pino / Winston)
- Unit testing (Jest)
- CI/CD pipeline
- Docker containerization
- OpenAPI / Swagger documentation
