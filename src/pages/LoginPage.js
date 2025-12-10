// src/pages/LoginPage.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginWithEmail, signInWithGoogle } from "../services/authService";

function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await loginWithEmail(form.email, form.password);
      navigate("/compiler"); // or wherever you want after login
    } catch (err) {
      console.error(err);
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError("");
    setLoading(true);

    try {
      await signInWithGoogle();
      navigate("/compiler");
    } catch (err) {
      console.error(err);
      setError("Failed to sign in with Google.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-50">
      {/* Top nav reused style */}
      <header className="border-b border-slate-800/80 bg-slate-950/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-sky-400 text-xl font-bold text-white shadow-lg">
              ⌘
            </span>
            <div>
              <p className="text-sm font-semibold tracking-tight">
                CyberCompile
              </p>
              <p className="text-[11px] text-slate-400">
                Multi-language online compiler
              </p>
            </div>
          </div>

          <nav className="hidden items-center gap-4 text-sm md:flex">
            <Link
              to="/register"
              className="text-xs font-medium text-slate-400 hover:text-slate-100"
            >
              Register
            </Link>
            <Link
              to="/"
              className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-4 py-1.5 text-xs font-semibold text-slate-900 shadow-sm hover:bg-white"
            >
              Back to landing
            </Link>
          </nav>

          {/* Mobile back */}
          <Link
            to="/"
            className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-900 shadow-sm hover:bg-white md:hidden"
          >
            Home
          </Link>
        </div>
      </header>

      <main className="mx-auto flex max-w-6xl items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="relative rounded-2xl border border-slate-800 bg-slate-950/90 p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h1 className="text-xl font-semibold tracking-tight">
                  Welcome back
                </h1>
                <p className="mt-1 text-xs text-slate-400">
                  Login to access the CyberCompile playground.
                </p>
              </div>
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-300 text-lg">
                🔐
              </span>
            </div>

            {error && (
              <div className="mb-3 rounded-lg border border-rose-500/60 bg-rose-500/10 px-3 py-2 text-[11px] text-rose-100">
                {error}
              </div>
            )}

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-xs font-medium text-slate-300">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 outline-none ring-0 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 outline-none ring-0 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-2 inline-flex w-full items-center justify-center rounded-lg bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Signing in..." : "Login"}
              </button>
            </form>

            <div className="mt-4 flex items-center gap-2">
              <div className="h-px flex-1 bg-slate-800" />
              <span className="text-[10px] uppercase tracking-[0.15em] text-slate-500">
                or
              </span>
              <div className="h-px flex-1 bg-slate-800" />
            </div>

            <button
              type="button"
              disabled={loading}
              onClick={handleGoogle}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-900/70 px-4 py-2.5 text-xs font-medium text-slate-100 hover:border-slate-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className="text-lg">ⓖ</span>
              Continue with Google
            </button>

            <p className="mt-4 text-[11px] text-slate-500">
              Don&apos;t have an account?{" "}
              <Link
                to="/register"
                className="font-medium text-indigo-300 hover:text-indigo-200"
              >
                Register
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default LoginPage;
