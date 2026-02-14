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

/**
 * ✅ CORS Fix (Production + Local)
 * On Render BACKEND service set:
 * FRONTEND_URL = https://trading-journal-ui-e3ac.onrender.com
 */
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "https://trading-journal-ui-e3ac.onrender.com", // hardcode to avoid env mistakes
  "http://localhost:5173",
  "http://127.0.0.1:5173",
].filter(Boolean);

const corsOptions = {
  origin(origin, cb) {
    // allow server-to-server / curl / postman (no Origin header)
    if (!origin) return cb(null, true);

    if (allowedOrigins.includes(origin)) return cb(null, true);

    return cb(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use(express.json());

// ✅ Root route so Render URL doesn't say "Cannot GET /"
app.get("/", (req, res) => {
  res.json({ ok: true, message: "Trading Journal API running" });
});

// ✅ Health check (add version so we can confirm deploy)
app.get("/health", (req, res) => {
  res.json({ ok: true, corsFix: "v1" });
});

// Routes
app.use("/auth", authRoutes);
app.use("/", dailyLogRoutes);
app.use("/trades", tradeRoutes);
app.use("/", analyticsRoutes);
app.use("/", analyticsStrategiesRoutes);
app.use("/", analyticsWeeklyRoutes);

// Error handler (last)
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API running on port ${PORT}`);
  console.log("Allowed CORS origins:", allowedOrigins);
});
