console.log("✅ LOADED trades.routes.js");
const analyticsRoutes = require("./routes/analytics.routes");
const analyticsStrategiesRoutes = require("./routes/analytics.strategies.routes");
const tradeRoutes = require("./routes/trades.routes");
const dailyLogRoutes = require("./routes/dailyLogs.routes");
const analyticsWeeklyRoutes = require("./routes/analytics.weekly.routes");
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/auth.routes");

const app = express();
app.get("/health", (req, res) => res.json({ ok: true }));

app.use(cors());
app.use(express.json());
app.use("/", dailyLogRoutes);
app.use("/trades", tradeRoutes);
app.use("/", analyticsRoutes);
app.use("/", analyticsStrategiesRoutes);
app.use("/", analyticsWeeklyRoutes);

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.use("/auth", authRoutes);

const PORT = process.env.PORT || 3000;

const errorHandler = require("./middleware/errorHandler");
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
