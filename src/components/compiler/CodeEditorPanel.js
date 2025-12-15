// src/components/compiler/CodeEditorPanel.jsx
import React, { useEffect, useMemo, useState } from "react";
import Editor from "@monaco-editor/react";

const WRAP_STORAGE_KEY = "cc_editor_wordwrap"; // remember per user/device

function CodeEditorPanel({ language, code, onChange, editorTheme, filename }) {
  const displayName = filename || "Untitled";

  // default: OFF (horizontal scroll) — but restore if user toggled before
  const [wrapEnabled, setWrapEnabled] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(WRAP_STORAGE_KEY);
      if (saved === "on") setWrapEnabled(true);
      if (saved === "off") setWrapEnabled(false);
    } catch {
      // ignore
    }
  }, []);

  const toggleWrap = () => {
    setWrapEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(WRAP_STORAGE_KEY, next ? "on" : "off");
      } catch {
        // ignore
      }
      return next;
    });
  };

  const editorOptions = useMemo(
    () => ({
      fontSize: 14,
      minimap: { enabled: false },

      // ✅ user toggle
      wordWrap: wrapEnabled ? "on" : "off",

      // ✅ better UX: show horizontal bar when wrap is OFF
      scrollbar: {
        horizontal: wrapEnabled ? "auto" : "visible",
        vertical: "auto",
        useShadows: false,
        horizontalScrollbarSize: 10,
        verticalScrollbarSize: 10,
      },

      automaticLayout: true,
      padding: { top: 8, bottom: 8 },
    }),
    [wrapEnabled]
  );

  return (
    <section className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-slate-50 shadow-sm transition dark:border-slate-700 dark:bg-slate-900/90">
      <div className="flex items-center justify-between gap-2 border-b border-slate-200 px-3 py-2 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-[11px] font-semibold text-slate-800 dark:text-slate-100">
            {displayName}
          </span>
          <span className="text-[10px] text-slate-400 dark:text-slate-500">
            Editor
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* ✅ Wrap toggle */}
          <button
            type="button"
            onClick={toggleWrap}
            className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-700 hover:bg-slate-50 active:scale-[0.98] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            title={wrapEnabled ? "Turn wrapping OFF" : "Turn wrapping ON"}
          >
            Wrap: {wrapEnabled ? "ON" : "OFF"}
          </button>

          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] uppercase tracking-wide text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {language}
          </span>
        </div>
      </div>

      {/* ✅ Add class for touch scrolling fix */}
      <div className="monaco-touch h-[260px] sm:h-[320px] md:h-[380px] lg:h-[420px]">
        <Editor
          height="100%"
          defaultLanguage={language}
          language={language}
          value={code}
          theme={editorTheme}
          onChange={(value) => onChange(value ?? "")}
          options={editorOptions}
        />
      </div>
    </section>
  );
}

export default CodeEditorPanel;
