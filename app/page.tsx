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

function HomeCenterPromoCard() {
  return (
    <div className="mt-5 rounded-[28px] bg-gradient-to-br from-sky-50 to-white p-5 shadow-[0_14px_36px_rgba(15,23,42,0.06)] ring-1 ring-sky-100">
      <div className="text-sm font-semibold text-sky-700">
        하테나 교육센터
      </div>

      <div className="mt-2 text-xl font-bold tracking-tight text-slate-900">
        다음 단계 학습이 궁금하신가요?
      </div>

      <p className="mt-2 text-sm leading-6 text-slate-600">
        20년 넘게 일본어를 가르쳐 온 경험을 바탕으로,
        입문자도 부담 없이 다음 단계로 이어갈 수 있는 학습 과정을 안내해드려요.
      </p>

      <a
        href="https://hotena.com/"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-flex w-full items-center justify-center rounded-2xl bg-white px-4 py-3.5 text-base font-bold text-sky-700 ring-1 ring-sky-200 transition hover:bg-sky-50"
      >
        교육센터 보기
      </a>
    </div>
  );
}

const learningSteps = [
  {
    id: "step_1",
    badge: "1단계",
    title: "문자 익히기",
    description: "히라가나와 가타카나를 눌러 보며 기본 발음과 예시 단어를 익혀보세요.",
    href: "/letters",
    cta: "문자 학습 시작",
    icon: "あ",
  },
  {
    id: "step_2",
    badge: "2단계",
    title: "발음 규칙 익히기",
    description: "촉음, 장음처럼 헷갈리기 쉬운 규칙을 카드와 예시로 익혀보세요.",
    href: "/rules",
    cta: "규칙 학습 가기",
    icon: "っ",
  },
  {
    id: "step_3",
    badge: "3단계",
    title: "퀴즈로 확인하기",
    description: "기본 / 확장 / 전체 범위를 골라 지금 배운 내용을 바로 문제로 확인해 보세요.",
    href: "/quiz",
    cta: "퀴즈 풀기",
    icon: "✍️",
  },
  {
    id: "step_4",
    badge: "4단계",
    title: "틀린 것 다시 보기",
    description: "틀린 문자만 다시 복습하면서 약한 부분을 줄여보세요.",
    href: "/review",
    cta: "오답 복습 가기",
    icon: "🔁",
  },
];

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
            발음 규칙과 퀴즈로 자연스럽게 반복해 보세요.
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

        <div className="mb-5 rounded-[28px] bg-white p-5 shadow-[0_14px_36px_rgba(15,23,42,0.07)] ring-1 ring-slate-100">
          <div className="text-sm font-semibold text-sky-700">추천 학습 코스</div>

          <div className="mt-2 text-lg font-bold text-slate-900">
            문자 → 규칙 → 퀴즈 → 복습
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            처음이라면 아래 순서대로 따라가면 가장 자연스럽게 익힐 수 있습니다.
          </p>

          <div className="mt-4 grid gap-3">
            {learningSteps.map((step) => (
              <Link
                key={step.id}
                href={step.href}
                className="rounded-2xl bg-sky-50/70 p-4 ring-1 ring-sky-100 transition hover:bg-sky-50"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-lg font-bold text-slate-900 ring-1 ring-sky-100">
                    {step.icon}
                  </div>

                  <div className="min-w-0">
                    <div className="inline-flex rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-sky-700 ring-1 ring-sky-100">
                      {step.badge}
                    </div>
                    <div className="mt-2 text-base font-bold text-slate-900">
                      {step.title}
                    </div>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      {step.description}
                    </p>
                    <div className="mt-2 text-sm font-semibold text-sky-700">
                      {step.cta} →
                    </div>
                  </div>
                </div>
              </Link>
            ))}
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
            href="/rules"
            className="rounded-[28px] bg-white p-5 shadow-[0_14px_36px_rgba(15,23,42,0.07)] ring-1 ring-slate-100 transition hover:-translate-y-0.5"
          >
            <div className="text-sm font-semibold text-sky-700">발음 규칙</div>
            <div className="mt-1 text-xl font-bold">촉음 · 장음 규칙 익히기</div>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              っ / ッ, ー 같은 규칙을 카드와 예시 단어로 익혀보세요.
            </p>
          </Link>

          <Link
            href="/quiz"
            className="rounded-[28px] bg-white p-5 shadow-[0_14px_36px_rgba(15,23,42,0.07)] ring-1 ring-slate-100 transition hover:-translate-y-0.5"
          >
            <div className="text-sm font-semibold text-sky-700">퀴즈</div>
            <div className="mt-1 text-xl font-bold">랜덤 10문제로 복습하기</div>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              문자 퀴즈와 발음 규칙 퀴즈로 지금 배운 내용을 바로 확인해 보세요.
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