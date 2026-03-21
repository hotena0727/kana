"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import hiraganaData from "@/data/hiragana.json";
import type { KanaItem } from "@/lib/types";

const hiraganaList = hiraganaData as KanaItem[];
const SPEED_OPTIONS = [2000, 3000, 5000];

function getKanaCharClass(char: string) {
  const isCombinedKana = (char || "").length >= 2;

  return [
    "font-bold leading-none whitespace-nowrap tracking-tight",
    isCombinedKana ? "text-[18px]" : "text-2xl",
  ].join(" ");
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

  if (jaVoice) {
    utterance.voice = jaVoice;
  }

  window.speechSynthesis.speak(utterance);
}

export default function HiraganaPage() {
  const [selectedId, setSelectedId] = useState<string>(hiraganaList[0]?.id ?? "");
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [autoPlayMs, setAutoPlayMs] = useState(2000);
  const detailRef = useRef<HTMLDivElement | null>(null);

  const selectedIndex = useMemo(() => {
    const foundIndex = hiraganaList.findIndex((item) => item.id === selectedId);
    return foundIndex >= 0 ? foundIndex : 0;
  }, [selectedId]);

  const selectedItem = useMemo(() => {
    return hiraganaList[selectedIndex] ?? hiraganaList[0];
  }, [selectedIndex]);

  const scrollToDetail = () => {
    window.setTimeout(() => {
      detailRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 50);
  };

  const handlePrev = () => {
    const prevIndex =
      selectedIndex === 0 ? hiraganaList.length - 1 : selectedIndex - 1;
    setSelectedId(hiraganaList[prevIndex].id);
    scrollToDetail();
  };

  const handleNext = () => {
    const nextIndex =
      selectedIndex === hiraganaList.length - 1 ? 0 : selectedIndex + 1;
    setSelectedId(hiraganaList[nextIndex].id);
    scrollToDetail();
  };

  const handleRandom = () => {
    if (hiraganaList.length <= 1) return;

    let randomIndex = selectedIndex;
    while (randomIndex === selectedIndex) {
      randomIndex = Math.floor(Math.random() * hiraganaList.length);
    }
    setSelectedId(hiraganaList[randomIndex].id);
    scrollToDetail();
  };

  const handleToggleAuto = () => {
    setIsAutoPlaying((prev) => !prev);
  };

  const handleSpeakChar = () => {
    speakJapanese(selectedItem?.char ?? "");
  };

  const handleSpeakExample = () => {
    speakJapanese(selectedItem?.example ?? "");
  };

  useEffect(() => {
    if (!isAutoPlaying) return;

    const timer = window.setInterval(() => {
      setSelectedId((prevId) => {
        const currentIndex = hiraganaList.findIndex((item) => item.id === prevId);
        const safeIndex = currentIndex >= 0 ? currentIndex : 0;
        const nextIndex =
          safeIndex === hiraganaList.length - 1 ? 0 : safeIndex + 1;
        return hiraganaList[nextIndex].id;
      });
    }, autoPlayMs);

    return () => window.clearInterval(timer);
  }, [isAutoPlaying, autoPlayMs]);

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f7fbff_0%,#eef6ff_45%,#f9fcff_100%)] pb-24 text-slate-900">
      <section className="mx-auto w-full max-w-md px-5 py-7">
        <div className="mb-6 rounded-[32px] bg-white/85 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)] ring-1 ring-sky-100 backdrop-blur">
          <Link
            href="/letters"
            className="inline-flex rounded-full bg-sky-50 px-3 py-1 text-sm font-semibold text-sky-700 ring-1 ring-sky-100"
          >
            ← 문자로
          </Link>

          <h1 className="mt-4 text-[30px] font-extrabold tracking-tight">히라가나</h1>
          <p className="mt-3 text-[15px] leading-7 text-slate-600">
            문자를 하나씩 눌러 보면서 발음과 예시 단어를 익혀봅시다.
          </p>
        </div>

        <div className="rounded-[28px] bg-white p-5 shadow-[0_14px_36px_rgba(15,23,42,0.07)] ring-1 ring-slate-100">
          <div className="mb-4 flex items-center justify-between">
            <div className="text-sm font-semibold text-sky-700">기본 문자표</div>
            <div className="text-xs text-slate-500">문자를 눌러 보세요</div>
          </div>

          <div className="grid grid-cols-5 gap-3">
            {hiraganaList.map((item) => {
              const isSelected = item.id === selectedItem?.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setSelectedId(item.id);
                    scrollToDetail();
                  }}
                  className={[
                    "rounded-2xl px-2 py-3 text-center ring-1 transition",
                    isSelected
                      ? "bg-sky-500 text-white ring-sky-500 shadow-md"
                      : "bg-sky-50 text-slate-900 ring-sky-100 hover:bg-sky-100",
                  ].join(" ")}
                >
                  <div className={getKanaCharClass(item.char)}>{item.char}</div>
                  <div
                    className={[
                      "mt-1 text-xs font-medium",
                      isSelected ? "text-sky-50" : "text-slate-500",
                    ].join(" ")}
                  >
                    {item.korean}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {selectedItem && (
          <div
            ref={detailRef}
            className="mt-5 rounded-[28px] bg-white p-5 shadow-[0_14px_36px_rgba(15,23,42,0.07)] ring-1 ring-slate-100"
          >
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-sky-700">선택한 문자</div>
              <div className="text-xs text-slate-500">
                {selectedIndex + 1} / {hiraganaList.length}
              </div>
            </div>

            <div className="mt-4 flex items-center gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-sky-50 text-4xl font-extrabold text-slate-900 ring-1 ring-sky-100">
                {selectedItem.char}
              </div>

              <div>
                <div className="text-2xl font-bold text-slate-900">{selectedItem.korean}</div>
                <div className="mt-1 text-sm text-slate-500">
                  로마자: <span className="font-semibold text-slate-700">{selectedItem.roman}</span>
                </div>
                <div className="mt-1 text-sm text-slate-500">
                  줄: <span className="font-semibold text-slate-700">{selectedItem.row}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleSpeakChar}
                className="rounded-2xl bg-sky-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-600"
              >
                문자 듣기
              </button>
              <button
                type="button"
                onClick={handleSpeakExample}
                className="rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50"
              >
                예시 단어 듣기
              </button>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={handlePrev}
                className="rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50"
              >
                이전
              </button>
              <button
                type="button"
                onClick={handleRandom}
                className="rounded-2xl bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-700 ring-1 ring-sky-100 transition hover:bg-sky-100"
              >
                랜덤
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50"
              >
                다음
              </button>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleToggleAuto}
                className={[
                  "rounded-2xl px-4 py-3 text-sm font-semibold transition",
                  isAutoPlaying
                    ? "bg-rose-50 text-rose-700 ring-1 ring-rose-200 hover:bg-rose-100"
                    : "bg-sky-500 text-white hover:bg-sky-600",
                ].join(" ")}
              >
                {isAutoPlaying ? "자동 학습 정지" : "자동 학습 시작"}
              </button>

              <div className="flex items-center justify-center rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-600 ring-1 ring-slate-200">
                {isAutoPlaying ? `${autoPlayMs / 1000}초마다 이동 중` : "수동 학습 중"}
              </div>
            </div>

            <div className="mt-3">
              <div className="mb-2 text-xs font-semibold text-slate-500">자동 학습 속도</div>
              <div className="grid grid-cols-3 gap-3">
                {SPEED_OPTIONS.map((ms) => {
                  const isActive = autoPlayMs === ms;
                  return (
                    <button
                      key={ms}
                      type="button"
                      onClick={() => setAutoPlayMs(ms)}
                      className={[
                        "rounded-2xl px-4 py-3 text-sm font-semibold transition ring-1",
                        isActive
                          ? "bg-sky-500 text-white ring-sky-500"
                          : "bg-white text-slate-700 ring-slate-200 hover:bg-slate-50",
                      ].join(" ")}
                    >
                      {ms / 1000}초
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-5 rounded-2xl bg-sky-50 p-4 ring-1 ring-sky-100">
              <div className="text-xs font-semibold tracking-wide text-sky-700">예시 단어</div>
              <div className="mt-2 text-xl font-bold text-slate-900">
                {selectedItem.example || "-"}
              </div>
              <div className="mt-1 text-sm text-slate-600">
                {selectedItem.exampleKorean || "-"}
              </div>
            </div>
          </div>
        )}
      </section>

      <BottomNav />
    </main>
  );
}