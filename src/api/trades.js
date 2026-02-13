const API_BASE = "http://localhost:3000";

export async function patchTrade(tradeId, body) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_BASE}/trades/${tradeId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.error || `Request failed (${res.status})`);
  }

  return data.trade ?? data;
}

