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
    あ: "첫 점과 짧은 선을 가볍게 시작한 뒤, 마지막 곡선을 크게 이어 보세요.",
    い: "왼쪽의 짧은 획부터 시작하고, 오른쪽 획을 조금 더 길게 써보세요.",
    う: "윗점은 가볍게, 아래 곡선은 너무 급하지 않게 이어 보세요.",
    え: "윗부분은 짧게, 아래 곡선은 넓게 펼친다는 느낌으로 써보세요.",
    お: "왼쪽 세로 흐름과 오른쪽 둥근 부분을 나눠서 보면 더 잘 보입니다.",
    か: "왼쪽과 오른쪽이 성격이 다르니, 먼저 왼쪽을 안정적으로 쓴 뒤 오른쪽을 이어 보세요.",
    き: "가로선 간격이 너무 붙지 않게, 위에서 아래로 차분히 써보세요.",
    く: "짧게 시작해 자연스럽게 꺾이는 흐름을 한 번에 이어 보세요.",
    け: "왼쪽 짧은 흐름과 오른쪽 긴 흐름의 높이 차이를 의식해 보세요.",
    こ: "두 가로선의 길이와 간격을 비슷하게 맞추면 안정적입니다.",
    さ: "윗부분과 아래쪽 흐름을 분리해서 보고, 마지막 곡선을 너무 급하게 꺾지 마세요.",
    し: "위에서 아래로 한 흐름으로 내려온다는 느낌으로 부드럽게 써보세요.",
    す: "윗부분을 간단히 처리한 뒤, 마지막 곡선을 넉넉하게 빼 보세요.",
    せ: "가로와 세로가 만나는 위치를 차분히 확인하며 써보세요.",
    そ: "윗부분과 아래 곡선이 겹쳐 보이기 쉬우니 두 부분을 나눠서 보세요.",
    た: "왼쪽 획과 오른쪽 획의 길이 차이를 살리면 모양이 자연스럽습니다.",
    ち: "윗부분은 작게, 아래 곡선은 조금 더 크게 흐르게 써보세요.",
    つ: "짧은 시작 후 긴 곡선이 자연스럽게 이어지도록 리듬을 살려 보세요.",
    て: "짧은 선 뒤 긴 흐름이 따라온다는 느낌으로 한 번에 이어 보세요.",
    と: "점과 아래 곡선을 너무 붙이지 않게 거리감을 두고 써보세요.",
    な: "윗부분에서 시작해 아래쪽 곡선을 크게 이어 보세요.",
    に: "세 획의 간격을 일정하게 두면 훨씬 보기 좋아집니다.",
    ぬ: "마지막에 돌아 나오는 곡선 흐름을 천천히 확인해 보세요.",
    ね: "왼쪽과 오른쪽의 곡선이 따로 보이도록, 붙여 쓰지 말고 차분히 나눠 보세요.",
    の: "한 획으로 크게 원을 그린다는 느낌으로 너무 끊지 말고 이어 보세요.",
    は: "왼쪽 두 획을 먼저 안정적으로 두고, 오른쪽 곡선을 따로 이어 보세요.",
    ひ: "아래로 내려오다 마지막에 휘어지는 흐름을 부드럽게 이어 보세요.",
    ふ: "윗점 두 개와 아래 큰 곡선이 각각 따로 보이게 써보세요.",
    へ: "짧게 꺾이는 흐름을 가볍게 이어 주는 것이 포인트입니다.",
    ほ: "왼쪽 세로 흐름과 오른쪽 부분을 따로 보고 균형을 맞춰 보세요.",
    ま: "윗부분 가로선과 아래 흐름 사이 간격을 일정하게 잡아 보세요.",
    み: "세 부분이 너무 붙지 않게 여유를 두고 써보세요.",
    や: "왼쪽과 오른쪽 획 길이가 다르니 시작 위치를 천천히 잡아 보세요.",
    ゆ: "겹쳐 보이기 쉬우니 안쪽과 바깥쪽 흐름을 나눠서 보세요.",
    よ: "세 줄의 간격을 일정하게 두면 훨씬 안정적입니다.",
    ら: "짧게 시작한 뒤 아래 곡선을 가볍게 흘려 보세요.",
    り: "두 획의 높이 차이와 간격 차이를 살려 보세요.",
    る: "둥근 흐름을 너무 급히 끊지 말고 마지막까지 이어 보세요.",
    れ: "마지막 곡선이 헷갈리기 쉬우니 천천히 모양을 확인해 보세요.",
    ろ: "모서리가 너무 각지지 않게 둥글게 이어 보세요.",
    わ: "왼쪽 시작 뒤 아래 곡선을 크게 써 주면 모양이 잘 잡힙니다.",
    を: "작게 시작한 뒤 큰 곡선으로 이어지는 흐름을 의식해 보세요.",
    ん: "짧은 시작 후 마지막 곡선을 너무 끊지 말고 부드럽게 이어 보세요.",

    ア: "짧은 위 획부터 시작하고, 아래로 내려오는 흐름을 곧게 잡아 보세요.",
    イ: "왼쪽 짧은 획과 오른쪽 긴 대각선의 균형을 맞춰 보세요.",
    ウ: "윗부분과 아래 큰 흐름이 분리되어 보이도록 써보세요.",
    エ: "세 가로선의 길이와 간격을 일정하게 두면 안정적입니다.",
    オ: "왼쪽 흐름과 오른쪽 대각선/가로 흐름을 나눠서 보세요.",
    カ: "짧은 윗선 뒤 세로 흐름을 또렷하게 내리면 좋습니다.",
    キ: "가로선이 많으니 간격이 붙지 않게 주의해 보세요.",
    ク: "짧게 시작해 아래로 꺾이는 흐름을 한 번에 이어 보세요.",
    ケ: "왼쪽 짧은 획과 오른쪽 긴 획의 높이 차이를 살려 보세요.",
    コ: "세로와 두 가로선이 직선적으로 안정되게 보이게 해 보세요.",
    サ: "왼쪽과 오른쪽 세로 흐름이 헷갈리지 않게 간격을 두세요.",
    シ: "세 점은 위에서 아래로 흐르듯, 오른쪽 획은 크게 써보세요.",
    ス: "윗부분은 짧게, 아래 곡선은 길게 리듬을 살려 보세요.",
    セ: "가로와 세로가 만나는 위치를 안정적으로 잡아 보세요.",
    ソ: "두 점과 아래 흐름의 방향 차이를 천천히 확인해 보세요.",
    タ: "왼쪽 획과 오른쪽 획의 길이 차이를 살리면 모양이 살아납니다.",
    チ: "윗부분은 작게, 아래 길게 이어지는 흐름을 분리해서 보세요.",
    ツ: "세 점은 오른쪽으로 흐르듯, 아래 획은 길게 써보세요.",
    テ: "윗부분 가로선과 아래 흐름이 따로 보이도록 써보세요.",
    ト: "짧은 가로선 뒤 세로 흐름을 곧게 내려 보세요.",
    ナ: "짧은 대각선과 긴 흐름의 대비를 살려 보세요.",
    ニ: "두 가로선의 길이와 간격을 일정하게 맞춰 보세요.",
    ヌ: "윗부분과 아래 큰 흐름을 나눠서 보면 훨씬 쉬워집니다.",
    ネ: "윗부분과 아래 가로선의 위치 관계를 천천히 맞춰 보세요.",
    ノ: "한 번에 툭 내려 긋는 느낌으로 가볍게 써보세요.",
    ハ: "양쪽 대각선의 벌어지는 각도를 비슷하게 맞춰 보세요.",
    ヒ: "가로 흐름 뒤 왼쪽 아래로 빠지는 방향을 의식해 보세요.",
    フ: "가로선과 아래로 떨어지는 두 흐름을 분리해 보세요.",
    ヘ: "하나의 꺾임으로 이어진다는 느낌으로 가볍게 써보세요.",
    ホ: "가운데 세로 흐름을 중심으로 좌우 균형을 잡아 보세요.",
    マ: "윗부분과 아래 점/가로선의 간격이 너무 붙지 않게 하세요.",
    ミ: "세 가로선 간격과 길이 차이를 의식해 보세요.",
    ム: "아래로 내려와 다시 올라가는 흐름을 크게 잡아 보세요.",
    メ: "짧은 시작 뒤 큰 대각선과 교차 흐름을 분리해 보세요.",
    モ: "가로선 간격과 마지막 세로 흐름의 위치를 맞춰 보세요.",
    ヤ: "가운데 긴 흐름을 중심으로 나머지 획이 붙도록 써보세요.",
    ユ: "가로-세로-가로의 틀을 안정적으로 잡아 보세요.",
    ヨ: "세 칸 구조처럼 간격을 맞추면 훨씬 또렷해집니다.",
    ラ: "짧은 윗획 뒤 아래 흐름을 길게 빼 보세요.",
    リ: "두 세로 흐름의 간격과 높이 차이를 살려 보세요.",
    ル: "왼쪽 짧은 획 후 아래로 흐르는 곡선을 부드럽게 이어 보세요.",
    レ: "왼쪽 위에서 오른쪽 아래로 내려가는 한 흐름을 의식하세요.",
    ロ: "네모 형태가 찌그러지지 않게 균형을 맞춰 보세요.",
    ワ: "윗부분과 아래로 꺾이는 흐름의 각도를 차분히 맞춰 보세요.",
    ヲ: "가로선과 아래 흐름이 서로 너무 붙지 않게 보세요.",
    ン: "짧은 점 뒤 긴 흐름이 자연스럽게 이어지게 써보세요.",
  };

  if (hintMap[item.char]) return hintMap[item.char];

  if (item.script === "hiragana") {
    return "히라가나는 곡선이 많으니, 위에서 아래로 흐르듯 천천히 이어 써보세요.";
  }

  return "가타카나는 직선과 각이 많으니, 획의 방향과 길이를 또렷하게 나눠서 써보세요.";
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
    ctx.globalAlpha = 0.12;
    ctx.fillStyle = "#64748b";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `700 96px "Noto Sans JP", "Hiragino Sans", sans-serif`;
    ctx.fillText(char, width / 2, height / 2);
    ctx.restore();
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
            원고지 칸에 손가락이나 펜으로 직접 써보세요. 예시 글자와 획순 힌트를
            참고하면서 천천히 따라 쓰면 기억이 더 단단해집니다.
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

          <div className="mt-4 flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-slate-200">
            <div>
              <div className="text-sm font-semibold text-slate-800">반투명 예시</div>
              <div className="mt-1 text-xs leading-5 text-slate-500">
                원고지 안에 연한 글자를 띄워 따라 써볼 수 있습니다.
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowGhost((prev) => !prev)}
              className={[
                "rounded-full px-3 py-2 text-xs font-semibold transition",
                showGhost
                  ? "bg-sky-500 text-white"
                  : "bg-white text-slate-700 ring-1 ring-slate-200",
              ].join(" ")}
            >
              {showGhost ? "ON" : "OFF"}
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
                획순 힌트
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
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-sky-700">손글씨 연습칸</div>
              <button
                type="button"
                onClick={handleClearCanvas}
                className="rounded-full bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600 ring-1 ring-slate-200 transition hover:bg-slate-100"
              >
                지우기
              </button>
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
                ? "원고지 안의 연한 예시 글자를 참고해서 손가락이나 펜으로 직접 써보세요."
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
            써보고 있어요. 많이 쓰려고 하기보다, 한 글자씩 천천히 익히는 것이 더 좋습니다.
          </div>
        </div>
      </section>

      <BottomNav />
    </main>
  );
}