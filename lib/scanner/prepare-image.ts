/**
 * Przygotowanie zdjęcia pod OCR – działa w przeglądarce (także iOS Safari).
 * - skaluje duże zdjęcia z aparatu iPhone'a (12 MP+), które inaczej zabijają pamięć karty,
 * - uwzględnia orientację EXIF (createImageBitmap z imageOrientation),
 * - konwertuje do skali szarości i podbija kontrast, co wyraźnie poprawia rozpoznawanie.
 */

const MAX_SIDE = 1200;

export interface PreparedImage {
  /** Obraz po obróbce – podawany do OCR. */
  canvas: HTMLCanvasElement;
  /** Podgląd (data URL, mały JPEG) do pokazania użytkownikowi. */
  previewUrl: string;
}

async function loadBitmap(file: Blob): Promise<{ source: CanvasImageSource; width: number; height: number; close: () => void }> {
  if (typeof createImageBitmap === "function") {
    try {
      const bmp = await createImageBitmap(file, { imageOrientation: "from-image" });
      return { source: bmp, width: bmp.width, height: bmp.height, close: () => bmp.close() };
    } catch {
      // starsze Safari – spadamy do <img>
    }
  }
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.decoding = "async";
    img.src = url;
    await img.decode();
    return { source: img, width: img.naturalWidth, height: img.naturalHeight, close: () => {} };
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function prepareImageForOcr(file: Blob): Promise<PreparedImage> {
  const bmp = await loadBitmap(file);
  const scale = Math.min(1, MAX_SIDE / Math.max(bmp.width, bmp.height));
  const w = Math.max(1, Math.round(bmp.width * scale));
  const h = Math.max(1, Math.round(bmp.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Przeglądarka nie udostępnia obszaru roboczego (canvas).");

  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(bmp.source, 0, 0, w, h);
  bmp.close();

  // Podgląd robimy PRZED binaryzacją, żeby wyglądał naturalnie.
  const previewUrl = canvas.toDataURL("image/jpeg", 0.7);

  // Skala szarości + rozciągnięcie histogramu (prosty autokontrast).
  const img = ctx.getImageData(0, 0, w, h);
  const d = img.data;
  let min = 255;
  let max = 0;
  for (let i = 0; i < d.length; i += 4) {
    const g = (d[i] * 299 + d[i + 1] * 587 + d[i + 2] * 114) / 1000;
    d[i] = d[i + 1] = d[i + 2] = g;
    if (g < min) min = g;
    if (g > max) max = g;
  }
  const range = Math.max(1, max - min);
  for (let i = 0; i < d.length; i += 4) {
    const v = ((d[i] - min) * 255) / range;
    d[i] = d[i + 1] = d[i + 2] = v;
  }
  ctx.putImageData(img, 0, 0);

  return { canvas, previewUrl };
}
