"use client";

import { useState } from "react";
import { computeGcdLcm, type GcdLcmResult } from "@/lib/math-engine";
import { MathTex } from "@/components/math/MathTex";

export function GcdLcmModule() {
  const [a, setA] = useState("24");
  const [b, setB] = useState("36");

  const numA = parseInt(a, 10) || 1;
  const numB = parseInt(b, 10) || 1;
  const data: GcdLcmResult = computeGcdLcm(numA, numB);

  return (
    <section className="rounded-2xl bg-white p-5 ring-1 ring-black/5 dark:bg-zinc-900 dark:ring-white/10">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
          Największy Wspólny Dzielnik (NWD) i Wielokrotność (NWW)
        </h3>
        <p className="text-xs text-zinc-500">
          Rozkład na czynniki pierwsze – klucz do skracania i sprowadzania ułamków do wspólnego mianownika.
        </p>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-2">
        <div>
          <label className="text-xs font-semibold text-zinc-500">Pierwsza liczba (a):</label>
          <input
            type="number"
            value={a}
            onChange={(e) => setA(e.target.value)}
            className="mt-1 w-full rounded-xl bg-zinc-50 px-3 py-2 text-base font-bold ring-1 ring-black/5 outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-zinc-950 dark:text-white"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-zinc-500">Druga liczba (b):</label>
          <input
            type="number"
            value={b}
            onChange={(e) => setB(e.target.value)}
            className="mt-1 w-full rounded-xl bg-zinc-50 px-3 py-2 text-base font-bold ring-1 ring-black/5 outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-zinc-950 dark:text-white"
          />
        </div>
      </div>

      {/* Podsumowanie wyników */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/20">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
            NWD({numA}; {numB}) – Największy Dzielnik
          </span>
          <div className="mt-1 text-2xl font-bold text-emerald-700 dark:text-emerald-400">
            {data.gcd}
          </div>
          <span className="text-[11px] text-zinc-500">Przez tę liczbę można skrócić ułamek {numA}/{numB}.</span>
        </div>

        <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-4 dark:border-indigo-900/40 dark:bg-indigo-950/20">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-800 dark:text-indigo-300">
            NWW({numA}; {numB}) – Wspólny Mianownik
          </span>
          <div className="mt-1 text-2xl font-bold text-indigo-700 dark:text-indigo-400">
            {data.lcm}
          </div>
          <span className="text-[11px] text-zinc-500">To najmniejszy wspólny mianownik dla ułamków o mianownikach {numA} i {numB}.</span>
        </div>
      </div>

      {/* Kroki */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
          Metoda rozkładu na czynniki pierwsze:
        </h4>
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
