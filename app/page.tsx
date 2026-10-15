"use client";

import { useEffect, useState } from "react";
import { Header, Footer, LevelSelector, type SchoolLevel, type SecondaryModule } from "@/components/layout";
import { PrimarySchoolCalculator } from "@/components/primary";
import { ScientificCalculator, EquationSolver, GeometryCalculator } from "@/components/secondary";
import { DocsModal } from "@/components/docs/DocsModal";

export default function Home() {
  const [level, setLevel] = useState<SchoolLevel>(null);
  const [secondaryModule, setSecondaryModule] = useState<SecondaryModule>("general");
  const [isDocsOpen, setIsDocsOpen] = useState(false);

  // Odczyt z pamięci podręcznej (jeśli uczeń już wcześniej wybrał szkołę)
  useEffect(() => {
    const saved = localStorage.getItem("simplemath:school_level");
    if (saved === "primary" || saved === "secondary") {
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

  return (
    <div className="flex min-h-screen flex-col bg-zinc-100/70 dark:bg-zinc-950">
      <Header
        level={level}
        onSelectLevel={selectLevel}
        secondaryModule={secondaryModule}
        onSelectSecondaryModule={setSecondaryModule}
        onOpenDocs={() => setIsDocsOpen(true)}
      />

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:py-8 sm:px-6">
        {/* EKRAN WYBORU ETAPU EDUKACJI */}
        {level === null && <LevelSelector onSelectLevel={selectLevel} />}

        {/* POZIOM 1: SZKOŁA PODSTAWOWA (KLASY 4-8) */}
        {level === "primary" && <PrimarySchoolCalculator />}

        {/* POZIOM 2: SZKOŁA PONADPODSTAWOWA (LICEUM / TECHNIKUM) */}
        {level === "secondary" && (
          <div>
            {secondaryModule === "general" && <ScientificCalculator />}
            {secondaryModule === "equations" && <EquationSolver />}
            {secondaryModule === "geometry" && <GeometryCalculator />}
          </div>
        )}
      </main>

      <Footer />

      {/* Modal Dokumentacji i Ściągi CKE */}
      <DocsModal isOpen={isDocsOpen} onClose={() => setIsDocsOpen(false)} />
    </div>
  );
}
