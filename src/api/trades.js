import api from "./client";

// Update an existing trade
export async function patchTrade(tradeId, body) {
  const res = await api.patch(`/trades/${tradeId}`, body);
  return res.data?.trade ?? res.data;
}

// (Optional) Create trade under a daily log (use this if you want a helper)
export async function createTrade(dailyLogId, payload) {
  const res = await api.post(`/daily-logs/${dailyLogId}/trades`, payload);
  return res.data?.trade ?? res.data;
}

// (Optional) Delete trade
export async function deleteTrade(tradeId) {
  const res = await api.delete(`/trades/${tradeId}`);
  return res.data;
}
