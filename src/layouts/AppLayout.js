// src/layouts/AppLayout.jsx
import React, { useEffect, useState } from "react";
import RightSidebar from "../components/RightSidebar";
import { fetchUserProfile } from "../services/userService";

function AppLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [profile, setProfile] = useState(null);

  // 🔗 this will hold the "currently opened" file from the workspace
  const [openedFile, setOpenedFile] = useState(null);

  useEffect(() => {
    fetchUserProfile()
      .then((data) => setProfile(data))
      .catch((err) => console.error("Profile load error:", err));
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  const toggleTheme = () => setIsDark((prev) => !prev);

  // Inject common props into the active page (CompilerPage, ProfilePage, etc.)
  const childWithProps =
    React.isValidElement(children)
      ? React.cloneElement(children, {
          isDark,
          onToggleTheme: toggleTheme,
          profile,
          // 👇 CompilerPage (and others) can read which file is opened
          openedFile,
        })
      : children;

  return (
    <div className="relative min-h-screen bg-slate-100 text-slate-900 dark:bg-slate-900 dark:text-slate-50">
      {/* Mobile burger */}
      <button
        onClick={() => setIsSidebarOpen(true)}
        className="fixed left-4 top-4 z-30 inline-flex items-center justify-center rounded-full border border-slate-300 bg-white/90 px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-950/80 dark:text-slate-100 lg:hidden"
      >
        <span className="mr-1">Menu</span>
        ☰
      </button>

      {/* MAIN CONTENT */}
      <div
        className="
          mx-auto max-w-6xl
          px-3 py-4 sm:px-4 lg:py-8
          lg:mr-80       /* ⬅️ reserve ~20rem for sidebar on desktop */
        "
      >
        {childWithProps}
      </div>

      {/* FIXED RIGHT SIDEBAR */}
      <RightSidebar
        profile={profile}
        isMobileOpen={isSidebarOpen}
        onMobileClose={() => setIsSidebarOpen(false)}
        // 👇 when a file is clicked in ProjectWorkspace, update openedFile
        onOpenFile={(payload) => {
          // payload should be { projectId, file: { ... } }
          setOpenedFile(payload);
        }}
      />
    </div>
  );
}

export default AppLayout;
