const express = require("express");
const router = express.Router();

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const openai = require("../lib/openai");

router.get("/test", (req, res) => {
  res.json({ message: "AI route works" });
});

router.post("/analyze-trade/:tradeId", async (req, res) => {
  try {
    const tradeId = req.params.tradeId;

    if (!tradeId || typeof tradeId !== "string") {
      return res.status(400).json({ error: "Invalid trade ID" });
    }

    const trade = await prisma.trade.findUnique({
      where: { id: tradeId },
      include: {
        dailyLog: true,
      },
    });

    if (!trade) {
      return res.status(404).json({ error: "Trade not found" });
    }

    const tradePayload = {
      symbol: trade.symbol ?? null,
      side: trade.side ?? null,
      entryPrice: trade.entryPrice ?? null,
      exitPrice: trade.exitPrice ?? null,
      profitLoss: trade.profitLoss ?? null,
      strategy: trade.strategy ?? null,
      notes: trade.notes ?? null,
      tradeDate: trade.dailyLog?.date ?? null,
      dailyLogNotes: trade.dailyLog?.notes ?? null,
    };

    const prompt = `
You are a disciplined trading performance coach.

Analyze this trade and return ONLY valid JSON.
Do not include markdown fences.
Do not predict future prices.
Do not give financial advice.

Return this exact shape:
{
  "disciplineScore": number,
  "strengths": ["string"],
  "mistakes": ["string"],
  "riskNotes": ["string"],
  "coachingSummary": "string",
  "suggestedImprovement": "string"
}

Trade data:
${JSON.stringify(tradePayload, null, 2)}
`;

    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: prompt,
    });

    const rawText = response.output_text;

    if (!rawText) {
      return res.status(500).json({ error: "AI returned no text output" });
    }

    let analysis;
    try {
      analysis = JSON.parse(rawText);
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      console.error("Invalid AI output:", rawText);

      return res.status(500).json({
        error: "AI returned invalid JSON",
        rawText,
      });
    }

    return res.status(200).json({
      tradeId: trade.id,
      analysis,
    });
  } catch (error) {
    console.error("AI analyze trade error:", error);
    console.error("AI analyze trade error message:", error.message);

    return res.status(500).json({
      error: "Failed to analyze trade",
      details: error.message,
    });
  }
});

module.exports = router;