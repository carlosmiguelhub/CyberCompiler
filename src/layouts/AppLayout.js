// src/layouts/AppLayout.jsx
import React, { useEffect, useState } from "react";
import RightSidebar from "../components/RightSidebar";
import { fetchUserProfile } from "../services/userService";

function AppLayout({ children }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      try {
        setLoading(true);
        setError("");
        const data = await fetchUserProfile();
        if (isMounted) {
          setProfile(data);
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
        if (isMounted) {
          setError("Failed to load profile. Some account info may be missing.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  // 🔥 This is now the ONLY place we touch the `dark` class
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  const handleToggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  // inject theme props into the active page (CompilerPage, ProfilePage, etc.)
  const childrenWithProps =
    React.isValidElement(children)
      ? React.cloneElement(children, {
          isDark,
          onToggleTheme: handleToggleTheme,
        })
      : children;

  if (loading && !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-200">
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-sm">
          Loading workspace...
        </div>
      </div>
    );
  }

  return (
    // 🚫 no more `className={isDark ? "dark" : ""}` wrapper
  <div className="flex min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-gradient-to-b dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-slate-50">
      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {error && (
          <div className="mx-4 mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-800 dark:border-amber-500/60 dark:bg-amber-500/10 dark:text-amber-100">
            {error}
          </div>
        )}

        {childrenWithProps}
      </div>

      {/* Right sidebar */}
      <RightSidebar profile={profile} />
    </div>
  );
}

export default AppLayout;
