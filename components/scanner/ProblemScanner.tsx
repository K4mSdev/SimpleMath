"use client";

import { useCallback, useEffect, useRef, useState, type ChangeEvent, type DragEvent } from "react";
import {
  AlertCircle,
  BrainCircuit,
  Calculator,
  Camera,
  Check,
  ChevronDown,
  ChevronUp,
  ClipboardPaste,
  Copy,
  ExternalLink,
  ImageUp,
  Key,
  Lightbulb,
  ListOrdered,
  Loader2,
  PenTool,
  RotateCcw,
  ScanLine,
  Sparkles,
  X,
  Zap,
} from "lucide-react";
import { MathTex } from "@/components/math/MathTex";
import { prepareImageForOcr } from "@/lib/scanner/prepare-image";
import { cleanOcrText } from "@/lib/scanner/ocr-text";
import { solveTaskWithFullProcess } from "@/lib/math-engine/full-process";
import { performStandaloneOcr, type DetectedTaskCandidate } from "@/lib/scanner/standalone-ocr";
import type { GeminiTaskResponse } from "@/app/api/scan/route";

export type ScanTarget = { text: string; kind: "equation" | "expression" | "geometry" | "word_problem" };

interface ProblemScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenInCalculator?: (target: ScanTarget) => void;
  schoolLevel?: "primary" | "secondary" | null;
}

type TabMode = "camera" | "manual";
type Phase = "idle" | "preparing" | "analyzing" | "done" | "error";

const QUICK_TASK_SUGGESTIONS = ["Zadanie 1", "Zadanie 2", "Zadanie 3a", "Zadanie 3b", "Zadanie 4", "Zadanie 5"];

export function ProblemScanner({
  isOpen,
  onClose,
  onOpenInCalculator,
  schoolLevel,
}: ProblemScannerProps) {
  const [tabMode, setTabMode] = useState<TabMode>("camera");
  const [phase, setPhase] = useState<Phase>("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [instruction, setInstruction] = useState("");
  const [manualText, setManualText] = useState("2x^2 - 5x + 2 = 0");
  const [editableFormula, setEditableFormula] = useState("");
  const [solution, setSolution] = useState<GeminiTaskResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [showSteps, setShowSteps] = useState(true);

  // Wybór silnika: "standalone" (lokalny, offline, 100% darmowy) vs "gemini" (chmura AI)
  const [engineMode, setEngineMode] = useState<"standalone" | "gemini">("standalone");
  const [detectedCandidates, setDetectedCandidates] = useState<DetectedTaskCandidate[]>([]);
  const [activeCandidateId, setActiveCandidateId] = useState<string | null>(null);
  const [engineNotice, setEngineNotice] = useState<string | null>(null);

  // Klucz API Gemini (opcjonalny, zapisywany w localStorage)
  const [apiKey, setApiKey] = useState("");
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [tempKey, setTempKey] = useState("");

  const runIdRef = useRef(0);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const currentBlobRef = useRef<Blob | null>(null);
  const currentCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Wczytanie klucza z pamięci podręcznej
  useEffect(() => {
    const saved = localStorage.getItem("simplemath:gemini_api_key");
    if (saved) {
      setApiKey(saved);
      setTempKey(saved);
    }
  }, []);

  const saveApiKey = (keyToSave: string) => {
    const trimmed = keyToSave.trim();
    setApiKey(trimmed);
    if (trimmed) {
      localStorage.setItem("simplemath:gemini_api_key", trimmed);
    } else {
      localStorage.removeItem("simplemath:gemini_api_key");
    }
    setShowKeyModal(false);
  };

  const reset = useCallback(() => {
    runIdRef.current++;
    setPhase("idle");
    setStatusMessage("");
    setPreviewUrl(null);
    setSolution(null);
    setEditableFormula("");
    setError(null);
    setDetectedCandidates([]);
    setActiveCandidateId(null);
    setEngineNotice(null);
    currentBlobRef.current = null;
    currentCanvasRef.current = null;
  }, []);

  // Przetwarzanie obrazu wbudowanym silnikiem (100% lokalny OCR i solver)
  const processWithStandaloneEngine = async (
    canvas: HTMLCanvasElement,
    currentInstruction: string = instruction
  ) => {
    setPhase("analyzing");
    setStatusMessage("Wbudowany silnik OCR odczytuje zadanie ze zdjęcia...");
    setError(null);
    setEngineNotice("Wbudowany Silnik SimpleMath (Offline)");
    try {
      const ocrRes = await performStandaloneOcr(canvas, currentInstruction, (msg) => {
        setStatusMessage(msg);
      });

      setDetectedCandidates(ocrRes.allCandidates);

      // 1. Sprawdzamy wybranego kandydata
      let taskToSolve = ocrRes.selectedCandidate;
      let localResult = taskToSolve
        ? solveTaskWithFullProcess(taskToSolve.cleanMath, currentInstruction || taskToSolve.label)
        : null;

      // 2. Jeśli wybrany kandydat nie zwrócił rozwiązania, sprawdzamy pozostałych kandydatów
      if (!localResult && ocrRes.allCandidates.length > 0) {
        for (const cand of ocrRes.allCandidates) {
          const testRes = solveTaskWithFullProcess(cand.cleanMath, cand.label);
          if (testRes) {
            taskToSolve = cand;
            localResult = testRes;
            break;
          }
        }
      }

      // 3. Jeśli nadal brak rozwiązania, sprawdzamy pełny połączony tekst z całego zdjęcia
      if (!localResult && ocrRes.fullRawText.trim()) {
        const fullRes = solveTaskWithFullProcess(ocrRes.fullRawText, currentInstruction);
        if (fullRes) {
          localResult = fullRes;
          taskToSolve = {
            id: "full-ocr",
            label: "Zadanie ze zdjęcia",
            rawText: ocrRes.fullRawText,
            cleanMath: fullRes.cleanExpression,
            confidence: 85,
          };
        }
      }

      const activeText = taskToSolve?.cleanMath || ocrRes.fullRawText.trim();
      if (taskToSolve) {
        setActiveCandidateId(taskToSolve.id);
      }
      setEditableFormula(activeText);

      if (localResult) {
        setSolution(localResult);
        setPhase("done");
      } else {
        // Jeśli zadanie nie pasuje do żadnego z wbudowanych wzorców,
        // wstawiamy odczytaną treść do pola edycji i pozwalamy użytkownikowi jednym kliknięciem przeliczyć
        setManualText(activeText);
        setTabMode("manual");
        setPhase("idle");
        setError(
          `Odczytano zadanie: "${activeText.slice(0, 90)}${activeText.length > 90 ? "..." : ""}". Sprawdź zapis poniżej i kliknij 'Pokaż cały proces'.`
        );
      }
    } catch (err) {
      console.error("Błąd wbudowanego silnika OCR:", err);
      setError("Wystąpił problem z analizą obrazu. Upewnij się, że zdjęcie jest czytelne lub wpisz treść ręcznie.");
      setPhase("error");
    }
  };

  // Wybór innego kandydata zadania wykrytego na zdjęciu
  const handleSelectCandidate = (cand: DetectedTaskCandidate) => {
    setActiveCandidateId(cand.id);
    const localRes = solveTaskWithFullProcess(cand.cleanMath, cand.label);
    if (localRes) {
      setSolution(localRes);
      setEditableFormula(localRes.cleanExpression);
      setPhase("done");
    } else {
      setManualText(cand.cleanMath);
      setTabMode("manual");
    }
  };

  // Rozwiązanie zadania wpisanego ręcznie (błyskawiczne z pełnym procesem)
  const handleSolveManual = () => {
    if (!manualText.trim()) return;
    setError(null);
    setPhase("analyzing");
    setStatusMessage("Generuję pełny proces rozwiązania...");

    setTimeout(() => {
      const localResult = solveTaskWithFullProcess(manualText, instruction);
      if (localResult) {
        setSolution(localResult);
        setEditableFormula(localResult.cleanExpression);
        setEngineNotice("Wbudowany Silnik SimpleMath (Offline)");
        setPhase("done");
      } else if (engineMode === "gemini") {
        void solveWithAiBackend(undefined, manualText, instruction);
      } else {
        setError("Nie rozpoznano typu zadania. Upewnij się, że wpisano poprawne równanie, ułamek lub geometrię.");
        setPhase("error");
      }
    }, 150);
  };

  // Wywołanie backendu AI z natychmiastowym awaryjnym przejściem na silnik lokalny
  const solveWithAiBackend = async (
    base64Image?: string,
    rawTextTask?: string,
    taskInstruction?: string
  ) => {
    setPhase("analyzing");
    setStatusMessage("Chmura AI analizuje zadanie i tworzy pełny proces rozwiązania...");
    setError(null);

    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(apiKey ? { "x-gemini-key": apiKey } : {}),
        },
        body: JSON.stringify({
          image: base64Image,
          textTask: rawTextTask,
          instruction: taskInstruction,
          apiKey: apiKey || undefined,
          schoolLevel,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (data.status === "fallback_to_local") {
        if (currentCanvasRef.current) {
          setEngineNotice("Chmura AI była niedostępna. Uruchomiono Wbudowany Silnik SimpleMath.");
          await processWithStandaloneEngine(currentCanvasRef.current, taskInstruction);
          return;
        }
      }

      if (res.status === 401 || data.status === "need_key") {
        if (currentCanvasRef.current) {
          setEngineNotice("Brak klucza API — zadanie rozwiązane przez Wbudowany Silnik SimpleMath.");
          await processWithStandaloneEngine(currentCanvasRef.current, taskInstruction);
          return;
        }
        if (rawTextTask) {
          const fallback = solveTaskWithFullProcess(rawTextTask, taskInstruction);
          if (fallback) {
            setSolution(fallback);
            setEditableFormula(fallback.cleanExpression);
            setEngineNotice("Wbudowany Silnik SimpleMath (Offline)");
            setPhase("done");
            return;
          }
        }
        setShowKeyModal(true);
        setError("Wklej darmowy klucz Google Gemini API (poniżej) lub przełącz na Wbudowany Silnik SimpleMath.");
        setPhase("error");
        return;
      }

      if (!res.ok || data.status !== "ok" || !data.data) {
        throw new Error(data.message || `Błąd serwera (${res.status})`);
      }

      const result = data.data as GeminiTaskResponse;
      setSolution(result);
      setEditableFormula(result.cleanExpression);
      setEngineNotice(data.engine === "standalone" ? "Wbudowany Silnik SimpleMath" : "Google Gemini AI (Chmura)");
      setPhase("done");
    } catch (err: unknown) {
      console.warn("Błąd analizy AI, uruchamiam wbudowany silnik:", err);
      if (currentCanvasRef.current) {
        setEngineNotice("Chmura AI była niedostępna. Uruchomiono Wbudowany Silnik SimpleMath.");
        await processWithStandaloneEngine(currentCanvasRef.current, taskInstruction);
        return;
      }
      if (rawTextTask) {
        const fallback = solveTaskWithFullProcess(rawTextTask, taskInstruction);
        if (fallback) {
          setSolution(fallback);
          setEditableFormula(fallback.cleanExpression);
          setEngineNotice("Wbudowany Silnik SimpleMath (Offline)");
          setPhase("done");
          return;
        }
      }
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      setPhase("error");
    }
  };

  // Przetworzenie zdjęcia z aparatu / pliku / schowka
  const processImageBlob = useCallback(
    async (blob: Blob, currentInstruction: string = instruction) => {
      const runId = ++runIdRef.current;
      currentBlobRef.current = blob;
      setError(null);
      setSolution(null);
      setPhase("preparing");
      setStatusMessage("Przygotowuję zdjęcie do analizy...");

      try {
        const { canvas, previewUrl: preview } = await prepareImageForOcr(blob);
        if (runId !== runIdRef.current) return;
        currentCanvasRef.current = canvas;
        setPreviewUrl(preview);

        if (engineMode === "standalone") {
          await processWithStandaloneEngine(canvas, currentInstruction);
        } else {
          try {
            await solveWithAiBackend(preview, undefined, currentInstruction);
          } catch {
            await processWithStandaloneEngine(canvas, currentInstruction);
          }
        }
      } catch (e: unknown) {
        if (runId !== runIdRef.current) return;
        console.error(e);
        setError("Wystąpił problem z wczytaniem zdjęcia. Spróbuj wybrać inne ujęcie.");
        setPhase("error");
      }
    },
    [apiKey, engineMode, instruction, schoolLevel]
  );

  const onFileChosen = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) void processImageBlob(file);
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const file = Array.from(e.dataTransfer.files).find((f) => f.type.startsWith("image/"));
    if (file) void processImageBlob(file);
  };

  const pasteFromClipboard = async () => {
    try {
      const items = await navigator.clipboard.read();
      for (const item of items) {
        const type = item.types.find((t) => t.startsWith("image/"));
        if (type) {
          await processImageBlob(await item.getType(type));
          return;
        }
      }
      setError("W schowku nie znaleziono obrazu. Zrób zrzut ekranu i kliknij ponownie.");
      setPhase("error");
    } catch {
      setError("Przeglądarka zablokowała dostęp do schowka. Użyj przycisku wyboru pliku.");
      setPhase("error");
    }
  };

  // Ponowne przeliczenie po edycji formuły przez użytkownika
  const handleRecalculateFormula = () => {
    if (!editableFormula.trim()) return;
    const recalculated = solveTaskWithFullProcess(editableFormula, instruction);
    if (recalculated) {
      setSolution(recalculated);
    } else {
      void solveWithAiBackend(undefined, editableFormula, instruction);
    }
  };

  // Obsługa Ctrl/Cmd + V
  useEffect(() => {
    if (!isOpen) return;
    const onPaste = (e: ClipboardEvent) => {
      const file = Array.from(e.clipboardData?.files ?? []).find((f) =>
        f.type.startsWith("image/")
      );
      if (file) {
        e.preventDefault();
        void processImageBlob(file);
      }
    };
    document.addEventListener("paste", onPaste);
    return () => document.removeEventListener("paste", onPaste);
  }, [isOpen, processImageBlob]);

  // Klawisz Esc
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const busy = phase === "preparing" || phase === "analyzing";

  const copyFullSolution = async () => {
    if (!solution) return;
    const lines = [
      `=== ${solution.detectedTaskTitle} ===`,
      `Zadanie: ${solution.cleanExpression}`,
      "",
      "--- DANE I WZORY ---",
      ...(solution.givenData || []).map((d) => `• ${d}`),
      ...(solution.appliedFormulas || []).map((f) => `• Wzór: ${f}`),
      "",
      "--- PEŁNY PROCES ROZWIĄZANIA ---",
      ...solution.steps.map(
        (st, idx) => `${idx + 1}. ${st.title}\n   ${st.explanation}${st.formulaTex ? `\n   ${st.formulaTex}` : ""}`
      ),
      "",
      `--- WYNIK KOŃCOWY ---`,
      `Odpowiedź: ${solution.finalAnswerText}`,
      solution.verification ? `Sprawdzenie: ${solution.verification}` : "",
    ].filter(Boolean);

    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Skaner zadań matematycznych z pełnym procesem"
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[94dvh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl ring-1 ring-black/10 sm:rounded-2xl dark:bg-zinc-900 dark:ring-white/10"
        onClick={(e) => e.stopPropagation()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
      >
        {/* Nagłówek okna */}
        <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-3.5 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm shadow-indigo-500/30">
              <ScanLine className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-zinc-900 dark:text-white">
                  Skaner Zadań & Pełny Proces CKE
                </h2>
                <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                  <BrainCircuit className="h-3 w-3" />
                  Krok po kroku
                </span>
              </div>
              <p className="text-xs text-zinc-500">
                Pokazuje cały proces obliczeniowy, dane, wzory i sprawdzenie
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setShowKeyModal((prev) => !prev)}
              title="Konfiguracja darmowego klucza Gemini AI"
              className={`flex h-9 w-9 items-center justify-center rounded-lg transition ${
                apiKey
                  ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50"
                  : "text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
              }`}
            >
              <Key className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Zamknij"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Zakładki: Zdjęcie / Aparat vs Wpisz treść */}
        <div className="flex border-b border-zinc-100 bg-zinc-50/50 px-5 pt-2 dark:border-zinc-800 dark:bg-zinc-950/40">
          <button
            type="button"
            onClick={() => setTabMode("camera")}
            className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-bold transition ${
              tabMode === "camera"
                ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                : "border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
            }`}
          >
            <Camera className="h-4 w-4" />
            <span>Aparat / Zdjęcie / Zrzut</span>
          </button>
          <button
            type="button"
            onClick={() => setTabMode("manual")}
            className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-bold transition ${
              tabMode === "manual"
                ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                : "border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
            }`}
          >
            <PenTool className="h-4 w-4" />
            <span>Wpisz treść zadania</span>
          </button>
        </div>

        <div className="space-y-4 overflow-y-auto overscroll-contain p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          {/* Przełącznik silnika: Wbudowany (Offline) vs Gemini AI */}
          <div className="flex items-center gap-1.5 rounded-2xl bg-zinc-100 p-1.5 dark:bg-zinc-800/80">
            <button
              type="button"
              onClick={() => {
                setEngineMode("standalone");
                setEngineNotice(null);
              }}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 px-3 text-xs font-bold transition ${
                engineMode === "standalone"
                  ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-900 dark:text-white"
                  : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
              }`}
            >
              <Zap className="h-4 w-4 text-amber-500" />
              <span>Silnik Wbudowany (Offline & 100% Darmowy)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setEngineMode("gemini");
                setEngineNotice(null);
                if (!apiKey) setShowKeyModal(true);
              }}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 px-3 text-xs font-bold transition ${
                engineMode === "gemini"
                  ? "bg-white text-indigo-600 shadow-sm dark:bg-zinc-900 dark:text-indigo-400"
                  : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
              }`}
            >
              <Sparkles className="h-4 w-4 text-indigo-500" />
              <span>Chmura Gemini AI</span>
            </button>
          </div>

          {/* Panel konfiguracji darmowego klucza API */}
          {showKeyModal && (
            <div className="rounded-2xl border border-indigo-200 bg-indigo-50/80 p-4 text-xs dark:border-indigo-900/60 dark:bg-indigo-950/40">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="font-bold text-indigo-950 dark:text-indigo-200">
                    Klucz Google Gemini AI (100% bezpłatny)
                  </span>
                  <p className="mt-1 leading-relaxed text-zinc-600 dark:text-zinc-400">
                    Pozwala bezbłędnie czytać zdjęcia z kartki, rysunki geometryczne i pismo odręczne. Pobierzesz go bezpłatnie w 10 sekund (bez podawania karty kredytowej) na stronie Google AI Studio:
                  </p>
                </div>
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noreferrer"
                  className="flex shrink-0 items-center gap-1 rounded-xl bg-indigo-600 px-3 py-1.5 font-semibold text-white shadow-sm hover:bg-indigo-500"
                >
                  <span>Pobierz klucz</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>

              <div className="mt-3 flex gap-2">
                <input
                  type="password"
                  value={tempKey}
                  onChange={(e) => setTempKey(e.target.value)}
                  placeholder="Wklej klucz API (np. AIzaSy...)"
                  className="flex-1 rounded-xl bg-white px-3 py-2 text-xs font-mono ring-1 ring-black/5 outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-zinc-900 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => saveApiKey(tempKey)}
                  className="rounded-xl bg-zinc-900 px-4 py-2 font-semibold text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900"
                >
                  Zapisz
                </button>
              </div>
            </div>
          )}

          {/* Sekcja: Wskaż które zadanie zrobić */}
          <div className="rounded-2xl bg-zinc-50 p-4 ring-1 ring-black/5 dark:bg-zinc-950/60 dark:ring-white/10">
            <label
              htmlFor="task-instruction-input"
              className="flex items-center justify-between text-xs font-bold text-zinc-700 dark:text-zinc-300"
            >
              <span>Które zadanie rozwiązać z kartki / podręcznika?</span>
              <span className="font-normal text-zinc-400">Opcjonalnie</span>
            </label>

            {/* Szybkie sugestie podpowiedzi */}
            <div className="mt-2 flex flex-wrap gap-1.5">
              {QUICK_TASK_SUGGESTIONS.map((sug) => (
                <button
                  key={sug}
                  type="button"
                  onClick={() => setInstruction(sug)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                    instruction === sug
                      ? "bg-indigo-600 text-white"
                      : "bg-white text-zinc-600 ring-1 ring-black/5 hover:bg-zinc-100 dark:bg-zinc-900 dark:text-zinc-300 dark:ring-white/10"
                  }`}
                >
                  {sug}
                </button>
              ))}
            </div>

            <input
              id="task-instruction-input"
              type="text"
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              placeholder="np. Zadanie 3 podpunkt b, oblicz pole trójkąta, to w czerwonej ramce..."
              className="mt-2 w-full rounded-xl bg-white px-3.5 py-2.5 text-sm font-medium text-zinc-900 ring-1 ring-black/5 outline-none placeholder:text-zinc-400 focus:ring-2 focus:ring-indigo-500 dark:bg-zinc-900 dark:text-white dark:ring-white/10"
            />
          </div>

          {/* Tryb 1: Aparat / Zdjęcie */}
          {tabMode === "camera" && (
            <div className="space-y-4">
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={onFileChosen}
              />
              <input
                ref={galleryInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onFileChosen}
              />

              <div
                className={`grid gap-2.5 rounded-2xl border-2 border-dashed p-3.5 transition sm:grid-cols-3 ${
                  dragOver
                    ? "border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/30"
                    : "border-zinc-200 dark:border-zinc-700"
                }`}
              >
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => cameraInputRef.current?.click()}
                  className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition active:scale-[0.98] hover:bg-indigo-500 disabled:opacity-50"
                >
                  <Camera className="h-5 w-5" />
                  <span>Zrób zdjęcie</span>
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => galleryInputRef.current?.click()}
                  className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-zinc-100 px-4 py-3 text-sm font-semibold text-zinc-800 transition active:scale-[0.98] hover:bg-zinc-200 disabled:opacity-50 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
                >
                  <ImageUp className="h-5 w-5" />
                  <span>Zrzut / Galeria</span>
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={pasteFromClipboard}
                  className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-zinc-100 px-4 py-3 text-sm font-semibold text-zinc-800 transition active:scale-[0.98] hover:bg-zinc-200 disabled:opacity-50 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
                >
                  <ClipboardPaste className="h-5 w-5" />
                  <span>Wklej ze schowka</span>
                </button>
              </div>

              {previewUrl && (
                <div className="relative overflow-hidden rounded-2xl bg-zinc-100 ring-1 ring-black/5 dark:bg-zinc-800">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewUrl}
                    alt="Podgląd zadania"
                    className="max-h-56 w-full object-contain"
                  />
                  {currentBlobRef.current && !busy && (
                    <button
                      type="button"
                      onClick={() => void processImageBlob(currentBlobRef.current!, instruction)}
                      className="absolute bottom-2 right-2 flex items-center gap-1.5 rounded-xl bg-white/95 px-3 py-1.5 text-xs font-semibold text-zinc-800 shadow-md backdrop-blur-sm hover:bg-white dark:bg-zinc-900/95 dark:text-white"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      <span>Rozwiąż ponownie z opisem</span>
                    </button>
                  )}
                </div>
              )}

              {/* Wykryte zadania na stronie (gdy OCR rozpozna kilka zadań) */}
              {detectedCandidates.length > 1 && (
                <div className="rounded-2xl border border-indigo-200/80 bg-indigo-50/60 p-3.5 dark:border-indigo-900/50 dark:bg-indigo-950/30">
                  <div className="flex items-center justify-between text-xs font-bold text-indigo-950 dark:text-indigo-200">
                    <span>Wykryte zadania na zdjęciu ({detectedCandidates.length}):</span>
                    <span className="text-[11px] font-normal text-indigo-600 dark:text-indigo-400">
                      Kliknij, aby wybrać inne
                    </span>
                  </div>
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {detectedCandidates.map((cand) => (
                      <button
                        key={cand.id}
                        type="button"
                        onClick={() => handleSelectCandidate(cand)}
                        className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                          activeCandidateId === cand.id
                            ? "bg-indigo-600 text-white shadow-sm"
                            : "bg-white text-zinc-700 ring-1 ring-black/5 hover:bg-zinc-100 dark:bg-zinc-900 dark:text-zinc-200 dark:ring-white/10"
                        }`}
                      >
                        <span>{cand.label}</span>
                        <span className="font-mono text-[11px] opacity-75">
                          ({cand.cleanMath.slice(0, 15)})
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tryb 2: Wpisz treść zadania */}
          {tabMode === "manual" && (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  Wpisz treść zadania, równanie lub formułę:
                </label>
                <textarea
                  rows={3}
                  value={manualText}
                  onChange={(e) => setManualText(e.target.value)}
                  placeholder="np. 2x^2 - 5x + 2 = 0 lub 3/4 + 2/5 lub Oblicz pole trójkąta a=6, h=5"
                  className="mt-1.5 w-full resize-none rounded-xl bg-zinc-50 p-3.5 font-mono text-base font-semibold text-zinc-900 ring-1 ring-black/5 outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-zinc-950 dark:text-white dark:ring-white/10"
                />
              </div>

              <button
                type="button"
                disabled={busy || !manualText.trim()}
                onClick={handleSolveManual}
                className="flex w-full min-h-12 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-md transition active:scale-[0.98] hover:bg-indigo-500 disabled:opacity-50"
              >
                <Sparkles className="h-5 w-5" />
                <span>Pokaż cały proces rozwiązania krok po kroku</span>
              </button>
            </div>
          )}

          {/* Animacja ładowania i stanu */}
          {busy && (
            <div className="flex items-center justify-center gap-3 rounded-2xl bg-indigo-50/70 p-5 text-sm font-semibold text-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-200">
              <Loader2 className="h-5 w-5 animate-spin text-indigo-600 dark:text-indigo-400" />
              <span>{statusMessage}</span>
            </div>
          )}

          {/* Komunikat błędu */}
          {error && (
            <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50/80 p-4 text-xs text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
              <div>
                <span className="font-bold">Informacja: </span>
                {error}
              </div>
            </div>
          )}

          {/* WYNIK: PEŁNY PROCES ROZWIĄZYWANIA ZADANIA */}
          {phase === "done" && solution && (
            <div className="space-y-4 pt-2">
              {/* Belka z tytułem zadania i silnikiem */}
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-indigo-50 px-4 py-2.5 text-xs font-bold text-indigo-900 dark:bg-indigo-950/60 dark:text-indigo-300">
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-amber-500" />
                  <span>{solution.detectedTaskTitle}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {engineNotice && (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300">
                      {engineNotice}
                    </span>
                  )}
                  <span className="rounded-full bg-white px-2.5 py-0.5 text-[10px] font-semibold text-zinc-700 shadow-sm dark:bg-zinc-900 dark:text-zinc-300">
                    Zgodne z CKE
                  </span>
                </div>
              </div>

              {/* Karta 1: Dane i założenia (jeśli są) */}
              {solution.givenData && solution.givenData.length > 0 && (
                <div className="rounded-2xl bg-zinc-50 p-4 ring-1 ring-black/5 dark:bg-zinc-950/60 dark:ring-white/10">
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                    1. Dane i założenia:
                  </span>
                  <ul className="mt-2 space-y-1 text-xs text-zinc-700 dark:text-zinc-300">
                    {solution.givenData.map((d, i) => (
                      <li key={i} className="flex items-center gap-1.5 font-medium">
                        <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Karta 2: Zastosowane wzory (jeśli są) */}
              {solution.appliedFormulas && solution.appliedFormulas.length > 0 && (
                <div className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-4 text-xs dark:border-indigo-900/40 dark:bg-indigo-950/20">
                  <span className="font-bold uppercase tracking-wider text-indigo-800 dark:text-indigo-300">
                    2. Zastosowane wzory z tablic CKE:
                  </span>
                  <div className="mt-2 space-y-1.5 font-mono text-zinc-900 dark:text-zinc-100">
                    {solution.appliedFormulas.map((f, i) => (
                      <div key={i} className="rounded-lg bg-white/80 p-2 text-center ring-1 ring-black/5 dark:bg-zinc-900/60 dark:ring-white/10">
                        <MathTex tex={f} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Karta 3: Cały proces obliczeniowy krok po kroku */}
              <div className="rounded-2xl bg-zinc-50 p-4 ring-1 ring-black/5 dark:bg-zinc-950/60 dark:ring-white/10">
                <button
                  type="button"
                  onClick={() => setShowSteps((prev) => !prev)}
                  className="flex w-full items-center justify-between text-xs font-bold text-zinc-800 dark:text-zinc-200"
                >
                  <div className="flex items-center gap-2">
                    <ListOrdered className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    <span>3. Pełny proces rozwiązania ({solution.steps.length} etapów):</span>
                  </div>
                  {showSteps ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>

                {showSteps && (
                  <div className="mt-4 space-y-3.5 border-t border-zinc-200/60 pt-3 dark:border-zinc-800">
                    {solution.steps.map((st, idx) => (
                      <div
                        key={idx}
                        className="rounded-xl border border-zinc-200/80 bg-white p-3.5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
                      >
                        <div className="flex items-center gap-2">
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white">
                            {idx + 1}
                          </span>
                          <span className="text-xs font-bold text-zinc-900 dark:text-white">
                            {st.title}
                          </span>
                        </div>

                        <p className="mt-1.5 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                          {st.explanation}
                        </p>

                        {st.formulaTex && (
                          <div className="mt-2 rounded-lg bg-zinc-50 p-2 text-center text-sm font-bold text-zinc-900 dark:bg-zinc-950 dark:text-white">
                            <MathTex tex={st.formulaTex} />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Karta 4: Wynik końcowy */}
              <div className="rounded-2xl border-2 border-emerald-500/50 bg-emerald-50/60 p-5 text-center dark:bg-emerald-950/30">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                  Odpowiedź końcowa:
                </span>
                <div className="mt-2 text-2xl font-black text-zinc-900 sm:text-3xl dark:text-white">
                  <MathTex tex={solution.finalAnswerTex || solution.finalAnswerText} />
                </div>
                <p className="mt-2 text-xs font-semibold text-emerald-900 dark:text-emerald-200">
                  {solution.finalAnswerText}
                </p>
              </div>

              {/* Karta 5: Sprawdzenie poprawności (jeśli jest) */}
              {solution.verification && (
                <div className="rounded-xl border border-zinc-200 bg-white p-3 text-xs text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
                  <span className="font-bold text-zinc-800 dark:text-zinc-200">Weryfikacja / sprawdzenie: </span>
                  {solution.verification}
                </div>
              )}

              {/* Pole z odczytanym wzorem (możliwość ręcznej poprawki i ponownego przeliczenia) */}
              <div className="rounded-xl bg-zinc-50 p-3 ring-1 ring-black/5 dark:bg-zinc-950/50 dark:ring-white/10">
                <label className="text-[11px] font-bold text-zinc-500">
                  Wzór zadania (możesz poprawić i kliknąć Enter aby przeliczyć):
                </label>
                <div className="mt-1 flex gap-2">
                  <input
                    type="text"
                    value={editableFormula}
                    onChange={(e) => setEditableFormula(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleRecalculateFormula()}
                    className="flex-1 rounded-lg bg-white px-3 py-1.5 font-mono text-sm font-bold text-zinc-900 ring-1 ring-black/5 outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-zinc-900 dark:text-white dark:ring-white/10"
                  />
                  <button
                    type="button"
                    onClick={handleRecalculateFormula}
                    className="rounded-lg bg-zinc-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-zinc-700 dark:bg-zinc-700 dark:hover:bg-zinc-600"
                  >
                    Przelicz
                  </button>
                </div>
              </div>

              {/* Przyciski akcji */}
              <div className="flex flex-wrap gap-2 pt-1">
                {onOpenInCalculator && (
                  <button
                    type="button"
                    onClick={() =>
                      onOpenInCalculator({
                        text: editableFormula,
                        kind: solution.taskType,
                      })
                    }
                    className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition active:scale-[0.98] hover:bg-indigo-500"
                  >
                    <Calculator className="h-4 w-4" />
                    <span>Otwórz w kalkulatorze</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={copyFullSolution}
                  className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-zinc-100 px-4 py-2.5 text-sm font-semibold text-zinc-800 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
                >
                  {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                  <span>{copied ? "Skopiowano cały proces" : "Kopiuj proces"}</span>
                </button>

                <button
                  type="button"
                  onClick={reset}
                  className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-zinc-100 px-4 py-2.5 text-sm font-semibold text-zinc-800 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>Nowe zadanie</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
