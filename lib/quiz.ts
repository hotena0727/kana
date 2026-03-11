import hiraganaData from "@/data/hiragana.json";
import katakanaData from "@/data/katakana.json";
import type { KanaItem } from "@/lib/types";

export type QuizMode = "hiragana" | "katakana" | "mixed";
export type QuizQuestionType = "char_to_sound" | "sound_to_char";

export type QuizChoice = {
  id: string;
  label: string;
  isAnswer: boolean;
};

export type QuizQuestion = {
  id: string;
  kanaId: string;
  char: string;
  answer: string;
  script: "hiragana" | "katakana";
  type: QuizQuestionType;
  prompt: string;
  promptValue: string;
  choices: QuizChoice[];
};

const hiraganaList = hiraganaData as KanaItem[];
const katakanaList = katakanaData as KanaItem[];
const allKana = [...hiraganaList, ...katakanaList];

function shuffleArray<T>(array: T[]): T[] {
  const copied = [...array];

  for (let i = copied.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copied[i], copied[j]] = [copied[j], copied[i]];
  }

  return copied;
}

function getRandomItems<T>(array: T[], count: number): T[] {
  return shuffleArray(array).slice(0, count);
}

function getPoolByMode(mode: QuizMode): KanaItem[] {
  if (mode === "hiragana") return hiraganaList;
  if (mode === "katakana") return katakanaList;
  return allKana;
}

function buildCharToSoundQuestion(
  item: KanaItem,
  index: number,
  sourcePool: KanaItem[],
  prefix: string
): QuizQuestion {
  const wrongPool = sourcePool.filter(
    (kana) => kana.id !== item.id && kana.korean !== item.korean
  );

  const wrongChoices: QuizChoice[] = getRandomItems(wrongPool, 3).map((kana) => ({
    id: `${kana.id}_sound_wrong`,
    label: kana.korean,
    isAnswer: false,
  }));

  const choices = shuffleArray<QuizChoice>([
    {
      id: `${item.id}_sound_answer`,
      label: item.korean,
      isAnswer: true,
    },
    ...wrongChoices,
  ]);

  return {
    id: `${prefix}_${index}_${item.id}_char_to_sound`,
    kanaId: item.id,
    char: item.char,
    answer: item.korean,
    script: item.script,
    type: "char_to_sound",
    prompt: "이 문자의 발음은?",
    promptValue: item.char,
    choices,
  };
}

function buildSoundToCharQuestion(
  item: KanaItem,
  index: number,
  sourcePool: KanaItem[],
  prefix: string
): QuizQuestion {
  const wrongPool = sourcePool.filter(
    (kana) => kana.id !== item.id && kana.korean !== item.korean
  );

  const wrongChoices: QuizChoice[] = getRandomItems(wrongPool, 3).map((kana) => ({
    id: `${kana.id}_char_wrong`,
    label: kana.char,
    isAnswer: false,
  }));

  const choices = shuffleArray<QuizChoice>([
    {
      id: `${item.id}_char_answer`,
      label: item.char,
      isAnswer: true,
    },
    ...wrongChoices,
  ]);

  return {
    id: `${prefix}_${index}_${item.id}_sound_to_char`,
    kanaId: item.id,
    char: item.char,
    answer: item.char,
    script: item.script,
    type: "sound_to_char",
    prompt: "이 발음에 맞는 문자는?",
    promptValue: item.korean,
    choices,
  };
}

function buildQuestion(
  item: KanaItem,
  index: number,
  sourcePool: KanaItem[],
  prefix: string
): QuizQuestion {
  const type: QuizQuestionType =
    Math.random() < 0.5 ? "char_to_sound" : "sound_to_char";

  if (type === "char_to_sound") {
    return buildCharToSoundQuestion(item, index, sourcePool, prefix);
  }

  return buildSoundToCharQuestion(item, index, sourcePool, prefix);
}

export function createKanaQuiz(
  mode: QuizMode = "mixed",
  count = 10
): QuizQuestion[] {
  const pool = getPoolByMode(mode);
  const pickedKana = getRandomItems(pool, Math.min(count, pool.length));

  return pickedKana.map((item, index) =>
    buildQuestion(item, index, pool, `quiz_${mode}`)
  );
}

export function createReviewQuizByIds(ids: string[]): QuizQuestion[] {
  const pickedKana = shuffleArray(allKana.filter((item) => ids.includes(item.id)));

  return pickedKana.map((item, index) =>
    buildQuestion(item, index, allKana, "review")
  );
}