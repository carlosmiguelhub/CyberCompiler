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
    <div className="w-full bg-slate-100 text-slate-900 transition-colors duration-300 dark:bg-transparent dark:text-slate-50">
      <main className="flex flex-col">
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
      </main>
    </div>
  );
}

export default CompilerPage;
