export const SFX_BASE_URL = "https://hotena.com/hotena/n3/mp3";

export function playSfx(fileName: string, volume = 0.8) {
  if (typeof window === "undefined") return;
  if (!fileName) return;

  const audio = new Audio(`${SFX_BASE_URL}/${fileName}`);
  audio.volume = volume;
  audio.play().catch(() => {});
}