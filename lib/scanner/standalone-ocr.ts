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
 * Zaawansowana adaptacyjna binaryzacja obrazu (algorytm Bradley-Roth / integral image):
 * - automatycznie usuwa cienie rzucane przez telefon i nierównomierne oświetlenie kartki
 * - porównuje każdy piksel z lokalną średnią jasnością w oknie (ok. 15-20% szerokości)
 * - dodaje 36px białego marginesu ochronnego, dzięki czemu Tesseract nie obcina znaków przy krawędziach
 */
export function enhanceCanvasForOcr(srcCanvas: HTMLCanvasElement): HTMLCanvasElement {
  const pad = 36;
  const w = srcCanvas.width;
  const h = srcCanvas.height;

  // 1. Kopia do skali szarości
  const tempCanvas = document.createElement("canvas");
  tempCanvas.width = w;
  tempCanvas.height = h;
  const tempCtx = tempCanvas.getContext("2d", { willReadFrequently: true });
  if (!tempCtx) return srcCanvas;

  tempCtx.drawImage(srcCanvas, 0, 0);
  const imgData = tempCtx.getImageData(0, 0, w, h);
  const data = imgData.data;

  const gray = new Uint8Array(w * h);
  for (let i = 0, j = 0; i < data.length; i += 4, j++) {
    gray[j] = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
  }

  // 2. Tablica całkowa (Integral Image) w O(N)
  const integral = new Float64Array(w * h);
  for (let y = 0; y < h; y++) {
    let sum = 0;
    for (let x = 0; x < w; x++) {
      sum += gray[y * w + x];
      if (y === 0) {
        integral[y * w + x] = sum;
      } else {
        integral[y * w + x] = integral[(y - 1) * w + x] + sum;
      }
    }
  }

  // 3. Adaptacyjne progowanie (lokalne okno)
  const windowFraction = 0.08;
  const thresholdT = 0.12; // 12% ciemniejszy od tła
  const s = Math.max(12, Math.round(w * windowFraction));
  const s2 = Math.floor(s / 2);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const x1 = Math.max(0, x - s2);
      const x2 = Math.min(w - 1, x + s2);
      const y1 = Math.max(0, y - s2);
      const y2 = Math.min(h - 1, y + s2);
      const count = (x2 - x1 + 1) * (y2 - y1 + 1);

      const sum =
        integral[y2 * w + x2] -
        (x1 > 0 ? integral[y2 * w + (x1 - 1)] : 0) -
        (y1 > 0 ? integral[(y1 - 1) * w + x2] : 0) +
        (x1 > 0 && y1 > 0 ? integral[(y1 - 1) * w + (x1 - 1)] : 0);

      const val = gray[y * w + x];
      const isInk = val * count < sum * (1.0 - thresholdT);
      const pixelIdx = (y * w + x) * 4;
      const c = isInk ? 0 : 255;
      data[pixelIdx] = c;
      data[pixelIdx + 1] = c;
      data[pixelIdx + 2] = c;
      data[pixelIdx + 3] = 255;
    }
  }

  tempCtx.putImageData(imgData, 0, 0);

  // 4. Utworzenie płótna docelowego z 36px białego marginesu
  const target = document.createElement("canvas");
  target.width = w + pad * 2;
  target.height = h + pad * 2;
  const ctx = target.getContext("2d", { willReadFrequently: true });
  if (!ctx) return tempCanvas;

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, target.width, target.height);
  ctx.drawImage(tempCanvas, pad, pad);

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
    .replace(/⁴/g, "^4")
    .replace(/√/g, "sqrt")
    .replace(/Delta|DELTA/g, "Δ");

  // Potęgi w druku szkolnym (np. x2 -> x^2, x3 -> x^3)
  text = text
    .replace(/([a-zA-Z])\s*2(?=[+\-*/=,\s)]|$)/g, "$1^2")
    .replace(/([a-zA-Z])\s*3(?=[+\-*/=,\s)]|$)/g, "$1^3")
    .replace(/([a-zA-Z])\s*4(?=[+\-*/=,\s)]|$)/g, "$1^4");

  // Cyfry i zmienne: litera O jako 0, l lub I jako 1 obok cyfr
  text = text
    .replace(/(^|[\d+\-*/:=(^ ])O(?=[\d+\-*/:=) ^]|$)/g, "$10")
    .replace(/(?<=\d)[lI](?=\d)/g, "1")
    .replace(/(?<=\d)[lI]\b/g, "1")
    .replace(/(\d)\s*[xX]\s*(?=\d)/g, "$1*")
    .replace(/(^|[^A-Za-z])X(?![A-Za-z])/g, "$1x")
    .replace(/\s+/g, " ")
    .replace(/\s*=\s*/g, " = ")
    .trim();

  // Znak '=' pomylony z długim myślnikiem typograficznym między stronami równania (np. 2x + 4 — 10 gdzie brak =)
  // Nie zmieniamy standardowego minusa '-' ani gdy występuje operator relacji (<, >, <=, >=, =)
  if (!/[=<>≤≥]/.test(text) && /[a-zA-Z]/.test(text)) {
    text = text.replace(/(\s+)[—–](\s+)(?=\d+)/g, "$1=$2");
  }

  return text;
}

/**
 * Wyodrębnia czyste wyrażenie matematyczne ze zdania lub linii z OCR,
 * usuwając polskie słowa poleceń (np. "Rozwiąż równanie:", "Zadanie 3a:").
 */
export function extractPureMathExpression(raw: string): {
  expression: string;
  contextTitle?: string;
  detectedType: "equation" | "expression" | "geometry" | "word_problem";
} {
  const normalized = normalizeOcrMath(raw);
  const lower = normalized.toLowerCase();

  // 1. Zadanie geometryczne z parametrami a=, b=, h=, r=
  if (
    lower.includes("pole") ||
    lower.includes("obwód") ||
    lower.includes("trójkąt") ||
    lower.includes("trapez") ||
    lower.includes("romb") ||
    lower.includes("prostokąt") ||
    lower.includes("kwadrat") ||
    lower.includes("koło") ||
    lower.includes("pitagoras")
  ) {
    const cleanGeom = normalized
      .replace(/^(?:zad(?:anie)?\.?\s*\d+[a-z]?[\s:.)-]*|[a-z]\)[\s:.]*)/i, "")
      .replace(/[.?!\s]+$/, "")
      .trim();

    return {
      expression: cleanGeom,
      contextTitle: "Zadanie geometryczne",
      detectedType: "geometry",
    };
  }

  // 2. Zadanie z procentami
  if (/\b\d+(?:\.\d+)?\s*%\s*(?:z|\*|·)?\s*\d+/i.test(normalized)) {
    const pMatch = normalized.match(/(\d+(?:\.\d+)?\s*%\s*(?:z|\*|·)?\s*\d+(?:\.\d+)?)/i);
    if (pMatch) {
      return {
        expression: pMatch[1].trim(),
        contextTitle: "Obliczenia procentowe",
        detectedType: "word_problem",
      };
    }
  }

  // 3. Układ dwóch równań liniowych
  if (
    (normalized.includes(",") || normalized.includes("\n") || /\bi\b/.test(normalized)) &&
    normalized.split(/[,\n]|\bi\b/).filter((s) => s.includes("=") && (s.includes("x") || s.includes("y"))).length >= 2
  ) {
    const cleanSystem = normalized
      .replace(/^(?:zad(?:anie)?\.?\s*\d+[a-z]?[\s:.)-]*|układ(?:\s+równań)?[\s:.]*)/i, "")
      .trim();
    return {
      expression: cleanSystem,
      contextTitle: "Układ równań liniowych",
      detectedType: "equation",
    };
  }

  // 4. Usuwamy polskie prefiksy poleceń szkolnych
  const instructionPrefixes = [
    /^[.:)\s-]+/,
    /^(?:zad(?:anie)?\.?\s*\d+[a-z]?[\s:.)-]*)/i,
    /^(?:[a-z]\)[\s:.]*)/i,
    /^(?:rozw(?:i|ią)ż(?:\s+równanie|\s+nierówność)?[\s:.]*)/i,
    /^(?:oblicz(?:\s+wartość)?(?:\s+wyrażenia|\s+ułamek|\s+ułamki|\s+deltę|\s+pierwiastki|\s+miejsca\s+zerowe)?[\s:.]*)/i,
    /^(?:wyznacz(?:\s+x|\s+rozwiązania|\s+pierwiastki|\s+miejsca\s+zerowe)?[\s:.]*)/i,
    /^(?:dla\s+jakich\s+x(?:\s+zachodzi)?[\s:.]*)/i,
    /^(?:wykonaj(?:\s+działania|\s+mnożenie|\s+dzielenie)?[\s:.]*)/i,
    /^(?:doprowadź\s+do\s+najprostszej\s+postaci[\s:.]*)/i,
  ];

  let stripped = normalized;
  let changed = true;
  while (changed) {
    changed = false;
    for (const prefix of instructionPrefixes) {
      if (prefix.test(stripped)) {
        stripped = stripped.replace(prefix, "").trim();
        changed = true;
      }
    }
  }

  // 5. Usuwamy końcowe interpunkcje, pytajniki i jednostki
  stripped = stripped
    .replace(/\s*=\s*$/, "")
    .replace(/[.?!;:]+$/, "")
    .replace(/\s*(?:cm|dm|m|mm|km|zł)\s*$/i, "")
    .trim();

  // 6. Jeśli wewnątrz nadal znajduje się znak równości z równaniem
  if (stripped.includes("=")) {
    const eqMatch = stripped.match(/([a-zA-Z0-9^/().\s*+-]+\s*=\s*[a-zA-Z0-9^/().\s*+-]+)/);
    if (eqMatch) {
      stripped = eqMatch[1].trim();
    }
  }

  const kind =
    stripped.includes("=") || (stripped.includes("x") && !stripped.includes("*"))
      ? "equation"
      : "expression";

  return {
    expression: stripped,
    detectedType: kind,
  };
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
      const parsed = extractPureMathExpression(combined);
      if (parsed.expression) {
        candidates.push({
          id: `task-${taskIndex}`,
          label: currentTitle || `Zadanie ${taskIndex}`,
          rawText: combined,
          cleanMath: parsed.expression,
          confidence: 85,
        });
        taskIndex++;
      }
    }
    currentLines = [];
  };

  const taskHeaderRegex = /^(?:zad(?:anie)?\.?\s*(\d+[a-z]?)[.:)\s-]*|(\d+)[.)]\s+|([a-z]\))\s+)/i;

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
        const parsed = extractPureMathExpression(ml);
        candidates.push({
          id: `line-${idx + 1}`,
          label: `Równanie / Działanie ${idx + 1}`,
          rawText: ml,
          cleanMath: parsed.expression,
          confidence: 80,
        });
      });
    } else if (lines.length > 0) {
      const parsed = extractPureMathExpression(lines.join(" "));
      candidates.push({
        id: "full",
        label: "Treść zadania",
        rawText: lines.join(" "),
        cleanMath: parsed.expression,
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
 * Wykonuje pełny odczyt lokalnym silnikiem OCR z Tesseract.js
 */
export async function performStandaloneOcr(
  canvas: HTMLCanvasElement,
  instruction?: string,
  onStatusUpdate?: (status: string) => void
): Promise<OcrScanResult> {
  onStatusUpdate?.("Optymalizuję obraz i usuwam cienie z kartki...");
  const enhancedCanvas = enhanceCanvasForOcr(canvas);

  onStatusUpdate?.("Uruchamiam wbudowany silnik OCR...");
  const { createWorker } = await import("tesseract.js");

  let worker;
  try {
    worker = await createWorker(["pol", "eng"]);
  } catch (err) {
    console.warn("Brak pakietu pol, ładowanie eng:", err);
    worker = await createWorker("eng");
  }

  onStatusUpdate?.("Odczytuję treść zadań i wzory ze zdjęcia...");
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
