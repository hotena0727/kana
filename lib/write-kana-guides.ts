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
  y: number;
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

export function getGhostGlyphs(text: string): GhostGlyph[] {
  const chars = splitKanaString(text);

  if (chars.length <= 1) {
    return [
      {
        char: chars[0] || "",
        x: 150,
        y: 150,
        size: 148,
      },
    ];
  }

  return [
    {
      char: chars[0],
      x: 120,
      y: 156,
      size: 118,
    },
    {
      char: chars[1],
      x: 200,
      y: 132,
      size: 70,
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