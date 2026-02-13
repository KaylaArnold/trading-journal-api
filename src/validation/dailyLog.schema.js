const { z } = require("zod");

// helpers
const numericLike = z.union([
  z.number(),
  z.string().regex(/^-?\d+(\.\d+)?$/, "Must be a number"),
]);

const ymd = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD");

const dailyLogCreateSchema = z.object({
  date: ymd, // "YYYY-MM-DD"
  ticker: z.string().min(1).max(10),

  currentPrice: numericLike.optional().nullable(),
  pmh: numericLike.optional().nullable(),
  ydh: numericLike.optional().nullable(),
  pml: numericLike.optional().nullable(),
  ydl: numericLike.optional().nullable(),

  keyLevels: z.string().optional().nullable(),
  premarketGaps: z.coerce.boolean().optional().nullable(),

  strategyOrb15: z.coerce.boolean().optional(),
  strategyOrb5: z.coerce.boolean().optional(),
  strategy3Conf: z.coerce.boolean().optional(),

  waitedAPlus: z.coerce.boolean().optional().nullable(),
  tradedInZone: z.coerce.boolean().optional().nullable(),
  followedRules: z.coerce.boolean().optional().nullable(),

  feelings: z.string().optional().nullable(),
  reflections: z.string().optional().nullable(),
});

// UPDATE: partial update + must include at least one field
const dailyLogUpdateSchema = dailyLogCreateSchema
  .omit({ date: true }) // optional: allow date updates? if you want, remove this line
  .partial()
  .refine((obj) => Object.keys(obj).length > 0, {
    message: "At least one field is required",
  });

// LIST query schema: page/limit/ticker/from/to
const dailyLogListQuerySchema = z.object({
  ticker: z.string().optional(),
  from: ymd.optional(),
  to: ymd.optional(),

  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  sortBy: z.enum(["date", "ticker"]).optional(),
  order: z.enum(["asc", "desc"]).optional(),
});

module.exports = {
  dailyLogCreateSchema,
  dailyLogUpdateSchema,
  dailyLogListQuerySchema,
};
