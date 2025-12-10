import { useState } from "react";
import CompilerPage from "./CompilerPage";
import RightSidebar from "../components/RightSidebar";

function CompilerWithSidebar({ profile, isDark, onToggleTheme }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 transition-colors duration-300 dark:bg-slate-900 dark:text-slate-50">
      <div className="mx-auto flex max-w-6xl flex-col lg:flex-row">
        
        {/* MAIN CONTENT */}
        <div className="flex-1 px-3 py-3 sm:px-4 sm:py-4 lg:py-8">
          {/* Mobile burger button */}
          <button
            type="button"
            onClick={() => setIsSidebarOpen(true)}
            className="mb-3 inline-flex items-center justify-center rounded-full border border-slate-300 bg-white/90 px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950/80 dark:text-slate-100 dark:hover:bg-slate-900 lg:hidden"
          >
            <span className="mr-1">Menu</span>
            <span className="text-lg leading-none">☰</span>
          </button>

          <CompilerPage isDark={isDark} onToggleTheme={onToggleTheme} />
        </div>

        {/* SIDEBAR */}
        <RightSidebar
          profile={profile}
          isMobileOpen={isSidebarOpen}
          onMobileClose={() => setIsSidebarOpen(false)}
        />
      </div>
    </div>
  );
}

export default CompilerWithSidebar;
