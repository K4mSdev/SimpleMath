import katex from "katex";
import { useMemo } from "react";

interface MathTexProps {
  tex: string;
  display?: boolean;
  className?: string;
}

/** Renderuje wzór LaTeX przez KaTeX (ułamki, pierwiastki, potęgi). */
export function MathTex({ tex, display = false, className }: MathTexProps) {
  const html = useMemo(
    () => katex.renderToString(tex, { throwOnError: false, displayMode: display, output: "html" }),
    [tex, display],
  );
  return <span className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}
