// compiler-api/server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());           // ✅ allow all origins for dev
app.use(express.json());   // ✅ parse JSON bodies

// Health check
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "CyberCompile API running" });
});

// Map UI language ids -> Piston languages/versions/file names
const LANGUAGE_MAP = {
  javascript: {
    language: "javascript",
    version: "18.15.0",
    fileName: "main.js",
  },
  python: {
    language: "python",
    version: "3.10.0",
    fileName: "main.py",
  },
  // ✅ C must use gcc 10.2.0 on Piston; use .c extension for clearer errors
  c: {
    language: "c",
    version: "10.2.0",
    fileName: "main.c",
  },
  // you can add more languages here later (cpp, java, etc.)
};

// Real run endpoint using Piston
app.post("/run", async (req, res) => {
  try {
    const { language: uiLanguage, code, stdin = "" } = req.body || {};

    if (!uiLanguage || !code) {
      return res.status(400).json({
        success: false,
        error: "language and code are required",
      });
    }

    const langConfig = LANGUAGE_MAP[uiLanguage];

    if (!langConfig) {
      return res.status(400).json({
        success: false,
        error: `Unsupported language: ${uiLanguage}`,
      });
    }

    // Build request payload for Piston
    const payload = {
      language: langConfig.language,
      version: langConfig.version,
      files: [
        {
          name: langConfig.fileName, // 👈 gives nicer C compile errors
          content: code,
        },
      ],
      stdin: stdin || "",      // 👈 this is what scanf / fgets / input() will read
      args: [],
      compile_timeout: 10000,  // ms
      run_timeout: 3000,       // ms
      compile_memory_limit: -1,
      run_memory_limit: -1,
    };

    // Call Piston API
    const pistonResponse = await axios.post(
      "https://emkc.org/api/v2/piston/execute",
      payload,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const data = pistonResponse.data;

    const compileStderr = data.compile?.stderr || "";
    const compileCode = data.compile?.code;
    const runStdout = data.run?.stdout || "";
    const runStderr = data.run?.stderr || "";
    const runExitCode = data.run?.code;

    const stdoutCombined = runStdout;
    const stderrCombined = [compileStderr, runStderr].filter(Boolean).join("\n");

    // Optional: one combined output string for easy display
    let combinedOutput = "";
    if (compileStderr) {
      combinedOutput += `--- COMPILER ---\n${compileStderr}\n\n`;
    }
    if (runStderr) {
      combinedOutput += `--- STDERR ---\n${runStderr}\n\n`;
    }
    if (runStdout) {
      combinedOutput += `--- STDOUT ---\n${runStdout}\n`;
    }
    combinedOutput = combinedOutput.trim();

    return res.json({
      success: true,
      language: uiLanguage,
      stdout: stdoutCombined,   // pure program output to stdout
      stderr: stderrCombined,   // compiler + runtime errors
      output: combinedOutput,   // nicely formatted combo (optional)
      compileCode,              // exit code of compile step (if any)
      runExitCode,              // exit code of program
    });
  } catch (err) {
    // Log whatever Piston sends back to help debugging
    console.error("Error executing code:", err.response?.data || err.message);

    return res.status(500).json({
      success: false,
      error: "Failed to execute code",
      details: err.response?.data || err.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Compiler API listening on port ${PORT}`);
});
