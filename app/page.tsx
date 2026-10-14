"use client";

import { useEffect, useState } from "react";
import { Calculator } from "@/components/calculator/Calculator";
import { EquationSolver } from "@/components/calculator/EquationSolver";
import { GeometryCalculator } from "@/components/calculator/GeometryCalculator";
import { PrimarySchoolCalculator } from "@/components/calculator/PrimarySchoolCalculator";
import { DocsModal } from "@/components/docs/DocsModal";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Calculator as CalcIcon,
  Compass,
  GraduationCap,
  Sparkles,
  Variable,
} from "lucide-react";

type SchoolLevel = "primary" | "secondary" | null;
type SecondaryModule = "general" | "equations" | "geometry";

export default function Home() {
  const [level, setLevel] = useState<SchoolLevel>(null);
  const [secondaryModule, setSecondaryModule] = useState<SecondaryModule>("general");
  const [isDocsOpen, setIsDocsOpen] = useState(false);

  // Odczyt z pamięci podręcznej (jeśli uczeń już wcześniej wybrał szkołę)
  useEffect(() => {
    const saved = localStorage.getItem("simplemath:school_level");
    if (saved === "primary" || saved === "secondary") {
      setLevel(saved);
    }
  }, []);

  const selectLevel = (newLevel: SchoolLevel) => {
    setLevel(newLevel);
    if (newLevel) {
      localStorage.setItem("simplemath:school_level", newLevel);
    } else {
      localStorage.removeItem("simplemath:school_level");
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-zinc-100/70 dark:bg-zinc-950">
      {/* Pasek nawigacyjny */}
      <header className="sticky top-0 z-40 border-b border-zinc-200/80 bg-white/80 backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-900/80">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-2.5 sm:px-6">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => selectLevel(null)}
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
                onClick={() => selectLevel(null)}
                className="flex items-center gap-1 rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Zmień poziom</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsDocsOpen(true)}
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

        {/* Zakładki dla szkoły ponadpodstawowej */}
        {level === "secondary" && (
          <div className="border-t border-zinc-100 dark:border-zinc-800">
            <div className="mx-auto flex max-w-5xl gap-1 overflow-x-auto px-4 py-1.5 sm:px-6">
              <button
                type="button"
                onClick={() => setSecondaryModule("general")}
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
                onClick={() => setSecondaryModule("equations")}
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
                onClick={() => setSecondaryModule("geometry")}
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

      {/* Główna zawartość */}
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:py-8 sm:px-6">
        {/* EKRAN GŁÓWNY: WYBÓR POZIOMU SZKOŁY */}
        {level === null && (
          <div className="space-y-8 py-4 sm:py-8">
            <div className="text-center">
              <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                <Sparkles className="h-3.5 w-3.5" />
                Wybierz swój etap edukacji
              </span>
              <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl dark:text-white">
                Dedykowany Kalkulator Szkolny CKE
              </h1>
              <p className="mx-auto mt-2 max-w-xl text-sm text-zinc-500 dark:text-zinc-400">
                Dopasowany ściśle do polskiej podstawy programowej. Wybierz szkołę, aby otrzymać narzędzia dostosowane do Twojego poziomu.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              {/* KARTA 1: SZKOŁA PODSTAWOWA */}
              <div
                onClick={() => selectLevel("primary")}
                className="group relative flex cursor-pointer flex-col justify-between rounded-3xl border-2 border-emerald-200/80 bg-white p-6 shadow-sm transition hover:border-emerald-500 hover:shadow-xl dark:border-emerald-900/40 dark:bg-zinc-900 dark:hover:border-emerald-500"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-2xl font-bold text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                      🎒
                    </span>
                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                      Egzamin 8-Klasisty
                    </span>
                  </div>

                  <h2 className="mt-4 text-2xl font-bold text-zinc-900 dark:text-white">
                    Kalkulator Klas 4–8 Szkół Podstawowych
                  </h2>
                  <p className="mt-2 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                    Zaprojektowany specjalnie pod wymagania szkoły podstawowej i sprawdziany CKE:
                  </p>

                  <ul className="mt-4 space-y-2 text-xs text-zinc-700 dark:text-zinc-300">
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      <strong>Ułamki zwykłe krok po kroku:</strong> wspólny mianownik (NWW), rozszerzanie, skracanie.
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      <strong>NWD i NWW:</strong> rozkład liczb na czynniki pierwsze.
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      <strong>Kalkulator procentów:</strong> podwyżki, obniżki, procent z liczby.
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      <strong>Wyłączanie czynnika przed pierwiastek:</strong> np. √50 = 5√2, ∛24 = 2∛3.
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      <strong>Pola figur i prędkość (v = s / t).</strong>
                    </li>
                  </ul>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-zinc-100 pt-4 dark:border-zinc-800">
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    Otwórz kalkulator klas 4–8
                  </span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 transition group-hover:translate-x-1 group-hover:bg-emerald-600 group-hover:text-white dark:bg-emerald-950/60 dark:text-emerald-300">
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </div>

              {/* KARTA 2: SZKOŁA PONADPODSTAWOWA */}
              <div
                onClick={() => selectLevel("secondary")}
                className="group relative flex cursor-pointer flex-col justify-between rounded-3xl border-2 border-indigo-200/80 bg-white p-6 shadow-sm transition hover:border-indigo-500 hover:shadow-xl dark:border-indigo-900/40 dark:bg-zinc-900 dark:hover:border-indigo-500"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 text-2xl font-bold text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300">
                      🎓
                    </span>
                    <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                      Matura CKE (Podstawa & Rozszerzenie)
                    </span>
                  </div>

                  <h2 className="mt-4 text-2xl font-bold text-zinc-900 dark:text-white">
                    Kalkulator dla Szkół Ponadpodstawowych
                  </h2>
                  <p className="mt-2 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                    Zaawansowane narzędzie dla liceum i technikum przygotowujące do egzaminu maturalnego:
                  </p>

                  <ul className="mt-4 space-y-2 text-xs text-zinc-700 dark:text-zinc-300">
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                      <strong>Równania kwadratowe z Deltą (Δ):</strong> pierwiastki x₁, x₂, postać kanoniczna i iloczynowa.
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                      <strong>Trygonometria:</strong> tg, ctg, sin, cos, tryb DEG/RAD, jedynka trygonometryczna.
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                      <strong>Logarytmy:</strong> dziesiętne, o dowolnej podstawie log(b; a) i naturalne ln.
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                      <strong>Geometria:</strong> twierdzenie Pitagorasa, trójkąty równoboczne, koła.
                    </li>
                  </ul>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-zinc-100 pt-4 dark:border-zinc-800">
                  <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                    Otwórz kalkulator ponadpodstawowy
                  </span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 transition group-hover:translate-x-1 group-hover:bg-indigo-600 group-hover:text-white dark:bg-indigo-950/60 dark:text-indigo-300">
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* POZIOM 1: SZKOŁA PODSTAWOWA */}
        {level === "primary" && <PrimarySchoolCalculator />}

        {/* POZIOM 2: SZKOŁA PONADPODSTAWOWA */}
        {level === "secondary" && (
          <div>
            {secondaryModule === "general" && <Calculator />}
            {secondaryModule === "equations" && <EquationSolver />}
            {secondaryModule === "geometry" && <GeometryCalculator />}
          </div>
        )}
      </main>

      {/* Stopka */}
      <footer className="mt-auto border-t border-zinc-200/60 py-4 text-center text-xs text-zinc-400 dark:border-zinc-800/60">
        <div className="mx-auto max-w-5xl px-4">
          SimpleMath · Zgodność z podstawą programową CKE dla szkół podstawowych i ponadpodstawowych
        </div>
      </footer>

      {/* Modal Dokumentacji i Ściągi */}
      <DocsModal isOpen={isDocsOpen} onClose={() => setIsDocsOpen(false)} />
    </div>
  );
}
