import { Calculator } from "@/components/calculator/Calculator";
import { GraduationCap } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-100/70 dark:bg-zinc-950">
      <header className="border-b border-zinc-200/80 bg-white/80 backdrop-blur-sm dark:border-zinc-800/80 dark:bg-zinc-900/80">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm shadow-indigo-500/30">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
                Simple<span className="text-indigo-600 dark:text-indigo-400">Math</span>
              </span>
              <span className="ml-2 hidden rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-medium text-indigo-700 sm:inline-block dark:bg-indigo-950/60 dark:text-indigo-300">
                Polska notacja szkolna
              </span>
            </div>
          </div>

          <a
            href="https://github.com/K4mSdev/SimpleMath"
            target="_blank"
            rel="noreferrer"
            title="Repozytorium na GitHubie"
            className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
          >
            <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            <span className="hidden sm:inline">GitHub</span>
          </a>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:py-8 sm:px-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl dark:text-white">
            Kalkulator Naukowy & Szkolny
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Automatyczne ułamki zwykłe i okresowe, pierwiastki, logarytmy i polskie funkcje trygonometryczne (<code className="rounded bg-zinc-200/60 px-1 py-0.5 text-xs text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">tg</code>, <code className="rounded bg-zinc-200/60 px-1 py-0.5 text-xs text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">ctg</code>).
          </p>
        </div>

        <Calculator />
      </main>

      <footer className="mt-auto border-t border-zinc-200/60 py-4 text-center text-xs text-zinc-400 dark:border-zinc-800/60">
        <div className="mx-auto max-w-5xl px-4">
          SimpleMath · Twój szkolny kalkulator · Zbudowany dla uczniów szkół podstawowych i ponadpodstawowych
        </div>
      </footer>
    </div>
  );
}
