"use client";

import { useState } from "react";
import { BookOpen, Check, ChevronRight, HelpCircle, Lightbulb, X } from "lucide-react";
import { MathTex } from "@/components/math/MathTex";
import {
  RightTriangleDiagram,
  SpeedTriangleDiagram,
  ParabolaDiagram,
  TriangleDiagram,
  TrapezoidDiagram,
} from "@/components/math/diagrams";

interface DocsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TermDoc {
  key: string;
  name: string;
  shortcut: string;
  schoolMeaning: string;
  mathFormula?: string;
  exampleInput: string;
  exampleResult: string;
  ckeNote?: string;
}

const GLOSSARY: TermDoc[] = [
  {
    key: "tg",
    name: "Tangens (tg)",
    shortcut: "tg",
    schoolMeaning:
      "Stosunek przyprostokątnej leżącej naprzeciwko kąta do przyprostokątnej przyległej. W literaturze anglojęzycznej oznaczany jako tan.",
    mathFormula: "\\operatorname{tg}(\\alpha) = \\frac{a}{b} = \\frac{\\sin(\\alpha)}{\\cos(\\alpha)}",
    exampleInput: "tg(45)",
    exampleResult: "= 1",
    ckeNote: "Ważne: tg(90°) nie istnieje (dzielenie przez zero!).",
  },
  {
    key: "ctg",
    name: "Cotangens (ctg)",
    shortcut: "ctg",
    schoolMeaning:
      "Odwrotność tangensa: stosunek przyprostokątnej przyległej do naprzeciwległej. W kalkulatorach zachodnich oznaczany jako cot.",
    mathFormula: "\\operatorname{ctg}(\\alpha) = \\frac{b}{a} = \\frac{1}{\\operatorname{tg}(\\alpha)}",
    exampleInput: "ctg(45)",
    exampleResult: "= 1",
    ckeNote: "Ważne: ctg(0°) i ctg(180°) nie istnieją.",
  },
  {
    key: "sin_cos",
    name: "Sinus i Cosinus",
    shortcut: "sin / cos",
    schoolMeaning:
      "Podstawowe funkcje trygonometryczne. Sinus to stosunek przyprostokątnej naprzeciw kąta do przeciwprostokątnej, cosinus to stosunek przyprostokątnej przyległej do przeciwprostokątnej.",
    mathFormula: "\\sin^2(\\alpha) + \\cos^2(\\alpha) = 1 \\quad \\text{(Jedynka trygonometryczna)}",
    exampleInput: "sin(30)",
    exampleResult: "= 0,5",
    ckeNote: "Wartości dla kątów 30°, 45°, 60° to stałe pozycje na maturze CKE.",
  },
  {
    key: "deg_rad",
    name: "DEG vs RAD (Stopnie i Radiany)",
    shortcut: "DEG / RAD",
    schoolMeaning:
      "DEG (Degrees) = kąty w stopniach (pełny obrót = 360°). RAD (Radians) = miara łukowa (pełny obrót = 2π rad).",
    mathFormula: "180^\\circ = \\pi \\text{ rad} \\implies 1 \\text{ rad} \\approx 57{,}3^\\circ",
    exampleInput: "sin(30°) w trybie RAD",
    exampleResult: "= 0,5 (automatycznie przelicza stopnie)",
    ckeNote: "W szkole podstawowej i średniej w 95% zadań używasz trybu DEG.",
  },
  {
    key: "ans",
    name: "Poprzedni wynik (Answer)",
    shortcut: "ans",
    schoolMeaning:
      "Zmienna przechowująca dokładną wartość z ostatniego zatwierdzonego działania. Pozwala kontynuować obliczenia bez ponownego wpisywania wyniku.",
    exampleInput: "ans · 2",
    exampleResult: "mnoży ostatni wynik przez 2",
    ckeNote: "Zachowuje ułamek nieskracalny, dzięki czemu nie tracisz dokładności przy kolejnych krokach.",
  },
  {
    key: "log",
    name: "Logarytm dziesiętny i o dowolnej podstawie",
    shortcut: "log",
    schoolMeaning:
      "W polskiej szkole sam zapis log(x) oznacza logarytm dziesiętny o podstawie 10. Aby wpisać inną podstawę, oddziel ją średnikiem: log(liczba; podstawa).",
    mathFormula: "\\log_a(b) = c \\iff a^c = b \\quad (a > 0, a \\neq 1, b > 0)",
    exampleInput: "log(8; 2)",
    exampleResult: "= 3, bo 2³ = 8",
    ckeNote: "Na maturze częste są wzory: log(a·b) = log(a) + log(b) oraz log(a/b) = log(a) - log(b).",
  },
  {
    key: "ln",
    name: "Logarytm naturalny",
    shortcut: "ln",
    schoolMeaning:
      "Logarytm o podstawie liczby Eulera e (e ≈ 2,71828...). Często spotykany na poziomie rozszerzonym i na studiach.",
    mathFormula: "\\ln(x) = \\log_e(x)",
    exampleInput: "ln(e)",
    exampleResult: "= 1",
  },
  {
    key: "abs",
    name: "Wartość bezwzględna (Moduł)",
    shortcut: "|x| lub abs()",
    schoolMeaning:
      "Odległość liczby od zera na osi liczbowej. Zawsze daje wynik nieujemny. Z liczby ujemnej robi dodatnią, z dodatniej pozostawia taką samą.",
    mathFormula: "|x| = \\begin{cases} x & \\text{dla } x \\ge 0 \\\\ -x & \\text{dla } x < 0 \\end{cases}",
    exampleInput: "abs(-7)",
    exampleResult: "= 7",
    ckeNote: "Kluczowe w CKE: pierwiastek kwadratowy √(x²) = |x|.",
  },
  {
    key: "factorial",
    name: "Silnia (n!)",
    shortcut: "n! lub !",
    schoolMeaning:
      "Iloczyn wszystkich liczb naturalnych od 1 do n. Podstawa kombinatoryki i prawdopodobieństwa w szkole średniej.",
    mathFormula: "n! = 1 \\cdot 2 \\cdot 3 \\cdot \\dots \\cdot n, \\quad 0! = 1",
    exampleInput: "5!",
    exampleResult: "= 120 (1·2·3·4·5)",
    ckeNote: "Używana do liczenia permutacji, wariacji i kombinacji (symbol Newtona).",
  },
  {
    key: "powers_roots",
    name: "Potęgowanie i Pierwiastkowanie",
    shortcut: "x², xʸ, √",
    schoolMeaning:
      "x² podnosi liczbę do kwadratu, xʸ pozwala wpisać dowolny wykładnik (np. ułamkowy), a √ wyciąga pierwiastek kwadratowy.",
    mathFormula: "\\sqrt{a} = a^{\\frac{1}{2}}, \\quad a^{-n} = \\frac{1}{a^n}",
    exampleInput: "√16 + 2^3",
    exampleResult: "= 4 + 8 = 12",
  },
  {
    key: "mixed_fractions",
    name: "Ułamki zwykłe i rozwinięcia okresowe",
    shortcut: ": lub /",
    schoolMeaning:
      "SimpleMath nie zaokrągla w ciemno. Jeśli wynikiem jest ułamek, pokaże postać nieskracalną, liczbę mieszaną oraz rozwinięcie dziesiętne z okresem w nawiasie.",
    mathFormula: "\\frac{7}{3} = 2\\frac{1}{3} = 2{,}(3)",
    exampleInput: "1:3 + 0,5",
    exampleResult: "= 5/6 = 0,8(3)",
    ckeNote: "Na egzaminie 8-klasisty i maturze wynik w postaci ułamka nieskracalnego to standard wymagany przez CKE.",
  },
  {
    key: "pythagoras",
    name: "Twierdzenie Pitagorasa (a² + b² = c²)",
    shortcut: "a² + b² = c²",
    schoolMeaning:
      "Podstawowe twierdzenie geometrii: w trójkącie prostokątnym suma kwadratów przyprostokątnych równa się kwadratowi przeciwprostokątnej.",
    mathFormula: "a^2 + b^2 = c^2 \\iff c = \\sqrt{a^2 + b^2}",
    exampleInput: "3² + 4²",
    exampleResult: "= 9 + 16 = 25 (c = 5)",
    ckeNote: "Kultowe trójki pitagorejskie w CKE: (3, 4, 5), (5, 12, 13), (8, 15, 17).",
  },
  {
    key: "triangle_area",
    name: "Pole trójkąta (Wzór z wysokością h)",
    shortcut: "P = (a·h)/2",
    schoolMeaning:
      "Pole dowolnego trójkąta to połowa iloczynu długości podstawy i wysokości opuszczonej prostopadle na tę podstawę.",
    mathFormula: "P = \\frac{a \\cdot h}{2}",
    exampleInput: "a = 6, h = 5",
    exampleResult: "P = (6 · 5) / 2 = 15",
    ckeNote: "Wysokość musi tworzyć kąt prosty (90°) z podstawą lub jej przedłużeniem.",
  },
  {
    key: "trapezoid_area",
    name: "Pole trapezu (Podstawy a, b i wysokość h)",
    shortcut: "P = (a+b)h/2",
    schoolMeaning:
      "Pole trapezu to połowa sumy długości obu równoległych podstaw pomnożona przez odległość między nimi (wysokość h).",
    mathFormula: "P = \\frac{(a + b) \\cdot h}{2}",
    exampleInput: "a = 6, b = 4, h = 5",
    exampleResult: "P = ((6 + 4) · 5) / 2 = 25",
    ckeNote: "Częste zadanie CKE: wysokość trapezu opuszczona z wierzchołka odcina trójkąt prostokątny, z którego liczy się h z twierdzenia Pitagorasa.",
  },
  {
    key: "speed_triangle",
    name: "Prędkość, Droga, Czas (Trójkąt s, v, t)",
    shortcut: "v = s / t",
    schoolMeaning:
      "Mnemotechniczny trójkąt fizyczno-matematyczny. Pozioma kreska oznacza dzielenie (÷), pionowa mnożenie (·).",
    mathFormula: "v = \\frac{s}{t}, \\quad s = v \\cdot t, \\quad t = \\frac{s}{v}",
    exampleInput: "120 km / 2 h",
    exampleResult: "= 60 km/h (16,67 m/s)",
    ckeNote: "Zamiana jednostek: 1 km/h = 1000m / 3600s = 1/3,6 m/s. Z km/h na m/s dzielimy przez 3,6.",
  },
  {
    key: "quadratic_parabola",
    name: "Wyróżnik Δ i Wierzchołek paraboli",
    shortcut: "Δ = b² - 4ac",
    schoolMeaning:
      "Wyróżnik równania kwadratowego Δ decyduje o liczbie pierwiastków, a wierzchołek W(p, q) określa punkt zwrotny wykresu paraboli.",
    mathFormula: "\\Delta = b^2 - 4ac, \\quad p = -\\frac{b}{2a}, \\quad q = -\\frac{\\Delta}{4a}",
    exampleInput: "x² - 5x + 6 = 0",
    exampleResult: "Δ = 1, x₁ = 2, x₂ = 3, W = (2.5, -0.25)",
    ckeNote: "Gdy a > 0 ramiona paraboli skierowane są do góry (funkcja ma minimum w q), gdy a < 0 ramiona idą w dół (maksimum w q).",
  },
];

export function DocsModal({ isOpen, onClose }: DocsModalProps) {
  const [selectedKey, setSelectedKey] = useState<string>("tg");
  const [search, setSearch] = useState("");

  if (!isOpen) return null;

  const filtered = GLOSSARY.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.shortcut.toLowerCase().includes(search.toLowerCase()) ||
      item.schoolMeaning.toLowerCase().includes(search.toLowerCase()),
  );

  const current = GLOSSARY.find((item) => item.key === selectedKey) ?? GLOSSARY[0];

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/10 dark:bg-zinc-900 dark:ring-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Nagłówek modala */}
        <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
                Dokumentacja i Słownik Pojęć CKE
              </h2>
              <p className="text-xs text-zinc-500">
                Wyjaśnienie wszystkich skrótów, symboli i zasad zapisu w SimpleMath
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            title="Zamknij (Esc)"
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Wyszukiwarka */}
        <div className="border-b border-zinc-100 px-6 py-2.5 dark:border-zinc-800">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Szukaj pojęcia lub skrótu (np. tg, log, silnia, okres)..."
            className="w-full rounded-lg bg-zinc-100 px-3 py-1.5 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:ring-2 focus:ring-indigo-500 dark:bg-zinc-800 dark:text-zinc-100"
          />
        </div>

        {/* Zawartość: Lista po lewej, Szczegóły po prawej */}
        <div className="grid flex-1 overflow-hidden sm:grid-cols-[280px_minmax(0,1fr)]">
          {/* Lista tematów */}
          <div className="overflow-y-auto border-r border-zinc-100 p-2 dark:border-zinc-800">
            {filtered.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setSelectedKey(item.key)}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition ${
                  selectedKey === item.key
                    ? "bg-indigo-600 font-semibold text-white shadow-sm"
                    : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                }`}
              >
                <span>{item.name}</span>
                <ChevronRight
                  className={`h-4 w-4 shrink-0 ${
                    selectedKey === item.key ? "text-white" : "text-zinc-400"
                  }`}
                />
              </button>
            ))}
          </div>

          {/* Panel ze szczegółami pojęcia */}
          <div className="overflow-y-auto p-6">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3 dark:border-zinc-800">
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white">{current.name}</h3>
              <span className="rounded-md bg-zinc-100 px-2 py-0.5 font-mono text-xs font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                Klawisz: {current.shortcut}
              </span>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Co to oznacza w szkole?
                </h4>
                <p className="mt-1 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                  {current.schoolMeaning}
                </p>
              </div>

              {current.mathFormula && (
                <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-3.5 dark:border-indigo-900/40 dark:bg-indigo-950/20">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400">
                    Oficjalny wzór z tablic CKE
                  </h4>
                  <div className="mt-2 text-base text-zinc-900 dark:text-zinc-100">
                    <MathTex tex={current.mathFormula} display />
                  </div>
                </div>
              )}

              <div className="rounded-xl bg-zinc-50 p-3.5 dark:bg-zinc-800/40">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Przykład w kalkulatorze
                </h4>
                <div className="mt-1.5 flex flex-wrap items-center gap-2 font-mono text-sm">
                  <span className="rounded bg-white px-2 py-1 text-zinc-800 ring-1 ring-black/5 dark:bg-zinc-900 dark:text-zinc-200 dark:ring-white/10">
                    {current.exampleInput}
                  </span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-semibold">
                    {current.exampleResult}
                  </span>
                </div>
              </div>

              {current.ckeNote && (
                <div className="flex gap-2.5 rounded-xl border border-amber-200 bg-amber-50/60 p-3.5 text-xs leading-relaxed text-amber-900 dark:border-amber-800/40 dark:bg-amber-950/20 dark:text-amber-200">
                  <Lightbulb className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                  <div>
                    <span className="font-bold">Wskazówka egzaminacyjna CKE: </span>
                    {current.ckeNote}
                  </div>
                </div>
              )}

              {/* Rysunek pomocniczy ze wzorem */}
              {(current.key === "tg" || current.key === "ctg" || current.key === "sin_cos") && (
                <div className="mt-4">
                  <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Rysunek poglądowy z oznaczeniami
                  </h4>
                  <RightTriangleDiagram a="a" b="b" c="c" showTrig={true} className="w-full" />
                </div>
              )}

              {current.key === "pythagoras" && (
                <div className="mt-4">
                  <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Rysunek trójkąta prostokątnego
                  </h4>
                  <RightTriangleDiagram a="a" b="b" c="c" showTrig={false} className="w-full" />
                </div>
              )}

              {current.key === "triangle_area" && (
                <div className="mt-4">
                  <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Rysunek trójkąta z wysokością h
                  </h4>
                  <TriangleDiagram a={6} h={5} className="w-full" />
                </div>
              )}

              {current.key === "trapezoid_area" && (
                <div className="mt-4">
                  <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Rysunek trapezu z wysokością h
                  </h4>
                  <TrapezoidDiagram a={6} b={4} h={5} className="w-full" />
                </div>
              )}

              {current.key === "speed_triangle" && (
                <div className="mt-4">
                  <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Szkolny trójkąt s, v, t
                  </h4>
                  <SpeedTriangleDiagram active="v" s="120" v="60" t="2" className="w-full" />
                </div>
              )}

              {current.key === "quadratic_parabola" && (
                <div className="mt-4">
                  <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Wykres paraboli, wierzchołek W i miejsca zerowe
                  </h4>
                  <ParabolaDiagram a={1} p={2.5} q={-0.25} delta={1} x1={2} x2={3} className="w-full" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stopka */}
        <div className="flex items-center justify-between border-t border-zinc-100 bg-zinc-50 px-6 py-3 text-xs text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950">
          <span>Zgodność z tablicami matematycznymi CKE (Egzamin 8-klasisty & Matura)</span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-zinc-200 px-3 py-1 font-medium text-zinc-800 hover:bg-zinc-300 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
          >
            Rozumiem, wracam do obliczeń
          </button>
        </div>
      </div>
    </div>
  );
}
