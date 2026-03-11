export type KanaDailyProgress = {
  date: string;
  solved: number;
  correct: number;
};

export type KanaProgress = {
  lastStudyDate: string | null;
  streakDays: number;
  daily: KanaDailyProgress | null;
};

const PROGRESS_KEY = "hotena-kana-progress";

function todayString() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function diffDays(a: string, b: string) {
  const aDate = new Date(`${a}T00:00:00`);
  const bDate = new Date(`${b}T00:00:00`);
  const ms = bDate.getTime() - aDate.getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

export function getKanaProgress(): KanaProgress {
  if (typeof window === "undefined") {
    return {
      lastStudyDate: null,
      streakDays: 0,
      daily: null,
    };
  }

  try {
    const raw = window.localStorage.getItem(PROGRESS_KEY);
    if (!raw) {
      return {
        lastStudyDate: null,
        streakDays: 0,
        daily: null,
      };
    }

    const parsed = JSON.parse(raw) as KanaProgress;
    return {
      lastStudyDate: parsed.lastStudyDate ?? null,
      streakDays: typeof parsed.streakDays === "number" ? parsed.streakDays : 0,
      daily: parsed.daily ?? null,
    };
  } catch {
    return {
      lastStudyDate: null,
      streakDays: 0,
      daily: null,
    };
  }
}

export function saveKanaProgress(progress: KanaProgress) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
}

export function recordKanaStudy(solved: number, correct: number) {
  const today = todayString();
  const current = getKanaProgress();

  let nextStreak = current.streakDays;

  if (!current.lastStudyDate) {
    nextStreak = 1;
  } else if (current.lastStudyDate === today) {
    nextStreak = current.streakDays || 1;
  } else {
    const gap = diffDays(current.lastStudyDate, today);
    if (gap === 1) {
      nextStreak = current.streakDays + 1;
    } else {
      nextStreak = 1;
    }
  }

  const currentDaily =
    current.daily && current.daily.date === today
      ? current.daily
      : { date: today, solved: 0, correct: 0 };

  const next: KanaProgress = {
    lastStudyDate: today,
    streakDays: nextStreak,
    daily: {
      date: today,
      solved: currentDaily.solved + solved,
      correct: currentDaily.correct + correct,
    },
  };

  saveKanaProgress(next);
}

export function getTodayKanaStats() {
  const progress = getKanaProgress();
  const today = todayString();

  if (!progress.daily || progress.daily.date !== today) {
    return {
      date: today,
      solved: 0,
      correct: 0,
    };
  }

  return progress.daily;
}