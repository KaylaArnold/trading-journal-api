require("dotenv").config();

const express = require("express");
const cors = require("cors");

const dailyLogRoutes = require("./routes/dailyLogs.routes");
const tradeRoutes = require("./routes/trades.routes");
const authRoutes = require("./routes/auth.routes");
const analyticsRoutes = require("./routes/analytics.routes");
const analyticsStrategiesRoutes = require("./routes/analytics.strategies.routes");
const analyticsWeeklyRoutes = require("./routes/analytics.weekly.routes");
const aiRoutes = require("./routes/ai.routes");

const errorHandler = require("./middleware/errorHandler");

const app = express();

// ===== CORS =====
const allowedOrigins = [
  "http://localhost:5173",
  "https://trading-journal-ui-e3ac.onrender.com",
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error("CORS not allowed"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
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
      `[routes] ⚠️ ${name} is NOT a function. Check module.exports = router and require path.`
    );
  }
}

logRouteType("authRoutes", authRoutes);
logRouteType("dailyLogRoutes", dailyLogRoutes);
logRouteType("tradeRoutes", tradeRoutes);
logRouteType("analyticsRoutes", analyticsRoutes);
logRouteType("analyticsStrategiesRoutes", analyticsStrategiesRoutes);
logRouteType("analyticsWeeklyRoutes", analyticsWeeklyRoutes);
logRouteType("aiRoutes", aiRoutes);

// ===== Routes (mount only if valid) =====
function safeUse(path, mod, name) {
  if (typeof mod !== "function") return;
  app.use(path, mod);
  console.log(`[routes] mounted ${name} at "${path}"`);
}

safeUse("/auth", authRoutes, "authRoutes");
safeUse("/", dailyLogRoutes, "dailyLogRoutes");
safeUse("/trades", tradeRoutes, "tradeRoutes");
safeUse("/", analyticsRoutes, "analyticsRoutes");
safeUse("/", analyticsStrategiesRoutes, "analyticsStrategiesRoutes");
safeUse("/", analyticsWeeklyRoutes, "analyticsWeeklyRoutes");
safeUse("/ai", aiRoutes, "aiRoutes");

// Error handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API running on port ${PORT}`);
});

module.exports = app;