import { NextRequest, NextResponse } from "next/server";

export interface SolutionStep {
  title: string;
  explanation: string;
  formulaTex?: string;
}

export interface GeminiTaskResponse {
  detectedTaskTitle: string;
  cleanExpression: string;
  taskType: "equation" | "expression" | "geometry" | "word_problem";
  givenData?: string[];
  appliedFormulas?: string[];
  steps: SolutionStep[];
  finalAnswerTex: string;
  finalAnswerText: string;
  verification?: string;
}

interface ScanRequestBody {
  image?: string; // base64 data url or base64 raw string
  textTask?: string; // wpisana treść zadania
  instruction?: string; // np. "Zadanie 3 podpunkt b"
  apiKey?: string; // opcjonalny klucz przekazany przez użytkownika
  schoolLevel?: "primary" | "secondary" | null;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ScanRequestBody;
    const { image, textTask, instruction, schoolLevel } = body;

    if (!image && !textTask) {
      return NextResponse.json(
        { status: "error", message: "Brak zdjęcia lub treści zadania do przeanalizowania." },
        { status: 400 }
      );
    }

    // Klucz API: z nagłówka, z ciała zapytania lub ze zmiennej środowiskowej
    const apiKey =
      req.headers.get("x-gemini-key") ||
      body.apiKey ||
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          status: "need_key",
          message:
            "Aby skanować zadania aparatem i zobaczyć pełny proces rozwiązania ze sztuczną inteligencją Gemini, wpisz darmowy klucz API.",
        },
        { status: 401 }
      );
    }

    const schoolContext =
      schoolLevel === "primary"
        ? "Poziom: Szkoła podstawowa (klasy 4-8, egzamin ósmoklasisty CKE). Wyjaśniaj przystępnym językiem, używaj ułamków zwykłych i podstawowych wzorów."
        : "Poziom: Szkoła ponadpodstawowa (liceum/technikum, matura CKE). Używaj oficjalnych wzorów maturalnych CKE, delty, postaci kanonicznej/iloczynowej itp.";

    const userPrompt = instruction?.trim()
      ? `Użytkownik wskazał które konkretnie zadanie należy zrobić: "${instruction.trim()}". Odszukaj dokładnie to zadanie i rozwiąż je.`
      : `Odszukaj główne zadanie matematyczne i rozwiąż je.`;

    const systemInstruction = `Jesteś polskim nauczycielem matematyki i egzaminatorem CKE.
Twoim celem jest przedstawienie UCZNIOWI CAŁEGO PROCESU ROZWIĄZYWANIA ZADANIA KROK PO KROKU (dokładnie tak, jak wymaga się na sprawdzianie lub egzaminie CKE na 100% punktów).
Uczeń nie chce samej odpowiedzi — uczeń chce zobaczyć cały tok rozumowania, dane, wzory, obliczenia pośrednie i sprawdzenie!

Wymogi dotyczące rozwiązania:
1. "detectedTaskTitle": Nazwa zadania (np. "Zadanie 3b: Równanie kwadratowe z deltą").
2. "cleanExpression": Czysty zapis równania lub wyrażenia (np. "x^2 - 5x + 6 = 0" lub "3/4 + 1/2").
3. "givenData": Tablica stringów z wypisanymi danymi i założeniami z zadania (np. ["a = 1", "b = -5", "c = 6", "Dziedzina: D = R"]).
4. "appliedFormulas": Tablica stringów z zastosowanymi wzorami CKE (np. ["Δ = b² - 4ac", "x_{1,2} = (-b ± √Δ)/(2a)"]).
5. "steps": Tablica obiektów { title: string, explanation: string, formulaTex?: string } opisująca CAŁY PROCES rozwiązania:
   - Każdy krok ma jasny nagłówek "title" (np. "Krok 1: Wypisanie współczynników", "Krok 2: Obliczenie delty", "Krok 3: Wyznaczenie pierwiastków").
   - "explanation" zawiera polski komentarz dydaktyczny (dlaczego tak robimy).
   - "formulaTex" zawiera zapis matematyczny w LaTeX dla danego kroku (np. "\\Delta = (-5)^2 - 4 \\cdot 1 \\cdot 6 = 25 - 24 = 1").
6. "finalAnswerTex": Ostateczny wynik w zapisie KaTeX/LaTeX (np. "x_1 = 2, \\quad x_2 = 3").
7. "finalAnswerText": Odpowiedź pełnym zdaniem po polsku (np. "Rozwiązaniem równania są liczby x = 2 oraz x = 3.").
8. "verification": Sprawdzenie poprawności wyniku (podstawienie do równania wyjściowego).

${schoolContext}
${userPrompt}

Odpowiedz wyłącznie poprawnym obiektem JSON w formacie:
{
  "detectedTaskTitle": "...",
  "cleanExpression": "...",
  "taskType": "equation" | "expression" | "geometry" | "word_problem",
  "givenData": ["..."],
  "appliedFormulas": ["..."],
  "steps": [
    {
      "title": "Krok 1: ...",
      "explanation": "...",
      "formulaTex": "..."
    }
  ],
  "finalAnswerTex": "...",
  "finalAnswerText": "...",
  "verification": "..."
}`;

    // Budowa części zapytania (tekst + opcjonalny obraz)
    const parts: Array<{ text: string } | { inline_data: { mime_type: string; data: string } }> = [
      { text: systemInstruction },
    ];

    if (textTask?.trim()) {
      parts.push({ text: `Treść wpisana przez użytkownika: ${textTask.trim()}` });
    }

    if (image) {
      let mimeType = "image/jpeg";
      let base64Data = image;

      const dataUrlMatch = image.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
      if (dataUrlMatch) {
        mimeType = dataUrlMatch[1];
        base64Data = dataUrlMatch[2];
      }

      parts.push({
        inline_data: {
          mime_type: mimeType,
          data: base64Data,
        },
      });
    }

    // Wywołanie Gemini API
    const models = ["gemini-2.5-flash", "gemini-1.5-flash"];
    let lastError = "";

    for (const model of models) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              contents: [{ parts }],
              generationConfig: {
                temperature: 0.1,
                responseMimeType: "application/json",
              },
            }),
          }
        );

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          const errMsg =
            errData?.error?.message || `HTTP ${response.status} ${response.statusText}`;
          lastError = errMsg;
          if (response.status === 400 && errMsg.toLowerCase().includes("api_key")) {
            return NextResponse.json(
              {
                status: "error",
                message:
                  "Nieprawidłowy klucz Google Gemini API. Upewnij się, że skopiowano poprawny klucz z ai.google.dev.",
              },
              { status: 401 }
            );
          }
          continue;
        }

        const data = await response.json();
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!rawText) {
          lastError = "Model AI nie zwrócił odpowiedzi dla tego zadania.";
          continue;
        }

        let parsed: GeminiTaskResponse;
        try {
          parsed = JSON.parse(rawText) as GeminiTaskResponse;
        } catch {
          const cleanJson = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
          parsed = JSON.parse(cleanJson) as GeminiTaskResponse;
        }

        return NextResponse.json({
          status: "ok",
          data: parsed,
        });
      } catch (err: unknown) {
        lastError = err instanceof Error ? err.message : String(err);
      }
    }

    return NextResponse.json(
      {
        status: "error",
        message: `Nie udało się przetworzyć zadania: ${lastError}`,
      },
      { status: 502 }
    );
  } catch (error: unknown) {
    console.error("Błąd API /api/scan:", error);
    return NextResponse.json(
      {
        status: "error",
        message:
          error instanceof Error
            ? error.message
            : "Wystąpił nieoczekiwany błąd podczas przetwarzania zadania.",
      },
      { status: 500 }
    );
  }
}
