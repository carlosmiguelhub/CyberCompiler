  import React from "react";

  function CompilerHeader({
    language,
    isRunning,
    onLanguageChange,
    onRun,
    isDark,
    onToggleTheme,
  }) {
    return (
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-sky-400 text-lg font-bold text-white shadow-md">
            ⌘
          </span>
          <div>
            <h1 className="text-base font-semibold tracking-tight sm:text-lg">
              CyberCompile
            </h1>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 sm:text-xs">
              Multi-language online compiler
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center justify-start gap-2 sm:justify-end">
          {/* Theme toggle */}
          <button
            type="button"
            onClick={onToggleTheme}
            className="inline-flex items-center gap-1 rounded-full border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition hover:border-slate-400 hover:bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:border-slate-500 dark:hover:bg-slate-800"
          >
            <span className="text-sm">{isDark ? "🌙" : "☀️"}</span>
            <span className="hidden xs:inline">{isDark ? "Dark" : "Light"}</span>
          </button>

          {/* Language select */}
          <label className="flex items-center gap-2 text-xs">
            <span className="hidden text-slate-500 dark:text-slate-400 sm:inline">
              Language
            </span>
            <select
              value={language}
              onChange={onLanguageChange}
              className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            >
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="c">C</option>
            </select>
          </label>

          {/* Run button */}
          <button
            onClick={onRun}
            disabled={isRunning}
            className={`inline-flex flex-1 items-center justify-center gap-1 rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm transition focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 dark:focus:ring-offset-slate-950 sm:flex-none ${
              isRunning
                ? "cursor-wait bg-slate-400 dark:bg-slate-600"
                : "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 active:scale-[0.98]"
            }`}
          >
            {isRunning ? (
              <>
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Running…
              </>
            ) : (
              <>
                <span className="text-base leading-none">▶</span>
                <span className="hidden xs:inline">Run</span>
              </>
            )}
          </button>
        </div>
      </header>
    );
  }

  export default CompilerHeader;
