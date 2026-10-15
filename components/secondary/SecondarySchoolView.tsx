"use client";

import { useState } from "react";
import {
  ArrowLeft,
  Binary,
  Box,
  Calculator,
  Compass,
  CornerDownRight,
  Divide,
  Hash,
  LineChart,
  LogOut,
  MapPin,
  Percent,
  PieChart,
  ScanLine,
  Shapes,
  Sparkles,
  TrendingUp,
  Variable,
} from "lucide-react";
import { EquationSolver } from "./EquationSolver";
import { GeometryCalculator } from "./GeometryCalculator";
import { ScientificCalculator } from "./ScientificCalculator";
import { QuadraticInequalitiesModule } from "./modules/QuadraticInequalitiesModule";
import { SequencesModule } from "./modules/SequencesModule";
import { LogarithmsModule } from "./modules/LogarithmsModule";
import { TrigonometryModule } from "./modules/TrigonometryModule";
import { AnalyticGeometryModule } from "./modules/AnalyticGeometryModule";
import { StereometryModule } from "./modules/StereometryModule";
import { CombinatoricsModule } from "./modules/CombinatoricsModule";
import { FunctionAnalysisModule } from "./modules/FunctionAnalysisModule";

export type SecondaryCategoryKey =
  | "equations"
  | "inequalities"
  | "functions"
  | "sequences"
  | "trigonometry"
  | "logarithms"
  | "geometry"
  | "stereometry"
  | "analytic"
  | "combinatorics"
  | "scientific";

interface CategoryMeta {
  key: SecondaryCategoryKey;
  title: string;
  badge: string;
  desc: string;
  icon: typeof Calculator;
  color: string;
  tags: string[];
}

const CATEGORIES: CategoryMeta[] = [
  {
    key: "equations",
    title: "Równania & Delta (Δ)",
    badge: "Pewniak CKE",
    desc: "Równania kwadratowe z wyróżnikiem Δ, pierwiastki x₁ i x₂, równania liniowe oraz postać iloczynowa.",
    icon: Variable,
    color: "from-blue-600 to-indigo-600",
    tags: ["Δ = b² - 4ac", "x₁, x₂", "Postać iloczynowa"],
  },
  {
    key: "inequalities",
    title: "Nierówności Kwadratowe",
    badge: "Zadanie otwarte CKE",
    desc: "Wyznaczanie przedziałów rozwiązań, wykres paraboli, ramiona w górę/dół i analiza znaku trójmianu.",
    icon: TrendingUp,
    color: "from-indigo-600 to-purple-600",
    tags: ["ax² + bx + c > 0", "Przedziały liczbowe", "Szkic osi"],
  },
  {
    key: "functions",
    title: "Funkcje & Wykresy",
    badge: "Własności CKE",
    desc: "Postać kanoniczna a(x-p)²+q, wierzchołek paraboli W(p, q), oś symetrii, zbiór wartości i monotoniczność.",
    icon: LineChart,
    color: "from-purple-600 to-pink-600",
    tags: ["W(p, q)", "Postać kanoniczna", "Monotoniczność"],
  },
  {
    key: "sequences",
    title: "Ciągi Liczbowe",
    badge: "CKE Matura",
    desc: "Ciąg arytmetyczny (różnica r, suma Sₙ) oraz ciąg geometryczny (iloraz q, n-ty wyraz aₙ).",
    icon: Binary,
    color: "from-emerald-600 to-teal-600",
    tags: ["aₙ = a₁ + (n-1)r", "Ciąg geom. q", "Suma Sₙ"],
  },
  {
    key: "logarithms",
    title: "Logarytmy i Potęgi",
    badge: "Pewniak CKE (1 pkt)",
    desc: "Definicja logarytmu log_a(b)=c, wzory na sumę i różnicę logarytmów oraz potęgi o wykładniku wymiernym.",
    icon: Hash,
    color: "from-amber-500 to-orange-600",
    tags: ["log_a(b) = c", "log(x·y)", "Potęgi wymierne"],
  },
  {
    key: "trigonometry",
    title: "Trygonometria (CKE)",
    badge: "Karta wzorów CKE",
    desc: "Dokładne wartości kątów 30°, 45°, 60°, tożsamość jedynki trygonometrycznej i rozwiązywanie trójkątów.",
    icon: PieChart,
    color: "from-cyan-600 to-blue-600",
    tags: ["sin²α + cos²α = 1", "Kąty 30°, 45°, 60°", "tg α"],
  },
  {
    key: "analytic",
    title: "Geometria Analityczna",
    badge: "Geometria Oxy",
    desc: "Długość odcinka |AB|, środek odcinka S, równanie prostej y=ax+b, warunki prostopadłości i równoległości.",
    icon: MapPin,
    color: "from-rose-600 to-red-600",
    tags: ["|AB| = √(...)", "Środek S", "Proste y = ax + b"],
  },
  {
    key: "stereometry",
    title: "Stereometria (Bryły)",
    badge: "Bryły CKE",
    desc: "Walec, stożek, kula, sześcian, prostopadłościan — objętość V, pole powierzchni całkowitej Pc i przekątne.",
    icon: Box,
    color: "from-violet-600 to-indigo-600",
    tags: ["Walec V = πr²h", "Kula V = 4/3πr³", "Pole Pc"],
  },
  {
    key: "geometry",
    title: "Planimetria & Pitagoras",
    badge: "Planimetria",
    desc: "Twierdzenie Pitagorasa, trójkąty, trapezy, czworokąty, okręgi wpisane i opisane.",
    icon: Compass,
    color: "from-emerald-600 to-green-600",
    tags: ["a² + b² = c²", "Trójkąt", "Pola figur"],
  },
  {
    key: "combinatorics",
    title: "Kombinatoryka & Silnia",
    badge: "Rachunek CKE",
    desc: "Symbol Newtona (n po k), silnia n!, permutacje, kombinacje i prawdopodobieństwo klasyczne P(A).",
    icon: Shapes,
    color: "from-fuchsia-600 to-pink-600",
    tags: ["Symbol Newtona", "Silnia n!", "Prawdopodobieństwo"],
  },
  {
    key: "scientific",
    title: "Kalkulator Naukowy",
    badge: "Uniwersalny",
    desc: "Zaawansowany kalkulator z nawiasami, potęgami, pierwiastkami, stałymi π i e oraz pełną historią.",
    icon: Calculator,
    color: "from-zinc-700 to-zinc-900",
    tags: ["Nawiasy", "Historia", "Stałe π, e"],
  },
];

interface SecondarySchoolViewProps {
  initialInput?: string;
  onOpenScanner: () => void;
}

export function SecondarySchoolView({ initialInput, onOpenScanner }: SecondarySchoolViewProps) {
  const [activeCategory, setActiveCategory] = useState<SecondaryCategoryKey | null>(null);

  const activeMeta = CATEGORIES.find((c) => c.key === activeCategory);

  return (
    <div className="space-y-6">
      {/* 1. GŁÓWNE MENU NA ŚRODKU (Gdy żadna kategoria nie jest aktywna) */}
      {activeCategory === null ? (
        <div className="mx-auto max-w-4xl space-y-6">
          {/* Wyśrodkowany baner nagłówkowy */}
          <div className="rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-950 to-zinc-950 p-6 text-center text-white shadow-xl ring-1 ring-white/10 sm:p-8">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/20 px-3.5 py-1 text-xs font-bold text-indigo-300 ring-1 ring-indigo-400/30">
              <Sparkles className="h-3.5 w-3.5" />
              Podstawa Programowa Szkół Ponadpodstawowych (CKE Matura)
            </span>

            <h1 className="mt-3 text-2xl font-black tracking-tight text-white sm:text-3xl">
              Menu Działów Matematyki
            </h1>

            <p className="mx-auto mt-2 max-w-2xl text-xs leading-relaxed text-indigo-200/80 sm:text-sm">
              Wybierz dział z podstawy programowej poniżej. Każdy moduł zawiera dedykowane narzędzia obliczeniowe, wzory z oficjalnych tablic CKE oraz pełne rozwiązania krok po kroku.
            </p>

            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={onOpenScanner}
                className="flex items-center gap-2 rounded-2xl bg-white px-5 py-2.5 text-xs font-bold text-zinc-950 shadow-lg shadow-white/10 transition active:scale-95 hover:bg-zinc-100"
              >
                <ScanLine className="h-4 w-4 text-indigo-600" />
                <span>Skanuj zadanie ze zdjęcia / podręcznika</span>
              </button>
            </div>
          </div>

          {/* Wyśrodkowana siatka kategorii */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              return (
                <div
                  key={cat.key}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5 transition duration-200 hover:-translate-y-1 hover:shadow-md dark:bg-zinc-900 dark:ring-white/10"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div
                        className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${cat.color} text-white shadow-md shadow-indigo-500/20`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-[10px] font-bold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                        {cat.badge}
                      </span>
                    </div>

                    <h3 className="mt-3.5 text-base font-bold text-zinc-900 dark:text-white">
                      {cat.title}
                    </h3>

                    <p className="mt-1 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                      {cat.desc}
                    </p>

                    {/* Tagi wzorów */}
                    <div className="mt-3 flex flex-wrap gap-1">
                      {cat.tags.map((t) => (
                        <span
                          key={t}
                          className="rounded-md bg-zinc-50 px-2 py-0.5 font-mono text-[10px] font-semibold text-zinc-600 dark:bg-zinc-800/60 dark:text-zinc-400"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-zinc-100 dark:border-zinc-800/80">
                    <button
                      type="button"
                      onClick={() => setActiveCategory(cat.key)}
                      className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-zinc-900 py-2.5 text-xs font-bold text-white shadow-sm transition group-hover:bg-indigo-600 dark:bg-white dark:text-zinc-900 dark:group-hover:bg-indigo-400"
                    >
                      <span>Otwórz moduł</span>
                      <CornerDownRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* 2. WIDOK OTWARTEGO MODUŁU Z WYŚRODKOWANYM PASKIEM KATEGORII */
        <div className="space-y-4">
          {/* Wyśrodkowany pasek wyboru i powrotu */}
          <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-2 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-black/5 dark:bg-zinc-900 dark:ring-white/10">
            <button
              type="button"
              onClick={() => setActiveCategory(null)}
              className="flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs font-bold text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Menu wszystkich kategorii</span>
            </button>

            {/* Wyśrodkowany selektor kategorii */}
            <div className="flex items-center gap-1 overflow-x-auto py-1">
              <select
                value={activeCategory}
                onChange={(e) => setActiveCategory(e.target.value as SecondaryCategoryKey)}
                aria-label="Wybierz dział z podstawy programowej"
                className="rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-1.5 text-xs font-bold text-zinc-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.key} value={c.key}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={onOpenScanner}
              className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-indigo-500"
            >
              <ScanLine className="h-3.5 w-3.5" />
              <span>Skanuj zadanie</span>
            </button>
          </div>

          {/* Komponent aktywnego modułu */}
          <div>
            {activeCategory === "equations" && (
              <EquationSolver initialInput={initialInput} />
            )}
            {activeCategory === "inequalities" && (
              <QuadraticInequalitiesModule
                initialInput={initialInput}
                onOpenScanner={onOpenScanner}
              />
            )}
            {activeCategory === "functions" && (
              <FunctionAnalysisModule onOpenScanner={onOpenScanner} />
            )}
            {activeCategory === "sequences" && (
              <SequencesModule onOpenScanner={onOpenScanner} />
            )}
            {activeCategory === "logarithms" && (
              <LogarithmsModule onOpenScanner={onOpenScanner} />
            )}
            {activeCategory === "trigonometry" && (
              <TrigonometryModule onOpenScanner={onOpenScanner} />
            )}
            {activeCategory === "analytic" && (
              <AnalyticGeometryModule onOpenScanner={onOpenScanner} />
            )}
            {activeCategory === "stereometry" && (
              <StereometryModule onOpenScanner={onOpenScanner} />
            )}
            {activeCategory === "geometry" && <GeometryCalculator />}
            {activeCategory === "combinatorics" && (
              <CombinatoricsModule onOpenScanner={onOpenScanner} />
            )}
            {activeCategory === "scientific" && (
              <ScientificCalculator initialInput={initialInput} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
