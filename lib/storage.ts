const WRONG_KANA_KEY = "hotena-kana-wrong-ids";

export function getWrongKanaIds(): string[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(WRONG_KANA_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((v) => typeof v === "string") : [];
  } catch {
    return [];
  }
}

export function getWrongKanaCount(): number {
  return getWrongKanaIds().length;
}

export function saveWrongKanaIds(ids: string[]) {
  if (typeof window === "undefined") return;

  const uniqueIds = Array.from(new Set(ids));
  window.localStorage.setItem(WRONG_KANA_KEY, JSON.stringify(uniqueIds));
}

export function addWrongKanaId(id: string) {
  const current = getWrongKanaIds();
  saveWrongKanaIds([...current, id]);
}

export function removeWrongKanaId(id: string) {
  const current = getWrongKanaIds();
  saveWrongKanaIds(current.filter((item) => item !== id));
}

export function clearWrongKanaIds() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(WRONG_KANA_KEY);
}