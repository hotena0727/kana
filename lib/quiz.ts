import hiraganaData from "@/data/hiragana.json";
import katakanaData from "@/data/katakana.json";
import type { KanaItem } from "@/lib/types";

export type QuizMode = "hiragana" | "katakana" | "mixed" | "rules";
export type QuizScope = "basic" | "extended" | "full";

export type QuizChoice = {
  id: string;
  label: string;
  isAnswer: boolean;
};

export type QuizQuestion = {
  id: string;
  kanaId: string;
  prompt: string;
  promptValue: string;
  answer: string;
  choices: QuizChoice[];
};

type RuleQuizItem = {
  id: string;
  prompt: string;
  promptValue: string;
  answer: string;
  choices: string[];
};

const hiraganaList = hiraganaData as KanaItem[];
const katakanaList = katakanaData as KanaItem[];
const allKanaList = [...hiraganaList, ...katakanaList];

const DAKUTEN_SET = new Set([
  "が",
  "ぎ",
  "ぐ",
  "げ",
  "ご",
  "ざ",
  "じ",
  "ず",
  "ぜ",
  "ぞ",
  "だ",
  "ぢ",
  "づ",
  "で",
  "ど",
  "ば",
  "び",
  "ぶ",
  "べ",
  "ぼ",
  "ぱ",
  "ぴ",
  "ぷ",
  "ぺ",
  "ぽ",
  "ガ",
  "ギ",
  "グ",
  "ゲ",
  "ゴ",
  "ザ",
  "ジ",
  "ズ",
  "ゼ",
  "ゾ",
  "ダ",
  "ヂ",
  "ヅ",
  "デ",
  "ド",
  "バ",
  "ビ",
  "ブ",
  "ベ",
  "ボ",
  "パ",
  "ピ",
  "プ",
  "ペ",
  "ポ",
]);

const ruleQuizItems: RuleQuizItem[] = [
  {
    id: "rule_sokuon_1",
    prompt: "작은 っ 의 역할로 가장 알맞은 것은?",
    promptValue: "きって",
    answer: "한 박자 멈춘 뒤 다음 소리를 강하게 이어 읽는다",
    choices: [
      "한 박자 멈춘 뒤 다음 소리를 강하게 이어 읽는다",
      "앞 음을 길게 늘여 읽는다",
      "앞 음을 약하게 만든다",
      "뒤 글자를 읽지 않는다",
    ],
  },
  {
    id: "rule_sokuon_2",
    prompt: "다음 중 촉음이 들어간 단어는?",
    promptValue: "보기에서 고르기",
    answer: "がっこう",
    choices: ["がこう", "がっこう", "がーこう", "がこうう"],
  },
  {
    id: "rule_sokuon_3",
    prompt: "다음 단어의 읽는 느낌으로 가장 알맞은 것은?",
    promptValue: "カップ",
    answer: "카-푸가 아니라 카-ㅃ푸처럼 중간을 잠깐 끊는다",
    choices: [
      "카-푸가 아니라 카-ㅃ푸처럼 중간을 잠깐 끊는다",
      "카아푸처럼 길게 늘인다",
      "카우푸처럼 두 글자로 나눈다",
      "카프처럼 작은 글자를 무시한다",
    ],
  },
  {
    id: "rule_choon_1",
    prompt: "장음 부호 ー 의 역할로 가장 알맞은 것은?",
    promptValue: "ケーキ",
    answer: "바로 앞 소리를 길게 늘여 읽는다",
    choices: [
      "바로 앞 소리를 길게 늘여 읽는다",
      "한 박자 끊어서 읽는다",
      "소리를 약하게 읽는다",
      "뒤 음절을 생략한다",
    ],
  },
  {
    id: "rule_choon_2",
    prompt: "다음 중 장음이 들어간 단어는?",
    promptValue: "보기에서 고르기",
    answer: "スーパー",
    choices: ["スパ", "スッパ", "スーパー", "スウパ"],
  },
  {
    id: "rule_choon_3",
    prompt: "コーヒー의 읽는 느낌으로 가장 알맞은 것은?",
    promptValue: "コーヒー",
    answer: "코히가 아니라 코-히-처럼 앞소리를 길게 읽는다",
    choices: [
      "코히가 아니라 코-히-처럼 앞소리를 길게 읽는다",
      "콧히처럼 중간을 끊어 읽는다",
      "코이히처럼 모음을 하나 더 넣어 읽는다",
      "코피처럼 단순화해서 읽는다",
    ],
  },
  {
    id: "rule_compare_1",
    prompt: "다음 중 중간을 끊어 읽는 단어는?",
    promptValue: "비교해서 고르기",
    answer: "さっか",
    choices: ["さか", "さっか", "サーカー", "せか"],
  },
  {
    id: "rule_compare_2",
    prompt: "다음 중 앞소리를 길게 읽는 단어는?",
    promptValue: "비교해서 고르기",
    answer: "カー",
    choices: ["か", "っか", "カー", "かーっ"],
  },
  {
    id: "rule_compare_3",
    prompt: "다음 설명에 맞는 단어를 고르세요",
    promptValue: "짧게 읽는 것이 아니라, 한 박자 끊은 뒤 이어 읽는다",
    answer: "きって",
    choices: ["きて", "きって", "きーて", "きてい"],
  },
  {
    id: "rule_compare_4",
    prompt: "다음 설명에 맞는 단어를 고르세요",
    promptValue: "끊는 것이 아니라, 바로 앞소리를 길게 늘인다",
    answer: "ケーキ",
    choices: ["ケキ", "ケット", "ケーキ", "ケッキ"],
  },
];

function shuffle<T>(items: T[]): T[] {
  const copied = [...items];
  for (let i = copied.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copied[i], copied[j]] = [copied[j], copied[i]];
  }
  return copied;
}

function uniqueById(items: KanaItem[]): KanaItem[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

function isBasicKana(item: KanaItem) {
  return item.char.length === 1 && !DAKUTEN_SET.has(item.char);
}

function isExtendedKana(item: KanaItem) {
  return item.char.length === 1;
}

function filterByScope(items: KanaItem[], scope: QuizScope) {
  if (scope === "basic") return items.filter(isBasicKana);
  if (scope === "extended") return items.filter(isExtendedKana);
  return items;
}

function getModeItems(mode: QuizMode) {
  if (mode === "hiragana") return hiraganaList;
  if (mode === "katakana") return katakanaList;
  if (mode === "mixed") return allKanaList;
  return [];
}

function getFilteredPool(mode: QuizMode, scope: QuizScope) {
  return filterByScope(getModeItems(mode), scope);
}

function buildChoicePool(
  answerItem: KanaItem,
  pool: KanaItem[],
  choiceCount = 4
): QuizChoice[] {
  const wrongCandidates = shuffle(
    pool.filter(
      (item) => item.id !== answerItem.id && item.korean !== answerItem.korean
    )
  ).slice(0, choiceCount - 1);

  const choices: QuizChoice[] = [
    {
      id: `${answerItem.id}_answer`,
      label: answerItem.korean,
      isAnswer: true,
    },
    ...wrongCandidates.map((item) => ({
      id: `${answerItem.id}_${item.id}`,
      label: item.korean,
      isAnswer: false,
    })),
  ];

  return shuffle(choices);
}

function buildKanaQuestion(
  answerItem: KanaItem,
  pool: KanaItem[],
  index: number
): QuizQuestion {
  const askCharToSound = Math.random() < 0.5;

  if (askCharToSound) {
    return {
      id: `quiz_${index}_${answerItem.id}_char_to_sound`,
      kanaId: answerItem.id,
      prompt: "이 문자의 발음은?",
      promptValue: answerItem.char,
      answer: answerItem.korean,
      choices: buildChoicePool(answerItem, pool),
    };
  }

  const choiceItems = shuffle(
    pool.filter((item) => item.id !== answerItem.id && item.char !== answerItem.char)
  ).slice(0, 3);

  const charChoices: QuizChoice[] = [
    {
      id: `${answerItem.id}_answer`,
      label: answerItem.char,
      isAnswer: true,
    },
    ...choiceItems.map((item) => ({
      id: `${answerItem.id}_${item.id}`,
      label: item.char,
      isAnswer: false,
    })),
  ];

  return {
    id: `quiz_${index}_${answerItem.id}_sound_to_char`,
    kanaId: answerItem.id,
    prompt: "이 발음에 맞는 문자는?",
    promptValue: answerItem.korean,
    answer: answerItem.char,
    choices: shuffle(charChoices),
  };
}

function buildRuleQuestion(item: RuleQuizItem, index: number): QuizQuestion {
  return {
    id: `rule_quiz_${index}_${item.id}`,
    kanaId: item.id,
    prompt: item.prompt,
    promptValue: item.promptValue,
    answer: item.answer,
    choices: shuffle(
      item.choices.map((choice, choiceIndex) => ({
        id: `${item.id}_${choiceIndex}`,
        label: choice,
        isAnswer: choice === item.answer,
      }))
    ),
  };
}

export function createKanaQuiz(
  mode: QuizMode,
  count = 10,
  scope: QuizScope = "full"
): QuizQuestion[] {
  if (mode === "rules") {
    const picked = shuffle(ruleQuizItems).slice(
      0,
      Math.min(count, ruleQuizItems.length)
    );
    return picked.map((item, index) => buildRuleQuestion(item, index));
  }

  const pool = uniqueById(getFilteredPool(mode, scope));
  if (pool.length === 0) return [];

  const picked = shuffle(pool).slice(0, Math.min(count, pool.length));
  return picked.map((item, index) => buildKanaQuestion(item, pool, index));
}

export function createReviewQuizByIds(ids: string[]): QuizQuestion[] {
  const uniqueIds = Array.from(new Set(ids));
  const pool = uniqueById(allKanaList.filter((item) => uniqueIds.includes(item.id)));

  if (pool.length === 0) return [];

  const reviewQuestions = shuffle(pool);
  return reviewQuestions.map((item, index) =>
    buildKanaQuestion(item, allKanaList, index)
  );
}