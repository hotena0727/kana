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
  ]);

  const voicedWideChars = new Set([
    "ぎ",
    "ジ",
    "じ",
    "ぢ",
    "ビ",
    "び",
    "ピ",
    "ぴ",
    "ギ",
  ]);

  if (voicedWideChars.has(char)) {
    return {
      x: 110,
      y: 214,
      size: 146,
    };
  }

  if (tallChars.has(char)) {
    return {
      x: 116,
      y: 214,
      size: 140,
    };
  }

  if (wideChars.has(char)) {
    return {
      x: 112,
      y: 214,
      size: 144,
    };
  }

  if (roundChars.has(char)) {
    return {
      x: 115,
      y: 214,
      size: 142,
    };
  }

  return {
    x: 114,
    y: 214,
    size: 142,
  };
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
      return {
        x: adjustX,
        y: 202,
        size: 94,
      };
    case "ゅ":
    case "ュ":
      return {
        x: adjustX,
        y: 205,
        size: 92,
      };
    case "ょ":
    case "ョ":
      return {
        x: adjustX,
        y: 200,
        size: 92,
      };
    default:
      return {
        x: adjustX,
        y: 202,
        size: 92,
      };
  }
}

export function getGhostGlyphs(text: string): GhostGlyph[] {
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