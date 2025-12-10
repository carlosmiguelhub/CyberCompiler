import React from "react";

function OutputPanel({ output, isRunning }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-slate-50 shadow-sm transition-colors duration-300 dark:border-slate-700 dark:bg-slate-900/90">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 px-3 py-2 text-xs font-medium text-slate-500 transition-colors duration-300 dark:border-slate-800 dark:text-slate-400">
        <span>Output</span>
        {isRunning && (
          <span className="inline-flex items-center gap-1 text-[10px] text-amber-500">
            <span className="h-2 w-2 animate-pulse rounded-full bg-amber-400" />
            Running…
          </span>
        )}
      </div>

      {/* Output Display Area */}
      <pre
        className="
          h-[220px] sm:h-[260px] md:h-[320px]
          overflow-auto
          rounded-b-xl
          px-3 py-2
          text-xs font-mono
          transition-colors duration-300

          bg-white text-slate-800
          dark:bg-slate-950 dark:text-emerald-300
        "
      >
        {output || (isRunning ? "Executing…" : "Click Run to execute your code.")}
      </pre>
    </section>
  );
}

export default OutputPanel;
