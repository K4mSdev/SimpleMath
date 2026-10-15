"use client";

import { useState } from "react";
import { computePercentage, type PercentCalcMode, type PercentResult } from "@/lib/math-engine";
import { MathTex } from "@/components/math/MathTex";

export function PercentagesModule() {
  const [mode, setMode] = useState<PercentCalcMode>("percent_of_number");
  const [valA, setValA] = useState("20");
  const [valB, setValB] = useState("150");

  const aNum = parseFloat(valA) || 0;
  const bNum = parseFloat(valB) || 0;
  const data: PercentResult = computePercentage(mode, aNum, bNum);

  return (
    <section className="rounded-2xl bg-white p-5 ring-1 ring-black/5 dark:bg-zinc-900 dark:ring-white/10">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
          Kalkulator Procentów (Typowe zadania E8)
        </h3>
        <p className="text-xs text-zinc-500">
          Wybierz rodzaj zadania spotykanego na sprawdzianach i egzaminie ósmoklasisty.
        </p>
      </div>

      {/* Wybór typu zadania */}
      <div className="mb-6 grid gap-2 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => setMode("percent_of_number")}
          className={`rounded-xl p-3 text-left text-xs font-semibold transition ${
            mode === "percent_of_number"
              ? "bg-emerald-600 text-white shadow-sm"
              : "bg-zinc-50 text-zinc-700 hover:bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-300"
          }`}
        >
          1. Oblicz p% z danej liczby
          <div className="text-[11px] font-normal opacity-80">np. Ile to 20% z liczby 150 zł?</div>
        </button>

        <button
          type="button"
          onClick={() => setMode("what_percent")}
          className={`rounded-xl p-3 text-left text-xs font-semibold transition ${
            mode === "what_percent"
              ? "bg-emerald-600 text-white shadow-sm"
              : "bg-zinc-50 text-zinc-700 hover:bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-300"
          }`}
        >
          2. Jakim procentem jest liczba A liczby B?
          <div className="text-[11px] font-normal opacity-80">np. Jaki procent z 200 pkt to 50 pkt?</div>
        </button>

        <button
          type="button"
          onClick={() => setMode("change_increase")}
          className={`rounded-xl p-3 text-left text-xs font-semibold transition ${
            mode === "change_increase"
              ? "bg-emerald-600 text-white shadow-sm"
              : "bg-zinc-50 text-zinc-700 hover:bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-300"
          }`}
        >
          3. Podwyżka o p%
          <div className="text-[11px] font-normal opacity-80">np. Cena 120 zł wzrosła o 15%</div>
        </button>

        <button
          type="button"
          onClick={() => setMode("change_decrease")}
          className={`rounded-xl p-3 text-left text-xs font-semibold transition ${
            mode === "change_decrease"
              ? "bg-emerald-600 text-white shadow-sm"
              : "bg-zinc-50 text-zinc-700 hover:bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-300"
          }`}
        >
          4. Obniżka / Rabat o p%
          <div className="text-[11px] font-normal opacity-80">np. Cena 80 zł spadła o 20%</div>
        </button>
      </div>

      {/* Pola wejściowe */}
      <div className="mb-6 grid gap-3 sm:grid-cols-2">
        <div>
          <label className="text-xs font-semibold text-zinc-500">
            {mode === "what_percent" ? "Część (liczba A):" : "Wartość procentowa (p%):"}
          </label>
          <input
            type="number"
            value={valA}
            onChange={(e) => setValA(e.target.value)}
            className="mt-1 w-full rounded-xl bg-zinc-50 px-3 py-2 text-base font-bold ring-1 ring-black/5 outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-zinc-950 dark:text-white"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-zinc-500">
            {mode === "what_percent" ? "Całość (liczba B):" : "Podstawa (liczba początkowa):"}
          </label>
          <input
            type="number"
            value={valB}
            onChange={(e) => setValB(e.target.value)}
            className="mt-1 w-full rounded-xl bg-zinc-50 px-3 py-2 text-base font-bold ring-1 ring-black/5 outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-zinc-950 dark:text-white"
          />
        </div>
      </div>

      {/* Wynik */}
      <div className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/20">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
          Wynik:
        </span>
        <div className="mt-1 text-2xl font-bold text-zinc-900 dark:text-white">
          <MathTex tex={data.tex} />
        </div>
        <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">{data.explanation}</p>
      </div>
    </section>
  );
}
