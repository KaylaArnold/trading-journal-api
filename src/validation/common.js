const { z } = require("zod");

const uuidParam = z.object({
  id: z.string().uuid(),
});

const tradeIdParam = z.object({
  tradeId: z.string().uuid(),
});

module.exports = { uuidParam, tradeIdParam };
