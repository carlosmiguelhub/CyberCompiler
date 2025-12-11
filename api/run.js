// api/run.js
const axios = require("axios");

const LANGUAGE_MAP = {
  javascript: { language: "javascript", version: "18.15.0" },
  python: { language: "python", version: "3.10.0" },
  c: { language: "c", version: "10.2.0" },
};

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ success: false, error: "Method not allowed" });
  }

  const { language, code, stdin } = req.body || {};

  if (!language || !code) {
    return res
      .status(400)
      .json({ success: false, error: "language and code are required" });
  }

  const mapped = LANGUAGE_MAP[language];
  if (!mapped) {
    return res
      .status(400)
      .json({ success: false, error: `Unsupported language: ${language}` });
  }

  try {
    const pistonRes = await axios.post(
      "https://emkc.org/api/v2/piston/execute",
      {
        language: mapped.language,
        version: mapped.version,
        files: [{ content: code }],
        stdin: stdin || "",
      }
    );

    const run = pistonRes.data.run || {};

    res.status(200).json({
      success: true,
      output: (run.output || "").trim(),
      stdout: (run.stdout || "").trim(),
      stderr: (run.stderr || "").trim(),
      code: run.code,
      signal: run.signal,
    });
  } catch (err) {
    console.error("Piston error:", err.response?.data || err.message);
    res
      .status(500)
      .json({ success: false, error: "Failed to execute code on server" });
  }
};
