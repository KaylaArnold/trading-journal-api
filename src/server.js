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

// ===== CORS (TEMP: allow any origin via reflection) =====
const corsOptions = {
  origin: true, // ✅ reflect request Origin
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

// ✅ Always respond to preflight quickly (no app.options("*") crash)
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
  res.json({ ok: true, version: "cors-reflect-temp" });
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
});
