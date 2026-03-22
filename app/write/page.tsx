"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import hiraganaData from "@/data/hiragana.json";
import katakanaData from "@/data/katakana.json";
import type { KanaItem } from "@/lib/types";
import {
  getGhostGlyphs,
  getHint,
  getStrokeGuide,
  isCombinedKana,
} from "@/lib/write-kana-guides";

type WriteMode = "basic" | "combined" | "all";

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

function scaleValue(value: number, actual: number, base: number) {
  return (value / base) * actual;
}

export default function WritePage() {
  const [mode, setMode] = useState<WriteMode>("basic");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [roundCount, setRoundCount] = useState(1);
  const [showGhost, setShowGhost] = useState(true);
  const [showStrokeGuide, setShowStrokeGuide] = useState(true);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const answerCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const answerWrapperRef = useRef<HTMLDivElement | null>(null);
  const answerRef = useRef<HTMLDivElement | null>(null);

  const isDrawingRef = useRef(false);

  const filteredItems = useMemo(() => {
    return filterWriteItems(allKanaList, mode);
  }, [mode]);

  const currentItem = filteredItems[currentIndex] ?? filteredItems[0];

  const modeLabel =
    mode === "basic" ? "기본 문자" : mode === "combined" ? "요음" : "전체";

  const hint = useMemo(() => {
    return currentItem ? getHint(currentItem.char, currentItem.script) : "";
  }, [currentItem]);

  useEffect(() => {
    setCurrentIndex(0);
    setShowAnswer(false);
    setRoundCount(1);
  }, [mode]);

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

    ctx.setLineDash([]);
  };

  const drawGhostChar = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    text: string
  ) => {
    const glyphs = getGhostGlyphs(text);

    glyphs.forEach((glyph) => {
      const x = scaleValue(glyph.x, width, 300);
      const y = scaleValue(glyph.y, height, 300);
      const size = scaleValue(glyph.size, width, 300);

      ctx.save();
      ctx.globalAlpha = 0.12;
      ctx.fillStyle = "#64748b";
      ctx.textAlign = "center";
      ctx.textBaseline = "alphabetic";
      ctx.font = `700 ${size}px "Noto Sans JP", "Hiragino Sans", sans-serif`;
      ctx.fillText(glyph.char, x, y);
      ctx.restore();
    });
  };

  const drawArrowHead = (
    ctx: CanvasRenderingContext2D,
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
    color: string
  ) => {
    const angle = Math.atan2(toY - fromY, toX - fromX);
    const size = 7;

    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.lineCap = "round";

    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(
      toX - size * Math.cos(angle - Math.PI / 6),
      toY - size * Math.sin(angle - Math.PI / 6)
    );
    ctx.moveTo(toX, toY);
    ctx.lineTo(
      toX - size * Math.cos(angle + Math.PI / 6),
      toY - size * Math.sin(angle + Math.PI / 6)
    );
    ctx.stroke();
    ctx.restore();
  };

  const drawStrokeGuide = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    text: string,
    options?: {
      showNumbers?: boolean;
      lineColor?: string;
      pointColor?: string;
      numberColor?: string;
      alpha?: number;
    }
  ) => {
    const guide = getStrokeGuide(text);
    if (!guide) return;

    const lineColor = options?.lineColor ?? "#60a5fa";
    const pointColor = options?.pointColor ?? "#2563eb";
    const numberColor = options?.numberColor ?? "#1d4ed8";
    const showNumbers = options?.showNumbers ?? true;
    const alpha = options?.alpha ?? 1;

    guide.strokes.forEach((stroke) => {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = lineColor;
      ctx.lineWidth = 2.5;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      ctx.beginPath();
      stroke.points.forEach((point, index) => {
        const x = scaleValue(point.x, width, 300);
        const y = scaleValue(point.y, height, 300);

        if (index === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();

      const start = stroke.points[0];
      const sx = scaleValue(start.x, width, 300);
      const sy = scaleValue(start.y, height, 300);

      ctx.fillStyle = pointColor;
      ctx.beginPath();
      ctx.arc(sx, sy, 4, 0, Math.PI * 2);
      ctx.fill();

      const ax1 = scaleValue(stroke.arrowFrom.x, width, 300);
      const ay1 = scaleValue(stroke.arrowFrom.y, height, 300);
      const ax2 = scaleValue(stroke.arrowTo.x, width, 300);
      const ay2 = scaleValue(stroke.arrowTo.y, height, 300);

      drawArrowHead(ctx, ax1, ay1, ax2, ay2, pointColor);

      if (showNumbers) {
        const lx = scaleValue(stroke.labelX, width, 300);
        const ly = scaleValue(stroke.labelY, height, 300);

        ctx.fillStyle = numberColor;
        ctx.font = `700 ${scaleValue(14, width, 300)}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(stroke.label, lx, ly);
      }

      ctx.restore();
    });
  };

  const drawPracticeGuide = () => {
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

    drawSingleCell(ctx, width, height);

    if (showGhost) {
      drawGhostChar(ctx, width, height, currentItem.char);
    }

    if (showStrokeGuide) {
      drawStrokeGuide(ctx, width, height, currentItem.char, {
        showNumbers: true,
        lineColor: "#93c5fd",
        pointColor: "#2563eb",
        numberColor: "#1d4ed8",
        alpha: 0.95,
      });
    }

    ctx.strokeStyle = "#111827";
    ctx.lineWidth = 7;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  };

  const drawAnswerPreview = () => {
    const canvas = answerCanvasRef.current;
    if (!canvas || !currentItem) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = "#dbeafe";
    ctx.lineWidth = 1;

    drawSingleCell(ctx, width, height);
    drawGhostChar(ctx, width, height, currentItem.char);
    drawStrokeGuide(ctx, width, height, currentItem.char, {
      showNumbers: true,
      lineColor: "#60a5fa",
      pointColor: "#2563eb",
      numberColor: "#1d4ed8",
      alpha: 1,
    });
  };

  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    const wrapper = wrapperRef.current;
    if (!canvas || !wrapper) return;

    const rect = wrapper.getBoundingClientRect();
    const ratio = window.devicePixelRatio || 1;
    const cssWidth = rect.width;
    const cssHeight = 300;

    canvas.width = Math.floor(cssWidth * ratio);
    canvas.height = Math.floor(cssHeight * ratio);
    canvas.style.width = `${cssWidth}px`;
    canvas.style.height = `${cssHeight}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    drawPracticeGuide();
  };

  const resizeAnswerCanvas = () => {
    const canvas = answerCanvasRef.current;
    const wrapper = answerWrapperRef.current;
    if (!canvas || !wrapper) return;

    const rect = wrapper.getBoundingClientRect();
    const ratio = window.devicePixelRatio || 1;
    const cssWidth = rect.width;
    const cssHeight = 260;

    canvas.width = Math.floor(cssWidth * ratio);
    canvas.height = Math.floor(cssHeight * ratio);
    canvas.style.width = `${cssWidth}px`;
    canvas.style.height = `${cssHeight}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    drawAnswerPreview();
  };

  useEffect(() => {
    resizeCanvas();
    resizeAnswerCanvas();
    window.addEventListener("resize", resizeCanvas);
    window.addEventListener("resize", resizeAnswerCanvas);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("resize", resizeAnswerCanvas);

      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  useEffect(() => {
    resizeCanvas();
  }, [currentIndex, mode, showGhost, showStrokeGuide, currentItem?.char]);

  useEffect(() => {
    if (!showAnswer) return;
    resizeAnswerCanvas();
  }, [showAnswer, currentIndex, mode, currentItem?.char]);

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
    } catch { }
  };

  const handleClearCanvas = () => {
    drawPracticeGuide();
  };

  const handleShowAnswer = () => {
    setShowAnswer(true);
    window.setTimeout(() => {
      answerRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      resizeAnswerCanvas();
    }, 80);
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
            <h1 className="text-2xl font-extrabold tracking-tight">
              손으로 써보기
            </h1>
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
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex rounded-full bg-sky-50 px-3 py-1 text-sm font-semibold text-sky-700 ring-1 ring-sky-100"
            >
              ← 홈으로
            </Link>

            <div className="inline-flex rounded-full bg-sky-50 px-3 py-1 text-sm font-semibold text-sky-700 ring-1 ring-sky-100">
              ✍️ 손으로 써보기
            </div>
          </div>
          <h1 className="mt-6 text-[30px] font-extrabold leading-tight tracking-tight">
            눈으로만 보지 말고,
            <br />
            직접 써보며 익혀보세요.
          </h1>

          <p className="mt-3 text-[15px] leading-7 text-slate-600">
            원고지 칸에 손가락이나 펜으로 직접 써보세요. 예시를 참고하면서
            천천히 따라 쓰면 훨씬 자연스럽게 익힐 수 있습니다.
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
        </div>

        <div className="rounded-[30px] bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.08)] ring-1 ring-slate-100">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-sky-700">현재 문제</div>
            <div className="text-xs text-slate-500">
              {Math.min(currentIndex + 1, filteredItems.length)} /{" "}
              {filteredItems.length}
            </div>
          </div>

          <div className="mt-4 rounded-[28px] bg-[linear-gradient(180deg,#f7fbff_0%,#ffffff_100%)] p-5 ring-1 ring-sky-100">
            <div className="flex items-center justify-between gap-3">
              <div className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-semibold text-sky-700 ring-1 ring-sky-100">
                {currentItem.script === "hiragana" ? "히라가나" : "가타카나"}
              </div>

              <div className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-500 ring-1 ring-slate-200">
                {currentItem.row || "문자"} · 1칸
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
              <div className="text-sm font-semibold text-sky-700">
                손글씨 연습하기
              </div>

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
                  onClick={() => setShowStrokeGuide((prev) => !prev)}
                  className={[
                    "rounded-full px-3 py-1.5 text-xs font-semibold transition",
                    showStrokeGuide
                      ? "bg-blue-500 text-white"
                      : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50",
                  ].join(" ")}
                >
                  획순 {showStrokeGuide ? "ON" : "OFF"}
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
              {hint}
            </div>
          </div>

          {showAnswer && (
            <div
              ref={answerRef}
              className="mt-4 rounded-[26px] bg-white p-5 ring-1 ring-sky-100 shadow-[0_10px_28px_rgba(56,189,248,0.08)]"
            >
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
                    숫자와 화살표를 보면서 획순과 방향을 같이 익혀보세요.
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-[24px] bg-[linear-gradient(180deg,#f8fbff_0%,#ffffff_100%)] p-4 ring-1 ring-sky-100">
                <div className="mb-3 flex items-center justify-between">
                  <div className="text-xs font-semibold tracking-wide text-sky-700">
                    획순 예시
                  </div>
                  <div className="text-[11px] text-slate-500">
                    현재는 10자 시험판 적용
                  </div>
                </div>

                <div
                  ref={answerWrapperRef}
                  className="overflow-hidden rounded-[20px] bg-white ring-1 ring-slate-200"
                >
                  <canvas
                    ref={answerCanvasRef}
                    className="block w-full bg-white"
                  />
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
            지금까지{" "}
            <span className="font-bold text-slate-900">{roundCount}</span>문제째
            써보고 있어요. 한 글자씩 천천히 써보는 것이 더 좋습니다.
          </div>
        </div>
      </section>

      <BottomNav />
    </main>
  );
}