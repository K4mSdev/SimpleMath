"use client";

import { useState } from "react";
import { calculateFractionsStepByStep, type FractionStepResult } from "@/lib/math-engine";
import { MathTex } from "@/components/math/MathTex";

export function FractionsModule() {
  const [n1, setN1] = useState("1");
  const [d1, setD1] = useState("2");
  const [op, setOp] = useState<"+" | "-" | "·" | ":">("+");
  const [n2, setN2] = useState("1");
  const [d2, setD2] = useState("3");

  const num1 = parseInt(n1, 10) || 0;
  const den1 = parseInt(d1, 10) || 1;
  const num2 = parseInt(n2, 10) || 0;
  const den2 = parseInt(d2, 10) || 1;

  const result: FractionStepResult = calculateFractionsStepByStep(num1, den1, op, num2, den2);

  return (
    <section className="rounded-2xl bg-white p-5 ring-1 ring-black/5 dark:bg-zinc-900 dark:ring-white/10">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
          Działania na Ułamkach Zwykłych Krok po Kroku
        </h3>
        <p className="text-xs text-zinc-500">
          Nauka sprowadzania do wspólnego mianownika (NWW), skracania przez NWD i wyciągania całości.
        </p>
      </div>

      {/* Interfejs wpisywania ułamków */}
      <div className="mb-6 flex flex-wrap items-center justify-center gap-3 rounded-2xl bg-zinc-50 p-6 dark:bg-zinc-950">
        {/* Ułamek 1 */}
        <div className="flex flex-col items-center">
          <input
            type="number"
            value={n1}
            onChange={(e) => setN1(e.target.value)}
            className="w-16 rounded-lg bg-white p-1 text-center font-mono text-lg font-bold ring-1 ring-black/10 outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-zinc-900 dark:text-white"
          />
          <div className="my-1.5 h-0.5 w-16 bg-zinc-400 dark:bg-zinc-600" />
          <input
            type="number"
            value={d1}
            onChange={(e) => setD1(e.target.value)}
            className="w-16 rounded-lg bg-white p-1 text-center font-mono text-lg font-bold ring-1 ring-black/10 outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-zinc-900 dark:text-white"
          />
        </div>

        {/* Znak działania */}
        <select
          value={op}
          onChange={(e) => setOp(e.target.value as any)}
          className="rounded-xl bg-white px-3 py-2 text-xl font-bold ring-1 ring-black/10 outline-none dark:bg-zinc-900 dark:text-white"
        >
          <option value="+">+</option>
          <option value="-">−</option>
          <option value="·">· (mnożenie)</option>
          <option value=":">: (dzielenie)</option>
        </select>

        {/* Ułamek 2 */}
        <div className="flex flex-col items-center">
          <input
            type="number"
            value={n2}
            onChange={(e) => setN2(e.target.value)}
            className="w-16 rounded-lg bg-white p-1 text-center font-mono text-lg font-bold ring-1 ring-black/10 outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-zinc-900 dark:text-white"
          />
          <div className="my-1.5 h-0.5 w-16 bg-zinc-400 dark:bg-zinc-600" />
          <input
            type="number"
            value={d2}
            onChange={(e) => setD2(e.target.value)}
            className="w-16 rounded-lg bg-white p-1 text-center font-mono text-lg font-bold ring-1 ring-black/10 outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-zinc-900 dark:text-white"
          />
        </div>

        <span className="text-2xl font-bold text-zinc-400">=</span>

        {/* Wynik */}
        <div className="flex items-center rounded-xl bg-emerald-50 px-4 py-2 font-mono text-2xl font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
          <MathTex tex={result.resultTex} />
        </div>
      </div>

      {/* Kroki rozwiązania */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
          Wyjaśnienie krok po kroku:
        </h4>
        {result.steps.map((st, i) => (
          <div key={i} className="rounded-xl border border-zinc-100 bg-zinc-50/50 p-3.5 dark:border-zinc-800 dark:bg-zinc-950/50">
            <div className="text-xs font-bold text-emerald-700 dark:text-emerald-400">{st.title}</div>
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
