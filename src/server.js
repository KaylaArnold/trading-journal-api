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

app.use(cors());
app.use(express.json());

// ✅ Root route so Render URL doesn't say "Cannot GET /"
app.get("/", (req, res) => {
  res.json({ ok: true, message: "Trading Journal API running" });
});

// ✅ Health check (keep only one)
app.get("/health", (req, res) => {
  res.json({ ok: true });
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
