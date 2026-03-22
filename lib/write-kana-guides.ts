export type StrokeMark = {
  x: number;
  y: number;
  label: string;
};

export type StrokeFlow = {
  x1: number;
  y1: number;
  cx?: number;
  cy?: number;
  x2: number;
  y2: number;
};

export type StrokeGuide = {
  marks: StrokeMark[];
  flows: StrokeFlow[];
};

export type GhostGlyph = {
  char: string;
  x: number;
  y: number;
  size: number;
};

export const BASE_CANVAS_WIDTH = 300;
export const BASE_CANVAS_HEIGHT = 300;

export function isCombinedKana(char: string) {
  return (char || "").length >= 2;
}

export function splitKanaString(char: string) {
  return Array.from(char || "");
}

export function getStrokeHint(char: string, script: "hiragana" | "katakana") {
  const hintMap: Record<string, string> = {
    あ: "짧은 시작 뒤 마지막 곡선을 크게 이어 보세요.",
    い: "왼쪽 짧은 획 뒤 오른쪽 긴 획을 또렷하게 써보세요.",
    う: "윗점과 아래 곡선의 위치 차이를 의식해 보세요.",
    え: "윗부분은 작게, 아래 곡선은 넓게 써보세요.",
    お: "왼쪽과 오른쪽 흐름을 나눠 보면 더 잘 보입니다.",
    か: "왼쪽부터 안정적으로 쓰고, 오른쪽을 이어 보세요.",
    き: "가로선 간격을 너무 붙이지 않게 써보세요.",
    や: "왼쪽 시작 뒤 오른쪽 흐름을 여유 있게 이어 보세요.",
    ゆ: "안쪽과 바깥쪽 흐름이 겹치지 않게 천천히 보세요.",
    よ: "세 줄 간격이 너무 붙지 않게 써보세요.",

    ア: "짧은 윗획 뒤 아래 흐름을 곧게 잡아 보세요.",
    イ: "왼쪽 짧은 획과 오른쪽 긴 대각선의 차이를 살려 보세요.",
    ウ: "윗부분과 아래 큰 흐름을 분리해서 보세요.",
    エ: "세 가로선 간격을 일정하게 두세요.",
    オ: "왼쪽 흐름과 오른쪽 흐름을 나눠서 보세요.",
    カ: "짧은 윗선 뒤 세로 흐름을 또렷하게 내려 보세요.",
    キ: "가로선이 많으니 간격을 붙이지 않게 보세요.",
    ヤ: "왼쪽과 오른쪽 흐름의 길이 차이를 의식해 보세요.",
    ユ: "틀을 먼저 떠올린 뒤 차분히 써보세요.",
    ヨ: "세 칸 구조처럼 간격을 맞추면 더 또렷합니다.",
  };

  if (hintMap[char]) return hintMap[char];

  return script === "hiragana"
    ? "히라가나는 곡선 흐름을 의식하며 천천히 이어 써보세요."
    : "가타카나는 방향과 길이를 또렷하게 나눠서 써보세요.";
}

/**
 * 반투명 예시 글자 배치
 * - 1글자: 가운데 크게
 * - 2글자(요음): 앞 글자 크게, 뒤 작은 글자 작게 우하단 배치
 */
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

  const first = chars[0];
  const second = chars[1];

  return [
    {
      char: first,
      x: 126,
      y: 148,
      size: 130,
    },
    {
      char: second,
      x: 204,
      y: 184,
      size: 88,
    },
  ];
}

/**
 * 큰 글자 획순 데이터를 작은 글자에도 재사용
 * 예: や -> ゃ
 */
const SMALL_KANA_MAP: Record<string, string> = {
  ゃ: "や",
  ゅ: "ゆ",
  ょ: "よ",
  ャ: "ヤ",
  ュ: "ユ",
  ョ: "ヨ",
};

function withOffset(
  guide: StrokeGuide,
  dx: number,
  dy: number,
  scale = 1,
  startIndex = 0
): StrokeGuide {
  return {
    marks: guide.marks.map((mark, index) => ({
      x: mark.x * scale + dx,
      y: mark.y * scale + dy,
      label: toCircledNumber(startIndex + index + 1),
    })),
    flows: guide.flows.map((flow) => ({
      x1: flow.x1 * scale + dx,
      y1: flow.y1 * scale + dy,
      cx: flow.cx !== undefined ? flow.cx * scale + dx : undefined,
      cy: flow.cy !== undefined ? flow.cy * scale + dy : undefined,
      x2: flow.x2 * scale + dx,
      y2: flow.y2 * scale + dy,
    })),
  };
}

function mergeGuides(a: StrokeGuide, b: StrokeGuide): StrokeGuide {
  return {
    marks: [...a.marks, ...b.marks],
    flows: [...a.flows, ...b.flows],
  };
}

function toCircledNumber(n: number) {
  const circled = [
    "①",
    "②",
    "③",
    "④",
    "⑤",
    "⑥",
    "⑦",
    "⑧",
    "⑨",
    "⑩",
  ];
  return circled[n - 1] || String(n);
}

/**
 * 기본 글자 획순 스타터 세트
 * - 먼저 자주 쓰는 문자/요음 관련 문자 중심
 * - 이후 같은 형식으로 계속 추가 가능
 */
const BASE_GUIDES: Record<string, StrokeGuide> = {
  あ: {
    marks: [
      { x: 88, y: 92, label: "①" },
      { x: 116, y: 136, label: "②" },
      { x: 214, y: 220, label: "③" },
    ],
    flows: [
      { x1: 98, y1: 100, x2: 110, y2: 114 },
      { x1: 126, y1: 144, x2: 138, y2: 158 },
      { x1: 196, y1: 200, cx: 206, cy: 208, x2: 214, y2: 214 },
    ],
  },
  い: {
    marks: [
      { x: 104, y: 114, label: "①" },
      { x: 204, y: 206, label: "②" },
    ],
    flows: [
      { x1: 114, y1: 122, x2: 124, y2: 136 },
      { x1: 190, y1: 190, x2: 198, y2: 200 },
    ],
  },
  う: {
    marks: [
      { x: 140, y: 84, label: "①" },
      { x: 204, y: 198, label: "②" },
    ],
    flows: [
      { x1: 148, y1: 92, x2: 156, y2: 100 },
      { x1: 188, y1: 182, cx: 196, cy: 190, x2: 204, y2: 194 },
    ],
  },
  え: {
    marks: [
      { x: 130, y: 84, label: "①" },
      { x: 102, y: 138, label: "②" },
      { x: 204, y: 220, label: "③" },
    ],
    flows: [
      { x1: 138, y1: 92, x2: 148, y2: 98 },
      { x1: 112, y1: 146, x2: 122, y2: 154 },
      { x1: 188, y1: 202, cx: 196, cy: 208, x2: 204, y2: 212 },
    ],
  },
  お: {
    marks: [
      { x: 86, y: 96, label: "①" },
      { x: 112, y: 138, label: "②" },
      { x: 220, y: 104, label: "③" },
      { x: 218, y: 222, label: "④" },
    ],
    flows: [
      { x1: 98, y1: 104, x2: 110, y2: 118 },
      { x1: 122, y1: 146, x2: 136, y2: 160 },
      { x1: 206, y1: 116, x2: 196, y2: 126 },
      { x1: 200, y1: 204, cx: 208, cy: 210, x2: 216, y2: 214 },
    ],
  },
  か: {
    marks: [
      { x: 96, y: 108, label: "①" },
      { x: 136, y: 148, label: "②" },
      { x: 216, y: 110, label: "③" },
    ],
    flows: [
      { x1: 108, y1: 116, x2: 118, y2: 130 },
      { x1: 146, y1: 156, x2: 156, y2: 168 },
      { x1: 202, y1: 122, cx: 208, cy: 130, x2: 214, y2: 140 },
    ],
  },
  き: {
    marks: [
      { x: 142, y: 88, label: "①" },
      { x: 136, y: 132, label: "②" },
      { x: 128, y: 184, label: "③" },
      { x: 214, y: 212, label: "④" },
    ],
    flows: [
      { x1: 152, y1: 94, x2: 162, y2: 98 },
      { x1: 146, y1: 138, x2: 156, y2: 142 },
      { x1: 138, y1: 190, x2: 148, y2: 194 },
      { x1: 198, y1: 202, x2: 190, y2: 198 },
    ],
  },
  や: {
    marks: [
      { x: 96, y: 110, label: "①" },
      { x: 150, y: 102, label: "②" },
      { x: 212, y: 192, label: "③" },
    ],
    flows: [
      { x1: 108, y1: 118, x2: 118, y2: 130 },
      { x1: 160, y1: 108, x2: 170, y2: 112 },
      { x1: 194, y1: 176, cx: 204, cy: 182, x2: 212, y2: 188 },
    ],
  },
  ゆ: {
    marks: [
      { x: 94, y: 112, label: "①" },
      { x: 146, y: 148, label: "②" },
      { x: 212, y: 194, label: "③" },
    ],
    flows: [
      { x1: 106, y1: 120, x2: 116, y2: 134 },
      { x1: 156, y1: 156, cx: 164, cy: 160, x2: 172, y2: 164 },
      { x1: 194, y1: 178, cx: 204, cy: 184, x2: 212, y2: 190 },
    ],
  },
  よ: {
    marks: [
      { x: 146, y: 92, label: "①" },
      { x: 146, y: 146, label: "②" },
      { x: 208, y: 214, label: "③" },
    ],
    flows: [
      { x1: 156, y1: 98, x2: 166, y2: 100 },
      { x1: 156, y1: 152, x2: 166, y2: 154 },
      { x1: 192, y1: 204, x2: 184, y2: 202 },
    ],
  },

  ア: {
    marks: [
      { x: 142, y: 92, label: "①" },
      { x: 206, y: 194, label: "②" },
    ],
    flows: [
      { x1: 152, y1: 98, x2: 162, y2: 100 },
      { x1: 192, y1: 182, x2: 200, y2: 190 },
    ],
  },
  イ: {
    marks: [
      { x: 96, y: 110, label: "①" },
      { x: 206, y: 194, label: "②" },
    ],
    flows: [
      { x1: 108, y1: 118, x2: 118, y2: 130 },
      { x1: 192, y1: 182, x2: 200, y2: 190 },
    ],
  },
  ウ: {
    marks: [
      { x: 142, y: 84, label: "①" },
      { x: 206, y: 194, label: "②" },
    ],
    flows: [
      { x1: 150, y1: 92, x2: 158, y2: 98 },
      { x1: 192, y1: 182, x2: 200, y2: 190 },
    ],
  },
  エ: {
    marks: [
      { x: 142, y: 88, label: "①" },
      { x: 100, y: 144, label: "②" },
      { x: 194, y: 212, label: "③" },
    ],
    flows: [
      { x1: 152, y1: 94, x2: 162, y2: 96 },
      { x1: 112, y1: 150, x2: 122, y2: 150 },
      { x1: 180, y1: 206, x2: 190, y2: 206 },
    ],
  },
  オ: {
    marks: [
      { x: 142, y: 88, label: "①" },
      { x: 100, y: 144, label: "②" },
      { x: 220, y: 102, label: "③" },
      { x: 214, y: 212, label: "④" },
    ],
    flows: [
      { x1: 152, y1: 94, x2: 162, y2: 96 },
      { x1: 112, y1: 150, x2: 122, y2: 150 },
      { x1: 206, y1: 114, x2: 196, y2: 122 },
      { x1: 198, y1: 200, x2: 190, y2: 206 },
    ],
  },
  カ: {
    marks: [
      { x: 146, y: 94, label: "①" },
      { x: 206, y: 194, label: "②" },
    ],
    flows: [
      { x1: 156, y1: 100, x2: 166, y2: 102 },
      { x1: 192, y1: 182, x2: 200, y2: 190 },
    ],
  },
  キ: {
    marks: [
      { x: 142, y: 88, label: "①" },
      { x: 136, y: 132, label: "②" },
      { x: 204, y: 212, label: "③" },
    ],
    flows: [
      { x1: 152, y1: 94, x2: 162, y2: 96 },
      { x1: 146, y1: 138, x2: 156, y2: 140 },
      { x1: 190, y1: 202, x2: 182, y2: 198 },
    ],
  },
  ヤ: {
    marks: [
      { x: 96, y: 110, label: "①" },
      { x: 150, y: 102, label: "②" },
      { x: 212, y: 192, label: "③" },
    ],
    flows: [
      { x1: 108, y1: 118, x2: 118, y2: 130 },
      { x1: 160, y1: 108, x2: 170, y2: 112 },
      { x1: 194, y1: 176, cx: 204, cy: 182, x2: 212, y2: 188 },
    ],
  },
  ユ: {
    marks: [
      { x: 96, y: 110, label: "①" },
      { x: 220, y: 110, label: "②" },
      { x: 214, y: 214, label: "③" },
    ],
    flows: [
      { x1: 108, y1: 114, x2: 118, y2: 114 },
      { x1: 206, y1: 114, x2: 196, y2: 114 },
      { x1: 198, y1: 202, x2: 190, y2: 208 },
    ],
  },
  ヨ: {
    marks: [
      { x: 96, y: 110, label: "①" },
      { x: 96, y: 156, label: "②" },
      { x: 96, y: 208, label: "③" },
    ],
    flows: [
      { x1: 108, y1: 114, x2: 118, y2: 114 },
      { x1: 108, y1: 160, x2: 118, y2: 160 },
      { x1: 108, y1: 212, x2: 118, y2: 212 },
    ],
  },
};

/**
 * 1글자 또는 요음용 획순 가이드 반환
 * - 기본 글자면 그대로
 * - 요음이면 앞글자 + 작은 ゃ/ゅ/ょ를 축소 결합
 */
export function getStrokeGuide(text: string): StrokeGuide | null {
  const chars = splitKanaString(text);

  if (chars.length <= 1) {
    return BASE_GUIDES[chars[0]] || null;
  }

  const first = chars[0];
  const second = chars[1];
  const firstGuide = BASE_GUIDES[first];

  const mappedSecond = SMALL_KANA_MAP[second] || second;
  const secondBaseGuide = BASE_GUIDES[mappedSecond];

  if (!firstGuide || !secondBaseGuide) return null;

  const firstCount = firstGuide.marks.length;

  const secondGuide = withOffset(secondBaseGuide, 138, 96, 0.56, firstCount);

  return mergeGuides(
    withOffset(firstGuide, 0, 0, 1, 0),
    secondGuide
  );
}