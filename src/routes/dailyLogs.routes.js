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

// POST /daily-logs/:id/trades  (create trade)
router.post(
  "/daily-logs/:id/trades",
  requireAuth,
  validate({ params: uuidParam }),
  async (req, res) => {
    try {
      const userId = req.user.id;
      const dailyLogId = req.params.id;

      const {
        timeIn,
        timeOut,
        profitLoss,
        runner,
        optionType,
        outcomeColor,
        strategy,
        contractsCount,
        dripPercent,
        amountLeveraged,
      } = req.body;

      if (!timeIn || !timeOut || profitLoss === "" || profitLoss == null) {
        return res
          .status(400)
          .json({ message: "timeIn, timeOut, and profitLoss are required." });
      }

      // optional safety: make sure the log belongs to this user
      const ownsLog = await prisma.dailyLog.findFirst({
        where: { id: dailyLogId, userId },
        select: { id: true },
      });
      if (!ownsLog) return res.status(404).json({ error: "Daily log not found" });

      const trade = await prisma.trade.create({
        data: {
          dailyLogId,
          timeIn,
          timeOut,
          profitLoss: Number(profitLoss),
          runner: !!runner,
          optionType,
          outcomeColor,
          strategy,
          contractsCount:
            contractsCount === "" || contractsCount == null
              ? null
              : Number(contractsCount),
          dripPercent:
            dripPercent === "" || dripPercent == null
              ? null
              : Number(dripPercent),
          amountLeveraged:
            amountLeveraged === "" || amountLeveraged == null
              ? null
              : Number(amountLeveraged),
        },
      });

      return res.status(201).json({ trade });
    } catch (err) {
      console.error("Create trade error:", err);
      return res.status(500).json({ message: "Failed to create trade." });
    }
  }
);

module.exports = router;