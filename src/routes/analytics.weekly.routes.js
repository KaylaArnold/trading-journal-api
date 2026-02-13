const express = require("express");
const prisma = require("../prisma");
const requireAuth = require("../middleware/requireAuth");
const validate = require("../middleware/validate");
const { analyticsWeeklyQuerySchema } = require("../validation/analyticsWeekly.schema");

const router = express.Router();

function weekStartMondayUTC(dateInput) {
  const d = new Date(dateInput);
  const utc = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const day = utc.getUTCDay() || 7; // Mon=1..Sun=7
  utc.setUTCDate(utc.getUTCDate() - day + 1); // Monday
  return utc;
}

function ymdStringUTC(dateInput) {
  const d = new Date(dateInput);
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

// GET /analytics/weekly?weeks=8&from=YYYY-MM-DD&to=YYYY-MM-DD
router.get(
  "/analytics/weekly",
  requireAuth,
  validate({ query: analyticsWeeklyQuerySchema }),
  async (req, res) => {
    try {
      const userId = req.user.id;

      const weeksRequested = req.query.weeks; // zod-coerced
      const from = req.query.from; // string YYYY-MM-DD | undefined
      const to = req.query.to;     // string YYYY-MM-DD | undefined

      // ----- Determine effective range -----
      const todayUTC = new Date();
      const endUTC = to
        ? new Date(`${to}T23:59:59.999Z`)
        : new Date(Date.UTC(todayUTC.getUTCFullYear(), todayUTC.getUTCMonth(), todayUTC.getUTCDate(), 23, 59, 59, 999));

      let startUTC;

      if (from && to) {
        startUTC = new Date(`${from}T00:00:00.000Z`);
      } else if (from && !to) {
        startUTC = new Date(`${from}T00:00:00.000Z`);
      } else if (!from && to) {
        // if only "to": range is (to - weeks*7 days) -> to
        startUTC = new Date(endUTC);
        startUTC.setUTCDate(startUTC.getUTCDate() - (weeksRequested - 1) * 7);
        startUTC = new Date(Date.UTC(startUTC.getUTCFullYear(), startUTC.getUTCMonth(), startUTC.getUTCDate(), 0, 0, 0, 0));
      } else {
        // neither: keep old behavior (last N weeks ending today)
        startUTC = new Date(endUTC);
        startUTC.setUTCDate(startUTC.getUTCDate() - (weeksRequested - 1) * 7);
        startUTC = new Date(Date.UTC(startUTC.getUTCFullYear(), startUTC.getUTCMonth(), startUTC.getUTCDate(), 0, 0, 0, 0));
      }

      // guard (from after to)
      if (startUTC > endUTC) {
        return res.status(400).json({
          error: "VALIDATION_ERROR",
          issues: [{ path: "from", message: "`from` must be <= `to`" }],
        });
      }

      // ----- Pull trades in range -----
      const trades = await prisma.trade.findMany({
        where: {
          userId,
          dailyLog: {
            date: {
              gte: startUTC,
              lte: endUTC,
            },
          },
        },
        select: {
          profitLoss: true,
          dailyLog: { select: { date: true } },
        },
      });

      // ----- Bucket trades by Monday week start -----
      const buckets = new Map(); // key -> { weekStart, trades, wins, totalPL }

      for (const t of trades) {
        const d = new Date(t.dailyLog.date);
        const monday = weekStartMondayUTC(d);
        const key = ymdStringUTC(monday);

        const pl = Number(t.profitLoss ?? 0);

        if (!buckets.has(key)) {
          buckets.set(key, { weekStart: key, trades: 0, wins: 0, totalPL: 0 });
        }
        const b = buckets.get(key);
        b.trades += 1;
        b.totalPL += pl;
        if (pl > 0) b.wins += 1;
      }

      // ----- Build output weeks -----
      // If from/to were provided: compute number of weeks between them and return them all (capped)
      // If neither: return exactly weeksRequested
      let weeksReturnedTarget = weeksRequested;

      if (from || to) {
        const startMonday = weekStartMondayUTC(startUTC);
        const endMonday = weekStartMondayUTC(endUTC);
        const diffDays = Math.floor((endMonday - startMonday) / (1000 * 60 * 60 * 24));
        const diffWeeks = Math.floor(diffDays / 7) + 1;
        weeksReturnedTarget = Math.min(Math.max(diffWeeks, 1), 52);
      }

      const weeksOut = [];
      let cursor = weekStartMondayUTC(endUTC);

      for (let i = 0; i < weeksReturnedTarget; i++) {
        const key = ymdStringUTC(cursor);
        const b = buckets.get(key) || { weekStart: key, trades: 0, wins: 0, totalPL: 0 };

        weeksOut.unshift({
          weekStart: b.weekStart,
          trades: b.trades,
          winRate: b.trades === 0 ? 0 : Math.round((b.wins / b.trades) * 100),
          totalPL: b.totalPL.toFixed(2),
        });

        cursor.setUTCDate(cursor.getUTCDate() - 7);
      }

      return res.json({
        range: {
          from: ymdStringUTC(startUTC),
          to: ymdStringUTC(endUTC),
        },
        weeksRequested,
        weeksReturned: weeksOut.length,
        weeks: weeksOut,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Server error" });
    }
  }
);

module.exports = router;
