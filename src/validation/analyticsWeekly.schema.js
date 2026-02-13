const { z } = require("zod");

// Accept YYYY-MM-DD only
const ymd = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD");

const analyticsWeeklyQuerySchema = z.object({
    weeks: z.coerce.number().int().min(1).max(52).default(8),
    from: ymd.optional(),
    to: ymd.optional(),
});

module