// src/pages/ProfilePage.jsx
import { useEffect, useState } from "react";
import { auth } from "../firebase";
import {
  fetchUserProfile,
  updateUserProfile,
  sendPasswordReset,
} from "../services/userService";

function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({
    displayName: "",
    role: "",
  });
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchUserProfile();
        setProfile(data);
        setForm({
          displayName: data.displayName || "",
          role: data.role || "user",
        });
      } catch (err) {
        console.error(err);
        setStatus("Failed to load profile.");
      }
    }

    load();
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setStatus("");
    setSaving(true);

    try {
      await updateUserProfile({
        displayName: form.displayName,
        role: form.role,
      });

      setStatus("Profile updated successfully.");
      setProfile((prev) => ({
        ...prev,
        displayName: form.displayName,
        role: form.role,
      }));
    } catch (err) {
      console.error(err);
      setStatus("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleResetPassword = async () => {
    setStatus("");
    setResetting(true);

    try {
      await sendPasswordReset();
      setStatus("Password reset email sent. Check your inbox.");
    } catch (err) {
      console.error(err);
      setStatus(
        err.message ||
          "Failed to send password reset. This may be a Google account."
      );
    } finally {
      setResetting(false);
    }
  };

  const user = auth.currentUser;
  const isGoogleAccount =
    user?.providerData?.some((p) => p.providerId === "google.com") ?? false;

  if (!profile) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm transition-colors duration-300 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-200">
          Loading profile...
        </div>
      </div>
    );
  }

  return (
    <main className="flex-1 px-4 py-6 transition-colors duration-300 md:px-8 md:py-8">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-slate-900 transition-colors duration-300 dark:text-slate-50">
              Profile
            </h1>
            <p className="mt-1 text-xs text-slate-500 transition-colors duration-300 dark:text-slate-400">
              Manage your CyberCompile account, roles, and security.
            </p>
          </div>
          <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] text-slate-500 shadow-sm transition-colors duration-300 dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-400">
            Signed in with{" "}
            <span className="font-medium text-slate-800 dark:text-slate-200">
              {isGoogleAccount ? "Google" : "Email/Password"}
            </span>
          </div>
        </div>

        {/* Card */}
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-900/5 transition-colors duration-300 dark:border-slate-800 dark:bg-slate-950/80 dark:shadow-slate-950/60">
          {/* Avatar + basic info */}
          <div className="flex items-center gap-4">
            {profile.photoURL || user?.photoURL ? (
              <img
                src={profile.photoURL || user?.photoURL}
                alt="avatar"
                className="h-14 w-14 rounded-full border border-slate-200 object-cover transition-colors duration-300 dark:border-slate-700"
              />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100 text-lg font-semibold text-indigo-700 transition-colors duration-300 dark:bg-indigo-500/20 dark:text-indigo-200">
                {(profile.displayName || "U").charAt(0).toUpperCase()}
              </div>
            )}

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900 transition-colors duration-300 dark:text-slate-50">
                {profile.displayName || user?.displayName || "Anonymous User"}
              </p>
              <p className="truncate text-xs text-slate-500 transition-colors duration-300 dark:text-slate-400">
                {profile.email || user?.email}
              </p>
              <p className="mt-1 text-[11px] text-slate-400 transition-colors duration-300 dark:text-slate-500">
                UID:{" "}
                <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400">
                  {profile.uid || user?.uid}
                </span>
              </p>
            </div>
          </div>

          {/* Status message */}
          {status && (
            <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] text-slate-700 transition-colors duration-300 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-200">
              {status}
            </div>
          )}

          {/* Form */}
          <form className="mt-5 space-y-4" onSubmit={handleSave}>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-slate-700 transition-colors duration-300 dark:text-slate-300">
                  Display name
                </label>
                <input
                  type="text"
                  name="displayName"
                  value={form.displayName}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-0 transition-colors duration-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 transition-colors duration-300 dark:text-slate-300">
                  Role
                </label>
                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-0 transition-colors duration-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                  <option value="instructor">Instructor</option>
                  <option value="student">Student</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center rounded-lg bg-indigo-500 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-500/30 transition-colors duration-300 hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save changes"}
              </button>

              <button
                type="button"
                disabled={resetting || isGoogleAccount}
                onClick={handleResetPassword}
                className="text-[11px] font-medium text-slate-600 underline-offset-4 transition-colors duration-300 hover:text-slate-900 hover:underline disabled:cursor-not-allowed disabled:text-slate-400 dark:text-slate-300 dark:hover:text-slate-100"
              >
                {isGoogleAccount
                  ? "Password managed by Google"
                  : resetting
                  ? "Sending reset email..."
                  : "Reset password"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}

export default ProfilePage;
