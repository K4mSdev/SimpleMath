/**
 * Czyszczenie surowego tekstu z OCR do postaci zrozumiałej dla silnika
 * obliczeniowego SimpleMath. OCR często myli znaki (×, −, ,, O/0, l/1),
 * dlatego wynik zawsze pokazujemy użytkownikowi do poprawy.
 */

export type ScanKind = "equation" | "expression" | "unknown";

/** Mapa znaków typograficznych i typowych pomyłek OCR → zapis akceptowany przez kalkulator. */
const CHAR_MAP: Array<[RegExp, string]> = [
  [/[−–—‒]/g, "-"],
  [/[×✕✖⋅·∙]/g, "*"],
  [/[÷∶]/g, ":"],
  [/[‚،]/g, ","],
  [/[“”„"«»]/g, ""],
  [/[‘’´`]/g, ""],
  [/＝/g, "="],
  [/[（［{]/g, "("],
  [/[）］}]/g, ")"],
  [/\[/g, "("],
  [/\]/g, ")"],
  [/\u00a0/g, " "],
];

/**
 * Usuwa numerację zadania na początku linii: "Zad. 4." / "Zadanie 4:" / "12." / "3)".
 * Dwukropek traktujemy jako numerację tylko po słowie "zad" – inaczej "8 : 2" (dzielenie) byłoby błędnie ucięte.
 */
const LEADING_NUMBERING = /^\s*(?:zad(?:anie)?\.?\s*\d{1,3}\s*[.):]|\d{1,3}\s*[.)])\s+(?=\S)/i;

export function cleanOcrText(raw: string): string {
  let lines = raw
    .split(/\r?\n/)
    .map((l) => {
      let t = l.trim();
      for (const [re, rep] of CHAR_MAP) t = t.replace(re, rep);
      return t;
    })
    .filter(Boolean);

  // Szukamy linii, które wyglądają jak matematyka (cyfry/x + operator) – reszta to zwykle treść słowna.
  const mathy = lines.filter((l) => /[0-9x]/i.test(l) && /[+\-*/:=^√()]/.test(l));
  if (mathy.length > 0) lines = mathy;

  let text = lines[0] ?? "";

  // Uwaga: celowo bez lookbehind – starsze wersje Safari (iOS < 16.4) nie obsługują tej składni.
  text = text
    .replace(LEADING_NUMBERING, "")
    // litera O otoczona cyframi/operatorami to prawie zawsze zero
    .replace(/(^|[\d+\-*/:=(^ ])O(?=[\d+\-*/:=) ^]|$)/g, "$10")
    // x użyte jako mnożenie między liczbami: "3 x 4" → "3*4"
    .replace(/(\d)\s*[xX]\s*(?=\d)/g, "$1*")
    // wielkie X jako niewiadoma → x
    .replace(/(^|[^A-Za-z])X(?![A-Za-z])/g, "$1x")
    .replace(/\s+/g, " ")
    .replace(/\s*=\s*/g, " = ")
    // końcowe operatory/interpunkcja to szum OCR (kropka po zadaniu itp.)
    .replace(/[+\-*/:^,.\s]+$/, "")
    .trim();

  return text;
}

/** Zgaduje, czy to równanie (z niewiadomą x i znakiem =), czy zwykłe wyrażenie. */
export function classifyScan(text: string): ScanKind {
  const t = text.trim();
  if (!t) return "unknown";
  if (/=/.test(t) && /x/i.test(t)) return "equation";
  if (/[0-9]/.test(t)) return "expression";
  return "unknown";
}
