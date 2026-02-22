🔐 Trading Journal — Secure REST API

Production-ready REST API powering the Trading Journal application.

Built with Node.js, Express, PostgreSQL, and Prisma, this API enforces strict authentication, ownership validation, and structured input validation.

Frontend repository: https://github.com/KaylaArnold/trading-journal-ui

Base URL: https://trading-journal-api-qya8.onrender.com

Health: https://trading-journal-api-qya8.onrender.com/health

🏗 Architecture
Core Stack

Node.js

Express

PostgreSQL

Prisma ORM

Zod validation

JWT authentication

Architectural Principles

Separation of concerns (routes, middleware, validation, DB layer)

Middleware-driven request lifecycle

Ownership enforcement at query layer

Environment-based configuration

Centralized error handling

Production-aware CORS configuration

🧠 Request Lifecycle

Request enters Express

CORS validated

requireAuth verifies JWT (if protected route)

Zod validates request body/params/query

Prisma executes user-scoped database query

Structured JSON response returned

Centralized error handler catches failures

🔐 Security Design
1️⃣ Authentication

JWT-based authentication

Tokens are:

Signed server-side using JWT_SECRET

Verified on every protected request

Time-limited (expire automatically)

Protected routes require:

Authorization: Bearer <token>

2️⃣ Authorization / Ownership Enforcement (Critical)

All data access is scoped to the authenticated user.

Example pattern:

where: { id, userId }


This prevents:

Horizontal privilege escalation

Cross-user data access

Unauthorized modification

Unauthorized deletion

Security is enforced at the database query level — not just in UI logic.

3️⃣ Input Validation (Zod)

All requests are validated server-side before hitting the database.

Examples:

Time format enforcement (H:MM / HH:MM)

Numeric coercion

Enum normalization

Empty PATCH prevention

UUID parameter validation

Invalid requests return structured errors:

{
  "error": "VALIDATION_ERROR",
  "issues": [
    { "path": "timeIn", "message": "Use H:MM or HH:MM" }
  ]
}


No raw Prisma or stack traces are exposed in production responses.

🗄 Database Design
Entities

users

dailyLogs

trades

Relationships

A User has many Daily Logs

A Daily Log has many Trades

A Trade belongs to a User

A Trade belongs to a Daily Log

This dual linkage enables strict ownership validation and relational integrity.

🧱 REST Resource Design
Auth
POST /auth/register
POST /auth/login

Daily Logs
POST   /daily-logs
GET    /daily-logs
GET    /daily-logs/:id
PUT    /daily-logs/:id
DELETE /daily-logs/:id

Trades
POST   /daily-logs/:id/trades
PATCH  /trades/:tradeId
DELETE /trades/:tradeId


Nested trade creation ensures clarity of ownership and proper relational scoping.

🌍 Deployment

Deployed on Render Web Service

Prisma migrations run during deploy

Environment variables injected securely

CORS restricted to approved origins

No secrets committed to repository

⚙️ Environment Variables

Create a .env file locally:

DATABASE_URL=
JWT_SECRET=
PORT=3000


Production secrets are configured via Render environment settings.

.env is excluded via .gitignore.

🛡 CORS Strategy

Allows approved frontend origins

Reflects request origin when valid

Allows requests without Origin header (Postman / Thunder Client)

Supports credentials and Authorization headers

Designed to balance browser security with API testing flexibility.

🐞 Production Debugging Case Study

During deployment, trade creation initially failed due to:

Incorrect route mounting

Router export misconfiguration

Frontend calling outdated endpoint

JWT expiration handling

Nested REST route mismatch

Resolved by:

Inspecting network requests in browser dev tools

Testing endpoints directly via Thunder Client

Verifying Express router exports

Correcting nested REST route definitions

Redeploying frontend + backend together

This reinforced the importance of environment parity and route consistency across services.

🧩 Notable Engineering Decisions

Nested REST structure for relational clarity

Middleware-first architecture

Centralized validation layer

Ownership enforcement embedded in query layer

Explicit environment-based configuration

Structured JSON error responses

Secure production CORS configuration

🔮 Future Improvements

Refresh token rotation

Rate limiting middleware

Role-based access control (RBAC)

Structured logging (Winston / Pino)

Unit testing (Jest)

CI/CD pipeline

Docker containerization

API documentation via OpenAPI/Swagger
