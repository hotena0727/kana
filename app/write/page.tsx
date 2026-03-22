"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import hiraganaData from "@/data/hiragana.json";
import katakanaData from "@/data/katakana.json";
import type { KanaItem } from "@/lib/types";

type WriteMode = "basic" | "combined" | "all";
type GridMode = "single" | "four";

type StudyItem = KanaItem & {
  script: "hiragana" | "katakana";
};

type StrokeMark = {
  x: number;
  y: number;
  label: string;
};

type StrokeFlow = {
  x1: number;
  y1: number;
  cx?: number;
  cy?: number;
  x2: number;
  y2: number;
};

type StrokeGuide = {
  marks: StrokeMark[];
  flows?: StrokeFlow[];
};

const hiraganaList = (hiraganaData as KanaItem[]).map((item) => ({
  ...item,
  script: "hiragana" as const,
}));

const katakanaList = (katakanaData as KanaItem[]).map((item) => ({
  ...item,
  script: "katakana" as const,
}));

const allKanaList: StudyItem[] = [...hiraganaList, ...katakanaList];

function isCombinedKana(char: string) {
  return (char || "").length >= 2;
}

function filterWriteItems(items: StudyItem[], mode: WriteMode) {
  if (mode === "basic") {
    return items.filter((item) => !isCombinedKana(item.char));
  }

  if (mode === "combined") {
    return items.filter((item) => isCombinedKana(item.char));
  }

  return items;
}

function pickRandomIndex(length: number, currentIndex: number) {
  if (length <= 1) return currentIndex;

  let next = currentIndex;
  while (next === currentIndex) {
    next = Math.floor(Math.random() * length);
  }
  return next;
}

function speakJapanese(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  if (!text) return;

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "ja-JP";
  utterance.rate = 0.9;
  utterance.pitch = 1.0;

  const voices = window.speechSynthesis.getVoices();
  const jaVoice =
    voices.find((voice) => voice.lang === "ja-JP") ||
    voices.find((voice) => voice.lang.startsWith("ja"));

  if (jaVoice) utterance.voice = jaVoice;
  window.speechSynthesis.speak(utterance);
}

function getStrokeHint(item: StudyItem) {
  const hintMap: Record<string, string> = {
    あ: "짧은 시작 뒤 마지막 곡선을 크게 이어 보세요.",
    い: "왼쪽 짧은 획 후 오른쪽 긴 획을 또렷하게 써보세요.",
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
    は: "왼쪽 두 획과 오른쪽 곡선을 나눠 보세요.",
    ふ: "점 두 개와 아래 곡선을 구분해서 보세요.",
    ま: "윗부분과 아래 선의 간격을 일정하게 보세요.",
    や: "왼쪽과 오른쪽 획 길이 차이를 보세요.",
    ゆ: "겹쳐 보이는 부분을 천천히 나눠 보세요.",
    よ: "세 줄 간격을 일정하게 맞춰 보세요.",
    り: "두 획의 높이와 간격 차이를 살려 보세요.",
    る: "둥근 흐름을 끊지 말고 이어 보세요.",
    ろ: "모서리를 너무 각지지 않게 둥글게 이어 보세요.",
    ん: "짧은 시작 후 마지막 곡선을 부드럽게 이어 보세요.",

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
    ハ: "양쪽 대각선 벌어지는 각도를 맞춰 보세요.",
    ヒ: "가로 흐름 뒤 왼쪽 아래로 빠지는 방향을 보세요.",
    フ: "가로선과 아래 흐름 둘을 분리해 보세요.",
    マ: "윗부분과 아래 점/가로선의 간격을 보세요.",
    ミ: "세 가로선 간격을 일정하게 보세요.",
    メ: "짧은 시작 뒤 큰 대각선과 교차 흐름을 보세요.",
    ヤ: "가운데 긴 흐름을 중심으로 나머지를 붙여 보세요.",
    ヨ: "세 칸 구조처럼 간격을 맞추면 더 또렷합니다.",
    リ: "두 세로 흐름의 간격과 높이 차이를 보세요.",
    ル: "왼쪽 짧은 획 뒤 아래 흐름을 부드럽게 이어 보세요.",
    ロ: "네모 틀이 찌그러지지 않게 균형을 보세요.",
    ン: "짧은 점 뒤 긴 흐름이 자연스럽게 이어지게 보세요.",
  };

  if (hintMap[item.char]) return hintMap[item.char];

  return item.script === "hiragana"
    ? "히라가나는 곡선 흐름을 의식하며 천천히 이어 써보세요."
    : "가타카나는 방향과 길이를 또렷하게 나눠서 써보세요.";
}

function getStrokeGuide(char: string): StrokeGuide | null {
  const guides: Record<string, StrokeGuide> = {
    あ: {
      marks: [
        { x: 96, y: 96, label: "①" },
        { x: 122, y: 134, label: "②" },
        { x: 206, y: 218, label: "③" },
      ],
      flows: [
        { x1: 108, y1: 104, x2: 118, y2: 118 },
        { x1: 134, y1: 142, x2: 144, y2: 154 },
        { x1: 194, y1: 202, cx: 206, cy: 206, x2: 214, y2: 214 },
      ],
    },
    い: {
      marks: [
        { x: 112, y: 120, label: "①" },
        { x: 198, y: 202, label: "②" },
      ],
      flows: [
        { x1: 122, y1: 128, x2: 132, y2: 142 },
        { x1: 186, y1: 188, x2: 194, y2: 198 },
      ],
    },
    う: {
      marks: [
        { x: 144, y: 88, label: "①" },
        { x: 194, y: 194, label: "②" },
      ],
      flows: [
        { x1: 150, y1: 96, x2: 158, y2: 106 },
        { x1: 180, y1: 180, cx: 190, cy: 184, x2: 200, y2: 190 },
      ],
    },
    え: {
      marks: [
        { x: 136, y: 88, label: "①" },
        { x: 108, y: 140, label: "②" },
        { x: 198, y: 212, label: "③" },
      ],
      flows: [
        { x1: 144, y1: 96, x2: 152, y2: 104 },
        { x1: 116, y1: 146, x2: 126, y2: 154 },
        { x1: 186, y1: 198, cx: 194, cy: 204, x2: 204, y2: 208 },
      ],
    },
    お: {
      marks: [
        { x: 96, y: 102, label: "①" },
        { x: 120, y: 142, label: "②" },
        { x: 214, y: 108, label: "③" },
        { x: 214, y: 214, label: "④" },
      ],
      flows: [
        { x1: 108, y1: 110, x2: 118, y2: 122 },
        { x1: 132, y1: 150, x2: 142, y2: 162 },
        { x1: 202, y1: 118, x2: 194, y2: 128 },
        { x1: 202, y1: 202, cx: 208, cy: 208, x2: 214, y2: 210 },
      ],
    },
    か: {
      marks: [
        { x: 98, y: 110, label: "①" },
        { x: 138, y: 148, label: "②" },
        { x: 214, y: 110, label: "③" },
      ],
      flows: [
        { x1: 110, y1: 118, x2: 120, y2: 130 },
        { x1: 150, y1: 156, x2: 160, y2: 168 },
        { x1: 202, y1: 120, cx: 208, cy: 128, x2: 214, y2: 138 },
      ],
    },
    き: {
      marks: [
        { x: 144, y: 90, label: "①" },
        { x: 138, y: 136, label: "②" },
        { x: 130, y: 188, label: "③" },
        { x: 214, y: 214, label: "④" },
      ],
      flows: [
        { x1: 152, y1: 98, x2: 160, y2: 106 },
        { x1: 146, y1: 144, x2: 154, y2: 150 },
        { x1: 138, y1: 194, x2: 146, y2: 198 },
        { x1: 202, y1: 206, x2: 194, y2: 202 },
      ],
    },
    く: {
      marks: [{ x: 198, y: 164, label: "①" }],
      flows: [{ x1: 184, y1: 150, cx: 190, cy: 158, x2: 198, y2: 168 }],
    },
    こ: {
      marks: [
        { x: 144, y: 106, label: "①" },
        { x: 144, y: 212, label: "②" },
      ],
      flows: [
        { x1: 154, y1: 112, x2: 162, y2: 112 },
        { x1: 154, y1: 206, x2: 162, y2: 206 },
      ],
    },
    さ: {
      marks: [
        { x: 144, y: 92, label: "①" },
        { x: 98, y: 146, label: "②" },
        { x: 214, y: 150, label: "③" },
      ],
      flows: [
        { x1: 152, y1: 98, x2: 160, y2: 104 },
        { x1: 110, y1: 152, x2: 120, y2: 160 },
        { x1: 202, y1: 158, cx: 208, cy: 164, x2: 214, y2: 172 },
      ],
    },
    し: {
      marks: [{ x: 196, y: 198, label: "①" }],
      flows: [{ x1: 184, y1: 186, cx: 190, cy: 192, x2: 198, y2: 198 }],
    },
    す: {
      marks: [
        { x: 144, y: 92, label: "①" },
        { x: 214, y: 204, label: "②" },
      ],
      flows: [
        { x1: 152, y1: 98, x2: 160, y2: 104 },
        { x1: 198, y1: 188, cx: 206, cy: 194, x2: 214, y2: 200 },
      ],
    },
    た: {
      marks: [
        { x: 98, y: 112, label: "①" },
        { x: 142, y: 148, label: "②" },
        { x: 210, y: 188, label: "③" },
      ],
      flows: [
        { x1: 110, y1: 120, x2: 118, y2: 132 },
        { x1: 152, y1: 156, x2: 160, y2: 168 },
        { x1: 196, y1: 176, cx: 204, cy: 182, x2: 212, y2: 188 },
      ],
    },
    ち: {
      marks: [
        { x: 144, y: 92, label: "①" },
        { x: 114, y: 142, label: "②" },
        { x: 206, y: 202, label: "③" },
      ],
      flows: [
        { x1: 152, y1: 98, x2: 160, y2: 104 },
        { x1: 124, y1: 150, x2: 132, y2: 158 },
        { x1: 192, y1: 188, cx: 200, cy: 194, x2: 208, y2: 198 },
      ],
    },
    つ: {
      marks: [{ x: 198, y: 182, label: "①" }],
      flows: [{ x1: 184, y1: 168, cx: 192, cy: 174, x2: 200, y2: 180 }],
    },
    て: {
      marks: [
        { x: 144, y: 94, label: "①" },
        { x: 204, y: 194, label: "②" },
      ],
      flows: [
        { x1: 152, y1: 100, x2: 160, y2: 104 },
        { x1: 192, y1: 182, cx: 198, cy: 188, x2: 206, y2: 194 },
      ],
    },
    の: {
      marks: [{ x: 194, y: 184, label: "①" }],
      flows: [{ x1: 180, y1: 170, cx: 188, cy: 176, x2: 196, y2: 184 }],
    },

    ア: {
      marks: [
        { x: 144, y: 96, label: "①" },
        { x: 204, y: 192, label: "②" },
      ],
      flows: [
        { x1: 152, y1: 102, x2: 160, y2: 106 },
        { x1: 192, y1: 180, x2: 200, y2: 188 },
      ],
    },
    イ: {
      marks: [
        { x: 98, y: 114, label: "①" },
        { x: 206, y: 194, label: "②" },
      ],
      flows: [
        { x1: 110, y1: 120, x2: 120, y2: 130 },
        { x1: 194, y1: 182, x2: 202, y2: 190 },
      ],
    },
    ウ: {
      marks: [
        { x: 144, y: 86, label: "①" },
        { x: 204, y: 194, label: "②" },
      ],
      flows: [
        { x1: 152, y1: 94, x2: 160, y2: 100 },
        { x1: 192, y1: 182, x2: 200, y2: 190 },
      ],
    },
    エ: {
      marks: [
        { x: 144, y: 92, label: "①" },
        { x: 104, y: 146, label: "②" },
        { x: 194, y: 212, label: "③" },
      ],
      flows: [
        { x1: 152, y1: 98, x2: 160, y2: 102 },
        { x1: 116, y1: 152, x2: 126, y2: 152 },
        { x1: 182, y1: 206, x2: 190, y2: 206 },
      ],
    },
    オ: {
      marks: [
        { x: 144, y: 92, label: "①" },
        { x: 102, y: 146, label: "②" },
        { x: 214, y: 108, label: "③" },
        { x: 210, y: 210, label: "④" },
      ],
      flows: [
        { x1: 152, y1: 98, x2: 160, y2: 102 },
        { x1: 114, y1: 152, x2: 124, y2: 152 },
        { x1: 204, y1: 118, x2: 194, y2: 126 },
        { x1: 198, y1: 198, x2: 190, y2: 204 },
      ],
    },
    カ: {
      marks: [
        { x: 148, y: 98, label: "①" },
        { x: 204, y: 192, label: "②" },
      ],
      flows: [
        { x1: 156, y1: 104, x2: 164, y2: 108 },
        { x1: 194, y1: 182, x2: 202, y2: 190 },
      ],
    },
    キ: {
      marks: [
        { x: 144, y: 92, label: "①" },
        { x: 138, y: 136, label: "②" },
        { x: 204, y: 210, label: "③" },
      ],
      flows: [
        { x1: 152, y1: 98, x2: 160, y2: 100 },
        { x1: 146, y1: 142, x2: 154, y2: 144 },
        { x1: 194, y1: 202, x2: 186, y2: 198 },
      ],
    },
    ク: {
      marks: [{ x: 202, y: 176, label: "①" }],
      flows: [{ x1: 188, y1: 164, cx: 194, cy: 170, x2: 202, y2: 176 }],
    },
    コ: {
      marks: [
        { x: 98, y: 108, label: "①" },
        { x: 214, y: 108, label: "②" },
        { x: 212, y: 212, label: "③" },
      ],
      flows: [
        { x1: 110, y1: 112, x2: 120, y2: 112 },
        { x1: 202, y1: 112, x2: 192, y2: 112 },
        { x1: 202, y1: 200, x2: 194, y2: 208 },
      ],
    },
    シ: {
      marks: [
        { x: 112, y: 96, label: "①" },
        { x: 132, y: 128, label: "②" },
        { x: 202, y: 198, label: "③" },
      ],
      flows: [
        { x1: 120, y1: 102, x2: 126, y2: 108 },
        { x1: 140, y1: 134, x2: 146, y2: 140 },
        { x1: 190, y1: 186, x2: 198, y2: 194 },
      ],
    },
    ス: {
      marks: [
        { x: 144, y: 94, label: "①" },
        { x: 204, y: 194, label: "②" },
      ],
      flows: [
        { x1: 152, y1: 100, x2: 160, y2: 104 },
        { x1: 192, y1: 184, x2: 200, y2: 192 },
      ],
    },
    ツ: {
      marks: [
        { x: 110, y: 94, label: "①" },
        { x: 136, y: 120, label: "②" },
        { x: 164, y: 146, label: "③" },
      ],
      flows: [
        { x1: 118, y1: 100, x2: 124, y2: 106 },
        { x1: 144, y1: 126, x2: 150, y2: 132 },
        { x1: 172, y1: 152, x2: 178, y2: 158 },
      ],
    },
    テ: {
      marks: [
        { x: 144, y: 94, label: "①" },
        { x: 204, y: 194, label: "②" },
      ],
      flows: [
        { x1: 152, y1: 100, x2: 160, y2: 104 },
        { x1: 192, y1: 184, x2: 200, y2: 192 },
      ],
    },
    ノ: {
      marks: [{ x: 198, y: 178, label: "①" }],
      flows: [{ x1: 186, y1: 166, x2: 194, y2: 174 }],
    },
    ハ: {
      marks: [
        { x: 104, y: 160, label: "①" },
        { x: 214, y: 160, label: "②" },
      ],
      flows: [
        { x1: 116, y1: 150, x2: 124, y2: 158 },
        { x1: 202, y1: 150, x2: 194, y2: 158 },
      ],
    },
    フ: {
      marks: [
        { x: 144, y: 100, label: "①" },
        { x: 106, y: 144, label: "②" },
        { x: 204, y: 196, label: "③" },
      ],
      flows: [
        { x1: 152, y1: 106, x2: 160, y2: 108 },
        { x1: 118, y1: 150, x2: 126, y2: 156 },
        { x1: 192, y1: 186, x2: 200, y2: 194 },
      ],
    },
    ミ: {
      marks: [
        { x: 144, y: 96, label: "①" },
        { x: 134, y: 150, label: "②" },
        { x: 124, y: 208, label: "③" },
      ],
      flows: [
        { x1: 152, y1: 100, x2: 160, y2: 102 },
        { x1: 142, y1: 154, x2: 150, y2: 156 },
        { x1: 132, y1: 212, x2: 140, y2: 214 },
      ],
    },
    ヨ: {
      marks: [
        { x: 98, y: 108, label: "①" },
        { x: 98, y: 156, label: "②" },
        { x: 98, y: 208, label: "③" },
      ],
      flows: [
        { x1: 110, y1: 112, x2: 120, y2: 112 },
        { x1: 110, y1: 160, x2: 120, y2: 160 },
        { x1: 110, y1: 212, x2: 120, y2: 212 },
      ],
    },
    リ: {
      marks: [
        { x: 112, y: 154, label: "①" },
        { x: 204, y: 194, label: "②" },
      ],
      flows: [
        { x1: 122, y1: 146, x2: 130, y2: 154 },
        { x1: 194, y1: 184, x2: 202, y2: 192 },
      ],
    },
    ロ: {
      marks: [
        { x: 98, y: 108, label: "①" },
        { x: 214, y: 108, label: "②" },
        { x: 214, y: 212, label: "③" },
      ],
      flows: [
        { x1: 110, y1: 112, x2: 120, y2: 112 },
        { x1: 202, y1: 112, x2: 194, y2: 112 },
        { x1: 202, y1: 200, x2: 194, y2: 208 },
      ],
    },
    ン: {
      marks: [
        { x: 130, y: 100, label: "①" },
        { x: 202, y: 194, label: "②" },
      ],
      flows: [
        { x1: 138, y1: 108, x2: 144, y2: 114 },
        { x1: 190, y1: 184, x2: 198, y2: 192 },
      ],
    },
  };

  return guides[char] || null;
}

function scaleMarkOrFlowValue(
  value: number,
  actual: number,
  base: number
) {
  return (value / base) * actual;
}

export default function WritePage() {
  const [mode, setMode] = useState<WriteMode>("basic");
  const [gridMode, setGridMode] = useState<GridMode>("four");
  const [showGhost, setShowGhost] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [roundCount, setRoundCount] = useState(1);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const isDrawingRef = useRef(false);

  const filteredItems = useMemo(() => {
    return filterWriteItems(allKanaList, mode);
  }, [mode]);

  const currentItem = filteredItems[currentIndex] ?? filteredItems[0];

  const modeLabel =
    mode === "basic" ? "기본 문자" : mode === "combined" ? "요음" : "전체";

  const gridLabel = gridMode === "single" ? "1칸" : "4칸";

  const strokeHint = useMemo(() => {
    return currentItem ? getStrokeHint(currentItem) : "";
  }, [currentItem]);

  const strokeGuide = useMemo(() => {
    return currentItem ? getStrokeGuide(currentItem.char) : null;
  }, [currentItem]);

  const drawSingleCell = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ) => {
    const padding = 18;
    const cellSize = Math.min(width - padding * 2, height - padding * 2, 250);
    const x = (width - cellSize) / 2;
    const y = (height - cellSize) / 2;

    ctx.setLineDash([]);
    ctx.strokeRect(x, y, cellSize, cellSize);

    ctx.beginPath();
    ctx.moveTo(x + cellSize / 2, y);
    ctx.lineTo(x + cellSize / 2, y + cellSize);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x, y + cellSize / 2);
    ctx.lineTo(x + cellSize, y + cellSize / 2);
    ctx.stroke();

    ctx.setLineDash([4, 4]);

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + cellSize, y + cellSize);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x + cellSize, y);
    ctx.lineTo(x, y + cellSize);
    ctx.stroke();
  };

  const drawFourCells = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ) => {
    const padding = 16;
    const gap = 10;
    const cellSize = Math.min((width - padding * 2 - gap) / 2, 140);
    const totalWidth = cellSize * 2 + gap;
    const totalHeight = cellSize * 2 + gap;
    const startX = (width - totalWidth) / 2;
    const startY = (height - totalHeight) / 2;

    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < 2; col++) {
        const x = startX + col * (cellSize + gap);
        const y = startY + row * (cellSize + gap);

        ctx.setLineDash([]);
        ctx.strokeRect(x, y, cellSize, cellSize);

        ctx.beginPath();
        ctx.moveTo(x + cellSize / 2, y);
        ctx.lineTo(x + cellSize / 2, y + cellSize);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(x, y + cellSize / 2);
        ctx.lineTo(x + cellSize, y + cellSize / 2);
        ctx.stroke();

        ctx.setLineDash([4, 4]);

        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + cellSize, y + cellSize);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(x + cellSize, y);
        ctx.lineTo(x, y + cellSize);
        ctx.stroke();
      }
    }
  };

  const drawGhostChar = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    char: string
  ) => {
    ctx.save();
    ctx.globalAlpha = 0.11;
    ctx.fillStyle = "#64748b";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `700 96px "Noto Sans JP", "Hiragino Sans", sans-serif`;
    ctx.fillText(char, width / 2, height / 2);
    ctx.restore();
  };

  const drawSoftArrow = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    flow: StrokeFlow
  ) => {
    const baseWidth = 300;
    const baseHeight = gridMode === "single" ? 300 : 340;

    const x1 = scaleMarkOrFlowValue(flow.x1, width, baseWidth);
    const y1 = scaleMarkOrFlowValue(flow.y1, height, baseHeight);
    const x2 = scaleMarkOrFlowValue(flow.x2, width, baseWidth);
    const y2 = scaleMarkOrFlowValue(flow.y2, height, baseHeight);
    const cx =
      flow.cx !== undefined
        ? scaleMarkOrFlowValue(flow.cx, width, baseWidth)
        : undefined;
    const cy =
      flow.cy !== undefined
        ? scaleMarkOrFlowValue(flow.cy, height, baseHeight)
        : undefined;

    ctx.save();
    ctx.strokeStyle = "rgba(14, 165, 233, 0.42)";
    ctx.fillStyle = "rgba(14, 165, 233, 0.42)";
    ctx.lineWidth = 1.25;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    if (cx !== undefined && cy !== undefined) {
      ctx.quadraticCurveTo(cx, cy, x2, y2);
    } else {
      ctx.lineTo(x2, y2);
    }
    ctx.stroke();

    const angle =
      cx !== undefined && cy !== undefined
        ? Math.atan2(y2 - cy, x2 - cx)
        : Math.atan2(y2 - y1, x2 - x1);

    const head = 4.5;

    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(
      x2 - head * Math.cos(angle - Math.PI / 7),
      y2 - head * Math.sin(angle - Math.PI / 7)
    );
    ctx.lineTo(
      x2 - head * Math.cos(angle + Math.PI / 7),
      y2 - head * Math.sin(angle + Math.PI / 7)
    );
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  };

  const drawStrokeAnnotations = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    guide: StrokeGuide | null
  ) => {
    if (!guide) return;

    const baseWidth = 300;
    const baseHeight = gridMode === "single" ? 300 : 340;

    if (guide.flows?.length) {
      guide.flows.forEach((flow) => drawSoftArrow(ctx, width, height, flow));
    }

    guide.marks.forEach((mark) => {
      const x = scaleMarkOrFlowValue(mark.x, width, baseWidth);
      const y = scaleMarkOrFlowValue(mark.y, height, baseHeight);

      ctx.save();
      ctx.fillStyle = "rgba(51, 65, 85, 0.66)";
      ctx.font = '600 14px "Noto Sans JP", "Noto Sans KR", sans-serif';
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(mark.label, x, y);
      ctx.restore();
    });
  };

  const drawGuide = () => {
    const canvas = canvasRef.current;
    if (!canvas || !currentItem) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = "#cfe3ff";
    ctx.lineWidth = 1;

    if (gridMode === "single") {
      drawSingleCell(ctx, width, height);
    } else {
      drawFourCells(ctx, width, height);
    }

    ctx.setLineDash([]);

    if (showGhost) {
      drawGhostChar(ctx, width, height, currentItem.char);
      drawStrokeAnnotations(ctx, width, height, strokeGuide);
    }

    ctx.strokeStyle = "#111827";
    ctx.lineWidth = 7;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  };

  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    const wrapper = wrapperRef.current;
    if (!canvas || !wrapper) return;

    const rect = wrapper.getBoundingClientRect();
    const ratio = window.devicePixelRatio || 1;
    const cssWidth = rect.width;
    const cssHeight = gridMode === "single" ? 300 : 340;

    canvas.width = Math.floor(cssWidth * ratio);
    canvas.height = Math.floor(cssHeight * ratio);
    canvas.style.width = `${cssWidth}px`;
    canvas.style.height = `${cssHeight}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    drawGuide();
  };

  useEffect(() => {
    setCurrentIndex(0);
    setShowAnswer(false);
    setRoundCount(1);
  }, [mode]);

  useEffect(() => {
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  useEffect(() => {
    resizeCanvas();
  }, [currentIndex, mode, gridMode, showGhost, currentItem?.char]);

  const getPoint = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const point = getPoint(event);
    if (!canvas || !ctx || !point) return;

    isDrawingRef.current = true;
    canvas.setPointerCapture(event.pointerId);
    ctx.beginPath();
    ctx.moveTo(point.x, point.y);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const point = getPoint(event);
    if (!canvas || !ctx || !point) return;

    ctx.lineTo(point.x, point.y);
    ctx.stroke();
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    isDrawingRef.current = false;
    try {
      canvas.releasePointerCapture(event.pointerId);
    } catch {}
  };

  const handleClearCanvas = () => {
    drawGuide();
  };

  const handleShowAnswer = () => {
    setShowAnswer(true);
  };

  const handleNext = () => {
    if (!filteredItems.length) return;

    const nextIndex =
      currentIndex === filteredItems.length - 1 ? 0 : currentIndex + 1;

    setCurrentIndex(nextIndex);
    setShowAnswer(false);
    setRoundCount((prev) => prev + 1);
  };

  const handleRandom = () => {
    if (!filteredItems.length) return;

    const nextIndex = pickRandomIndex(filteredItems.length, currentIndex);
    setCurrentIndex(nextIndex);
    setShowAnswer(false);
    setRoundCount((prev) => prev + 1);
  };

  const handleSpeak = () => {
    if (!currentItem?.char) return;
    speakJapanese(currentItem.char);
  };

  const handleSpeakExample = () => {
    if (!currentItem?.example) return;
    speakJapanese(currentItem.example);
  };

  if (!currentItem) {
    return (
      <main className="min-h-screen bg-[linear-gradient(180deg,#f7fbff_0%,#eef6ff_45%,#f9fcff_100%)] pb-24 text-slate-900">
        <section className="mx-auto flex min-h-screen w-full max-w-md flex-col px-5 py-7">
          <div className="rounded-[30px] bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.08)] ring-1 ring-slate-100">
            <h1 className="text-2xl font-extrabold tracking-tight">손으로 써보기</h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              표시할 문자가 없습니다.
            </p>
          </div>
        </section>
        <BottomNav />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f7fbff_0%,#eef6ff_45%,#f9fcff_100%)] pb-24 text-slate-900">
      <section className="mx-auto flex min-h-screen w-full max-w-md flex-col px-5 py-7">
        <div className="mb-5 overflow-hidden rounded-[32px] bg-white/85 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)] ring-1 ring-sky-100 backdrop-blur">
          <Link
            href="/"
            className="inline-flex rounded-full bg-sky-50 px-3 py-1 text-sm font-semibold text-sky-700 ring-1 ring-sky-100"
          >
            ← 홈으로
          </Link>

          <div className="mt-4 inline-flex rounded-full bg-sky-50 px-3 py-1 text-sm font-semibold text-sky-700 ring-1 ring-sky-100">
            ✍️ 손으로 써보기
          </div>

          <h1 className="mt-4 text-[30px] font-extrabold leading-tight tracking-tight">
            눈으로만 보지 말고,
            <br />
            직접 써보며 익혀보세요.
          </h1>

          <p className="mt-3 text-[15px] leading-7 text-slate-600">
            원고지 칸에 손가락이나 펜으로 직접 써보세요. 반투명 예시와 작은 획순 표시를
            참고하면서 천천히 따라 쓰면 훨씬 자연스럽게 익힐 수 있습니다.
          </p>
        </div>

        <div className="mb-5 rounded-[28px] bg-white p-5 shadow-[0_14px_36px_rgba(15,23,42,0.07)] ring-1 ring-slate-100">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-sky-700">쓰기 모드</div>
            <div className="text-xs text-slate-500">{modeLabel}</div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-3">
            {[
              { value: "basic", label: "기본 문자" },
              { value: "combined", label: "요음" },
              { value: "all", label: "전체" },
            ].map((item) => {
              const active = mode === item.value;
              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setMode(item.value as WriteMode)}
                  className={[
                    "rounded-2xl px-4 py-3 text-sm font-semibold ring-1 transition",
                    active
                      ? "bg-sky-500 text-white ring-sky-500"
                      : "bg-white text-slate-700 ring-slate-200 hover:bg-slate-50",
                  ].join(" ")}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setGridMode("single")}
              className={[
                "rounded-2xl px-4 py-3 text-sm font-semibold ring-1 transition",
                gridMode === "single"
                  ? "bg-sky-500 text-white ring-sky-500"
                  : "bg-white text-slate-700 ring-slate-200 hover:bg-slate-50",
              ].join(" ")}
            >
              1칸
            </button>

            <button
              type="button"
              onClick={() => setGridMode("four")}
              className={[
                "rounded-2xl px-4 py-3 text-sm font-semibold ring-1 transition",
                gridMode === "four"
                  ? "bg-sky-500 text-white ring-sky-500"
                  : "bg-white text-slate-700 ring-slate-200 hover:bg-slate-50",
              ].join(" ")}
            >
              4칸
            </button>
          </div>
        </div>

        <div className="rounded-[30px] bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.08)] ring-1 ring-slate-100">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-sky-700">현재 문제</div>
            <div className="text-xs text-slate-500">
              {Math.min(currentIndex + 1, filteredItems.length)} / {filteredItems.length}
            </div>
          </div>

          <div className="mt-4 rounded-[28px] bg-[linear-gradient(180deg,#f7fbff_0%,#ffffff_100%)] p-5 ring-1 ring-sky-100">
            <div className="flex items-center justify-between gap-3">
              <div className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-semibold text-sky-700 ring-1 ring-sky-100">
                {currentItem.script === "hiragana" ? "히라가나" : "가타카나"}
              </div>

              <div className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-500 ring-1 ring-slate-200">
                {currentItem.row || "문자"} · {gridLabel}
              </div>
            </div>

            <div className="mt-5 text-center">
              <div className="text-sm font-semibold text-slate-500">
                이 문자를 써보세요
              </div>

              <div className="mt-4 text-[72px] font-extrabold leading-none tracking-tight text-slate-900">
                {currentItem.char}
              </div>

              <div className="mt-3 text-base font-semibold text-sky-700">
                {currentItem.korean}
              </div>

              {currentItem.roman && (
                <div className="mt-1 text-sm text-slate-500">
                  로마자:{" "}
                  <span className="font-semibold text-slate-700">
                    {currentItem.roman}
                  </span>
                </div>
              )}
            </div>

            <div className="mt-5 rounded-2xl bg-white px-4 py-3 ring-1 ring-sky-100">
              <div className="text-xs font-semibold tracking-wide text-sky-700">
                짧은 힌트
              </div>
              <div className="mt-2 text-sm leading-6 text-slate-600">
                {strokeHint}
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleSpeak}
                className="rounded-2xl bg-sky-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-600"
              >
                발음 듣기
              </button>

              <button
                type="button"
                onClick={handleShowAnswer}
                className="rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50"
              >
                예시 보기
              </button>
            </div>
          </div>

          <div className="mt-4 rounded-[28px] bg-white p-4 ring-1 ring-slate-200 shadow-[0_10px_28px_rgba(15,23,42,0.04)]">
            <div className="flex items-center justify-between gap-2">
              <div className="text-sm font-semibold text-sky-700">손글씨 연습칸</div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowGhost((prev) => !prev)}
                  className={[
                    "rounded-full px-3 py-1.5 text-xs font-semibold transition",
                    showGhost
                      ? "bg-sky-500 text-white"
                      : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50",
                  ].join(" ")}
                >
                  예시 {showGhost ? "ON" : "OFF"}
                </button>

                <button
                  type="button"
                  onClick={handleClearCanvas}
                  className="rounded-full bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600 ring-1 ring-slate-200 transition hover:bg-slate-100"
                >
                  지우기
                </button>
              </div>
            </div>

            <div
              ref={wrapperRef}
              className="mt-3 overflow-hidden rounded-[24px] bg-white ring-1 ring-sky-100"
            >
              <canvas
                ref={canvasRef}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
                onPointerCancel={handlePointerUp}
                className="block w-full touch-none bg-white"
              />
            </div>

            <div className="mt-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600 ring-1 ring-slate-200">
              {showGhost
                ? "반투명 예시와 작은 획순 표시를 참고해 그대로 따라 써보세요."
                : "반투명 예시를 끄면 빈 칸에 스스로 떠올려 쓰는 연습을 할 수 있습니다."}
            </div>
          </div>

          {showAnswer && (
            <div className="mt-4 rounded-[26px] bg-white p-5 ring-1 ring-sky-100 shadow-[0_10px_28px_rgba(56,189,248,0.08)]">
              <div className="text-sm font-semibold text-sky-700">예시 확인</div>

              <div className="mt-3 flex items-center gap-4">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-sky-50 text-4xl font-extrabold text-slate-900 ring-1 ring-sky-100">
                  {currentItem.char}
                </div>

                <div className="min-w-0">
                  <div className="text-lg font-bold text-slate-900">
                    {currentItem.korean}
                  </div>
                  {currentItem.roman && (
                    <div className="mt-1 text-sm text-slate-500">
                      로마자:{" "}
                      <span className="font-semibold text-slate-700">
                        {currentItem.roman}
                      </span>
                    </div>
                  )}
                  <div className="mt-1 text-sm text-slate-500">
                    이 모양을 참고해서 한 번 더 써보세요.
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-2xl bg-sky-50 p-4 ring-1 ring-sky-100">
                <div className="text-xs font-semibold tracking-wide text-sky-700">
                  예시 단어
                </div>
                <div className="mt-2 text-xl font-bold text-slate-900">
                  {currentItem.example || "-"}
                </div>
                <div className="mt-1 text-sm text-slate-600">
                  {currentItem.exampleKorean || "-"}
                </div>

                {currentItem.example && (
                  <button
                    type="button"
                    onClick={handleSpeakExample}
                    className="mt-3 rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50"
                  >
                    예시 단어 듣기
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="mt-5 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleRandom}
              className="rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50"
            >
              랜덤
            </button>

            <button
              type="button"
              onClick={handleNext}
              className="rounded-2xl bg-sky-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-600"
            >
              다음 문제
            </button>
          </div>

          <div className="mt-4 rounded-2xl bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600 ring-1 ring-slate-200">
            지금까지 <span className="font-bold text-slate-900">{roundCount}</span>문제째
            써보고 있어요. 한 글자씩 천천히 써보는 것이 더 좋습니다.
          </div>
        </div>
      </section>

      <BottomNav />
    </main>
  );
}