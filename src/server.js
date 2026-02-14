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
 * ✅ CORS Configuration
 * Make sure this is set on Render (backend service):
 * FRONTEND_URL = https://trading-journal-ui-e3ac.onrender.com
 */
const corsOptions = {
  origin: true, // reflect request origin
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}  

// Apply CORS middleware
app.use(cors(corsOptions));

// ✅ Safe preflight handler (avoids app.options("*") crash)
app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});

app.use(express.json());

// Root route (Render check)
app.get("/", (req, res) => {
  res.json({ ok: true, message: "Trading Journal API running" });
});

// Health route (useful for testing deploy)
app.get("/health", (req, res) => {
  res.json({ ok: true, version: "cors-fixed" });
});

// Routes
app.use("/auth", authRoutes);
app.use("/", dailyLogRoutes);
app.use("/trades", tradeRoutes);
app.use("/", analyticsRoutes);
app.use("/", analyticsStrategiesRoutes);
app.use("/", analyticsWeeklyRoutes);

// Global error handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`API running on port ${PORT}`);
  console.log("Allowed origins:", allowedOrigins);
});
