function toNumber(v) {
  if (v === null || v === undefined) return v;
  if (typeof v === "number") return v;
  if (typeof v === "string" && v.trim() !== "") return Number(v);
  return v;
}

function coerceTradeNumbers(body) {
  // only convert keys that exist on body (PATCH safe)
  const out = { ...body };

  if ("profitLoss" in out) out.profitLoss = toNumber(out.profitLoss);
  if ("dripPercent" in out) out.dripPercent = toNumber(out.dripPercent);
  if ("amountLeveraged" in out) out.amountLeveraged = toNumber(out.amountLeveraged);
  if ("contractsCount" in out) out.contractsCount = toNumber(out.contractsCount);

  return out;
}

module.exports = { coerceTradeNumbers };
