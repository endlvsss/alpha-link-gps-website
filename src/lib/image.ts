// Fotos tomadas en terreno: se comprimen en el navegador (~1600 px, JPEG) como
// pide la especificación y se guarda una miniatura para el borrador local.

export interface CompressedPhoto {
  thumb: string;
  /** Peso del JPEG de 1600 px que se subiría al almacenamiento privado. */
  bytes: number;
}

function drawScaled(src: CanvasImageSource & { width: number; height: number }, max: number) {
  const scale = Math.min(1, max / Math.max(src.width, src.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(src.width * scale);
  canvas.height = Math.round(src.height * scale);
  canvas.getContext("2d")?.drawImage(src, 0, 0, canvas.width, canvas.height);
  return canvas;
}

export async function compressPhoto(file: File): Promise<CompressedPhoto> {
  const bitmap = await createImageBitmap(file);
  const full = drawScaled(bitmap, 1600);
  const blob = await new Promise<Blob | null>((resolve) => full.toBlob(resolve, "image/jpeg", 0.8));
  const thumb = drawScaled(bitmap, 360).toDataURL("image/jpeg", 0.6);
  bitmap.close();
  return { thumb, bytes: blob?.size ?? 0 };
}

/** Foto de ejemplo dibujada en el navegador, para probar el flujo sin cámara. */
export function samplePhoto(label: string): CompressedPhoto {
  const canvas = document.createElement("canvas");
  canvas.width = 360;
  canvas.height = 270;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.fillStyle = "#1c2b34";
    ctx.fillRect(0, 0, 360, 270);
    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    for (let x = 0; x < 360; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + 120, 270);
      ctx.stroke();
    }
    ctx.fillStyle = "#53d8ea";
    ctx.font = "600 13px sans-serif";
    ctx.fillText("FOTO DE EJEMPLO", 18, 30);
    ctx.fillStyle = "#e4ecee";
    ctx.font = "700 22px sans-serif";
    ctx.fillText(label, 18, 140);
    ctx.fillStyle = "#9fb8bc";
    ctx.font = "13px sans-serif";
    ctx.fillText(new Date().toLocaleString("es-CL"), 18, 250);
  }
  const thumb = canvas.toDataURL("image/jpeg", 0.7);
  return { thumb, bytes: Math.round(thumb.length * 0.75) };
}

export interface GeoPoint {
  lat: number;
  lng: number;
  accuracy: number;
}

/** Geolocalización si el navegador la entrega (la especificación la pide "si está disponible"). */
export function currentPosition(timeoutMs = 6000): Promise<GeoPoint | null> {
  return new Promise((resolve) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) return resolve(null);
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: Math.round(pos.coords.accuracy) }),
      () => resolve(null),
      { enableHighAccuracy: true, timeout: timeoutMs, maximumAge: 60_000 },
    );
  });
}
