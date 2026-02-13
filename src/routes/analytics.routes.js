const express = require("express");
const prisma = require("../prisma");
const requireAuth = require("../middleware/requireAuth");
const validate = require("../middleware/validate");

// use your existing Validation folder
const { analyticsQuery } = require("../validation/analytics.schema");

const router = express.Router();

// GET /analytics/summary?from=YYYY-MM-DD&to=YYYY-MM-DD
router.get(
  "/analytics/summary",
  requireAuth,
  validate({ query: analyticsQuery }),
  async (req, res) => {
    try {
      const userId = req.user.id;
      const { from, to } = req.query;

      // build date filter (based on DailyLog.date)
      const dailyLogWhere = { userId };

      if (from || to) {
        dailyLogWhere.date = {};
        if (from) dailyLogWhere.date.gte = new Date(`${from}T00:00:00.000Z`);
        if (to) {
          // inclusive end-of-day
          dailyLogWhere.date.lte = new Date(`${to}T23:59:59.999Z`);
        }
      }

      // get daily logs in range
      const dailyLogs = await prisma.dailyLog.findMany({
        where: dailyLogWhere,
        select: { id: true, ticker: true }
      });

      const dailyLogIds = dailyLogs.map((d) => d.id);

      // no logs → empty analytics
      if (dailyLogIds.length === 0) {
        return res.json({
          totalTrades: 0,
          totalProfitLoss: "0.00",
          winRate: 0,
          avgWin: "0.00",
          avgLoss: "0.00",
          bestTicker: null,
          tradesByTicker: {}
        });
      }

      // get trades for those logs
      const trades = await prisma.trade.findMany({
        where: {
          userId,
          dailyLogId: { in: dailyLogIds }
        },
        select: {
          profitLoss: true,
          dailyLogId: true
        }
      });

      // no trades → still valid analytics
      if (trades.length === 0) {
        return res.json({
          totalTrades: 0,
          totalProfitLoss: "0.00",
          winRate: 0,
          avgWin: "0.00",
          avgLoss: "0.00",
          bestTicker: null,
          tradesByTicker: {}
        });
      }

      // map dailyLogId → ticker
      const idToTicker = new Map(dailyLogs.map((d) => [d.id, d.ticker]));

      let totalTrades = 0;
      let wins = 0;
      let losses = 0;

      let totalPL = 0;
      let totalWinPL = 0;
      let totalLossPL = 0;

      const tradesByTicker = {}; // { AAPL: { trades, totalPL } }

      for (const t of trades) {
        totalTrades += 1;

        const pl = t.profitLoss == null ? 0 : Number(t.profitLoss);
        totalPL += pl;

        if (pl > 0) {
          wins += 1;
          totalWinPL += pl;
        } else if (pl < 0) {
          losses += 1;
          totalLossPL += pl;
        }

        const ticker = idToTicker.get(t.dailyLogId) || "UNKNOWN";

        if (!tradesByTicker[ticker]) {
          tradesByTicker[ticker] = { trades: 0, totalPL: 0 };
        }

        tradesByTicker[ticker].trades += 1;
        tradesByTicker[ticker].totalPL += pl;
      }

      const winRate =
        totalTrades === 0 ? 0 : Math.round((wins / totalTrades) * 100);

      const avgWin = wins === 0 ? 0 : totalWinPL / wins;
      const avgLoss = losses === 0 ? 0 : totalLossPL / losses; // negative

      // find best ticker by total PL
      let bestTicker = null;
      let bestTickerPL = -Infinity;

      for (const [ticker, stats] of Object.entries(tradesByTicker)) {
        if (stats.totalPL > bestTickerPL) {
          bestTickerPL = stats.totalPL;
          bestTicker = ticker;
        }
      }

      return res.json({
        totalTrades,
        totalProfitLoss: totalPL.toFixed(2),
        winRate,
        avgWin: avgWin.toFixed(2),
        avgLoss: avgLoss.toFixed(2),
        bestTicker,
        tradesByTicker
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Server error." });
    }
  }
);

module.exports = router;
