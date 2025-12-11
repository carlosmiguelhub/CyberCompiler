// src/components/RightSidebar.jsx
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { auth } from "../firebase";

function RightSidebar({ profile, isMobileOpen = false, onMobileClose }) {
  const [isCollapsed, setIsCollapsed] = useState(false); // desktop only
  const location = useLocation();

  const user = auth.currentUser;
  const displayName =
    profile?.displayName || user?.displayName || "Anonymous User";
  const email = profile?.email || user?.email || "";
  const role = profile?.role || "user";
  const photoURL = profile?.photoURL || user?.photoURL || null;

  const widthClass = isCollapsed ? "lg:w-12" : "lg:w-72";

  return (
    <>
      {/* Dark overlay for mobile drawer */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      <aside
        className={`
          fixed inset-y-0 right-0 z-40 w-72
          border-l border-slate-200 bg-white/85 text-slate-900 backdrop-blur-md
          transition-transform duration-300 ease-out
          dark:border-slate-800 dark:bg-slate-950/95 dark:text-slate-50
          ${isMobileOpen ? "translate-x-0" : "translate-x-full"}
          lg:translate-x-0
          ${widthClass}
        `}
      >
        {/* Desktop collapse button */}
        <button
          type="button"
          onClick={() => setIsCollapsed((prev) => !prev)}
          className="hidden lg:flex absolute -left-4 top-4 z-50 h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-xs text-slate-700 shadow-md hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-900"
        >
          {isCollapsed ? "‹" : "›"}
        </button>

        {/* Mobile close button */}
        <button
          type="button"
          onClick={onMobileClose}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border border-slate-300 bg-white/90 text-sm text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900/90 dark:text-slate-100 lg:hidden"
        >
          ✕
        </button>

        <div className={isCollapsed ? "hidden lg:block h-full px-1 py-4" : "h-full px-4 py-4"}>
          {isCollapsed ? (
            // Collapsed desktop view: just avatar
            <div className="flex flex-col items-center gap-4">
              <Link to="/profile" title="Profile">
                {photoURL ? (
                  <img
                    src={photoURL}
                    alt="avatar"
                    className="h-8 w-8 rounded-full border border-slate-200 object-cover dark:border-slate-700"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-200">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                )}
              </Link>
            </div>
          ) : (
            <>
              {/* Profile summary */}
              <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 dark:border-slate-800 dark:bg-slate-900/70">
                {photoURL ? (
                  <img
                    src={photoURL}
                    alt="avatar"
                    className="h-10 w-10 rounded-full border border-slate-200 object-cover dark:border-slate-700"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-200">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                )}

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-50">
                    {displayName}
                  </p>
                  <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">
                    {email}
                  </p>
                  <span className="mt-1 inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[10px] uppercase tracking-wide text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    Role: {role}
                  </span>
                </div>
              </div>

              {/* Navigation */}
              <div className="mt-5 space-y-1 text-xs text-slate-700 dark:text-slate-300">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
                  Account
                </p>

                <Link
                  to="/profile"
                  className={`flex items-center justify-between rounded-lg px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-900 ${
                    location.pathname === "/profile"
                      ? "bg-slate-100 text-indigo-600 dark:bg-slate-900/80 dark:text-indigo-300"
                      : ""
                  }`}
                >
                  <span>Profile</span>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500">
                    Edit
                  </span>
                </Link>

                <Link
                  to="/compiler"
                  className={`flex items-center justify-between rounded-lg px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-900 ${
                    location.pathname === "/compiler"
                      ? "bg-slate-100 text-indigo-600 dark:bg-slate-900/80 dark:text-indigo-300"
                      : ""
                  }`}
                >
                  <span>Compiler</span>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500">
                    Sandbox
                  </span>
                </Link>
              </div>
            </>
          )}
        </div>
      </aside>
    </>
  );
}

export default RightSidebar;
