"use client";

import { useState } from "react";
import {
  calculateFractionsStepByStep,
  computeGcdLcm,
  computePercentage,
  extractRootFactor,
  type FractionStepResult,
  type GcdLcmResult,
  type PercentCalcMode,
  type PercentResult,
  type RootFactorResult,
} from "@/lib/math-engine/primary";
import { MathTex } from "@/components/math/MathTex";
import {
  Car,
  ChevronDown,
  ChevronUp,
  Divide,
  Hash,
  Percent,
  Shapes,
  Sparkles,
} from "lucide-react";

type PrimaryTab = "fractions" | "gcd_lcm" | "percentages" | "roots" | "geometry_sp" | "speed";

export function PrimarySchoolCalculator() {
  const [tab, setTab] = useState<PrimaryTab>("fractions");

  return (
    <div className="space-y-6">
      {/* Pasek modułów dla klas 4-8 */}
      <div className="flex flex-wrap items-center gap-1.5 rounded-2xl bg-white p-2 shadow-sm ring-1 ring-black/5 dark:bg-zinc-900 dark:ring-white/10">
        <button
          type="button"
          onClick={() => setTab("fractions")}
          className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition ${
            tab === "fractions"
              ? "bg-emerald-600 text-white shadow-sm"
              : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
          }`}
        >
          <Divide className="h-4 w-4" />
          <span>Ułamki Krok po Kroku</span>
        </button>

        <button
          type="button"
          onClick={() => setTab("gcd_lcm")}
          className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition ${
            tab === "gcd_lcm"
              ? "bg-emerald-600 text-white shadow-sm"
              : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
          }`}
        >
          <Hash className="h-4 w-4" />
          <span>NWD, NWW i Czynniki</span>
        </button>

        <button
          type="button"
          onClick={() => setTab("percentages")}
          className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition ${
            tab === "percentages"
              ? "bg-emerald-600 text-white shadow-sm"
              : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
          }`}
        >
          <Percent className="h-4 w-4" />
          <span>Procenty (E8)</span>
        </button>

        <button
          type="button"
          onClick={() => setTab("roots")}
          className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition ${
            tab === "roots"
              ? "bg-emerald-600 text-white shadow-sm"
              : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
          }`}
        >
          <Sparkles className="h-4 w-4" />
          <span>Wyłączanie przed pierwiastek</span>
        </button>

        <button
          type="button"
          onClick={() => setTab("geometry_sp")}
          className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition ${
            tab === "geometry_sp"
              ? "bg-emerald-600 text-white shadow-sm"
              : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
          }`}
        >
          <Shapes className="h-4 w-4" />
          <span>Pola Figur (SP)</span>
        </button>

        <button
          type="button"
          onClick={() => setTab("speed")}
          className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition ${
            tab === "speed"
              ? "bg-emerald-600 text-white shadow-sm"
              : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
          }`}
        >
          <Car className="h-4 w-4" />
          <span>Prędkość, Droga, Czas</span>
        </button>
      </div>

      {/* Aktywny widok */}
      {tab === "fractions" && <FractionsModule />}
      {tab === "gcd_lcm" && <GcdLcmModule />}
      {tab === "percentages" && <PercentagesModule />}
      {tab === "roots" && <RootsModule />}
      {tab === "geometry_sp" && <GeometrySpModule />}
      {tab === "speed" && <SpeedModule />}
    </div>
  );
}

// 1. Moduł: Ułamki zwykłe
function FractionsModule() {
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

// 2. Moduł: NWD i NWW
function GcdLcmModule() {
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

// 3. Moduł: Procenty (E8 CKE)
function PercentagesModule() {
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

// 4. Moduł: Wyłączanie czynnika przed pierwiastek
function RootsModule() {
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

// 5. Moduł: Pola Figur (Planimetria SP)
function GeometrySpModule() {
  const [shape, setShape] = useState<"triangle" | "trapezoid" | "rhombus" | "parallelogram">("triangle");
  const [a, setA] = useState("6");
  const [b, setB] = useState("4");
  const [h, setH] = useState("5");

  const aNum = parseFloat(a) || 0;
  const bNum = parseFloat(b) || 0;
  const hNum = parseFloat(h) || 0;

  let area = 0;
  let formulaTex = "";

  if (shape === "triangle") {
    area = (aNum * hNum) / 2;
    formulaTex = `P = \\frac{a \\cdot h}{2} = \\frac{${aNum} \\cdot ${hNum}}{2} = ${area}`;
  } else if (shape === "trapezoid") {
    area = ((aNum + bNum) * hNum) / 2;
    formulaTex = `P = \\frac{(a + b) \\cdot h}{2} = \\frac{(${aNum} + ${bNum}) \\cdot ${hNum}}{2} = ${area}`;
  } else if (shape === "rhombus") {
    area = (aNum * bNum) / 2; // e * f / 2
    formulaTex = `P = \\frac{e \\cdot f}{2} = \\frac{${aNum} \\cdot ${bNum}}{2} = ${area}`;
  } else {
    area = aNum * hNum;
    formulaTex = `P = a \\cdot h = ${aNum} \\cdot ${hNum} = ${area}`;
  }

  return (
    <section className="rounded-2xl bg-white p-5 ring-1 ring-black/5 dark:bg-zinc-900 dark:ring-white/10">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
          Kalkulator Pól Figur Płaskich (Klasy 4–8)
        </h3>
        <p className="text-xs text-zinc-500">Wzory na pola trójkątów i czworokątów z podręcznika szkoły podstawowej.</p>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setShape("triangle")}
          className={`rounded-xl px-3 py-1.5 text-xs font-semibold ${
            shape === "triangle" ? "bg-emerald-600 text-white" : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
          }`}
        >
          Trójkąt
        </button>
        <button
          type="button"
          onClick={() => setShape("trapezoid")}
          className={`rounded-xl px-3 py-1.5 text-xs font-semibold ${
            shape === "trapezoid" ? "bg-emerald-600 text-white" : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
          }`}
        >
          Trapez
        </button>
        <button
          type="button"
          onClick={() => setShape("rhombus")}
          className={`rounded-xl px-3 py-1.5 text-xs font-semibold ${
            shape === "rhombus" ? "bg-emerald-600 text-white" : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
          }`}
        >
          Romb (przekątne e, f)
        </button>
        <button
          type="button"
          onClick={() => setShape("parallelogram")}
          className={`rounded-xl px-3 py-1.5 text-xs font-semibold ${
            shape === "parallelogram" ? "bg-emerald-600 text-white" : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
          }`}
        >
          Równoległobok
        </button>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <div>
          <label className="text-xs font-semibold text-zinc-500">
            {shape === "rhombus" ? "Przekątna e:" : "Podstawa a:"}
          </label>
          <input
            type="number"
            value={a}
            onChange={(e) => setA(e.target.value)}
            className="mt-1 w-full rounded-xl bg-zinc-50 px-3 py-2 text-base font-bold ring-1 ring-black/5 outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-zinc-950 dark:text-white"
          />
        </div>

        {shape === "trapezoid" && (
          <div>
            <label className="text-xs font-semibold text-zinc-500">Druga podstawa b:</label>
            <input
              type="number"
              value={b}
              onChange={(e) => setB(e.target.value)}
              className="mt-1 w-full rounded-xl bg-zinc-50 px-3 py-2 text-base font-bold ring-1 ring-black/5 outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-zinc-950 dark:text-white"
            />
          </div>
        )}

        {shape === "rhombus" ? (
          <div>
            <label className="text-xs font-semibold text-zinc-500">Druga przekątna f:</label>
            <input
              type="number"
              value={b}
              onChange={(e) => setB(e.target.value)}
              className="mt-1 w-full rounded-xl bg-zinc-50 px-3 py-2 text-base font-bold ring-1 ring-black/5 outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-zinc-950 dark:text-white"
            />
          </div>
        ) : (
          <div>
            <label className="text-xs font-semibold text-zinc-500">Wysokość h:</label>
            <input
              type="number"
              value={h}
              onChange={(e) => setH(e.target.value)}
              className="mt-1 w-full rounded-xl bg-zinc-50 px-3 py-2 text-base font-bold ring-1 ring-black/5 outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-zinc-950 dark:text-white"
            />
          </div>
        )}
      </div>

      <div className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-4 text-center dark:border-emerald-900/40 dark:bg-emerald-950/20">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
          Pole figury P:
        </span>
        <div className="mt-1 text-2xl font-bold text-zinc-900 dark:text-white">
          <MathTex tex={formulaTex} />
        </div>
      </div>
    </section>
  );
}

// 6. Moduł: Prędkość, Droga, Czas
function SpeedModule() {
  const [calcWhat, setCalcWhat] = useState<"v" | "s" | "t">("v");
  const [s, setS] = useState("120"); // km
  const [t, setT] = useState("2"); // h
  const [v, setV] = useState("60"); // km/h

  const sNum = parseFloat(s) || 0;
  const tNum = parseFloat(t) || 1;
  const vNum = parseFloat(v) || 0;

  let resVal = 0;
  let unit = "";
  let formula = "";
  let alternate = "";

  if (calcWhat === "v") {
    resVal = sNum / tNum;
    unit = "km/h";
    formula = `v = \\frac{s}{t} = \\frac{${sNum}\\text{ km}}{${tNum}\\text{ h}} = ${resVal}\\text{ km/h}`;
    alternate = `${(resVal / 3.6).toFixed(2).replace(".00", "")} m/s (dzielimy przez 3,6)`;
  } else if (calcWhat === "s") {
    resVal = vNum * tNum;
    unit = "km";
    formula = `s = v \\cdot t = ${vNum}\\text{ km/h} \\cdot ${tNum}\\text{ h} = ${resVal}\\text{ km}`;
  } else {
    resVal = vNum !== 0 ? sNum / vNum : 0;
    unit = "h";
    formula = `t = \\frac{s}{v} = \\frac{${sNum}\\text{ km}}{${vNum}\\text{ km/h}} = ${resVal}\\text{ h}`;
    alternate = `${Math.round(resVal * 60)} minut`;
  }

  return (
    <section className="rounded-2xl bg-white p-5 ring-1 ring-black/5 dark:bg-zinc-900 dark:ring-white/10">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
          Prędkość, Droga, Czas (Zadania z fizyki i matematyki SP)
        </h3>
        <p className="text-xs text-zinc-500">Klasyczne zadania: pociągi, samochody, rowerzyści (v = s / t).</p>
      </div>

      <div className="mb-6 flex gap-2">
        <button
          type="button"
          onClick={() => setCalcWhat("v")}
          className={`rounded-xl px-3 py-1.5 text-xs font-semibold ${
            calcWhat === "v" ? "bg-emerald-600 text-white" : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
          }`}
        >
          Oblicz Prędkość (v)
        </button>
        <button
          type="button"
          onClick={() => setCalcWhat("s")}
          className={`rounded-xl px-3 py-1.5 text-xs font-semibold ${
            calcWhat === "s" ? "bg-emerald-600 text-white" : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
          }`}
        >
          Oblicz Drogę (s)
        </button>
        <button
          type="button"
          onClick={() => setCalcWhat("t")}
          className={`rounded-xl px-3 py-1.5 text-xs font-semibold ${
            calcWhat === "t" ? "bg-emerald-600 text-white" : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
          }`}
        >
          Oblicz Czas (t)
        </button>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-2">
        {calcWhat !== "s" && (
          <div>
            <label className="text-xs font-semibold text-zinc-500">Droga s (km):</label>
            <input
              type="number"
              value={s}
              onChange={(e) => setS(e.target.value)}
              className="mt-1 w-full rounded-xl bg-zinc-50 px-3 py-2 text-base font-bold ring-1 ring-black/5 outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-zinc-950 dark:text-white"
            />
          </div>
        )}

        {calcWhat !== "v" && (
          <div>
            <label className="text-xs font-semibold text-zinc-500">Prędkość v (km/h):</label>
            <input
              type="number"
              value={v}
              onChange={(e) => setV(e.target.value)}
              className="mt-1 w-full rounded-xl bg-zinc-50 px-3 py-2 text-base font-bold ring-1 ring-black/5 outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-zinc-950 dark:text-white"
            />
          </div>
        )}

        {calcWhat !== "t" && (
          <div>
            <label className="text-xs font-semibold text-zinc-500">Czas t (godziny):</label>
            <input
              type="number"
              value={t}
              onChange={(e) => setT(e.target.value)}
              className="mt-1 w-full rounded-xl bg-zinc-50 px-3 py-2 text-base font-bold ring-1 ring-black/5 outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-zinc-950 dark:text-white"
            />
          </div>
        )}
      </div>

      <div className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-4 text-center dark:border-emerald-900/40 dark:bg-emerald-950/20">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
          Wynik:
        </span>
        <div className="mt-1 text-xl font-bold text-zinc-900 dark:text-white">
          <MathTex tex={formula} />
        </div>
        {alternate && (
          <div className="mt-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
            W innej jednostce: {alternate}
          </div>
        )}
      </div>
    </section>
  );
}
