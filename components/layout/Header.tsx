"use client";

import { ArrowLeft, BookOpen, Calculator as CalcIcon, Compass, GraduationCap, ScanLine, Variable } from "lucide-react";

export type SchoolLevel = "primary" | "secondary" | null;
export type SecondaryModule = "general" | "equations" | "geometry";

interface HeaderProps {
  level: SchoolLevel;
  onSelectLevel: (level: SchoolLevel) => void;
  secondaryModule: SecondaryModule;
  onSelectSecondaryModule: (module: SecondaryModule) => void;
  onOpenDocs: () => void;
  onOpenScanner: () => void;
}

export function Header({
  level,
  onSelectLevel,
  secondaryModule,
  onSelectSecondaryModule,
  onOpenDocs,
  onOpenScanner,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200/80 bg-white/80 backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-900/80">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-2.5 sm:px-6">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => onSelectLevel(null)}
            title="Wróć do menu wyboru szkoły"
            className="flex items-center gap-2 text-left"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm shadow-indigo-500/30">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
                Simple<span className="text-indigo-600 dark:text-indigo-400">Math</span>
              </span>
              {level === "primary" && (
                <span className="ml-2 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                  Klasy 4–8 SP
                </span>
              )}
              {level === "secondary" && (
                <span className="ml-2 rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                  Ponadpodstawowa (LO/Technikum)
                </span>
              )}
            </div>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {level !== null && (
            <button
              type="button"
              onClick={() => onSelectLevel(null)}
              className="flex items-center gap-1 rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Zmień poziom</span>
            </button>
          )}

          <button
            type="button"
            onClick={onOpenScanner}
            aria-label="Skanuj zadanie aparatem lub ze zrzutu ekranu"
            className="flex min-h-9 items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition active:scale-95 hover:bg-indigo-500"
          >
            <ScanLine className="h-4 w-4" />
            <span>Skanuj</span>
          </button>

          <button
            type="button"
            onClick={onOpenDocs}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100 dark:bg-indigo-950/50 dark:text-indigo-300 dark:hover:bg-indigo-900/50"
          >
            <BookOpen className="h-4 w-4" />
            <span>Ściąga CKE</span>
          </button>

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
      </div>

      {/* Zakładki kategorii dla szkoły ponadpodstawowej */}
      {level === "secondary" && (
        <div className="border-t border-zinc-100 dark:border-zinc-800">
          <div className="mx-auto flex max-w-5xl gap-1 overflow-x-auto px-4 py-1.5 sm:px-6">
            <button
              type="button"
              onClick={() => onSelectSecondaryModule("general")}
              className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                secondaryModule === "general"
                  ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                  : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
              }`}
            >
              <CalcIcon className="h-3.5 w-3.5" />
              <span>Kalkulator Ogólny & Trygonometria</span>
            </button>

            <button
              type="button"
              onClick={() => onSelectSecondaryModule("equations")}
              className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                secondaryModule === "equations"
                  ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                  : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
              }`}
            >
              <Variable className="h-3.5 w-3.5" />
              <span>Równania & Delta (Δ)</span>
            </button>

            <button
              type="button"
              onClick={() => onSelectSecondaryModule("geometry")}
              className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                secondaryModule === "geometry"
                  ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                  : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
              }`}
            >
              <Compass className="h-3.5 w-3.5" />
              <span>Geometria (Pitagoras / Trójkąty)</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
