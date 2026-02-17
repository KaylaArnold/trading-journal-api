🧠 BACKEND REPO README

(trading-journal-api/README.md)

🔐 Trading Journal — Secure REST API

Production-ready REST API powering the Trading Journal application.

Built with Node.js, Express, PostgreSQL, and Prisma, with strict ownership enforcement and validation middleware.

Frontend repository:
👉 https://github.com/KaylaArnold/trading-journal-ui

🏗 Backend Architecture

Express application

Modular route files

Middleware-based validation

JWT authentication

Prisma ORM

PostgreSQL database

Centralized error handling

Environment-aware CORS

🔐 Security Design
1️⃣ Authentication

JWT-based authentication.

Protected routes require:

Authorization: Bearer <token>


Tokens are:

Signed server-side

Verified on every request

Expire automatically

2️⃣ Ownership Enforcement (Critical)

All queries enforce user ownership:

where: { id, userId }


This prevents:

Horizontal privilege escalation

Cross-user data access

Unauthorized modification

Unauthorized deletion

Security is enforced at the database layer.

3️⃣ Input Validation (Zod)

All requests validated server-side.

Examples:

Time format enforcement (H:MM / HH:MM)

Numeric coercion

Enum normalization

Empty PATCH prevention

Invalid requests return structured errors:

{
  "error": "VALIDATION_ERROR",
  "issues": [...]
}

🗄 Database Design

Entities:

users

dailyLogs

trades

Relationships:

A user has many daily logs

A daily log has many trades

A trade belongs to a user

A trade belongs to a daily log

🧱 REST Resource Design

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


Nested design ensures resource clarity and secure ownership scoping.

🌍 Deployment

Backend deployed on Render Web Service.

Prisma migrations run on deploy

Environment variables injected securely

CORS restricted to approved origins

⚙️ Environment Variables
DATABASE_URL=
JWT_SECRET=
PORT=

🐞 Production Debugging Case Study

During deployment, trade creation initially failed due to:

Incorrect route mounting

Outdated frontend endpoint

Router export misconfiguration

Token expiration handling

Resolved by:

Inspecting network requests

Testing endpoints via Thunder Client

Fixing nested REST routing

Verifying Express router exports

Redeploying both services

🔮 Future Improvements

Refresh token flow

Rate limiting

Unit tests (Jest)

CI/CD pipeline

Docker containerization

Structured logging
