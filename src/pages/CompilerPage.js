// src/pages/CompilerPage.jsx
import React, { useState, useEffect } from "react";
import jsPDF from "jspdf";
import { useCompiler } from "../hooks/useCompiler";
import CompilerHeader from "../components/compiler/CompilerHeader";
import CodeEditorPanel from "../components/compiler/CodeEditorPanel";
import StdinPanel from "../components/compiler/StdinPanel";
import OutputPanel from "../components/compiler/OutputPanel";
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

// PDF export helper
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

  // Source Code
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

  // Program Output
  y += 18;
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

  const boxTop = y - 12;
  const boxLeft = margin - 6;
  const boxWidth = pageWidth - margin * 2 + 12;
  let boxBottom = boxTop;

  outputLines.forEach((line) => {
    if (y > pageHeight - margin) {
      doc.rect(
        boxLeft,
        boxTop,
        boxWidth,
        boxBottom - boxTop + 12
      );
      doc.addPage();
      y = margin;
      doc.setFont("courier", "normal");
      doc.setFontSize(9);
      const newBoxTop = y - 12;
      boxBottom = newBoxTop;
    }

    doc.text(line, margin, y);
    boxBottom = y;
    y += 12;
  });

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

  const [activeFilename, setActiveFilename] = useState(null);
  const [saveStatus, setSaveStatus] = useState("Saved");

  const getStorageKeyForFile = (projectId, fileId) =>
    `cybercompile_file_${projectId}_${fileId}`;

  // When user clicks a file: load its code + last output
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
    setLanguage(fileLang);
    setCode(initialCode);
    setOutput(initialOutput);
    setSaveStatus("Saved");
  }, [openedFile, setLanguage, setCode, setOutput]);

  // Save code + output to localStorage
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

  // 🔹 Autosave code to Firestore with status indicator
  useEffect(() => {
    if (!openedFile || !openedFile.file) return;
    const { projectId, file } = openedFile;
    if (!projectId || !file.id) return;
    if (typeof code !== "string") return;

    setSaveStatus("Editing…");

    const timeoutId = setTimeout(() => {
      setSaveStatus("Saving…");
      updateFileContent(projectId, file.id, {
        content: code ?? "",
        language: language || file.language || "text",
      })
        .then(() => {
          setSaveStatus("Saved");
        })
        .catch((err) => {
          console.error("Failed to save file to Firestore:", err);
          setSaveStatus("Error");
        });
    }, 800);

    return () => clearTimeout(timeoutId);
  }, [code, language, openedFile]);

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

  const statusDotClass =
    saveStatus === "Saved"
      ? "bg-emerald-500"
      : saveStatus === "Saving…"
      ? "bg-amber-500"
      : saveStatus === "Error"
      ? "bg-red-500"
      : "bg-slate-400";

  return (
    <div className="flex h-full w-full flex-col bg-transparent text-slate-900 transition-colors duration-300 dark:text-slate-50">
      <div className="flex-1 overflow-auto rounded-2xl border border-slate-200 bg-white/95 shadow-xl shadow-slate-900/5 backdrop-blur transition-colors duration-300 dark:border-slate-800 dark:bg-slate-950/90 dark:shadow-slate-950/60">
        {/* Header */}
        <div className="border-b border-slate-200 px-3 py-2.5 dark:border-slate-800 sm:px-4 sm:py-3">
          <div className="flex items-center justify-between gap-3">
            <CompilerHeader
              language={language}
              isRunning={isRunning}
              onLanguageChange={handleLanguageChange}
              onRun={handleRun}
              isDark={isDark}
              onToggleTheme={onToggleTheme}
              onExportPdf={handleExportPdf}
            />
            {/* Saving indicator (hidden on tiny screens if you want) */}
            <div className="hidden items-center gap-2 text-[11px] text-slate-400 sm:flex">
              <span
                className={`h-2 w-2 rounded-full ${statusDotClass}`}
              />
              <span>{saveStatus}</span>
            </div>
          </div>
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
