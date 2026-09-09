// Thin client for the PHP/MySQL backend in /server. Two calls only, mirroring
// the shape AppDataContext.jsx already used for localStorage: the whole app
// state is one JSON object, loaded once and saved back as a whole.

const API_BASE = import.meta.env.VITE_API_BASE_URL || "/server";
const API_KEY = import.meta.env.VITE_API_KEY || "";

function headers(extra = {}) {
  return API_KEY ? { ...extra, "X-Api-Key": API_KEY } : extra;
}

export async function fetchState() {
  const res = await fetch(`${API_BASE}/state.php`, { headers: headers() });
  if (!res.ok) {
    throw new Error(`Failed to load app state (${res.status})`);
  }
  return res.json();
}

export async function saveState(state) {
  const res = await fetch(`${API_BASE}/state.php`, {
    method: "POST",
    headers: headers({ "Content-Type": "application/json" }),
    body: JSON.stringify(state),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Failed to save app state (${res.status})`);
  }
  return res.json();
}
