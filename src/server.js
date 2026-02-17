const express = require("express");
const cors = require("cors");
require("dotenv").config();

const dailyLogRoutes = require("./routes/dailyLogs.routes");
const tradeRoutes = require("./routes/trades.routes");
const authRoutes = require("./routes/auth.routes");
const analyticsRoutes = require("./routes/analytics.routes");
const analyticsStrategiesRoutes = require("./routes/analytics.strategies.routes");
const analyticsWeeklyRoutes = require("./routes/analytics.weekly.routes");

const errorHandler = require("./middleware/errorHandler");

const app = express();

// ===== CORS =====
const allowedOrigins = [
  "http://localhost:5173", // local dev (Vite)
  "https://trading-journal-ui-e3ac.onrender.com", // deployed UI
];


const corsOptions = {
  origin: function (origin, callback) { // reflect request origin
    // allow non-browser tools (Thunder Client, curl)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error("CORS not allowed"));
   }
  },
  credentials: true,
};

app.use(cors(corsOptions));

// Handle preflight safely
app.use((req, res, next) => {
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

app.use(express.json());

// Root route
app.get("/", (req, res) => {
  res.json({ ok: true, message: "Trading Journal API running" });
});

// Health route
app.get("/health", (req, res) => {
  res.json({ ok: true, version: "debug-route-types" });
});

// ===== DEBUG: identify broken route imports =====
function logRouteType(name, mod) {
  console.log(`[routes] ${name}:`, typeof mod);
  if (typeof mod !== "function") {
    console.log(
      `[routes] ⚠️ ${name} is NOT a function. This will break app.use. Check that file exports "module.exports = router" and the require path is correct.`
    );
  }
}

logRouteType("authRoutes", authRoutes);
logRouteType("dailyLogRoutes", dailyLogRoutes);
logRouteType("tradeRoutes", tradeRoutes);
logRouteType("analyticsRoutes", analyticsRoutes);
logRouteType("analyticsStrategiesRoutes", analyticsStrategiesRoutes);
logRouteType("analyticsWeeklyRoutes", analyticsWeeklyRoutes);

// ===== Routes (mount only if valid) =====
function safeUse(path, mod, name) {
  if (typeof mod !== "function") return; // skip broken route to prevent crash
  app.use(path, mod);
  console.log(`[routes] mounted ${name} at "${path}"`);
}

safeUse("/auth", authRoutes, "authRoutes");

// dailyLogs.routes.js already defines "/daily-logs"
safeUse("/", dailyLogRoutes, "dailyLogRoutes");

// trades.routes.js should define "/" and "/:id"
safeUse("/trades", tradeRoutes, "tradeRoutes");

safeUse("/", analyticsRoutes, "analyticsRoutes");
safeUse("/", analyticsStrategiesRoutes, "analyticsStrategiesRoutes");
safeUse("/", analyticsWeeklyRoutes, "analyticsWeeklyRoutes");

// Error handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API running on port ${PORT}`);
});

// ✅ Correct export (NOT router)
module.exports = app;
