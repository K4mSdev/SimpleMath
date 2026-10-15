"use client";

import { useCallback, useEffect, useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { Camera, ClipboardPaste, Copy, ImageUp, Loader2, RotateCcw, ScanLine, Sparkles, X } from "lucide-react";
import { MathTex } from "@/components/math/MathTex";
import { evaluateExpression, solveEquation } from "@/lib/math-engine";
import { prepareImageForOcr } from "@/lib/scanner/prepare-image";
import { classifyScan, cleanOcrText, type ScanKind } from "@/lib/scanner/ocr-text";

export type ScanTarget = { text: string; kind: ScanKind };

interface ProblemScannerProps {
  isOpen: boolean;
  onClose: () => void;
  /** Gdy podane, pokazujemy przycisk "Otwórz w kalkulatorze" (poziom ponadpodstawowy). */
  onOpenInCalculator?: (target: ScanTarget) => void;
}

type Phase = "idle" | "preparing" | "loading" | "recognizing" | "done" | "error";

// Minimalny kształt workera Tesseract.js, którego używamy (biblioteka ładowana dynamicznie).
interface OcrWorker {
  recognize: (image: HTMLCanvasElement) => Promise<{ data: { text: string; confidence: number } }>;
  terminate: () => Promise<unknown>;
}

const PHASE_LABEL: Record<Phase, string> = {
  idle: "",
  preparing: "Przygotowuję obraz…",
  loading: "Pobieram silnik rozpoznawania (tylko za pierwszym razem)…",
  recognizing: "Rozpoznaję tekst…",
  done: "",
  error: "",
};

export function ProblemScanner({ isOpen, onClose, onOpenInCalculator }: ProblemScannerProps) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [progress, setProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [confidence, setConfidence] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const workerRef = useRef<OcrWorker | null>(null);
  const runIdRef = useRef(0);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const reset = useCallback(() => {
    runIdRef.current++;
    setPhase("idle");
    setProgress(0);
    setPreviewUrl(null);
    setText("");
    setConfidence(null);
    setError(null);
  }, []);

  const getWorker = useCallback(async (): Promise<OcrWorker> => {
    if (workerRef.current) return workerRef.current;
    const { createWorker } = await import("tesseract.js");
    // Do zadań matematycznych wystarczy angielski model (cyfry i operatory) – jest dużo lżejszy niż polski.
    const worker = (await createWorker("eng", 1, {
      logger: (m: { status: string; progress: number }) => {
        if (m.status === "recognizing text") setProgress(m.progress);
      },
    })) as unknown as OcrWorker;
    workerRef.current = worker;
    return worker;
  }, []);

  const scanBlob = useCallback(
    async (blob: Blob) => {
      const runId = ++runIdRef.current;
      setError(null);
      setText("");
      setConfidence(null);
      setProgress(0);
      try {
        setPhase("preparing");
        const { canvas, previewUrl: preview } = await prepareImageForOcr(blob);
        if (runId !== runIdRef.current) return;
        setPreviewUrl(preview);

        setPhase("loading");
        const worker = await getWorker();
        if (runId !== runIdRef.current) return;

        setPhase("recognizing");
        const { data } = await worker.recognize(canvas);
        if (runId !== runIdRef.current) return;

        const cleaned = cleanOcrText(data.text);
        setText(cleaned);
        setConfidence(Math.round(data.confidence));
        setPhase("done");
      } catch (e) {
        if (runId !== runIdRef.current) return;
        console.error(e);
        setError(
          "Nie udało się rozpoznać zadania. Sprawdź połączenie z internetem (przy pierwszym skanie pobierany jest silnik OCR) i spróbuj z wyraźniejszym zdjęciem.",
        );
        setPhase("error");
      }
    },
    [getWorker],
  );

  const onFileChosen = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // pozwala wybrać ten sam plik ponownie (ważne na iOS)
    if (file) void scanBlob(file);
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const file = Array.from(e.dataTransfer.files).find((f) => f.type.startsWith("image/"));
    if (file) void scanBlob(file);
  };

  const pasteFromClipboard = async () => {
    try {
      const items = await navigator.clipboard.read();
      for (const item of items) {
        const type = item.types.find((t) => t.startsWith("image/"));
        if (type) {
          await scanBlob(await item.getType(type));
          return;
        }
      }
      setError("W schowku nie ma obrazu. Zrób zrzut ekranu (iPhone: przycisk boczny + głośność w górę), skopiuj go i spróbuj ponownie.");
      setPhase("error");
    } catch {
      setError("Przeglądarka nie pozwoliła odczytać schowka. Użyj przycisku „Wybierz zrzut ekranu / zdjęcie”.");
      setPhase("error");
    }
  };

  // Wklejanie obrazu (Ctrl/Cmd+V oraz „Wklej” z menu iOS) gdy okno jest otwarte.
  useEffect(() => {
    if (!isOpen) return;
    const onPaste = (e: ClipboardEvent) => {
      const file = Array.from(e.clipboardData?.files ?? []).find((f) => f.type.startsWith("image/"));
      if (file) {
        e.preventDefault();
        void scanBlob(file);
      }
    };
    document.addEventListener("paste", onPaste);
    return () => document.removeEventListener("paste", onPaste);
  }, [isOpen, scanBlob]);

  // Zamknięcie klawiszem Esc + blokada przewijania strony pod oknem.
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

  // Sprzątanie workera przy odmontowaniu.
  useEffect(() => {
    return () => {
      void workerRef.current?.terminate();
      workerRef.current = null;
    };
  }, []);

  if (!isOpen) return null;

  const kind = classifyScan(text);
  const busy = phase === "preparing" || phase === "loading" || phase === "recognizing";

  const copyText = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* brak uprawnień – ignorujemy */
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Skaner zadań"
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[92dvh] w-full max-w-xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl ring-1 ring-black/10 sm:rounded-2xl dark:bg-zinc-900 dark:ring-white/10"
        onClick={(e) => e.stopPropagation()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
      >
        {/* Nagłówek */}
        <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-3.5 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
              <ScanLine className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-white">Skaner zadań</h2>
              <p className="text-xs text-zinc-500">Zdjęcie lub zrzut ekranu → gotowe działanie</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Zamknij"
            className="flex h-10 w-10 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 overflow-y-auto overscroll-contain p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          {/* Ukryte inputy – na iOS „capture” otwiera od razu aparat tylny */}
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={onFileChosen}
          />
          <input ref={galleryInputRef} type="file" accept="image/*" className="hidden" onChange={onFileChosen} />

          {/* Akcje wejściowe */}
          <div
            className={`grid gap-2.5 rounded-2xl border-2 border-dashed p-3 transition sm:grid-cols-3 ${
              dragOver ? "border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/30" : "border-zinc-200 dark:border-zinc-700"
            }`}
          >
            <button
              type="button"
              disabled={busy}
              onClick={() => cameraInputRef.current?.click()}
              className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition active:scale-[0.98] hover:bg-indigo-500 disabled:opacity-50"
            >
              <Camera className="h-5 w-5" />
              Zrób zdjęcie
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => galleryInputRef.current?.click()}
              className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-zinc-100 px-4 py-3 text-sm font-semibold text-zinc-800 transition active:scale-[0.98] hover:bg-zinc-200 disabled:opacity-50 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
            >
              <ImageUp className="h-5 w-5" />
              Zrzut / zdjęcie
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={pasteFromClipboard}
              className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-zinc-100 px-4 py-3 text-sm font-semibold text-zinc-800 transition active:scale-[0.98] hover:bg-zinc-200 disabled:opacity-50 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
            >
              <ClipboardPaste className="h-5 w-5" />
              Wklej ze schowka
            </button>
            <p className="text-center text-xs text-zinc-500 sm:col-span-3">
              Możesz też przeciągnąć obraz tutaj lub wkleić go (Ctrl/Cmd + V). Najlepiej kadruj jedno działanie, przy dobrym świetle.
            </p>
          </div>

          {/* Podgląd + postęp */}
          {previewUrl && (
            // eslint-disable-next-line @next/next/no-img-element -- data URL z lokalnego podglądu, next/image niepotrzebne
            <img
              src={previewUrl}
              alt="Podgląd skanowanego zadania"
              className="max-h-48 w-full rounded-xl bg-zinc-100 object-contain ring-1 ring-black/5 dark:bg-zinc-800"
            />
          )}

          {busy && (
            <div className="space-y-2" aria-live="polite">
              <div className="flex items-center gap-2 text-sm font-medium text-indigo-700 dark:text-indigo-300">
                <Loader2 className="h-4 w-4 animate-spin" />
                {PHASE_LABEL[phase]}
              </div>
              {phase === "recognizing" && (
                <div className="h-2 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                  <div
                    className="h-full rounded-full bg-indigo-600 transition-[width]"
                    style={{ width: `${Math.round(progress * 100)}%` }}
                  />
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50/70 p-3.5 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-400">
              {error}
            </div>
          )}

          {/* Wynik rozpoznawania */}
          {phase === "done" && (
            <div className="space-y-3">
              <div>
                <label htmlFor="scan-text" className="text-xs font-semibold text-zinc-500">
                  Rozpoznane zadanie (popraw, jeśli OCR się pomylił):
                </label>
                <textarea
                  id="scan-text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={2}
                  autoCapitalize="off"
                  autoCorrect="off"
                  spellCheck={false}
                  placeholder="Nie wykryto działania – wpisz je ręcznie"
                  // text-base (16px) – mniejsza czcionka powoduje automatyczne przybliżanie strony w Safari na iPhonie
                  className="mt-1 w-full resize-none rounded-xl bg-zinc-50 px-3 py-2.5 font-mono text-base text-zinc-900 ring-1 ring-black/5 outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-zinc-950 dark:text-zinc-100 dark:ring-white/10"
                />
                {confidence !== null && confidence < 60 && (
                  <p className="mt-1 text-xs text-amber-700 dark:text-amber-400">
                    Pewność rozpoznania jest niska ({confidence}%) – sprawdź dokładnie każdy znak.
                  </p>
                )}
              </div>

              <ScanQuickResult text={text} kind={kind} />

              <div className="flex flex-wrap gap-2">
                {onOpenInCalculator && kind !== "unknown" && (
                  <button
                    type="button"
                    onClick={() => onOpenInCalculator({ text, kind })}
                    className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm active:scale-[0.98] hover:bg-indigo-500"
                  >
                    <Sparkles className="h-4 w-4" />
                    Otwórz w kalkulatorze
                  </button>
                )}
                <button
                  type="button"
                  onClick={copyText}
                  disabled={!text}
                  className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-zinc-100 px-4 py-2.5 text-sm font-semibold text-zinc-800 hover:bg-zinc-200 disabled:opacity-50 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
                >
                  <Copy className="h-4 w-4" />
                  {copied ? "Skopiowano" : "Kopiuj"}
                </button>
                <button
                  type="button"
                  onClick={reset}
                  className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-zinc-100 px-4 py-2.5 text-sm font-semibold text-zinc-800 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
                >
                  <RotateCcw className="h-4 w-4" />
                  Skanuj ponownie
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/** Szybki podgląd wyniku zeskanowanego działania – działa na obu poziomach nauczania. */
function ScanQuickResult({ text, kind }: { text: string; kind: ScanKind }) {
  if (kind === "unknown" || !text.trim()) return null;

  if (kind === "equation") {
    const res = solveEquation(text);
    if (res.status === "error") {
      return <div className="rounded-xl bg-zinc-50 p-3 text-sm text-zinc-500 dark:bg-zinc-950">{res.message}</div>;
    }
    const d = res.data;
    let tex = "";
    if (d.type === "linear") tex = `x = ${d.xFormatted.tex}`;
    else if (d.type === "quadratic") {
      if (d.delta > 0 && d.x1Formatted && d.x2Formatted) tex = `x_1 = ${d.x1Formatted.tex},\\; x_2 = ${d.x2Formatted.tex}`;
      else if (d.delta === 0 && d.x0Formatted) tex = `x_0 = ${d.x0Formatted.tex}`;
      else tex = "x \\in \\emptyset";
    }
    if (!tex) return <div className="rounded-xl bg-zinc-50 p-3 text-sm dark:bg-zinc-950">{"message" in d ? d.message : ""}</div>;
    return (
      <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-3.5 text-center text-xl font-bold text-zinc-900 dark:border-indigo-900/40 dark:bg-indigo-950/20 dark:text-white">
        <MathTex tex={tex} />
      </div>
    );
  }

  const res = evaluateExpression(text, { angleMode: "deg" });
  if (res.status === "ok") {
    return (
      <div className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-3.5 text-center text-xl font-bold text-zinc-900 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-white">
        <MathTex tex={res.resultTex} />
      </div>
    );
  }
  if (res.status === "error") {
    return <div className="rounded-xl bg-zinc-50 p-3 text-sm text-zinc-500 dark:bg-zinc-950">{res.message}</div>;
  }
  return null;
}
