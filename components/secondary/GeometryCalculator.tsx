"use client";

import { useState } from "react";
import { Circle, Compass, Shapes, Triangle } from "lucide-react";
import { MathTex } from "@/components/math/MathTex";
import {
  RightTriangleDiagram,
  EquilateralDiagram,
  CircleDiagram,
} from "@/components/math/diagrams";

type GeometryTab = "pythagoras" | "trigonometry" | "equilateral" | "circle";

export function GeometryCalculator() {
  const [activeTab, setActiveTab] = useState<GeometryTab>("pythagoras");

  // Pitagoras state
  const [sideA, setSideA] = useState("3");
  const [sideB, setSideB] = useState("4");
  const [sideC, setSideC] = useState("");

  // Trygonometria state
  const [trigA, setTrigA] = useState("3");
  const [trigB, setTrigB] = useState("4");

  // Trójkąt równoboczny state
  const [eqA, setEqA] = useState("6");

  // Koło state
  const [radius, setRadius] = useState("5");

  // Obliczenia Pitagorasa:
  const aNum = parseFloat(sideA);
  const bNum = parseFloat(sideB);
  const cNum = parseFloat(sideC);

  let pythResult: { text: string; tex: string; explanation: string } | null = null;
  let pythComputedC = "";
  if (!isNaN(aNum) && !isNaN(bNum) && isNaN(cNum)) {
    const cVal = Math.sqrt(aNum * aNum + bNum * bNum);
    pythComputedC = cVal.toFixed(2).replace(".00", "");
    pythResult = {
      text: `c = ${pythComputedC}`,
      tex: `c = \\sqrt{${aNum}^2 + ${bNum}^2} = \\sqrt{${aNum * aNum + bNum * bNum}} \\approx ${cVal.toFixed(2).replace(".", "{,}")}`,
      explanation: "Obliczono przeciwprostokątną c z twierdzenia Pitagorasa: c = √(a² + b²)",
    };
  } else if (!isNaN(aNum) && isNaN(bNum) && !isNaN(cNum)) {
    if (cNum > aNum) {
      const bVal = Math.sqrt(cNum * cNum - aNum * aNum);
      pythResult = {
        text: `b = ${bVal.toFixed(2).replace(".00", "")}`,
        tex: `b = \\sqrt{${cNum}^2 - ${aNum}^2} = \\sqrt{${cNum * cNum - aNum * aNum}} \\approx ${bVal.toFixed(2).replace(".", "{,}")}`,
        explanation: "Obliczono przyprostokątną b z twierdzenia Pitagorasa: b = √(c² - a²)",
      };
    }
  }

  // Trygonometria obliczenia:
  const tANum = parseFloat(trigA) || 0;
  const tBNum = parseFloat(trigB) || 0;
  const tCNum = Math.sqrt(tANum * tANum + tBNum * tBNum);
  const sinVal = tCNum > 0 ? tANum / tCNum : 0;
  const cosVal = tCNum > 0 ? tBNum / tCNum : 0;
  const tgVal = tBNum > 0 ? tANum / tBNum : 0;
  const angleDeg = tCNum > 0 ? (Math.asin(sinVal) * 180) / Math.PI : 0;

  // Trójkąt równoboczny obliczenia:
  const eqANum = parseFloat(eqA);
  const eqH = !isNaN(eqANum) ? (eqANum * Math.sqrt(3)) / 2 : 0;
  const eqP = !isNaN(eqANum) ? (eqANum * eqANum * Math.sqrt(3)) / 4 : 0;
  const eqR = eqH / 3;
  const eqBigR = (2 * eqH) / 3;

  // Koło obliczenia:
  const rNum = parseFloat(radius);
  const circArea = !isNaN(rNum) ? Math.PI * rNum * rNum : 0;
  const circCircum = !isNaN(rNum) ? 2 * Math.PI * rNum : 0;

  return (
    <section className="rounded-2xl bg-white p-4 ring-1 ring-black/5 sm:p-6 dark:bg-zinc-900 dark:ring-white/10">
      <div className="mb-4">
        <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
          Kalkulator Geometrii i Trygonometrii (Planimetria CKE)
        </h2>
        <p className="mt-1 text-xs text-zinc-500">
          Wizualne schematy figur z naniesionymi wzorami, twierdzeniem Pitagorasa i funkcjami kąta ostrego.
        </p>
      </div>

      {/* Zakładki geometrii */}
      <div className="mb-6 flex flex-wrap gap-2 border-b border-zinc-100 pb-3 dark:border-zinc-800">
        <button
          type="button"
          onClick={() => setActiveTab("pythagoras")}
          className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
            activeTab === "pythagoras"
              ? "bg-indigo-600 text-white shadow-sm"
              : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300"
          }`}
        >
          <Triangle className="h-4 w-4" />
          <span>Twierdzenie Pitagorasa</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("trigonometry")}
          className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
            activeTab === "trigonometry"
              ? "bg-indigo-600 text-white shadow-sm"
              : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300"
          }`}
        >
          <Compass className="h-4 w-4" />
          <span>Trygonometria (sin, cos, tg)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("equilateral")}
          className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
            activeTab === "equilateral"
              ? "bg-indigo-600 text-white shadow-sm"
              : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300"
          }`}
        >
          <Shapes className="h-4 w-4" />
          <span>Trójkąt Równoboczny</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("circle")}
          className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
            activeTab === "circle"
              ? "bg-indigo-600 text-white shadow-sm"
              : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300"
          }`}
        >
          <Circle className="h-4 w-4" />
          <span>Koło i Okrąg</span>
        </button>
      </div>

      {/* Tab: Pitagoras */}
      {activeTab === "pythagoras" && (
        <div className="grid gap-6 md:grid-cols-2 md:items-center">
          <div className="space-y-4">
            <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-3.5 text-xs text-indigo-900 dark:border-indigo-900/40 dark:bg-indigo-950/20 dark:text-indigo-200">
              W trójkącie prostokątnym o przyprostokątnych <strong>a</strong> i <strong>b</strong> oraz przeciwprostokątnej <strong>c</strong>:
              <div className="mt-1 text-center font-mono text-base">
                <MathTex tex="a^2 + b^2 = c^2" />
              </div>
              Wpisz dwie dowolne wartości, a trzecia zostanie wyliczona z pełnym rozpisaniem.
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <label className="text-xs font-semibold text-zinc-500">Przyprostokątna a:</label>
                <input
                  type="number"
                  value={sideA}
                  onChange={(e) => setSideA(e.target.value)}
                  placeholder="np. 3"
                  className="mt-1 w-full rounded-xl bg-zinc-50 px-3 py-2 text-base ring-1 ring-black/5 outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-zinc-950 dark:text-zinc-100 dark:ring-white/10"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-500">Przyprostokątna b:</label>
                <input
                  type="number"
                  value={sideB}
                  onChange={(e) => setSideB(e.target.value)}
                  placeholder="np. 4"
                  className="mt-1 w-full rounded-xl bg-zinc-50 px-3 py-2 text-base ring-1 ring-black/5 outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-zinc-950 dark:text-zinc-100 dark:ring-white/10"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-500">Przeciwprostokątna c:</label>
                <input
                  type="number"
                  value={sideC}
                  onChange={(e) => setSideC(e.target.value)}
                  placeholder="np. 5"
                  className="mt-1 w-full rounded-xl bg-zinc-50 px-3 py-2 text-base ring-1 ring-black/5 outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-zinc-950 dark:text-zinc-100 dark:ring-white/10"
                />
              </div>
            </div>

            {pythResult && (
              <div className="rounded-xl bg-zinc-50 p-4 text-center dark:bg-zinc-950">
                <div className="text-xs text-zinc-400">{pythResult.explanation}</div>
                <div className="mt-2 text-xl font-bold text-zinc-900 dark:text-white">
                  <MathTex tex={pythResult.tex} />
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col items-center justify-center">
            <RightTriangleDiagram
              a={sideA || "a"}
              b={sideB || "b"}
              c={sideC || pythComputedC || "c"}
              className="w-full"
            />
          </div>
        </div>
      )}

      {/* Tab: Trygonometria */}
      {activeTab === "trigonometry" && (
        <div className="grid gap-6 md:grid-cols-2 md:items-center">
          <div className="space-y-4">
            <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-3.5 text-xs text-indigo-900 dark:border-indigo-900/40 dark:bg-indigo-950/20 dark:text-indigo-200">
              Definicje funkcji trygonometrycznych kąta ostrego α w trójkącie prostokątnym:
              <div className="mt-1 text-center font-mono text-sm">
                <MathTex tex="\sin\alpha = \frac{a}{c}, \quad \cos\alpha = \frac{b}{c}, \quad \text{tg}\alpha = \frac{a}{b}" />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="text-xs font-semibold text-zinc-500">Przyprostokątna a (naprzeciw α):</label>
                <input
                  type="number"
                  value={trigA}
                  onChange={(e) => setTrigA(e.target.value)}
                  className="mt-1 w-full rounded-xl bg-zinc-50 px-3 py-2 text-base ring-1 ring-black/5 outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-zinc-950 dark:text-zinc-100 dark:ring-white/10"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-500">Przyprostokątna b (przyległa do α):</label>
                <input
                  type="number"
                  value={trigB}
                  onChange={(e) => setTrigB(e.target.value)}
                  className="mt-1 w-full rounded-xl bg-zinc-50 px-3 py-2 text-base ring-1 ring-black/5 outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-zinc-950 dark:text-zinc-100 dark:ring-white/10"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-center sm:grid-cols-4">
              <div className="rounded-xl bg-zinc-50 p-2.5 dark:bg-zinc-950">
                <span className="text-[10px] font-bold text-zinc-400">sin α = a/c</span>
                <div className="mt-1 text-sm font-bold text-indigo-600 dark:text-indigo-400">
                  {sinVal.toFixed(3).replace(".", ",")}
                </div>
              </div>
              <div className="rounded-xl bg-zinc-50 p-2.5 dark:bg-zinc-950">
                <span className="text-[10px] font-bold text-zinc-400">cos α = b/c</span>
                <div className="mt-1 text-sm font-bold text-indigo-600 dark:text-indigo-400">
                  {cosVal.toFixed(3).replace(".", ",")}
                </div>
              </div>
              <div className="rounded-xl bg-zinc-50 p-2.5 dark:bg-zinc-950">
                <span className="text-[10px] font-bold text-zinc-400">tg α = a/b</span>
                <div className="mt-1 text-sm font-bold text-indigo-600 dark:text-indigo-400">
                  {tgVal.toFixed(3).replace(".", ",")}
                </div>
              </div>
              <div className="rounded-xl bg-zinc-50 p-2.5 dark:bg-zinc-950">
                <span className="text-[10px] font-bold text-zinc-400">Kąt α:</span>
                <div className="mt-1 text-sm font-bold text-amber-600 dark:text-amber-400">
                  ≈ {angleDeg.toFixed(1).replace(".", ",")}°
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center">
            <RightTriangleDiagram
              a={trigA}
              b={trigB}
              c={tCNum > 0 ? tCNum.toFixed(2).replace(".00", "") : "c"}
              showTrig={true}
              className="w-full"
            />
          </div>
        </div>
      )}

      {/* Tab: Trójkąt równoboczny */}
      {activeTab === "equilateral" && (
        <div className="grid gap-6 md:grid-cols-2 md:items-center">
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-zinc-500">Długość boku a:</label>
              <input
                type="number"
                value={eqA}
                onChange={(e) => setEqA(e.target.value)}
                placeholder="np. 6"
                className="mt-1 w-full max-w-xs rounded-xl bg-zinc-50 px-3 py-2 text-base ring-1 ring-black/5 outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-zinc-950 dark:text-zinc-100 dark:ring-white/10"
              />
            </div>

            {!isNaN(eqANum) && eqANum > 0 && (
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl bg-zinc-50 p-3.5 dark:bg-zinc-950">
                  <span className="text-xs font-semibold text-zinc-400">Wysokość h = (a√3) / 2:</span>
                  <div className="mt-1 text-lg font-bold text-zinc-900 dark:text-white">
                    <MathTex tex={`h = \\frac{${eqANum}\\sqrt{3}}{2} \\approx ${eqH.toFixed(2).replace(".", "{,}")}`} />
                  </div>
                </div>

                <div className="rounded-xl bg-zinc-50 p-3.5 dark:bg-zinc-950">
                  <span className="text-xs font-semibold text-zinc-400">Pole P = (a²√3) / 4:</span>
                  <div className="mt-1 text-lg font-bold text-zinc-900 dark:text-white">
                    <MathTex tex={`P = \\frac{${eqANum * eqANum}\\sqrt{3}}{4} \\approx ${eqP.toFixed(2).replace(".", "{,}")}`} />
                  </div>
                </div>

                <div className="rounded-xl bg-zinc-50 p-3.5 dark:bg-zinc-950">
                  <span className="text-xs font-semibold text-zinc-400">Promień wpisanego r = h / 3:</span>
                  <div className="mt-1 text-lg font-bold text-zinc-900 dark:text-white">
                    <MathTex tex={`r = \\frac{${eqANum}\\sqrt{3}}{6} \\approx ${eqR.toFixed(2).replace(".", "{,}")}`} />
                  </div>
                </div>

                <div className="rounded-xl bg-zinc-50 p-3.5 dark:bg-zinc-950">
                  <span className="text-xs font-semibold text-zinc-400">Promień opisanego R = 2h / 3:</span>
                  <div className="mt-1 text-lg font-bold text-zinc-900 dark:text-white">
                    <MathTex tex={`R = \\frac{${eqANum}\\sqrt{3}}{3} \\approx ${eqBigR.toFixed(2).replace(".", "{,}")}`} />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col items-center justify-center">
            <EquilateralDiagram a={eqANum} className="w-full" />
          </div>
        </div>
      )}

      {/* Tab: Koło i Okrąg */}
      {activeTab === "circle" && (
        <div className="grid gap-6 md:grid-cols-2 md:items-center">
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-zinc-500">Promień koła r:</label>
              <input
                type="number"
                value={radius}
                onChange={(e) => setRadius(e.target.value)}
                placeholder="np. 5"
                className="mt-1 w-full max-w-xs rounded-xl bg-zinc-50 px-3 py-2 text-base ring-1 ring-black/5 outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-zinc-950 dark:text-zinc-100 dark:ring-white/10"
              />
            </div>

            {!isNaN(rNum) && rNum > 0 && (
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl bg-zinc-50 p-3.5 dark:bg-zinc-950">
                  <span className="text-xs font-semibold text-zinc-400">Pole koła P = πr²:</span>
                  <div className="mt-1 text-lg font-bold text-zinc-900 dark:text-white">
                    <MathTex tex={`P = ${rNum * rNum}\\pi \\approx ${circArea.toFixed(2).replace(".", "{,}")}`} />
                  </div>
                </div>

                <div className="rounded-xl bg-zinc-50 p-3.5 dark:bg-zinc-950">
                  <span className="text-xs font-semibold text-zinc-400">Obwód okręgu L = 2πr:</span>
                  <div className="mt-1 text-lg font-bold text-zinc-900 dark:text-white">
                    <MathTex tex={`L = ${2 * rNum}\\pi \\approx ${circCircum.toFixed(2).replace(".", "{,}")}`} />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col items-center justify-center">
            <CircleDiagram r={rNum} className="w-full" />
          </div>
        </div>
      )}
    </section>
  );
}
