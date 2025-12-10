import React from "react";
import Editor from "@monaco-editor/react";

function CodeEditorPanel({ language, code, onChange, editorTheme }) {
  return (
    <section className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-slate-50 shadow-sm transition dark:border-slate-700 dark:bg-slate-900/90">
      <div className="flex items-center justify-between border-b border-slate-200 px-3 py-2 text-xs font-medium text-slate-500 dark:border-slate-800 dark:text-slate-400">
        <span>Editor</span>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] uppercase tracking-wide text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          {language}
        </span>
      </div>
      <div className="h-[260px] sm:h-[320px] md:h-[380px] lg:h-[420px]">
        <Editor
          height="100%"
          defaultLanguage={language}
          language={language}
          value={code}
          theme={editorTheme}
          onChange={(value) => onChange(value ?? "")}
          options={{
            fontSize: 14,
            minimap: { enabled: false },
            wordWrap: "on",
            automaticLayout: true,
            padding: { top: 8, bottom: 8 },
          }}
        />
      </div>
    </section>
  );
}

export default CodeEditorPanel;
