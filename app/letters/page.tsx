"use client";

import Link from "next/link";
import BottomNav from "@/components/BottomNav";

export default function LettersPage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f7fbff_0%,#eef6ff_45%,#f9fcff_100%)] pb-24 text-slate-900">
      <section className="mx-auto w-full max-w-md px-5 py-7">
        <div className="mb-6 rounded-[32px] bg-white/85 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)] ring-1 ring-sky-100 backdrop-blur">
          <Link
            href="/"
            className="inline-flex rounded-full bg-sky-50 px-3 py-1 text-sm font-semibold text-sky-700 ring-1 ring-sky-100"
          >
            ← 홈으로
          </Link>

          <h1 className="mt-4 text-[30px] font-extrabold tracking-tight">
            문자 학습
          </h1>
          <p className="mt-3 text-[15px] leading-7 text-slate-600">
            히라가나와 가타카나를 차근차근 익혀봅시다.
          </p>
        </div>

        <div className="grid gap-4">
          <Link
            href="/hiragana"
            className="rounded-[28px] bg-white p-5 shadow-[0_14px_36px_rgba(15,23,42,0.07)] ring-1 ring-slate-100 transition hover:-translate-y-0.5"
          >
            <div className="text-sm font-semibold text-sky-700">기초 문자</div>
            <div className="mt-1 text-xl font-bold">히라가나</div>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              あ, い, う부터 시작해서 일본어의 기본 문자를 익혀보세요.
            </p>
          </Link>

          <Link
            href="/katakana"
            className="rounded-[28px] bg-white p-5 shadow-[0_14px_36px_rgba(15,23,42,0.07)] ring-1 ring-slate-100 transition hover:-translate-y-0.5"
          >
            <div className="text-sm font-semibold text-sky-700">기초 문자</div>
            <div className="mt-1 text-xl font-bold">가타카나</div>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              ア, イ, ウ처럼 외래어에 자주 쓰이는 문자를 익혀보세요.
            </p>
          </Link>
        </div>

        <div className="mt-5 rounded-[28px] border border-dashed border-sky-200 bg-sky-50/80 p-4 text-sm leading-6 text-slate-600">
          먼저 문자에 익숙해진 뒤, 퀴즈로 바로 복습하면 훨씬 빨리 기억에 남습니다.
        </div>
      </section>

      <BottomNav />
    </main>
  );
}