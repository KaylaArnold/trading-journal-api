const { z } = require("zod");

const analyticsQuery = z
  .object({
    from: z.string().optional(),
    to: z.string().optional(),
  })
  .superRefine((v, ctx) => {
    const isYMD = (s) => /^\d{4}-\d{2}-\d{2}$/.test(s);

    if (v.from && !isYMD(v.from)) {
      ctx.addIssue({
        code: "custom",
        path: ["from"],
        message: "Use YYYY-MM-DD",
      });
    }

    if (v.to && !isYMD(v.to)) {
      ctx.addIssue({
        code: "custom",
        path: ["to"],
        message: "Use YYYY-MM-DD",
      });
    }
  });

module.exports = { analyticsQuery };
