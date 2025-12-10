import { Link } from "react-router-dom";

function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-50">
      {/* Top navigation */}
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
    to="/login"
    className="text-xs font-medium text-slate-400 hover:text-slate-100"
  >
    Login
  </Link>

  <Link
    to="/register"
    className="inline-flex items-center gap-1 rounded-full bg-indigo-500 px-4 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-600"
  >
    Register
  </Link>
</nav>


          {/* Mobile CTA */}
         <Link
  to="/login"
  className="inline-flex items-center gap-1 rounded-full bg-indigo-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-600 md:hidden"
>
  Login
</Link>

        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-8 md:py-12 lg:py-16">
        {/* Hero */}
        <section className="grid gap-10 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] md:items-center">
          {/* Left: text */}
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-[11px] font-medium text-emerald-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Built with React, Tailwind & Firebase
            </div>

            <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
              Compile, run & explore code
              <span className="block text-indigo-300">
                directly in your browser.
              </span>
            </h1>

            <p className="mt-4 max-w-xl text-sm text-slate-300 sm:text-[15px]">
              CyberCompile gives you a modern, web-based environment to quickly
              test snippets in multiple languages, experiment with SQL, and
              share runnable examples with your team or students.
            </p>

            {/* CTAs */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
             <Link
  to="/register"
  className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 hover:bg-indigo-600"
>
  Get Started
  <span className="text-[15px]">→</span>
</Link>


              <button className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900/60 px-4 py-2.5 text-xs font-medium text-slate-200 hover:border-slate-500 hover:bg-slate-900">
                View roadmap
                <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] text-slate-300">
                  Coming soon
                </span>
              </button>
            </div>

            {/* Stats */}
            <div className="mt-8 grid gap-4 text-xs text-slate-300 sm:grid-cols-3">
              <div>
                <p className="text-sm font-semibold text-slate-100">
                  Multi-language
                </p>
                <p className="mt-1 text-[11px] text-slate-400">
                  JavaScript, Python, C and more via a secure backend runner.
                </p>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-100">
                  SQL playground
                </p>
                <p className="mt-1 text-[11px] text-slate-400">
                  Execute queries safely for demos, training, or prototyping.
                </p>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-100">
                  Cloud-first
                </p>
                <p className="mt-1 text-[11px] text-slate-400">
                  Powered by React & Firebase, designed to extend with auth and
                  saved snippets.
                </p>
              </div>
            </div>
          </div>

          {/* Right: preview card */}
          <div className="relative">
            <div className="pointer-events-none absolute -inset-6 rounded-3xl bg-indigo-500/30 blur-3xl opacity-40" />
            <div className="relative rounded-2xl border border-slate-800 bg-slate-950/90 p-3 shadow-2xl">
              {/* Fake window header */}
              <div className="flex items-center justify-between rounded-xl bg-slate-900 px-3 py-2">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
                </div>
                <p className="text-[11px] text-slate-400">
                  demo.js • CyberCompile
                </p>
              </div>

              {/* Fake code panel */}
              <div className="mt-2 rounded-xl border border-slate-800 bg-gradient-to-b from-slate-950 to-slate-900 px-3 py-3">
                <p className="mb-2 text-[11px] font-medium text-slate-400">
                  // Quick example
                </p>
                <pre className="text-[11px] font-mono text-slate-100">
{`function greet(name) {
  return \`Hello, \${name}! 👋\`;
}

console.log(greet("CyberCompile"));`}
                </pre>
              </div>

              {/* Little badges */}
              <div className="mt-3 grid gap-2 text-[11px] text-slate-200 sm:grid-cols-2">
                <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2">
                  <span>Execution time</span>
                  <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] text-emerald-300">
                    0.12s
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2">
                  <span>Environment</span>
                  <span className="rounded-full bg-sky-500/15 px-2 py-0.5 text-[10px] text-sky-300">
                    Sandbox
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features section */}
        <section className="border-t border-slate-800/60 pt-8">
          <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-slate-400">
            Why CyberCompile?
          </h2>

          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
              <div className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-300">
                🧠
              </div>
              <p className="text-sm font-semibold text-slate-50">
                Built for learning & demos
              </p>
              <p className="mt-2 text-xs text-slate-400">
                Perfect for classrooms, tech talks, tutorials, and quick
                experimentation without installing toolchains.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
              <div className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300">
                🔒
              </div>
              <p className="text-sm font-semibold text-slate-50">
                Safe execution
              </p>
              <p className="mt-2 text-xs text-slate-400">
                Offload execution to a secure backend service and keep your
                frontend fast, clean, and safe.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
              <div className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-sky-500/20 text-sky-300">
                ⚙️
              </div>
              <p className="text-sm font-semibold text-slate-50">
                Extensible architecture
              </p>
              <p className="mt-2 text-xs text-slate-400">
                React, Tailwind, and Firebase give you a solid base to add auth,
                saved snippets, and collaboration later.
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="flex flex-col items-center justify-between gap-3 border-t border-slate-800/60 py-5 text-[11px] text-slate-500 sm:flex-row">
          <span>© {new Date().getFullYear()} CyberCompile. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <button className="hover:text-slate-300">Privacy</button>
            <button className="hover:text-slate-300">Terms</button>
            <button className="hover:text-slate-300">Support</button>
          </div>
        </footer>
      </main>
    </div>
  );
}

export default HomePage;
