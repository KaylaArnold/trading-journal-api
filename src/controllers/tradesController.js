const prisma = require("../prisma"); // adjust to your prisma client path
const { coerceTradeNumbers } = require("../utils/coerceTradeNumbers");

async function updateTrade(req, res) {
  const tradeId = req.params.id;
  const userId = req.user.id; // set by auth middleware
  const parsedBody = req.body; // already validated by validate(updateTradeBody)

  // Normalize numeric-like fields to real numbers
  const data = coerceTradeNumbers(parsedBody);

  // Ownership check: trade -> dailyLog -> userId
  const existing = await prisma.trade.findUnique({
    where: { id: tradeId },
    select: {
      id: true,
      dailyLog: { select: { userId: true } },
    },
  });

  if (!existing) {
    return res.status(404).json({ error: "Trade not found" });
  }

  if (existing.dailyLog.userId !== userId) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const updated = await prisma.trade.update({
    where: { id: tradeId },
    data,
  });

  return res.json(updated);
}

module.exports = { updateTrade };
