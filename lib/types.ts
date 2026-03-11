export type KanaScript = "hiragana" | "katakana";

export type KanaGroup = "basic" | "dakuon" | "handakuon" | "youon";

export type KanaItem = {
  id: string;
  script: KanaScript;
  char: string;
  roman: string;
  korean: string;
  group: KanaGroup;
  row: string;
  example?: string;
  exampleKorean?: string;
};