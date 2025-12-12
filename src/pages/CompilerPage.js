// src/pages/CompilerPage.jsx
import React, { useState, useEffect } from "react";
import jsPDF from "jspdf";
import { useCompiler } from "../hooks/useCompiler";
import CompilerHeader from "../components/compiler/CompilerHeader";
import CodeEditorPanel from "../components/compiler/CodeEditorPanel";
import StdinPanel from "../components/compiler/StdinPanel";
import OutputPanel from "../components/compiler/OutputPanel";

// 🔹 NEW: import Firestore file update
import { updateFileContent } from "../services/projectService";

function getDefaultCodeForLanguage(lang) {
  switch ((lang || "").toLowerCase()) {
    case "c":
      return `#include <stdio.h>

int main() {
    printf("Hello, world!\\n");
    return 0;
}
`;
    case "cpp":
    case "c++":
      return `#include <iostream>
using namespace std;

int main() {
    cout << "Hello, world!" << endl;
    return 0;
}
`;
    case "java":
      return `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, world!");
    }
}
`;
    case "javascript":
    case "js":
      return `console.log("Hello, world!");`;
    case "python":
    case "py":
      return `print("Hello, world!")`;
    default:
      return "// Start coding here...";
  }
}

// 🔹 Helper: nicely formatted PDF (Academic style)
function exportFileToPdf({ filename, language, code, output }) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const margin = 48;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let y = margin;

  const safeFilename = filename || "Untitled activity";
  const langLabel = language || "Unknown";
  const exportDate = new Date().toLocaleString();

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Programming Activity Report", margin, y);
  y += 28;

  // Meta info
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(`Filename: ${safeFilename}`, margin, y);
  y += 16;
  doc.text(`Language: ${langLabel}`, margin, y);
  y += 16;
  doc.text(`Exported: ${exportDate}`, margin, y);
  y += 24;

  // Section: Source Code
  if (y > pageHeight - margin) {
    doc.addPage();
    y = margin;
  }
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("Source Code", margin, y);
  y += 18;

  doc.setFont("courier", "normal");
  doc.setFontSize(9);
  const codeText = code || "";
  const codeLines = doc.splitTextToSize(
    codeText,
    pageWidth - margin * 2
  );

  codeLines.forEach((line) => {
    if (y > pageHeight - margin) {
      doc.addPage();
      y = margin;
      doc.setFont("courier", "normal");
      doc.setFontSize(9);
    }
    doc.text(line, margin, y);
    y += 12;
  });

  // Space before output section
  y += 18;

  // Section: Program Output
  if (y > pageHeight - margin) {
    doc.addPage();
    y = margin;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("Program Output", margin, y);
  y += 18;

  doc.setFont("courier", "normal");
  doc.setFontSize(9);
  const outputText =
    output && output.trim().length > 0 ? output : "(no output)";
  const outputLines = doc.splitTextToSize(
    outputText,
    pageWidth - margin * 2
  );

  // Draw a light box around the output area for "console" feel
  const boxTop = y - 12;
  const boxLeft = margin - 6;
  const boxWidth = pageWidth - margin * 2 + 12;

  // We don't know final height yet; so we will draw line-by-line and then a border
  let boxBottom = boxTop;

  outputLines.forEach((line) => {
    if (y > pageHeight - margin) {
      // close previous box
      doc.rect(
        boxLeft,
        boxTop,
        boxWidth,
        boxBottom - boxTop + 12
      );

      // new page
      doc.addPage();
      y = margin;
      doc.setFont("courier", "normal");
      doc.setFontSize(9);

      // reset box for new page
      const newBoxTop = y - 12;
      boxBottom = newBoxTop;
    }

    doc.text(line, margin, y);
    boxBottom = y;
    y += 12;
  });

  // Draw final box for output
  doc.rect(
    boxLeft,
    boxTop,
    boxWidth,
    boxBottom - boxTop + 16
  );

  doc.save(
    `${safeFilename.replace(/\.[^.]+$/, "") || "activity"}.pdf`
  );
}

function CompilerPage({ isDark, onToggleTheme, openedFile }) {
  const {
    language,
    code,
    stdin,
    output,
    isRunning,
    setCode,
    setStdin,
    setLanguage,
    setOutput,
    handleLanguageChange,
    handleRun,
  } = useCompiler();

  const editorTheme = isDark ? "vs-dark" : "light";

  // just for showing the file name in the editor header
  const [activeFilename, setActiveFilename] = useState(null);

  // build a unique key per file for localStorage
  const getStorageKeyForFile = (projectId, fileId) =>
    `cybercompile_file_${projectId}_${fileId}`;

  // 🔹 When user clicks a file: load its code + last output
  useEffect(() => {
    if (!openedFile || !openedFile.file) return;

    const { projectId, file } = openedFile;
    const fileLang = file.language || "javascript";
    const storageKey = getStorageKeyForFile(projectId, file.id);

    let initialCode = "";
    let initialOutput = "";

    try {
      const raw = window.localStorage.getItem(storageKey);

      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object") {
          initialCode =
            typeof parsed.code === "string"
              ? parsed.code
              : getDefaultCodeForLanguage(fileLang);
          initialOutput =
            typeof parsed.output === "string" ? parsed.output : "";
        } else {
          initialCode =
            file.content && file.content.trim() !== ""
              ? file.content
              : getDefaultCodeForLanguage(fileLang);
          initialOutput = "";
        }
      } else {
        // first time opening this file
        initialCode =
          file.content && file.content.trim() !== ""
            ? file.content
            : getDefaultCodeForLanguage(fileLang);
        initialOutput = "";
      }
    } catch (err) {
      console.error("Failed to load file from localStorage:", err);
      initialCode = getDefaultCodeForLanguage(fileLang);
      initialOutput = "";
    }

    setActiveFilename(file.filename || null);

    // set language for header + runner
    setLanguage(fileLang);

    // ⛔ only when openedFile changes
    setCode(initialCode);
    setOutput(initialOutput);
  }, [openedFile, setLanguage, setCode, setOutput]);

  // 🔹 Save code + output to localStorage whenever they change
  useEffect(() => {
    if (!openedFile || !openedFile.file) return;

    const { projectId, file } = openedFile;
    const storageKey = getStorageKeyForFile(projectId, file.id);

    const payload = {
      code: code ?? "",
      output: output ?? "",
    };

    try {
      window.localStorage.setItem(storageKey, JSON.stringify(payload));
    } catch (err) {
      console.error("Failed to save file to localStorage:", err);
    }
  }, [code, output, openedFile]);

  // 🔹 NEW: autosave code to Firestore whenever it changes (debounced)
  useEffect(() => {
    if (!openedFile || !openedFile.file) return;
    const { projectId, file } = openedFile;
    if (!projectId || !file.id) return;

    // Skip autosave if code is still undefined
    if (typeof code !== "string") return;

    const timeoutId = setTimeout(() => {
      updateFileContent(projectId, file.id, {
        content: code ?? "",
        language: language || file.language || "text",
      }).catch((err) => {
        console.error("Failed to save file to Firestore:", err);
      });
    }, 800); // 0.8s debounce

    return () => clearTimeout(timeoutId);
  }, [code, language, openedFile]);

  // 🔹 Export handler
  const handleExportPdf = () => {
    if (!openedFile || !openedFile.file) {
      alert("Please select a file from the workspace first.");
      return;
    }

    const filename =
      activeFilename || openedFile.file.filename || "Untitled.c";

    exportFileToPdf({
      filename,
      language,
      code,
      output,
    });
  };

  return (
    <div className="w-full bg-transparent text-slate-900 transition-colors duration-300 dark:text-slate-50">
      {/* Shell card */}
      <div className="flex-1 overflow-hidden rounded-2xl border border-slate-200 bg-white/95 shadow-xl shadow-slate-900/5 backdrop-blur transition-colors duration-300 dark:border-slate-800 dark:bg-slate-950/90 dark:shadow-slate-950/60">
        {/* Header */}
        <div className="border-b border-slate-200 px-3 py-2.5 dark:border-slate-800 sm:px-4 sm:py-3">
          <CompilerHeader
            language={language}
            isRunning={isRunning}
            onLanguageChange={handleLanguageChange}
            onRun={handleRun}
            isDark={isDark}
            onToggleTheme={onToggleTheme}
            onExportPdf={handleExportPdf}
          />
        </div>

        {/* Content */}
        <div className="px-3 pb-3 pt-2 sm:px-4 sm:pb-4 sm:pt-3 lg:px-6 lg:pb-6">
          <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1.2fr)] lg:gap-5">
            {/* Left: editor + stdin */}
            <div className="flex flex-col gap-3">
              <div className="min-h-[260px] sm:min-h-[320px] lg:min-h-[420px]">
                <CodeEditorPanel
                  language={language}
                  code={code}
                  onChange={setCode}
                  editorTheme={editorTheme}
                  filename={activeFilename || openedFile?.file?.filename}
                />
              </div>

              <div className="mt-1">
                <StdinPanel stdin={stdin} onChange={setStdin} />
              </div>
            </div>

            {/* Right: output */}
            <div className="flex flex-col">
              <div className="min-h-[180px] sm:min-h-[220px] lg:min-h-[260px]">
                <OutputPanel output={output} isRunning={isRunning} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CompilerPage;
