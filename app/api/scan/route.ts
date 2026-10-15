import { NextRequest, NextResponse } from "next/server";

interface ScanRequestBody {
  image: string; // base64 data url or base64 raw string
  instruction?: string; // np. "Zadanie 3 podpunkt b"
  apiKey?: string; // opcjonalny klucz przekazany przez użytkownika
  schoolLevel?: "primary" | "secondary" | null;
}

interface GeminiTaskResponse {
  detectedTaskTitle: string;
  cleanExpression: string;
  taskType: "equation" | "expression" | "geometry" | "word_problem";
  steps: string[];
  finalAnswerTex: string;
  finalAnswerText: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ScanRequestBody;
    const { image, instruction, schoolLevel } = body;

    if (!image) {
      return NextResponse.json(
        { status: "error", message: "Brak zdjęcia do przeanalizowania." },
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
            "Aby skanować zadania aparatem z pomocą sztucznej inteligencji (Gemini AI), podaj darmowy klucz Google Gemini API.",
        },
        { status: 401 }
      );
    }

    // Ekstrakcja typu MIME i czystego base64
    let mimeType = "image/jpeg";
    let base64Data = image;

    const dataUrlMatch = image.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
    if (dataUrlMatch) {
      mimeType = dataUrlMatch[1];
      base64Data = dataUrlMatch[2];
    }

    const schoolContext =
      schoolLevel === "primary"
        ? "Poziom: Szkoła podstawowa (klasy 4-8, egzamin ósmoklasisty CKE). Używaj prostych kroków, ułamków zwykłych i zapisu szkolnego."
        : "Poziom: Szkoła ponadpodstawowa (liceum/technikum, matura CKE). Używaj oficjalnych wzorów CKE, delty, postaci kanonicznej/iloczynowej itp.";

    const userPrompt = instruction?.trim()
      ? `Użytkownik podał dodatkowy opis zadania do wykonania: "${instruction.trim()}". Odszukaj dokładnie to zadanie na zdjęciu i rozwiąż je.`
      : `Użytkownik nie podał numeru zadania. Odszukaj główne zadanie matematyczne widoczne na zdjęciu (jeśli jest ich kilka, wybierz pierwsze lub najbardziej widoczne) i rozwiąż je.`;

    const systemInstruction = `Jesteś ekspertem polskiej edukacji matematycznej i nauczycielem przygotowującym uczniów do egzaminów CKE (egzamin 8-klasisty oraz matura).
Twoim zadaniem jest:
1. Bezbłędne odczytanie treści i wzorów zadania ze zdjęcia (uwzględniając ułamki, pierwiastki, potęgi, figury geometryczne i pismo odręczne).
2. Zastosowanie się do instrukcji użytkownika (które zadanie/podpunkt należy zrobić).
3. Podanie dokładnego rozwiązania krok po kroku w języku polskim.
4. Zwrócenie czystego wzoru matematycznego (cleanExpression), który można bezpośrednio wkleić do kalkulatora szkolnego (np. "2x^2 - 5x + 2 = 0" lub "(3/4 + 1/2) * 8").

${schoolContext}
${userPrompt}

Odpowiedz wyłącznie poprawnym obiektem JSON w formacie:
{
  "detectedTaskTitle": "np. Zadanie 3 podpunkt b: Obliczanie wartości wyrażenia",
  "cleanExpression": "wzór / równanie w prostym zapisie tekstowym kalkulatora",
  "taskType": "equation" | "expression" | "geometry" | "word_problem",
  "steps": [
    "Krok 1: ...",
    "Krok 2: ..."
  ],
  "finalAnswerTex": "ostateczna odpowiedź w formacie LaTeX (do KaTeX), np. x_1 = 1, \\quad x_2 = 2",
  "finalAnswerText": "ostateczna odpowiedź w zwykłym tekście"
}`;

    // Próbujemy najpierw z gemini-2.5-flash, a w razie czego z gemini-1.5-flash
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
              contents: [
                {
                  parts: [
                    { text: systemInstruction },
                    {
                      inline_data: {
                        mime_type: mimeType,
                        data: base64Data,
                      },
                    },
                  ],
                },
              ],
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
          // Jeśli błąd to zły klucz API, nie ma sensu ponawiać próby dla drugiego modelu
          if (response.status === 400 && errMsg.toLowerCase().includes("api_key")) {
            return NextResponse.json(
              {
                status: "error",
                message:
                  "Nieprawidłowy klucz Google Gemini API. Sprawdź czy klucz został skopiowany poprawnie z ai.google.dev.",
              },
              { status: 401 }
            );
          }
          continue;
        }

        const data = await response.json();
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!rawText) {
          lastError = "Model AI nie zwrócił odpowiedzi dla tego zdjęcia.";
          continue;
        }

        let parsed: GeminiTaskResponse;
        try {
          parsed = JSON.parse(rawText) as GeminiTaskResponse;
        } catch {
          // Gdyby model zwrócił markdown json code block
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
        message: `Nie udało się przetworzyć zadania przez AI: ${lastError}`,
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
            : "Wystąpił nieoczekiwany błąd podczas przetwarzania zdjęcia.",
      },
      { status: 500 }
    );
  }
}
