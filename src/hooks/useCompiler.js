import { useState } from "react";
import { runCodeRequest } from "../api/compilerApi";

const DEFAULT_CODE = {
  javascript: `// JavaScript example
function greet(name) {
  console.log("Hello, " + name + "!");
}

greet("World");`,
  python: `# Python example
def greet(name):
    print("Hello, " + name + "!")

greet("World")`,
  c: `// C example
#include <stdio.h>

int main() {
    printf("Hello, World!\\n");
    return 0;
}`
};

export function useCompiler() {
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState(DEFAULT_CODE.javascript);
  const [stdin, setStdin] = useState("");
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);

  const handleLanguageChange = (e) => {
    const lang = e.target.value;
    setLanguage(lang);
    setCode(DEFAULT_CODE[lang] || "");
  };

  const handleRun = async () => {
    try {
      setIsRunning(true);
      setOutput("");

      const result = await runCodeRequest({
        language,
        code,
        stdin
      });

      const stdout = result.stdout || "";
      const stderr = result.stderr || "";

      setOutput(
        stderr
          ? `${stdout ? stdout + "\n\n" : ""}Errors:\n${stderr}`
          : stdout || "Program finished with no output."
      );
    } catch (err) {
      setOutput(`Error: ${err.message || "Failed to execute code."}`);
    } finally {
      setIsRunning(false);
    }
  };

  return {
    language,
    code,
    stdin,
    output,
    isRunning,
    setCode,
    setStdin,
    handleLanguageChange,
    handleRun
  };
}
