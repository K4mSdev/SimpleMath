import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SimpleMath – kalkulator dla uczniów",
    short_name: "SimpleMath",
    description: "Kalkulator matematyczny z podstawy programowej: klasy 4–8 i szkoły ponadpodstawowe. Skanuj zadania aparatem.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    lang: "pl",
    background_color: "#f4f4f5",
    theme_color: "#4f46e5",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "maskable" },
    ],
  };
}
