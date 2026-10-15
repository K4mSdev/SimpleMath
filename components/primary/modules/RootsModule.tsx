"use client";

import { useState } from "react";
import { extractRootFactor, type RootFactorResult } from "@/lib/math-engine";
import { MathTex } from "@/components/math/MathTex";

export function RootsModule() {
  const [num, setNum] = useState("50");
  const [deg, setDeg] = useState<2 | 3>(2);

  const nVal = parseInt(num, 10) || 0;
  const data: RootFactorResult = extractRootFactor(nVal, deg);

  return (
    <section className="rounded-2xl bg-white p-5 ring-1 ring-black/5 dark:bg-zinc-900 dark:ring-white/10">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
          Wyłączanie Czynnika przed Pierwiastek
        </h3>
        <p className="text-xs text-zinc-500">
          Podstawa programowa klas 7–8: upraszczanie pierwiastków kwadratowych (√) i sześciennych (∛).
        </p>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-zinc-500">Stopień pierwiastka:</span>
          <button
            type="button"
            onClick={() => setDeg(2)}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
              deg === 2 ? "bg-emerald-600 text-white" : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
            }`}
          >
            √ Kwadratowy
          </button>
          <button
            type="button"
            onClick={() => setDeg(3)}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
              deg === 3 ? "bg-emerald-600 text-white" : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
            }`}
          >
            ∛ Sześcienny
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-zinc-500">Liczba pod pierwiastkiem:</span>
          <input
            type="number"
            value={num}
            onChange={(e) => setNum(e.target.value)}
            className="w-28 rounded-xl bg-zinc-50 px-3 py-1.5 text-base font-bold ring-1 ring-black/5 outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-zinc-950 dark:text-white"
          />
        </div>
      </div>

      {/* Wynik */}
      <div className="mb-6 rounded-xl border border-emerald-100 bg-emerald-50/40 p-4 text-center dark:border-emerald-900/40 dark:bg-emerald-950/20">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
          Postać uproszczona:
        </span>
        <div className="mt-1 text-3xl font-bold text-zinc-900 dark:text-white">
          <MathTex tex={`${deg === 3 ? "\\sqrt[3]{" + nVal + "}" : "\\sqrt{" + nVal + "}"} = ${data.tex}`} />
        </div>
      </div>

      {/* Kroki */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Rozwiązanie krok po kroku:</h4>
        {data.steps.map((st, i) => (
          <div key={i} className="rounded-xl border border-zinc-100 bg-zinc-50/50 p-3.5 dark:border-zinc-800 dark:bg-zinc-950/50">
            <div className="text-xs font-bold text-zinc-800 dark:text-zinc-200">{st.title}</div>
            <p className="mt-0.5 text-xs text-zinc-600 dark:text-zinc-400">{st.detail}</p>
            {st.tex && (
              <div className="mt-2 font-mono text-sm">
                <MathTex tex={st.tex} />
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
