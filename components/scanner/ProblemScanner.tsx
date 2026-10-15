"use client";

import { useCallback, useEffect, useRef, useState, type ChangeEvent, type DragEvent } from "react";
import {
  AlertCircle,
  BrainCircuit,
  Camera,
  Check,
  ChevronDown,
  ChevronUp,
  ClipboardPaste,
  Copy,
  ExternalLink,
  ImageUp,
  Key,
  Loader2,
  RotateCcw,
  ScanLine,
  Sparkles,
  X,
} from "lucide-react";
import { MathTex } from "@/components/math/MathTex";
import { prepareImageForOcr } from "@/lib/scanner/prepare-image";
import { classifyScan, cleanOcrText, type ScanKind } from "@/lib/scanner/ocr-text";

export type ScanTarget = { text: string; kind: ScanKind };

interface ProblemScannerProps {
  isOpen: boolean;
  onClose: () => void;
  /** Gdy podane, pozwala przejść ze skanu do odpowiedniego kalkulatora */
  onOpenInCalculator?: (target: ScanTarget) => void;
  schoolLevel?: "primary" | "secondary" | null;
}

interface AiScanResponse {
  detectedTaskTitle: string;
  cleanExpression: string;
  taskType: "equation" | "expression" | "geometry" | "word_problem";
  steps: string[];
  finalAnswerTex: string;
  finalAnswerText: string;
}

type Phase = "idle" | "preparing" | "scanning_ai" | "scanning_local" | "done" | "error";

export function ProblemScanner({
  isOpen,
  onClose,
  onOpenInCalculator,
  schoolLevel,
}: ProblemScannerProps) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [instruction, setInstruction] = useState("");
  const [text, setText] = useState("");
  const [aiResult, setAiResult] = useState<AiScanResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [showSteps, setShowSteps] = useState(true);

  // Klucz API Gemini (zapisywany w localStorage)
  const [apiKey, setApiKey] = useState("");
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [tempKey, setTempKey] = useState("");

  const runIdRef = useRef(0);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const currentBlobRef = useRef<Blob | null>(null);

  // Wczytanie zapisanego klucza z localStorage
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
    setShowKeyInput(false);
  };

  const reset = useCallback(() => {
    runIdRef.current++;
    setPhase("idle");
    setPreviewUrl(null);
    setText("");
    setAiResult(null);
    setError(null);
    currentBlobRef.current = null;
  }, []);

  // Skanowanie za pomocą Gemini Multimodal Vision API
  const scanWithAi = useCallback(
    async (base64Image: string, customInstruction: string) => {
      setPhase("scanning_ai");
      setError(null);

      const res = await fetch("/api/scan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(apiKey ? { "x-gemini-key": apiKey } : {}),
        },
        body: JSON.stringify({
          image: base64Image,
          instruction: customInstruction,
          apiKey: apiKey || undefined,
          schoolLevel,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 401 || data.status === "need_key") {
        setShowKeyInput(true);
        setError("Wklej darmowy klucz Google Gemini API poniżej, aby bezbłędnie czytać zadania ze zdjęć.");
        setPhase("error");
        return;
      }

      if (!res.ok || data.status !== "ok" || !data.data) {
        throw new Error(data.message || `Błąd serwera (${res.status})`);
      }

      const result = data.data as AiScanResponse;
      setAiResult(result);
      setText(result.cleanExpression);
      setPhase("done");
    },
    [apiKey, schoolLevel]
  );

  // Lokalny fallback (Tesseract.js)
  const scanWithLocalOcr = useCallback(
    async (canvas: HTMLCanvasElement) => {
      setPhase("scanning_local");
      try {
        const { createWorker } = await import("tesseract.js");
        const worker = await createWorker("eng", 1);
        const { data } = await worker.recognize(canvas);
        await worker.terminate();

        const cleaned = cleanOcrText(data.text);
        if (!cleaned || data.confidence < 35) {
          setError(
            "Lokalny silnik OCR miał trudności z odczytaniem wzoru ze zdjęcia. Użyj bezpłatnego skanera AI (Gemini) lub wpisz działanie ręcznie."
          );
          setPhase("error");
          return;
        }

        setText(cleaned);
        setPhase("done");
      } catch (err: unknown) {
        console.error("Local OCR error:", err);
        setError("Nie udało się rozpoznać tekstu lokalnie. Skorzystaj ze skanera AI.");
        setPhase("error");
      }
    },
    []
  );

  const processBlob = useCallback(
    async (blob: Blob, currentInstruction: string = instruction) => {
      const runId = ++runIdRef.current;
      currentBlobRef.current = blob;
      setError(null);
      setText("");
      setAiResult(null);

      try {
        setPhase("preparing");
        const { canvas, previewUrl: preview } = await prepareImageForOcr(blob);
        if (runId !== runIdRef.current) return;
        setPreviewUrl(preview);

        // Próbujemy skanowania AI
        try {
          await scanWithAi(preview, currentInstruction);
        } catch (aiErr: unknown) {
          console.warn("AI scan failed, attempting local OCR fallback:", aiErr);
          // Jeśli brak klucza to nie uruchamiamy bez sensu tesseract jeśli użytkownik chce podać klucz
          const errMsg = aiErr instanceof Error ? aiErr.message : String(aiErr);
          if (errMsg.toLowerCase().includes("klucz") || errMsg.toLowerCase().includes("key")) {
            setShowKeyInput(true);
            setError(errMsg);
            setPhase("error");
          } else {
            // Spróbuj lokalnego OCR
            await scanWithLocalOcr(canvas);
          }
        }
      } catch (e: unknown) {
        if (runId !== runIdRef.current) return;
        console.error(e);
        setError("Wystąpił błąd podczas przygotowania obrazu. Spróbuj wybrać inne zdjęcie.");
        setPhase("error");
      }
    },
    [instruction, scanWithAi, scanWithLocalOcr]
  );

  const onFileChosen = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) void processBlob(file);
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const file = Array.from(e.dataTransfer.files).find((f) => f.type.startsWith("image/"));
    if (file) void processBlob(file);
  };

  const pasteFromClipboard = async () => {
    try {
      const items = await navigator.clipboard.read();
      for (const item of items) {
        const type = item.types.find((t) => t.startsWith("image/"));
        if (type) {
          await processBlob(await item.getType(type));
          return;
        }
      }
      setError("W schowku nie ma obrazu. Skopiuj zrzut ekranu lub zdjęcie i kliknij ponownie.");
      setPhase("error");
    } catch {
      setError("Przeglądarka zablokowała dostęp do schowka. Użyj przycisku wyboru pliku.");
      setPhase("error");
    }
  };

  // Ponowne przeskanowanie obecnego zdjęcia z nową instrukcją
  const rescanWithInstruction = () => {
    if (currentBlobRef.current) {
      void processBlob(currentBlobRef.current, instruction);
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
        void processBlob(file);
      }
    };
    document.addEventListener("paste", onPaste);
    return () => document.removeEventListener("paste", onPaste);
  }, [isOpen, processBlob]);

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

  const busy = phase === "preparing" || phase === "scanning_ai" || phase === "scanning_local";
  const kind: ScanKind = aiResult
    ? aiResult.taskType === "equation"
      ? "equation"
      : "expression"
    : classifyScan(text);

  const copyResult = async () => {
    const toCopy = aiResult
      ? `${aiResult.detectedTaskTitle}\n${aiResult.cleanExpression}\nWynik: ${aiResult.finalAnswerText}\n\nKroki:\n${aiResult.steps.join("\n")}`
      : text;
    try {
      await navigator.clipboard.writeText(toCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Inteligentny skaner zadań matematycznych"
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[92dvh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl ring-1 ring-black/10 sm:rounded-2xl dark:bg-zinc-900 dark:ring-white/10"
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
                  Inteligentny Skaner Zadań
                </h2>
                <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                  <BrainCircuit className="h-3 w-3" />
                  AI Gemini Vision
                </span>
              </div>
              <p className="text-xs text-zinc-500">
                Aparat, zrzuty ekranu, pismo odręczne i zadania z podręcznika
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setShowKeyInput((prev) => !prev)}
              title="Ustawienia klucza API Gemini"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
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

        <div className="space-y-4 overflow-y-auto overscroll-contain p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          {/* Panel konfiguracji darmowego klucza Gemini */}
          {showKeyInput && (
            <div className="rounded-2xl border border-indigo-200 bg-indigo-50/70 p-4 text-xs dark:border-indigo-900/50 dark:bg-indigo-950/30">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="font-bold text-indigo-950 dark:text-indigo-200">
                    Klucz Google Gemini AI (100% darmowy)
                  </span>
                  <p className="mt-1 text-zinc-600 dark:text-zinc-400">
                    Służy do bezbłędnego odczytywania skomplikowanych ułamków, pierwiastków, rysunków i pisma odręcznego. Pobierzesz go bezpłatnie w 10 sekund (bez podawania karty) na stronie Google AI Studio:
                  </p>
                </div>
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noreferrer"
                  className="flex shrink-0 items-center gap-1 rounded-lg bg-indigo-600 px-2.5 py-1.5 font-semibold text-white shadow-sm hover:bg-indigo-500"
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
                  placeholder="Wklej klucz API (zaczyna się od AIza...)"
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

          {/* Pole opisu: Które zadanie zrobić? */}
          <div className="rounded-2xl bg-zinc-50 p-3.5 ring-1 ring-black/5 dark:bg-zinc-950/60 dark:ring-white/10">
            <label
              htmlFor="scan-instruction"
              className="flex items-center justify-between text-xs font-bold text-zinc-700 dark:text-zinc-300"
            >
              <span>Które zadanie rozwiązać z kartki / zdjęcia?</span>
              <span className="font-normal text-zinc-400">Opcjonalnie</span>
            </label>
            <input
              id="scan-instruction"
              type="text"
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              placeholder="np. Zadanie 3 podpunkt b, oblicz pole trójkąta, to w ramce..."
              className="mt-2 w-full rounded-xl bg-white px-3 py-2.5 text-sm font-medium text-zinc-900 ring-1 ring-black/5 outline-none placeholder:text-zinc-400 focus:ring-2 focus:ring-indigo-500 dark:bg-zinc-900 dark:text-white dark:ring-white/10"
            />
            <p className="mt-1 text-[11px] text-zinc-500">
              Gdy na zdjęciu jest cała strona z wieloma zadaniami, sztuczna inteligencja wybierze dokładnie to, które wskażesz.
            </p>
          </div>

          {/* Ukryte inputy plikowe (aparat z capture na iPhone) */}
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

          {/* Przyciski wyboru źródła obrazu */}
          <div
            className={`grid gap-2.5 rounded-2xl border-2 border-dashed p-3 transition sm:grid-cols-3 ${
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
              <span>Aparat</span>
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => galleryInputRef.current?.click()}
              className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-zinc-100 px-4 py-3 text-sm font-semibold text-zinc-800 transition active:scale-[0.98] hover:bg-zinc-200 disabled:opacity-50 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
            >
              <ImageUp className="h-5 w-5" />
              <span>Zrzut / Plik</span>
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={pasteFromClipboard}
              className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-zinc-100 px-4 py-3 text-sm font-semibold text-zinc-800 transition active:scale-[0.98] hover:bg-zinc-200 disabled:opacity-50 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
            >
              <ClipboardPaste className="h-5 w-5" />
              <span>Schowek</span>
            </button>
          </div>

          {/* Podgląd obrazu */}
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
                  onClick={rescanWithInstruction}
                  className="absolute bottom-2 right-2 flex items-center gap-1.5 rounded-xl bg-white/90 px-3 py-1.5 text-xs font-semibold text-zinc-800 shadow-md backdrop-blur-sm hover:bg-white dark:bg-zinc-900/90 dark:text-white"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Skanuj ponownie z opisem</span>
                </button>
              )}
            </div>
          )}

          {/* Stan ładowania / analizy */}
          {busy && (
            <div className="flex items-center justify-center gap-2.5 rounded-2xl bg-indigo-50/70 p-4 text-sm font-medium text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-200">
              <Loader2 className="h-5 w-5 animate-spin text-indigo-600 dark:text-indigo-400" />
              <span>
                {phase === "preparing" && "Optymalizuję zdjęcie..."}
                {phase === "scanning_ai" && "Sztuczna inteligencja analizuje treść i wzory zadania..."}
                {phase === "scanning_local" && "Trwa lokalne rozpoznawanie tekstu..."}
              </span>
            </div>
          )}

          {/* Komunikat błędu */}
          {error && (
            <div className="flex items-start gap-2.5 rounded-2xl border border-rose-200 bg-rose-50/80 p-4 text-xs text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
              <div>
                <span className="font-bold">Uwaga: </span>
                {error}
              </div>
            </div>
          )}

          {/* Wynik rozpoznania ze sztucznej inteligencji AI */}
          {phase === "done" && aiResult && (
            <div className="space-y-4">
              {/* Belka z wykrytym tytułem zadania */}
              <div className="flex items-center justify-between rounded-xl bg-indigo-50 px-3.5 py-2 text-xs font-bold text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300">
                <span>{aiResult.detectedTaskTitle || "Rozpoznane zadanie"}</span>
                <span className="rounded-full bg-white px-2 py-0.5 text-[10px] text-zinc-700 shadow-sm dark:bg-zinc-900 dark:text-zinc-300">
                  {aiResult.taskType === "equation"
                    ? "Równanie"
                    : aiResult.taskType === "geometry"
                    ? "Geometria"
                    : "Obliczenia"}
                </span>
              </div>

              {/* Główna karta z odpowiedzią końcową */}
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 text-center dark:border-emerald-900/40 dark:bg-emerald-950/20">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                  Wynik końcowy:
                </span>
                <div className="mt-1 text-2xl font-bold text-zinc-900 dark:text-white">
                  <MathTex tex={aiResult.finalAnswerTex || aiResult.finalAnswerText} />
                </div>
              </div>

              {/* Rozwiązanie krok po kroku */}
              {aiResult.steps && aiResult.steps.length > 0 && (
                <div className="rounded-2xl bg-zinc-50 p-4 ring-1 ring-black/5 dark:bg-zinc-950/60 dark:ring-white/10">
                  <button
                    type="button"
                    onClick={() => setShowSteps((prev) => !prev)}
                    className="flex w-full items-center justify-between text-xs font-bold text-zinc-700 dark:text-zinc-300"
                  >
                    <span>Rozwiązanie krok po kroku ({aiResult.steps.length} etapów):</span>
                    {showSteps ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>

                  {showSteps && (
                    <ol className="mt-3 space-y-2 border-t border-zinc-200/60 pt-3 text-xs leading-relaxed text-zinc-700 dark:border-zinc-800 dark:text-zinc-300">
                      {aiResult.steps.map((step, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-[10px] font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                            {idx + 1}
                          </span>
                          <span className="flex-1 font-medium">{step}</span>
                        </li>
                      ))}
                    </ol>
                  )}
                </div>
              )}

              {/* Pole edycji formuły */}
              <div>
                <label
                  htmlFor="clean-expression"
                  className="text-xs font-semibold text-zinc-500"
                >
                  Odczytany wzór do kalkulatora:
                </label>
                <input
                  id="clean-expression"
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="mt-1 w-full rounded-xl bg-zinc-50 px-3 py-2.5 font-mono text-base font-bold text-zinc-900 ring-1 ring-black/5 outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-zinc-950 dark:text-white dark:ring-white/10"
                />
              </div>

              {/* Przyciski akcji */}
              <div className="flex flex-wrap gap-2">
                {onOpenInCalculator && (
                  <button
                    type="button"
                    onClick={() => onOpenInCalculator({ text, kind })}
                    className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition active:scale-[0.98] hover:bg-indigo-500"
                  >
                    <Sparkles className="h-4 w-4" />
                    <span>Otwórz w kalkulatorze</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={copyResult}
                  className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-zinc-100 px-4 py-2.5 text-sm font-semibold text-zinc-800 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
                >
                  {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                  <span>{copied ? "Skopiowano" : "Kopiuj"}</span>
                </button>
                <button
                  type="button"
                  onClick={reset}
                  className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-zinc-100 px-4 py-2.5 text-sm font-semibold text-zinc-800 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>Nowy skan</span>
                </button>
              </div>
            </div>
          )}

          {/* Wynik z lokalnego OCR (fallback gdy brak AI) */}
          {phase === "done" && !aiResult && (
            <div className="space-y-3">
              <div>
                <label htmlFor="scan-text" className="text-xs font-semibold text-zinc-500">
                  Rozpoznane działanie (popraw ewentualne pomyłki):
                </label>
                <textarea
                  id="scan-text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={2}
                  className="mt-1 w-full resize-none rounded-xl bg-zinc-50 px-3 py-2.5 font-mono text-base font-bold text-zinc-900 ring-1 ring-black/5 outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-zinc-950 dark:text-zinc-100 dark:ring-white/10"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {onOpenInCalculator && (
                  <button
                    type="button"
                    onClick={() => onOpenInCalculator({ text, kind })}
                    className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm active:scale-[0.98] hover:bg-indigo-500"
                  >
                    <Sparkles className="h-4 w-4" />
                    <span>Otwórz w kalkulatorze</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={copyResult}
                  className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-zinc-100 px-4 py-2.5 text-sm font-semibold text-zinc-800 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-100"
                >
                  <Copy className="h-4 w-4" />
                  <span>Kopiuj</span>
                </button>
                <button
                  type="button"
                  onClick={reset}
                  className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-zinc-100 px-4 py-2.5 text-sm font-semibold text-zinc-800 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-100"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>Skanuj ponownie</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
