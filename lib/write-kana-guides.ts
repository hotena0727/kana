export type StrokeMark = {
  x: number;
  y: number;
  label: string;
};

export type StrokeGuide = {
  marks: StrokeMark[];
};

export type GhostGlyph = {
  char: string;
  x: number;
  y: number; // baseline 기준
  size: number;
};

export function isCombinedKana(char: string) {
  return Array.from(char || "").length >= 2;
}

export function splitKanaString(char: string) {
  return Array.from(char || "");
}

export function getHint(char: string, script: "hiragana" | "katakana") {
  const hintMap: Record<string, string> = {
    あ: "짧은 시작 뒤 마지막 곡선을 크게 이어 보세요.",
    い: "왼쪽 짧은 획 뒤 오른쪽 긴 획을 또렷하게 써보세요.",
    う: "윗점과 아래 곡선의 위치 차이를 보며 써보세요.",
    え: "윗부분은 작게, 아래 곡선은 넓게 써보세요.",
    お: "왼쪽과 오른쪽 흐름을 나눠 보면 더 잘 보입니다.",

    ア: "짧은 윗획 뒤 아래 흐름을 곧게 잡아 보세요.",
    イ: "왼쪽 짧은 획과 오른쪽 긴 대각선의 차이를 살려 보세요.",
    ウ: "윗부분과 아래 큰 흐름을 분리해서 보세요.",
    エ: "세 가로선의 간격을 일정하게 두세요.",
    オ: "왼쪽 흐름과 오른쪽 흐름을 나눠서 보세요.",
  };

  if (hintMap[char]) return hintMap[char];

  return script === "hiragana"
    ? "히라가나는 곡선 흐름을 의식하며 천천히 이어 써보세요."
    : "가타카나는 방향과 길이를 또렷하게 나눠서 써보세요.";
}

function getBaseKanaOffset(char: string) {
  const tallChars = new Set([
    "り",
    "リ",
    "し",
    "シ",
    "ち",
    "チ",
    "ひ",
    "ヒ",
    "い",
    "イ",
    "レ",
  ]);

  const wideChars = new Set([
    "み",
    "ミ",
    "き",
    "キ",
    "に",
    "ニ",
    "ま",
    "マ",
    "や",
    "ヤ",
    "ゆ",
    "ユ",
    "よ",
    "ヨ",
  ]);

  const roundChars = new Set([
    "く",
    "ぐ",
    "ク",
    "グ",
    "つ",
    "づ",
    "ツ",
    "ヅ",
    "る",
    "ル",
    "ろ",
    "ロ",
    "む",
    "ム",
  ]);

  const voicedWideChars = new Set([
    "ぎ",
    "じ",
    "ぢ",
    "び",
    "ぴ",
    "ギ",
    "ジ",
    "ヂ",
    "ビ",
    "ピ",
  ]);

  if (voicedWideChars.has(char)) {
    return { x: 110, y: 214, size: 146 };
  }

  if (tallChars.has(char)) {
    return { x: 116, y: 214, size: 140 };
  }

  if (wideChars.has(char)) {
    return { x: 112, y: 214, size: 144 };
  }

  if (roundChars.has(char)) {
    return { x: 115, y: 214, size: 142 };
  }

  return { x: 114, y: 214, size: 142 };
}

function getSmallKanaOffset(char: string, baseChar?: string) {
  const voicedBase = new Set([
    "ぎ",
    "じ",
    "ぢ",
    "び",
    "ぴ",
    "ギ",
    "ジ",
    "ヂ",
    "ビ",
    "ピ",
  ]);

  const adjustX = voicedBase.has(baseChar || "") ? 214 : 210;

  switch (char) {
    case "ゃ":
    case "ャ":
      return { x: adjustX, y: 202, size: 94 };
    case "ゅ":
    case "ュ":
      return { x: adjustX, y: 205, size: 92 };
    case "ょ":
    case "ョ":
      return { x: adjustX, y: 200, size: 92 };
    default:
      return { x: adjustX, y: 202, size: 92 };
  }
}

function getSpecialGlyphs(text: string): GhostGlyph[] | null {
  const specialMap: Record<string, GhostGlyph[]> = {
    // hiragana - ゃ
    きゃ: [
      { char: "き", x: 112, y: 214, size: 144 },
      { char: "ゃ", x: 212, y: 202, size: 94 },
    ],
    しゃ: [
      { char: "し", x: 116, y: 214, size: 140 },
      { char: "ゃ", x: 212, y: 200, size: 96 },
    ],
    ちゃ: [
      { char: "ち", x: 116, y: 214, size: 140 },
      { char: "ゃ", x: 212, y: 200, size: 96 },
    ],
    にゃ: [
      { char: "に", x: 112, y: 214, size: 144 },
      { char: "ゃ", x: 212, y: 202, size: 94 },
    ],
    ひゃ: [
      { char: "ひ", x: 116, y: 214, size: 140 },
      { char: "ゃ", x: 212, y: 200, size: 96 },
    ],
    みゃ: [
      { char: "み", x: 110, y: 214, size: 146 },
      { char: "ゃ", x: 214, y: 202, size: 94 },
    ],
    りゃ: [
      { char: "り", x: 116, y: 214, size: 140 },
      { char: "ゃ", x: 212, y: 200, size: 96 },
    ],
    ぎゃ: [
      { char: "ぎ", x: 110, y: 214, size: 146 },
      { char: "ゃ", x: 216, y: 202, size: 94 },
    ],
    じゃ: [
      { char: "じ", x: 110, y: 214, size: 146 },
      { char: "ゃ", x: 216, y: 202, size: 94 },
    ],
    ぢゃ: [
      { char: "ぢ", x: 110, y: 214, size: 146 },
      { char: "ゃ", x: 216, y: 202, size: 94 },
    ],
    びゃ: [
      { char: "び", x: 110, y: 214, size: 146 },
      { char: "ゃ", x: 216, y: 202, size: 94 },
    ],
    ぴゃ: [
      { char: "ぴ", x: 110, y: 214, size: 146 },
      { char: "ゃ", x: 216, y: 202, size: 94 },
    ],

    // hiragana - ゅ
    きゅ: [
      { char: "き", x: 112, y: 214, size: 144 },
      { char: "ゅ", x: 212, y: 205, size: 92 },
    ],
    しゅ: [
      { char: "し", x: 116, y: 214, size: 140 },
      { char: "ゅ", x: 212, y: 204, size: 94 },
    ],
    ちゅ: [
      { char: "ち", x: 116, y: 214, size: 140 },
      { char: "ゅ", x: 212, y: 204, size: 94 },
    ],
    にゅ: [
      { char: "に", x: 112, y: 214, size: 144 },
      { char: "ゅ", x: 212, y: 205, size: 92 },
    ],
    ひゅ: [
      { char: "ひ", x: 116, y: 214, size: 140 },
      { char: "ゅ", x: 212, y: 204, size: 94 },
    ],
    みゅ: [
      { char: "み", x: 110, y: 214, size: 146 },
      { char: "ゅ", x: 214, y: 205, size: 92 },
    ],
    りゅ: [
      { char: "り", x: 116, y: 214, size: 140 },
      { char: "ゅ", x: 212, y: 204, size: 94 },
    ],
    ぎゅ: [
      { char: "ぎ", x: 110, y: 214, size: 146 },
      { char: "ゅ", x: 216, y: 205, size: 92 },
    ],
    じゅ: [
      { char: "じ", x: 110, y: 214, size: 146 },
      { char: "ゅ", x: 216, y: 205, size: 92 },
    ],
    ぢゅ: [
      { char: "ぢ", x: 110, y: 214, size: 146 },
      { char: "ゅ", x: 216, y: 205, size: 92 },
    ],
    びゅ: [
      { char: "び", x: 110, y: 214, size: 146 },
      { char: "ゅ", x: 216, y: 205, size: 92 },
    ],
    ぴゅ: [
      { char: "ぴ", x: 110, y: 214, size: 146 },
      { char: "ゅ", x: 216, y: 205, size: 92 },
    ],

    // hiragana - ょ
    きょ: [
      { char: "き", x: 112, y: 214, size: 144 },
      { char: "ょ", x: 212, y: 200, size: 92 },
    ],
    しょ: [
      { char: "し", x: 116, y: 214, size: 140 },
      { char: "ょ", x: 212, y: 198, size: 94 },
    ],
    ちょ: [
      { char: "ち", x: 116, y: 214, size: 140 },
      { char: "ょ", x: 212, y: 198, size: 94 },
    ],
    にょ: [
      { char: "に", x: 112, y: 214, size: 144 },
      { char: "ょ", x: 212, y: 200, size: 92 },
    ],
    ひょ: [
      { char: "ひ", x: 116, y: 214, size: 140 },
      { char: "ょ", x: 212, y: 198, size: 94 },
    ],
    みょ: [
      { char: "み", x: 110, y: 214, size: 146 },
      { char: "ょ", x: 214, y: 200, size: 92 },
    ],
    りょ: [
      { char: "り", x: 116, y: 214, size: 140 },
      { char: "ょ", x: 212, y: 198, size: 94 },
    ],
    ぎょ: [
      { char: "ぎ", x: 110, y: 214, size: 146 },
      { char: "ょ", x: 216, y: 200, size: 92 },
    ],
    じょ: [
      { char: "じ", x: 110, y: 214, size: 146 },
      { char: "ょ", x: 216, y: 200, size: 92 },
    ],
    ぢょ: [
      { char: "ぢ", x: 110, y: 214, size: 146 },
      { char: "ょ", x: 216, y: 200, size: 92 },
    ],
    びょ: [
      { char: "び", x: 110, y: 214, size: 146 },
      { char: "ょ", x: 216, y: 200, size: 92 },
    ],
    ぴょ: [
      { char: "ぴ", x: 110, y: 214, size: 146 },
      { char: "ょ", x: 216, y: 200, size: 92 },
    ],

    // katakana
    キャ: [
      { char: "キ", x: 112, y: 214, size: 144 },
      { char: "ャ", x: 212, y: 202, size: 94 },
    ],
    シャ: [
      { char: "シ", x: 116, y: 214, size: 140 },
      { char: "ャ", x: 212, y: 200, size: 96 },
    ],
    チャ: [
      { char: "チ", x: 116, y: 214, size: 140 },
      { char: "ャ", x: 212, y: 200, size: 96 },
    ],
    ニャ: [
      { char: "ニ", x: 112, y: 214, size: 144 },
      { char: "ャ", x: 212, y: 202, size: 94 },
    ],
    ヒャ: [
      { char: "ヒ", x: 116, y: 214, size: 140 },
      { char: "ャ", x: 212, y: 200, size: 96 },
    ],
    ミャ: [
      { char: "ミ", x: 110, y: 214, size: 146 },
      { char: "ャ", x: 214, y: 202, size: 94 },
    ],
    リャ: [
      { char: "リ", x: 116, y: 214, size: 140 },
      { char: "ャ", x: 212, y: 200, size: 96 },
    ],

    キュ: [
      { char: "キ", x: 112, y: 214, size: 144 },
      { char: "ュ", x: 212, y: 205, size: 92 },
    ],
    シュ: [
      { char: "シ", x: 116, y: 214, size: 140 },
      { char: "ュ", x: 212, y: 204, size: 94 },
    ],
    チュ: [
      { char: "チ", x: 116, y: 214, size: 140 },
      { char: "ュ", x: 212, y: 204, size: 94 },
    ],
    ニュ: [
      { char: "ニ", x: 112, y: 214, size: 144 },
      { char: "ュ", x: 212, y: 205, size: 92 },
    ],
    ヒュ: [
      { char: "ヒ", x: 116, y: 214, size: 140 },
      { char: "ュ", x: 212, y: 204, size: 94 },
    ],
    ミュ: [
      { char: "ミ", x: 110, y: 214, size: 146 },
      { char: "ュ", x: 214, y: 205, size: 92 },
    ],
    リュ: [
      { char: "リ", x: 116, y: 214, size: 140 },
      { char: "ュ", x: 212, y: 204, size: 94 },
    ],

    キョ: [
      { char: "キ", x: 112, y: 214, size: 144 },
      { char: "ョ", x: 212, y: 200, size: 92 },
    ],
    ショ: [
      { char: "シ", x: 116, y: 214, size: 140 },
      { char: "ョ", x: 212, y: 198, size: 94 },
    ],
    チョ: [
      { char: "チ", x: 116, y: 214, size: 140 },
      { char: "ョ", x: 212, y: 198, size: 94 },
    ],
    ニョ: [
      { char: "ニ", x: 112, y: 214, size: 144 },
      { char: "ョ", x: 212, y: 200, size: 92 },
    ],
    ヒョ: [
      { char: "ヒ", x: 116, y: 214, size: 140 },
      { char: "ョ", x: 212, y: 198, size: 94 },
    ],
    ミョ: [
      { char: "ミ", x: 110, y: 214, size: 146 },
      { char: "ョ", x: 214, y: 200, size: 92 },
    ],
    リョ: [
      { char: "リ", x: 116, y: 214, size: 140 },
      { char: "ョ", x: 212, y: 198, size: 94 },
    ],

    ギャ: [
      { char: "ギ", x: 110, y: 214, size: 146 },
      { char: "ャ", x: 216, y: 202, size: 94 },
    ],
    ジャ: [
      { char: "ジ", x: 110, y: 214, size: 146 },
      { char: "ャ", x: 216, y: 202, size: 94 },
    ],
    ビャ: [
      { char: "ビ", x: 110, y: 214, size: 146 },
      { char: "ャ", x: 216, y: 202, size: 94 },
    ],
    ピャ: [
      { char: "ピ", x: 110, y: 214, size: 146 },
      { char: "ャ", x: 216, y: 202, size: 94 },
    ],

    ギュ: [
      { char: "ギ", x: 110, y: 214, size: 146 },
      { char: "ュ", x: 216, y: 205, size: 92 },
    ],
    ジュ: [
      { char: "ジ", x: 110, y: 214, size: 146 },
      { char: "ュ", x: 216, y: 205, size: 92 },
    ],
    ビュ: [
      { char: "ビ", x: 110, y: 214, size: 146 },
      { char: "ュ", x: 216, y: 205, size: 92 },
    ],
    ピュ: [
      { char: "ピ", x: 110, y: 214, size: 146 },
      { char: "ュ", x: 216, y: 205, size: 92 },
    ],

    ギョ: [
      { char: "ギ", x: 110, y: 214, size: 146 },
      { char: "ョ", x: 216, y: 200, size: 92 },
    ],
    ジョ: [
      { char: "ジ", x: 110, y: 214, size: 146 },
      { char: "ョ", x: 216, y: 200, size: 92 },
    ],
    ビョ: [
      { char: "ビ", x: 110, y: 214, size: 146 },
      { char: "ョ", x: 216, y: 200, size: 92 },
    ],
    ピョ: [
      { char: "ピ", x: 110, y: 214, size: 146 },
      { char: "ョ", x: 216, y: 200, size: 92 },
    ],
  };

  return specialMap[text] || null;
}

export function getGhostGlyphs(text: string): GhostGlyph[] {
  const special = getSpecialGlyphs(text);
  if (special) return special;

  const chars = splitKanaString(text);

  if (chars.length <= 1) {
    return [
      {
        char: chars[0] || "",
        x: 150,
        y: 214,
        size: 148,
      },
    ];
  }

  const base = getBaseKanaOffset(chars[0]);
  const small = getSmallKanaOffset(chars[1], chars[0]);

  return [
    {
      char: chars[0],
      x: base.x,
      y: base.y,
      size: base.size,
    },
    {
      char: chars[1],
      x: small.x,
      y: small.y,
      size: small.size,
    },
  ];
}

export function getStrokeGuide(text: string): StrokeGuide | null {
  const guides: Record<string, StrokeGuide> = {
    あ: {
      marks: [
        { x: 90, y: 96, label: "①" },
        { x: 118, y: 138, label: "②" },
        { x: 214, y: 222, label: "③" },
      ],
    },
    い: {
      marks: [
        { x: 108, y: 118, label: "①" },
        { x: 204, y: 206, label: "②" },
      ],
    },
    う: {
      marks: [
        { x: 142, y: 84, label: "①" },
        { x: 204, y: 198, label: "②" },
      ],
    },
    え: {
      marks: [
        { x: 134, y: 86, label: "①" },
        { x: 104, y: 140, label: "②" },
        { x: 204, y: 220, label: "③" },
      ],
    },
    お: {
      marks: [
        { x: 90, y: 100, label: "①" },
        { x: 116, y: 140, label: "②" },
        { x: 220, y: 106, label: "③" },
        { x: 218, y: 220, label: "④" },
      ],
    },
  };

  return guides[text] || null;
}