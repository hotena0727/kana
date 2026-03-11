"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import { getKanaProgress, getTodayKanaStats } from "@/lib/progress";

type HomeStats = {
  streakDays: number;
  todaySolved: number;
  todayCorrect: number;
};

export default function HomePage() {
  const [stats, setStats] = useState<HomeStats>({
    streakDays: 0,
    todaySolved: 0,
    todayCorrect: 0,
  });

  useEffect(() => {
    const progress = getKanaProgress();
    const today = getTodayKanaStats();

    setStats({
      streakDays: progress.streakDays,
      todaySolved: today.solved,
      todayCorrect: today.correct,
    });
  }, []);

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f7fbff_0%,#eef6ff_45%,#f9fcff_100%)] pb-24 text-slate-900">
      <section className="mx-auto flex min-h-screen w-full max-w-md flex-col px-5 py-7">
        <div className="mb-6 rounded-[32px] bg-white/85 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)] ring-1 ring-sky-100 backdrop-blur">
          <div className="inline-flex rounded-full bg-sky-50 px-3 py-1 text-sm font-semibold text-sky-700 ring-1 ring-sky-100">
            하테나일본어 문자와 발음
          </div>

          <h1 className="mt-4 text-[31px] font-extrabold leading-tight tracking-tight">
            문자부터 천천히,
            <br />
            일본어의 첫걸음.
          </h1>

          <p className="mt-3 text-[15px] leading-7 text-slate-600">
            히라가나와 가타카나를 부담 없이 익히고,
            오늘의 10문제로 바로 복습해 보세요.
          </p>

          <Link
            href="/quiz"
            className="mt-5 flex w-full items-center justify-center rounded-2xl bg-sky-500 px-4 py-3.5 text-base font-bold text-white transition hover:bg-sky-600"
          >
            오늘의 10문제 시작하기
          </Link>
        </div>

        <div className="mb-5 grid grid-cols-3 gap-3">
          <div className="rounded-2xl bg-white p-4 text-center shadow-[0_12px_30px_rgba(15,23,42,0.06)] ring-1 ring-slate-100">
            <div className="text-[11px] font-semibold text-sky-700">연속 학습</div>
            <div className="mt-2 text-2xl font-extrabold text-slate-900">
              {stats.streakDays}
            </div>
            <div className="mt-1 text-[11px] text-slate-500">일</div>
          </div>

          <div className="rounded-2xl bg-white p-4 text-center shadow-[0_12px_30px_rgba(15,23,42,0.06)] ring-1 ring-slate-100">
            <div className="text-[11px] font-semibold text-sky-700">오늘 푼 문제</div>
            <div className="mt-2 text-2xl font-extrabold text-slate-900">
              {stats.todaySolved}
            </div>
            <div className="mt-1 text-[11px] text-slate-500">문제</div>
          </div>

          <div className="rounded-2xl bg-white p-4 text-center shadow-[0_12px_30px_rgba(15,23,42,0.06)] ring-1 ring-slate-100">
            <div className="text-[11px] font-semibold text-sky-700">오늘 정답</div>
            <div className="mt-2 text-2xl font-extrabold text-slate-900">
              {stats.todayCorrect}
            </div>
            <div className="mt-1 text-[11px] text-slate-500">개</div>
          </div>
        </div>

        <div className="grid gap-4">
          <Link
            href="/letters"
            className="rounded-[28px] bg-white p-5 shadow-[0_14px_36px_rgba(15,23,42,0.07)] ring-1 ring-slate-100 transition hover:-translate-y-0.5"
          >
            <div className="text-sm font-semibold text-sky-700">문자 학습</div>
            <div className="mt-1 text-xl font-bold">히라가나 · 가타카나 익히기</div>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              문자를 하나씩 눌러 보면서 발음과 예시 단어를 익혀보세요.
            </p>
          </Link>

          <Link
            href="/quiz"
            className="rounded-[28px] bg-white p-5 shadow-[0_14px_36px_rgba(15,23,42,0.07)] ring-1 ring-slate-100 transition hover:-translate-y-0.5"
          >
            <div className="text-sm font-semibold text-sky-700">퀴즈</div>
            <div className="mt-1 text-xl font-bold">랜덤 10문제로 복습하기</div>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              문자를 보고 발음을 고르거나, 발음을 보고 문자를 고르는 문제를 풀어보세요.
            </p>
          </Link>

          <Link
            href="/review"
            className="rounded-[28px] bg-white p-5 shadow-[0_14px_36px_rgba(15,23,42,0.07)] ring-1 ring-slate-100 transition hover:-translate-y-0.5"
          >
            <div className="text-sm font-semibold text-sky-700">복습</div>
            <div className="mt-1 text-xl font-bold">틀린 문자 다시 보기</div>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              틀린 문자만 모아서 다시 맞혀 보며 약한 부분을 줄여보세요.
            </p>
          </Link>
        </div>
      </section>

      <BottomNav />
    </main>
  );
}