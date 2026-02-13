const express = require("express");
const prisma = require("../prisma");
const requireAuth = require("../middleware/requireAuth");

const router = express.Router();

/**
 * GET /analytics/strategies
 * Uses Trade.strategy (trade-level attribution)
 */
router.get("/analytics/strategies", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;

    const trades = await prisma.trade.findMany({
      where: {
        userId,
        strategy: { not: null }
      },
      select: {
        strategy: true,
        profitLoss: true
      }
    });

    // result: { ORB15: { trades, wins, losses, winRate, totalPL } }
    const result = {};

    for (const t of trades) {
      const stratRaw = t.strategy;
      if (!stratRaw) continue;

      const strat = String(stratRaw).toUpperCase().trim();
      const pl = Number(t.profitLoss ?? 0);

      if (!result[strat]) {
        result[strat] = { trades: 0, wins: 0, losses: 0, totalPL: 0 };
      }

      result[strat].trades += 1;
      result[strat].totalPL += pl;

      if (pl > 0) result[strat].wins += 1;
      else if (pl < 0) result[strat].losses += 1;
    }

    // finalize formatting
    for (const strat of Object.keys(result)) {
      const s = result[strat];
      s.winRate = s.trades === 0 ? 0 : Math.round((s.wins / s.trades) * 100);
      s.totalPL = s.totalPL.toFixed(2);
    }

    return res.json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
