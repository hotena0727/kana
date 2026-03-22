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
    か: "왼쪽부터 안정적으로 쓰고, 오른쪽을 이어 보세요.",
    き: "가로선 간격을 너무 붙이지 않게 써보세요.",
    く: "짧게 시작해 부드럽게 꺾어 보세요.",
    け: "왼쪽 짧은 획과 오른쪽 긴 획의 차이를 살려 보세요.",
    こ: "두 가로선 간격을 일정하게 맞춰 보세요.",
    さ: "윗부분과 아래 흐름을 분리해서 보세요.",
    し: "위에서 아래로 한 흐름으로 내려와 보세요.",
    す: "마지막 곡선을 급하게 끊지 말고 이어 보세요.",
    せ: "가로와 세로가 만나는 위치를 확인해 보세요.",
    そ: "윗부분과 아래 곡선을 나눠서 보면 쉽습니다.",
    た: "왼쪽과 오른쪽 길이 차이를 살려 보세요.",
    ち: "윗부분은 작게, 아래 곡선은 크게 써보세요.",
    つ: "짧은 시작 뒤 긴 곡선을 한 번에 이어 보세요.",
    て: "짧은 선 뒤 긴 흐름을 자연스럽게 이어 보세요.",
    と: "점과 곡선을 너무 붙이지 말고 써보세요.",
    の: "한 번에 둥글게 이어 쓴다는 느낌으로 써보세요.",

    ア: "짧은 윗획 뒤 아래 흐름을 곧게 잡아 보세요.",
    イ: "왼쪽 짧은 획과 오른쪽 긴 대각선의 차이를 살려 보세요.",
    ウ: "윗부분과 아래 큰 흐름을 분리해서 보세요.",
    エ: "세 가로선의 간격을 일정하게 두세요.",
    オ: "왼쪽 흐름과 오른쪽 흐름을 나눠서 보세요.",
    カ: "짧은 윗선 뒤 세로 흐름을 또렷하게 내려 보세요.",
    キ: "가로선이 많으니 간격을 붙이지 않게 보세요.",
    ク: "짧게 시작해 아래로 꺾이는 흐름을 이어 보세요.",
    コ: "세로와 두 가로선이 안정적으로 보이게 하세요.",
    シ: "세 점은 위에서 아래로, 오른쪽 획은 크게 보세요.",
    ス: "윗부분은 짧게, 아래 곡선은 길게 이어 보세요.",
    ツ: "세 점은 흐르듯, 아래 획은 길게 보세요.",
    テ: "윗선과 아래 흐름을 따로 보세요.",
    ト: "짧은 가로선 뒤 세로 흐름을 곧게 내려 보세요.",
    ノ: "한 번에 툭 내려 긋는 느낌으로 써보세요.",
    ロ: "네모 틀이 찌그러지지 않게 균형을 보세요.",
    ン: "짧은 점 뒤 긴 흐름이 자연스럽게 이어지게 보세요.",
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
        y: 154,
        size: 160,
      },
    ];
  }

  export function getGhostGlyphs(text: string): GhostGlyph[] {
    const chars = splitKanaString(text);

    if (chars.length <= 1) {
      return [
        {
          char: chars[0] || "",
          x: 150,
          y: 154,
          size: 160,
        },
      ];
    }

    return [
      {
        char: chars[0],
        x: 118,
        y: 160,
        size: 126,
      },
      {
        char: chars[1],
        x: 202,
        y: 160,
        size: 78,
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