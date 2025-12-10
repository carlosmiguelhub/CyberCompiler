// src/api/compilerApi.js
const API_BASE_URL = "http://localhost:4000"; // ✅ exact same port

export async function runCodeRequest({ language, code, stdin }) {
  const res = await fetch(`${API_BASE_URL}/run`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ language, code, stdin })
  });

  let data;
  try {
    data = await res.json();
  } catch {
    data = {};
  }

  if (!res.ok || data.success === false) {
    throw new Error(data.error || "Failed to execute code");
  }

  return data;
}
