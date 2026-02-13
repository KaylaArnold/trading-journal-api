const { z } = require("zod");

// Accepts "125.50" or 125.5
const numericLike = z.union([
  z.number(),
  z.string().regex(/^-?\d+(\.\d+)?$/, "Must be a number"),
]);

const timeHHMM = z
  .string()
  .regex(/^\d{1,2}:\d{2}$/, "Use H:MM or HH:MM (e.g. 9:30 or 10:02)");
const createTradeBody = z.object({
  timeIn: timeHHMM,
  timeOut: timeHHMM,
  profitLoss: numericLike,
  dripPercent: numericLike.optional().nullable(),
  amountLeveraged: numericLike.optional().nullable(),
  runner: z.coerce.boolean().optional().default(false),
  contractsCount: z.coerce.number().int().positive().optional().nullable(),
  optionType: z.string().max(20).optional().nullable(),
  outcomeColor: z.string().max(20).optional().nullable(),
  strategy: z.string().max(20).optional().nullable(),
});

const updateTradeBody = createTradeBody.partial().refine(
  (obj) => Object.keys(obj).length > 0,
  { message: "At least one field is required" }
);

module.exports = { createTradeBody, updateTradeBody };
