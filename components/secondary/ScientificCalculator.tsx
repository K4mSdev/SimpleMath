"use client";

import { useMemo, useRef, useState, type ChangeEvent, type KeyboardEvent } from "react";
import { Check, Copy, HelpCircle, Sparkles } from "lucide-react";
import { MathTex } from "@/components/math/MathTex";
import {
  evaluateExpression,
  type AngleMode,
  type CalcSuccess,
  type PreviousAnswer,
} from "@/lib/math-engine";
import {
  angleModeStore,
  HISTORY_LIMIT,
  historyStore,
  type HistoryEntry,
} from "@/lib/storage/calculator-store";
import { useLocalStore } from "@/lib/storage/local-store";
import { History } from "./History";
import { Keypad, type KeyAction } from "./Keypad";

interface Committed {
  input: string;
  result: CalcSuccess;
}

/** Operatory, którymi można "kontynuować" poprzedni wynik (np. po "=" wpisujesz "+5"). */
const CONTINUES_ANSWER = /^[+\-·*:/^!²]/;

/** Fragmenty usuwane w całości przez Backspace, np. "sin(" zamiast samego "(". */
const TOKEN_BEFORE_CARET = /(?:arcsin|arccos|arcctg|arctg|sin|cos|ctg|tg|log|ln|abs|ans|√)\(?$/;

export function ScientificCalculator() {
  const [input, setInput] = useState("");
  const [committed, setCommitted] = useState<Committed | null>(null);
  const [showError, setShowError] = useState(false);
  const [copiedType, setCopiedType] = useState<"text" | "tex" | null>(null);
  const [showHelp, setShowHelp] = useState(false);

  const [angleMode, setAngleMode] = useLocalStore(angleModeStore);
  const [history, setHistory] = useLocalStore(historyStore);
  const inputRef = useRef<HTMLInputElement>(null);

  const ans: PreviousAnswer | undefined = committed
    ? { value: committed.result.value, exact: committed.result.exact }
    : undefined;

  const live = useMemo(
    () => evaluateExpression(input, { angleMode, ans }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [input, angleMode, committed],
  );

  const setInputAndCaret = (next: string, caret: number = next.length) => {
    setInput(next);
    setShowError(false);
    requestAnimationFrame(() => {
      const el = inputRef.current;
      if (!el) return;
      el.focus();
      el.setSelectionRange(caret, caret);
    });
  };

  const selection = () => {
    const el = inputRef.current;
    return {
      start: el?.selectionStart ?? input.length,
      end: el?.selectionEnd ?? input.length,
    };
  };

  const insertText = (text: string) => {
    if (input === "" && committed && CONTINUES_ANSWER.test(text)) {
      setInputAndCaret(`ans${text}`);
      return;
    }
    const { start, end } = selection();
    setInputAndCaret(input.slice(0, start) + text + input.slice(end), start + text.length);
  };

  const backspace = () => {
    const { start, end } = selection();
    if (start !== end) {
      setInputAndCaret(input.slice(0, start) + input.slice(end), start);
      return;
    }
    if (start === 0) return;
    const token = input.slice(0, start).match(TOKEN_BEFORE_CARET);
    const length = token ? token[0].length : 1;
    setInputAndCaret(input.slice(0, start - length) + input.slice(start), start - length);
  };

  const clear = () => {
    setCommitted(null);
    setInputAndCaret("");
  };

  const evaluate = () => {
    if (live.status === "empty") return;
    if (live.status === "error") {
      setShowError(true);
      return;
    }
    const entry: HistoryEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      input,
      inputTex: live.inputTex,
      resultTex: live.resultTex,
      resultText: live.resultText,
      createdAt: Date.now(),
    };
    setHistory([entry, ...history.filter((h) => h.input !== input)].slice(0, HISTORY_LIMIT));
    setCommitted({ input, result: live });
    setInputAndCaret("");
  };

  const handleAction = (action: KeyAction) => {
    switch (action.type) {
      case "insert":
        return insertText(action.text);
      case "backspace":
        return backspace();
      case "clear":
        return clear();
      case "evaluate":
        return evaluate();
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (input === "" && committed && CONTINUES_ANSWER.test(value)) {
      setInputAndCaret(`ans${value}`);
      return;
    }
    setInput(value);
    setShowError(false);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === "=") {
      e.preventDefault();
      evaluate();
    } else if (e.key === "Escape") {
      e.preventDefault();
      clear();
    }
  };

  const copyResult = (type: "text" | "tex", textToCopy: string) => {
    navigator.clipboard.writeText(textToCopy);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 1500);
  };

  const selectHistory = (entry: HistoryEntry) => setInputAndCaret(entry.input);
  const deleteHistoryItem = (id: string) => setHistory(history.filter((h) => h.id !== id));

  // Co pokazać na wyświetlaczu: bieżące wyrażenie albo ostatnio zatwierdzony wynik.
  const showingCommitted = input.trim() === "" && committed !== null;
  const displayTex = showingCommitted
    ? committed.result.inputTex
    : live.status !== "empty"
      ? live.inputTex
      : undefined;
  const displayResult = showingCommitted ? committed.result : live.status === "ok" ? live : null;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <section className="rounded-2xl bg-white p-4 ring-1 ring-black/5 sm:p-6 dark:bg-zinc-900 dark:ring-white/10">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AngleToggle value={angleMode} onChange={setAngleMode} />
            <button
              type="button"
              onClick={() => setShowHelp(!showHelp)}
              title="Wskazówki zapisu"
              className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition ${
                showHelp
                  ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300"
                  : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
              }`}
            >
              <HelpCircle className="h-3.5 w-3.5" />
              <span>Pomoc</span>
            </button>
          </div>
          <span className="hidden text-xs text-zinc-400 sm:block">
            Enter – oblicz · Esc – wyczyść
          </span>
        </div>

        {/* Panel pomocy */}
        {showHelp && (
          <div className="mb-4 rounded-xl border border-indigo-100 bg-indigo-50/50 p-3 text-xs leading-relaxed text-zinc-700 dark:border-indigo-900/40 dark:bg-indigo-950/20 dark:text-zinc-300">
            <div className="font-semibold text-indigo-900 dark:text-indigo-200">
              Przykłady zapisu szkolnego:
            </div>
            <ul className="mt-1.5 grid gap-1 sm:grid-cols-2">
              <li>
                <span className="font-mono font-medium text-indigo-600 dark:text-indigo-400">2,5 + 3/4</span> — przecinek i ułamki zwykłe
              </li>
              <li>
                <span className="font-mono font-medium text-indigo-600 dark:text-indigo-400">log(8; 2)</span> — logarytm o podstawie 2 z 8
              </li>
              <li>
                <span className="font-mono font-medium text-indigo-600 dark:text-indigo-400">tg(45) / ctg(45)</span> — funkcje trygonometryczne
              </li>
              <li>
                <span className="font-mono font-medium text-indigo-600 dark:text-indigo-400">sin(30°)</span> — wymuszenie stopni w trybie RAD
              </li>
              <li>
                <span className="font-mono font-medium text-indigo-600 dark:text-indigo-400">√(16) lub √16</span> — pierwiastek kwadratowy
              </li>
              <li>
                <span className="font-mono font-medium text-indigo-600 dark:text-indigo-400">ans + 5</span> — użycie poprzedniego wyniku
              </li>
            </ul>
          </div>
        )}

        {/* Wyświetlacz */}
        <div className="mb-4 rounded-xl bg-zinc-50 p-4 ring-1 ring-black/5 dark:bg-zinc-950 dark:ring-white/10">
          <input
            ref={inputRef}
            value={input}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            autoFocus
            spellCheck={false}
            autoComplete="off"
            aria-label="Wyrażenie do obliczenia"
            placeholder={committed ? "Wpisz kolejne działanie…" : "Wpisz działanie, np. 1:3 + 0,5"}
            className="w-full bg-transparent font-mono text-xl text-zinc-900 outline-none placeholder:text-zinc-400 dark:text-zinc-100"
          />

          <div className="mt-3 min-h-24 overflow-x-auto">
            {displayTex && (
              <div className="text-base text-zinc-500">
                <MathTex tex={displayTex} />
              </div>
            )}

            {displayResult && (
              <div className="mt-1 flex flex-wrap items-baseline justify-between gap-2">
                <div
                  className={`text-2xl sm:text-3xl ${
                    showingCommitted ? "text-zinc-900 dark:text-white" : "text-zinc-400"
                  }`}
                >
                  <MathTex tex={displayResult.resultTex} />
                </div>

                <div className="flex items-center gap-1.5 self-end">
                  <button
                    type="button"
                    onClick={() => copyResult("text", displayResult.resultText)}
                    title="Kopiuj wynik jako tekst"
                    className="flex items-center gap-1 rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-600 transition hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                  >
                    {copiedType === "text" ? (
                      <>
                        <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-emerald-600 dark:text-emerald-400">Skopiowano!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        <span>Kopiuj</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => copyResult("tex", displayResult.resultTex)}
                    title="Kopiuj jako kod LaTeX"
                    className="flex items-center gap-1 rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-600 transition hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                  >
                    {copiedType === "tex" ? (
                      <>
                        <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-emerald-600 dark:text-emerald-400">LaTeX!</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-3 w-3 text-indigo-500" />
                        <span>LaTeX</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {live.status === "error" && showError && (
              <p role="alert" className="mt-2 text-sm font-medium text-rose-600 dark:text-rose-400">
                {live.message}
              </p>
            )}
          </div>
        </div>

        <Keypad onAction={handleAction} />

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-400">
          <span>
            Przecinek dziesiętny: <code>2,5</code> · dzielenie: <code>:</code> lub <code>/</code>
          </span>
          <span className="font-medium text-zinc-500">SimpleMath v0.1</span>
        </div>
      </section>

      <History
        entries={history}
        onSelect={selectHistory}
        onDelete={deleteHistoryItem}
        onClear={() => setHistory([])}
      />
    </div>
  );
}

function AngleToggle({ value, onChange }: { value: AngleMode; onChange: (v: AngleMode) => void }) {
  const options: { value: AngleMode; label: string; title: string }[] = [
    { value: "deg", label: "DEG", title: "Stopnie" },
    { value: "rad", label: "RAD", title: "Radiany" },
  ];
  return (
    <div
      role="radiogroup"
      aria-label="Jednostka kątów"
      className="inline-flex rounded-lg bg-zinc-100 p-1 dark:bg-zinc-800"
    >
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          title={o.title}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => onChange(o.value)}
          className={`rounded-md px-3 py-1 text-xs font-semibold transition ${
            value === o.value
              ? "bg-white text-indigo-600 shadow-sm dark:bg-zinc-700 dark:text-indigo-300"
              : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
