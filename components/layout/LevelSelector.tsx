"use client";

import { ArrowRight, Sparkles } from "lucide-react";
import type { SchoolLevel } from "./Header";

interface LevelSelectorProps {
  onSelectLevel: (level: SchoolLevel) => void;
}

export function LevelSelector({ onSelectLevel }: LevelSelectorProps) {
  return (
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
          onClick={() => onSelectLevel("primary")}
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
          onClick={() => onSelectLevel("secondary")}
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
  );
}
