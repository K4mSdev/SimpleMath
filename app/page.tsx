"use client";

import { useEffect, useState } from "react";
import { Header, Footer, LevelSelector, type SchoolLevel } from "@/components/layout";
import { PrimarySchoolCalculator } from "@/components/primary";
import { SecondarySchoolView } from "@/components/secondary";
import { DocsModal } from "@/components/docs/DocsModal";
import { ProblemScanner, type ScanTarget } from "@/components/scanner/ProblemScanner";

export default function Home() {
  const [level, setLevel] = useState<SchoolLevel>(null);
  const [isDocsOpen, setIsDocsOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  // Tekst z skanera przekazywany do kalkulatora; zmiana nonce wymusza ponowne zamontowanie z nową wartością.
  const [scanInput, setScanInput] = useState<{ text: string; nonce: number }>({ text: "", nonce: 0 });

  // Odczyt z pamięci podręcznej (jeśli uczeń już wcześniej wybrał szkołę)
  useEffect(() => {
    const saved = localStorage.getItem("simplemath:school_level");
    if (saved === "primary" || saved === "secondary") {
      // Odczyt po hydratacji jest celowy: localStorage nie istnieje na serwerze, więc czytanie go w renderze
      // dałoby niezgodność HTML (hydration mismatch).
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLevel(saved);
    }
  }, []);

  const selectLevel = (newLevel: SchoolLevel) => {
    setLevel(newLevel);
    if (newLevel) {
      localStorage.setItem("simplemath:school_level", newLevel);
    } else {
      localStorage.removeItem("simplemath:school_level");
    }
  };

  const openScanInCalculator = ({ text }: ScanTarget) => {
    setScanInput((prev) => ({ text, nonce: prev.nonce + 1 }));
    setIsScannerOpen(false);
  };

  return (
    <div className="flex min-h-screen flex-col bg-zinc-100/70 dark:bg-zinc-950">
      <Header
        level={level}
        onSelectLevel={selectLevel}
        onOpenDocs={() => setIsDocsOpen(true)}
        onOpenScanner={() => setIsScannerOpen(true)}
      />

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:py-8 sm:px-6">
        {/* EKRAN WYBORU ETAPU EDUKACJI */}
        {level === null && <LevelSelector onSelectLevel={selectLevel} />}

        {/* POZIOM 1: SZKOŁA PODSTAWOWA (KLASY 4-8) */}
        {level === "primary" && <PrimarySchoolCalculator />}

        {/* POZIOM 2: SZKOŁA PONADPODSTAWOWA (LICEUM / TECHNIKUM / MATURA CKE) */}
        {level === "secondary" && (
          <SecondarySchoolView
            key={`sec-${scanInput.nonce}`}
            initialInput={scanInput.text}
            onOpenScanner={() => setIsScannerOpen(true)}
          />
        )}
      </main>

      <Footer />

      {/* Modal Dokumentacji i Ściąga CKE */}
      <DocsModal isOpen={isDocsOpen} onClose={() => setIsDocsOpen(false)} />

      {/* Skaner zadań: aparat / zrzut ekranu / schowek */}
      <ProblemScanner
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onOpenInCalculator={level === "secondary" ? openScanInCalculator : undefined}
        schoolLevel={level}
      />
    </div>
  );
}
