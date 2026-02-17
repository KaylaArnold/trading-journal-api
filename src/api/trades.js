import api from "./client";

function toUpperOrNull(v) {
  if (v == null) return null;
  const s = String(v).trim();
  return s ? s.toUpperCase() : null;
}

function toNumberOrNull(v) {
  if (v == null) return null;
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  const s = String(v).trim();
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function toStringOrNull(v) {
  if (v == null) return null;
  const s = String(v).trim();
  return s ? s : null;
}

export async function patchTrade(tradeId, body) {
  // Only send fields your API expects, with correct types
  const payload = {
    timeIn: toStringOrNull(body.timeIn),
    timeOut: toStringOrNull(body.timeOut),

    // Pick ONE based on your backend schema:
    // If your backend expects Decimal-as-string: use String
    // If your backend expects number: use toNumberOrNull
    profitLoss: body.profitLoss === "" ? null : String(body.profitLoss),

    runner: !!body.runner,
    optionType: toUpperOrNull(body.optionType),
    outcomeColor: toUpperOrNull(body.outcomeColor),
    strategy: toUpperOrNull(body.strategy),

    contractsCount: toNumberOrNull(body.contractsCount),
    dripPercent: toNumberOrNull(body.dripPercent),
    amountLeveraged: toNumberOrNull(body.amountLeveraged),
  };

  // Remove null/undefined keys if your Zod schema disallows nulls
  Object.keys(payload).forEach((k) => {
    if (payload[k] === undefined) delete payload[k];
  });

  const res = await api.patch(`/trades/${tradeId}`, payload);
  return res.data?.trade ?? res.data;
}
