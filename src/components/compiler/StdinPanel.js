import React from "react";

function StdinPanel({ stdin, onChange }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-slate-50 shadow-sm transition dark:border-slate-700 dark:bg-slate-900/90">
      <div className="border-b border-slate-200 px-3 py-2 text-xs font-medium text-slate-500 dark:border-slate-800 dark:text-slate-400">
        Standard Input (stdin)
      </div>
      <textarea
        value={stdin}
        onChange={(e) => onChange(e.target.value)}
        className="h-24 w-full resize-none bg-transparent px-3 py-2 text-xs font-mono text-slate-800 outline-none placeholder:text-slate-400 dark:text-slate-100 dark:placeholder:text-slate-500"
        placeholder="Type input for your program here..."
      />
    </section>
  );
}

export default StdinPanel;
