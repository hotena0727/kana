export const SFX_BASE_URL = "https://hotena.com/hotena/app/mp3/sfx";

export function playSfx(fileName: string, volume = 0.8) {
  if (typeof window === "undefined") return;
  if (!fileName) return;

  const audio = new Audio(`${SFX_BASE_URL}/${fileName}`);
  audio.volume = volume;
  audio.play().catch(() => {});
}