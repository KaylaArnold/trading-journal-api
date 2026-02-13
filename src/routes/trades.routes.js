const express = require("express");
const prisma = require("../prisma");
const requireAuth = require("../middleware/requireAuth");
const validate = require("../middleware/validate");

const { uuidParam, tradeIdParam } = require("../validation/common");
const { createTradeBody, updateTradeBody } = require("../validation/trade.schema");

const router = express.Router();

/**

  const lookup = first?.id
    ? await prisma.trade.findUnique({
        where: { id: first.id },
        select: { id: true, userId: true },
      })
    : null;

  return res.json({
    totalTrades,
    first,
    lookupFound: !!lookup,
    lookup,
  });
});


/**
 * CREATE: Add a trade to a daily log (must own the daily log)
 * With server mount: app.use("/trades", tradeRoutes)
 * Full path: POST /trades/daily-logs/:id/trades
 */
router.post(
  "/daily-logs/:id/trades",
  requireAuth,
  validate({ params: uuidParam, body: createTradeBody }),
  async (req, res) => {
    try {
      const userId = req.user.id;
      const dailyLogId = req.params.id;

      const log = await prisma.dailyLog.findFirst({
        where: { id: dailyLogId, userId },
      });
      if (!log) return res.status(404).json({ error: "Daily log not found." });

      const {
        timeIn,
        timeOut,
        profitLoss,
        dripPercent,
        amountLeveraged,
        runner,
        contractsCount,
        optionType,
        outcomeColor,
        strategy,
      } = req.body;

      const trade = await prisma.trade.create({
        data: {
          userId,
          dailyLogId,
          timeIn,
          timeOut,
          // NOTE: Your Prisma model uses Decimal, but we keep your current behavior for now.
          // We'll convert to Number/Decimal cleanly after the routing/ID issues are done.
          profitLoss: profitLoss != null ? String(profitLoss) : null,
          dripPercent: dripPercent != null ? String(dripPercent) : null,
          amountLeveraged: amountLeveraged != null ? String(amountLeveraged) : null,
          runner: !!runner,
          contractsCount: contractsCount != null ? Number(contractsCount) : null,
          optionType: optionType ? String(optionType).toUpperCase() : null,
          outcomeColor: outcomeColor ? String(outcomeColor).toUpperCase() : null,
          strategy: strategy ? String(strategy).toUpperCase() : null,
        },
      });

      return res.status(201).json({ trade });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Server error." });
    }
  }
);

/**
 * Helper: strict ownership check that returns 404 vs 403 correctly
 */
async function assertTradeOwnershipOrRespond(tradeId, userId, res) {
  const existing = await prisma.trade.findUnique({
    where: { id: tradeId },
    select: { id: true, userId: true },
  });

  if (!existing) {
    res.status(404).json({ error: "Trade not found." });
    return null;
  }

  if (existing.userId !== userId) {
    res.status(403).json({ error: "Forbidden" });
    return null;
  }

  return existing;
}

/**
 * UPDATE (PUT)
 * Full path: PUT /trades/:tradeId
 */
router.put(
  "/:tradeId",
  requireAuth,
  validate({ params: tradeIdParam, body: updateTradeBody }),
  async (req, res) => {
    try {
      const userId = req.user.id;
      const tradeId = decodeURIComponent(req.params.tradeId).trim();

      const ok = await assertTradeOwnershipOrRespond(tradeId, userId, res);
      if (!ok) return;

      const data = { ...req.body };

      // normalize (keep your current behavior)
      if (data.profitLoss != null) data.profitLoss = String(data.profitLoss);
      if (data.dripPercent != null) data.dripPercent = String(data.dripPercent);
      if (data.amountLeveraged != null) data.amountLeveraged = String(data.amountLeveraged);
      if (data.contractsCount != null) data.contractsCount = Number(data.contractsCount);
      if (data.runner != null) data.runner = !!data.runner;
      if (data.optionType) data.optionType = String(data.optionType).toUpperCase();
      if (data.outcomeColor) data.outcomeColor = String(data.outcomeColor).toUpperCase();
      if (data.strategy) data.strategy = String(data.strategy).toUpperCase();

      const updated = await prisma.trade.update({
        where: { id: tradeId },
        data,
      });

      return res.json({ trade: updated });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Server error." });
    }
  }
);

/**
 * UPDATE (PATCH)
 * Full path: PATCH /trades/:tradeId
 */
router.patch(
  "/:tradeId",
  requireAuth,
  validate({ params: tradeIdParam, body: updateTradeBody }),
  async (req, res) => {
    try {
      const userId = req.user.id;
      const tradeId = decodeURIComponent(req.params.tradeId).trim();

      const ok = await assertTradeOwnershipOrRespond(tradeId, userId, res);
      if (!ok) return;

      const data = { ...req.body };

      // normalize (keep your current behavior)
      if (data.profitLoss != null) data.profitLoss = String(data.profitLoss);
      if (data.dripPercent != null) data.dripPercent = String(data.dripPercent);
      if (data.amountLeveraged != null) data.amountLeveraged = String(data.amountLeveraged);
      if (data.contractsCount != null) data.contractsCount = Number(data.contractsCount);
      if (data.runner != null) data.runner = !!data.runner;
      if (data.optionType) data.optionType = String(data.optionType).toUpperCase();
      if (data.outcomeColor) data.outcomeColor = String(data.outcomeColor).toUpperCase();
      if (data.strategy) data.strategy = String(data.strategy).toUpperCase();

      const updated = await prisma.trade.update({
        where: { id: tradeId },
        data,
      });

      return res.json({ trade: updated });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Server error." });
    }
  }
);

/**
 * DELETE
 * Full path: DELETE /trades/:tradeId
 */
router.delete(
  "/:tradeId",
  requireAuth,
  validate({ params: tradeIdParam }),
  async (req, res) => {
    try {
      const userId = req.user.id;
      const tradeId = decodeURIComponent(req.params.tradeId).trim();

      const ok = await assertTradeOwnershipOrRespond(tradeId, userId, res);
      if (!ok) return;

      await prisma.trade.delete({ where: { id: tradeId } });
      return res.status(204).send();
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Server error." });
    }
  }
);

module.exports = router;
