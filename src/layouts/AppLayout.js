// src/layouts/AppLayout.jsx
import React, { useEffect, useState } from "react";
import RightSidebar from "../components/RightSidebar";
import { fetchUserProfile } from "../services/userService";

function AppLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    fetchUserProfile()
      .then((data) => setProfile(data))
      .catch((err) => console.error("Profile load error:", err));
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  const toggleTheme = () => setIsDark((prev) => !prev);

  const childWithProps =
    React.isValidElement(children)
      ? React.cloneElement(children, {
          isDark,
          onToggleTheme: toggleTheme,
          profile,
        })
      : children;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 dark:bg-slate-900 dark:text-slate-50 relative">
      {/* Mobile burger */}
      <button
        onClick={() => setIsSidebarOpen(true)}
        className="z-30 fixed top-4 left-4 lg:hidden inline-flex items-center justify-center rounded-full border border-slate-300 bg-white/90 px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-950/80 dark:text-slate-100"
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
      />
    </div>
  );
}

export default AppLayout;
