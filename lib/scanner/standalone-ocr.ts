/**
 * Osobny, wbudowany silnik odczytu zdjęć (Local Vision & Math OCR) dla SimpleMath.
 * Działa w 100% lokalnie w przeglądarce bez konieczności korzystania z Gemini API.
 */

export interface DetectedTaskCandidate {
  id: string;
  label: string;
  rawText: string;
  cleanMath: string;
  confidence: number;
}

export interface OcrScanResult {
  fullRawText: string;
  selectedCandidate: DetectedTaskCandidate | null;
  allCandidates: DetectedTaskCandidate[];
}

/**
 * Zaawansowane przygotowanie płótna do OCR:
 * - dodanie 36px białego marginesu (Tesseract gubi znaki przy samej krawędzi)
 * - wyostrzenie i adaptacyjny kontrast dla cienkich kresek ułamkowych i potęg
 */
export function enhanceCanvasForOcr(srcCanvas: HTMLCanvasElement): HTMLCanvasElement {
  const pad = 36;
  const target = document.createElement("canvas");
  target.width = srcCanvas.width + pad * 2;
  target.height = srcCanvas.height + pad * 2;
  const ctx = target.getContext("2d", { willReadFrequently: true });
  if (!ctx) return srcCanvas;

  // Białe tło i margines
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, target.width, target.height);
  ctx.drawImage(srcCanvas, pad, pad);

  // Proste wyostrzenie i podbicie kontrastu
  const imgData = ctx.getImageData(0, 0, target.width, target.height);
  const data = imgData.data;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    // Luminancja
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;

    // Kontrast progowy
    const adjusted = lum < 140 ? Math.max(0, lum - 35) : Math.min(255, lum + 35);
    data[i] = adjusted;
    data[i + 1] = adjusted;
    data[i + 2] = adjusted;
  }

  ctx.putImageData(imgData, 0, 0);
  return target;
}

/**
 * Czyści i normalizuje tekst matematyczny z OCR
 */
export function normalizeOcrMath(raw: string): string {
  let text = raw.trim();

  // Zamiana typograficznych znaków na operatory kalkulatora
  text = text
    .replace(/[−–—‒]/g, "-")
    .replace(/[×✕✖⋅·∙•]/g, "*")
    .replace(/[÷∶]/g, ":")
    .replace(/＝/g, "=")
    .replace(/[（［{]/g, "(")
    .replace(/[）］}]/g, ")")
    .replace(/\[/g, "(")
    .replace(/\]/g, ")")
    .replace(/²/g, "^2")
    .replace(/³/g, "^3")
    .replace(/√/g, "sqrt")
    .replace(/Delta|DELTA/g, "Δ");

  // Cyfry i zmienne: litera O jako 0, l lub I jako 1 obok cyfr
  text = text
    .replace(/(^|[\d+\-*/:=(^ ])O(?=[\d+\-*/:=) ^]|$)/g, "$10")
    .replace(/(?<=\d)[lI](?=\d)/g, "1")
    .replace(/(\d)\s*[xX]\s*(?=\d)/g, "$1*")
    .replace(/(^|[^A-Za-z])X(?![A-Za-z])/g, "$1x")
    .replace(/\s+/g, " ")
    .replace(/\s*=\s*/g, " = ")
    .trim();

  return text;
}

/**
 * Dzieli pełny tekst ze strony na kandydatów poszczególnych zadań
 * (np. Zadanie 1, Zadanie 2, Zadanie 3b itp.)
 */
export function extractTaskCandidates(fullText: string): DetectedTaskCandidate[] {
  const lines = fullText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const candidates: DetectedTaskCandidate[] = [];
  let currentTitle = "";
  let currentLines: string[] = [];
  let taskIndex = 1;

  const flushCandidate = () => {
    if (currentLines.length > 0) {
      const combined = currentLines.join(" ");
      const clean = normalizeOcrMath(combined);
      if (clean) {
        candidates.push({
          id: `task-${taskIndex}`,
          label: currentTitle || `Zadanie ${taskIndex}`,
          rawText: combined,
          cleanMath: clean,
          confidence: 85,
        });
        taskIndex++;
      }
    }
    currentLines = [];
  };

  const taskHeaderRegex = /^(?:zad(?:anie)?\.?\s*(\d+[a-z]?)|(\d+)[.)]\s+|([a-z]\))\s+)/i;

  for (const line of lines) {
    const match = line.match(taskHeaderRegex);
    if (match) {
      flushCandidate();
      const num = match[1] || match[2] || match[3] || `${taskIndex}`;
      currentTitle = `Zadanie ${num.replace(/[.)]/g, "").trim()}`;
      const afterHeader = line.replace(taskHeaderRegex, "").trim();
      if (afterHeader) {
        currentLines.push(afterHeader);
      }
    } else {
      currentLines.push(line);
    }
  }

  flushCandidate();

  // Jeśli nie wykryto żadnego nagłówka "Zadanie...", traktujemy każdą matematyczną linię jako kandydata
  if (candidates.length === 0) {
    const mathLines = lines.filter((l) => /[0-9]/.test(l) && /[+\-*/:=^√()]/.test(l));
    if (mathLines.length > 0) {
      mathLines.forEach((ml, idx) => {
        candidates.push({
          id: `line-${idx + 1}`,
          label: `Równanie / Działanie ${idx + 1}`,
          rawText: ml,
          cleanMath: normalizeOcrMath(ml),
          confidence: 80,
        });
      });
    } else if (lines.length > 0) {
      candidates.push({
        id: "full",
        label: "Treść zadania",
        rawText: lines.join(" "),
        cleanMath: normalizeOcrMath(lines.join(" ")),
        confidence: 70,
      });
    }
  }

  return candidates;
}

/**
 * Wybiera najlepszego kandydata na podstawie instrukcji użytkownika (np. "Zadanie 3 podpunkt b")
 */
export function selectBestCandidate(
  candidates: DetectedTaskCandidate[],
  instruction?: string
): DetectedTaskCandidate | null {
  if (candidates.length === 0) return null;
  if (!instruction || !instruction.trim()) {
    // Preferujemy kandydata z równaniem '=' lub najdłuższą formułą matematyczną
    const eqCandidate = candidates.find((c) => c.cleanMath.includes("=") && c.cleanMath.includes("x"));
    if (eqCandidate) return eqCandidate;
    return candidates[0];
  }

  const query = instruction.toLowerCase().trim();

  // Szukanie numeru zadania w instrukcji (np. "3", "3a", "3b", "zadanie 2")
  const numMatch = query.match(/(\d+[a-z]?)/i);
  if (numMatch) {
    const target = numMatch[1].toLowerCase();
    // 1. Najpierw sprawdzamy dopasowanie do etykiety (np. "Zadanie 2")
    const labelFound = candidates.find((c) => {
      const lbl = c.label.toLowerCase();
      return (
        lbl.includes(`zadanie ${target}`) ||
        lbl.includes(`zad. ${target}`) ||
        lbl.endsWith(` ${target}`) ||
        new RegExp(`\\b${target}\\b`, "i").test(lbl)
      );
    });
    if (labelFound) return labelFound;

    // 2. Jeśli nie ma w etykiecie, sprawdzamy nagłówek zadania w rawText
    const rawFound = candidates.find((c) =>
      new RegExp(`(?:zad(?:anie)?\\.?\\s*|\\b)${target}[.)\\s]`, "i").test(c.rawText)
    );
    if (rawFound) return rawFound;
  }

  // Szukanie po słowach kluczowych (np. "trójkąt", "pitagoras", "ułamek")
  const keywordFound = candidates.find((c) => {
    const text = (c.label + " " + c.rawText).toLowerCase();
    return query.split(/\s+/).some((w) => w.length > 3 && text.includes(w));
  });

  return keywordFound || candidates[0];
}

/**
 * Wykonuje pełny odczyt lokalnym silnikiem OCR z Tesseract.js (pol + eng)
 */
export async function performStandaloneOcr(
  canvas: HTMLCanvasElement,
  instruction?: string,
  onStatusUpdate?: (status: string) => void
): Promise<OcrScanResult> {
  onStatusUpdate?.("Optymalizuję obraz do odczytu matematycznego...");
  const enhancedCanvas = enhanceCanvasForOcr(canvas);

  onStatusUpdate?.("Uruchamiam wbudowany silnik OCR (język polski i notacja matematyczna)...");
  const { createWorker } = await import("tesseract.js");

  let worker;
  try {
    // Próbujemy załadować polski + angielski dla polskich treści zadań
    worker = await createWorker(["pol", "eng"]);
  } catch (err) {
    console.warn("Brak pakietu pol, ładowanie eng:", err);
    worker = await createWorker("eng");
  }

  onStatusUpdate?.("Odczytuję treść zadań i wzory...");
  const { data } = await worker.recognize(enhancedCanvas);
  await worker.terminate();

  const fullRawText = data.text || "";
  const candidates = extractTaskCandidates(fullRawText);
  const selectedCandidate = selectBestCandidate(candidates, instruction);

  return {
    fullRawText,
    selectedCandidate,
    allCandidates: candidates,
  };
}
