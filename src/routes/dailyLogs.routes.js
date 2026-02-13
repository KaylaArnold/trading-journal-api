const express = require("express");
const prisma = require("../prisma");
const requireAuth = require("../middleware/requireAuth");
const validate = require("../middleware/validate");

const { uuidParam } = require("../validation/common");
const {
  dailyLogCreateSchema,
  dailyLogUpdateSchema,
  dailyLogListQuerySchema,
} = require("../validation/dailyLog.schema");

const router = express.Router();

/**
 * CREATE daily log (Zod validation via middleware)
 */
router.post(
  "/daily-logs",
  requireAuth,
  validate({ body: dailyLogCreateSchema }),
  async (req, res) => {
    try {
      const userId = req.user.id;

      const {
        date,
        ticker,
        currentPrice,
        pmh,
        ydh,
        pml,
        ydl,
        keyLevels,
        premarketGaps,
        strategyOrb15,
        strategyOrb5,
        strategy3Conf,
        waitedAPlus,
        tradedInZone,
        followedRules,
        feelings,
        reflections,
      } = req.body;

      const created = await prisma.dailyLog.create({
        data: {
          userId,
          date: new Date(date),
          ticker: ticker.toUpperCase(),

          // Decimal fields: store as strings (safe for Prisma Decimal)
          currentPrice: currentPrice != null ? String(currentPrice) : null,
          pmh: pmh != null ? String(pmh) : null,
          ydh: ydh != null ? String(ydh) : null,
          pml: pml != null ? String(pml) : null,
          ydl: ydl != null ? String(ydl) : null,

          keyLevels,
          premarketGaps,

          strategyOrb15: !!strategyOrb15,
          strategyOrb5: !!strategyOrb5,
          strategy3Conf: !!strategy3Conf,

          waitedAPlus,
          tradedInZone,
          followedRules,

          feelings,
          reflections,
        },
      });

      return res.status(201).json({ dailyLog: created });
    } catch (err) {
      if (err.code === "P2002") {
        return res.status(409).json({
          error: "Daily log already exists for this date/ticker",
        });
      }
      console.error(err);
      return res.status(500).json({ error: "Server error" });
    }
  }
);

/**
 * LIST daily logs (pagination + filters)
 * Example: /daily-logs?page=1&limit=10&ticker=AAPL&from=2026-02-01&to=2026-02-28
 */
router.get(
  "/daily-logs",
  requireAuth,
  validate({ query: dailyLogListQuerySchema }),
  async (req, res) => {
    try {
      const userId = req.user.id;

      const { ticker, from, to, sortBy, order } = req.query;
 
      // force to numbes even if query values are strings (Zod does coercion, but TS doesn't know that)
      const pageNum = Number(req.query.page) || 1;
      const limitNum = Number(req.query.limit) || 10;

      const safePage = Math.max(pageNum, 1);
      const safeLimit = Math.min(Math.max(limitNum, 1), 50);
      
      const safeSortBy = sortBy === "ticker" ? "ticker" : "date"; 
      const safeOrder = order === "asc" ? "asc" : "desc"; // default to descending order
     
      const orderBy = { [safeSortBy]: safeOrder};
      
      const skip = (safePage - 1) * safeLimit;

      const where = { userId };

      if (ticker) where.ticker = String(ticker).toUpperCase();

      if (from || to) {
        where.date = {};
        if (from) where.date.gte = new Date(`${from}T00:00:00.000Z`);
        if (to) where.date.lte = new Date(`${to}T23:59:59.999Z`);
      }

      const [total, logs] = await Promise.all([
        prisma.dailyLog.count({ where }),
        prisma.dailyLog.findMany({
          where,
          orderBy: { date: "desc" },
          skip,
          take: safeLimit,
        }),
      ]);

      const totalPages = Math.ceil(total / safeLimit);

      return res.json({
        page: safePage,
        limit: safeLimit,
        total,
        totalPages,
        dailyLogs: logs,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Server error" });
    }
  }
);

/**
 * GET one daily log (includes trades)
 */
router.get(
  "/daily-logs/:id",
  requireAuth,
  validate({ params: uuidParam }),
  async (req, res) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const log = await prisma.dailyLog.findFirst({
        where: { id, userId },
        include: { trades: true },
      });

      if (!log) return res.status(404).json({ error: "Not found" });

      return res.json({ dailyLog: log });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Server error" });
    }
  }
);

/**
 * UPDATE daily log (partial + not empty)
 */
router.put(
  "/daily-logs/:id",
  requireAuth,
  validate({ params: uuidParam, body: dailyLogUpdateSchema }),
  async (req, res) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const existing = await prisma.dailyLog.findFirst({ where: { id, userId } });
      if (!existing) return res.status(404).json({ error: "Not found" });

      const data = { ...req.body };

      if (data.date) data.date = new Date(data.date);
      if (data.ticker) data.ticker = String(data.ticker).toUpperCase();

      // Decimal fields: store as strings if present
      if (data.currentPrice != null) data.currentPrice = String(data.currentPrice);
      if (data.pmh != null) data.pmh = String(data.pmh);
      if (data.ydh != null) data.ydh = String(data.ydh);
      if (data.pml != null) data.pml = String(data.pml);
      if (data.ydl != null) data.ydl = String(data.ydl);

      const updated = await prisma.dailyLog.update({
        where: { id },
        data,
      });

      return res.json({ dailyLog: updated });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Server error" });
    }
  }
);

/**
 * DELETE daily log
 */
router.delete(
  "/daily-logs/:id",
  requireAuth,
  validate({ params: uuidParam }),
  async (req, res) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const existing = await prisma.dailyLog.findFirst({ where: { id, userId } });
      if (!existing) return res.status(404).json({ error: "Not found" });

      await prisma.dailyLog.delete({ where: { id } });
      return res.status(204).send();
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Server error" });
    }
  }
);

module.exports = router;
