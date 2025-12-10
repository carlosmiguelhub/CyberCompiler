// src/pages/CompilerPage.jsx
import React from "react";
import { useCompiler } from "../hooks/useCompiler";
import CompilerHeader from "../components/compiler/CompilerHeader";
import CodeEditorPanel from "../components/compiler/CodeEditorPanel";
import StdinPanel from "../components/compiler/StdinPanel";
import OutputPanel from "../components/compiler/OutputPanel";

function CompilerPage({ isDark, onToggleTheme }) {
  const {
    language,
    code,
    stdin,
    output,
    isRunning,
    setCode,
    setStdin,
    handleLanguageChange,
    handleRun,
  } = useCompiler();

  const editorTheme = isDark ? "vs-dark" : "light";

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 transition-colors duration-300 dark:bg-transparent dark:text-slate-50">
      <main className="mx-auto max-w-6xl px-3 py-4 sm:px-4 lg:py-8">
        {/* Main shell card */}
<div className="rounded-2xl border border-slate-200 bg-white/90 shadow-xl shadow-slate-900/5 backdrop-blur transition-colors duration-300 dark:border-slate-800 dark:bg-slate-950/80 dark:shadow-slate-950/60">
          {/* Header area */}
          <div className="border-b border-slate-200 px-4 py-3 dark:border-slate-800 sm:px-6">
            <CompilerHeader
              language={language}
              isRunning={isRunning}
              onLanguageChange={handleLanguageChange}
              onRun={handleRun}
              isDark={isDark}
              onToggleTheme={onToggleTheme}
            />
          </div>

          {/* Main content */}
          <div className="px-4 pb-4 pt-3 sm:px-6 sm:pb-6">
            <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[minmax(0,1.8fr)_minmax(0,1.2fr)]">
              {/* Left: editor + stdin */}
              <div className="flex flex-col gap-3">
                <CodeEditorPanel
                  language={language}
                  code={code}
                  onChange={setCode}
                  editorTheme={editorTheme}
                />
                <StdinPanel stdin={stdin} onChange={setStdin} />
              </div>

              {/* Right: output */}
              <div className="flex flex-col">
                <OutputPanel output={output} isRunning={isRunning} />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default CompilerPage;
