"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import { getWrongKanaCount } from "@/lib/storage";
import { recordKanaStudy } from "@/lib/progress";
import type { QuizMode } from "@/lib/quiz";

const modeLabels: Record<QuizMode, string> = {
    hiragana: "히라가나만",
    katakana: "가타카나만",
    mixed: "섞기",
    rules: "발음 규칙",
};

type ResultClientProps = {
    score: number;
    total: number;
    mode: QuizMode;
};

export default function ResultClient({
    score,
    total,
    mode,
}: ResultClientProps) {
    const [wrongCount, setWrongCount] = useState(0);
    const savedRef = useRef(false);

    useEffect(() => {
        setWrongCount(getWrongKanaCount());
    }, []);

    useEffect(() => {
        if (savedRef.current) return;
        recordKanaStudy(total, score);
        savedRef.current = true;
    }, [score, total]);

    const percent = useMemo(() => {
        return total > 0 ? Math.round((score / total) * 100) : 0;
    }, [score, total]);

    const resultMessage = useMemo(() => {
        if (percent === 100) {
            return "완벽합니다! 문자 감각이 아주 좋습니다.";
        }
        if (percent >= 80) {
            return "아주 잘하셨습니다. 이제 복습만 조금 더 하면 더 단단해집니다.";
        }
        if (percent >= 60) {
            return "좋습니다. 절반을 넘겼으니 감이 점점 잡히고 있습니다.";
        }
        return "괜찮습니다. 지금부터가 익숙해지는 구간입니다. 천천히 반복해 봅시다.";
    }, [percent]);

    const modeMessage = useMemo(() => {
        if (mode === "hiragana") {
            return "히라가나를 중심으로 복습한 결과입니다.";
        }
        if (mode === "katakana") {
            return "가타카나를 중심으로 복습한 결과입니다.";
        }
        if (mode === "rules") {
            return "촉음과 장음 같은 발음 규칙을 중심으로 학습한 결과입니다.";
        }
        return "히라가나와 가타카나를 함께 복습한 결과입니다.";
    }, [mode]);

    return (
        <main className="min-h-screen bg-[linear-gradient(180deg,#f7fbff_0%,#eef6ff_45%,#f9fcff_100%)] pb-24 text-slate-900">
            <section className="mx-auto w-full max-w-md px-5 py-7">
                <div className="rounded-[32px] bg-white/85 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)] ring-1 ring-sky-100 backdrop-blur">
                    <Link
                        href="/"
                        className="inline-flex rounded-full bg-sky-50 px-3 py-1 text-sm font-semibold text-sky-700 ring-1 ring-sky-100"
                    >
                        ← 홈으로
                    </Link>

                    <div className="mt-4 inline-flex rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700 ring-1 ring-sky-100">
                        {modeLabels[mode]}
                    </div>

                    <h1 className="mt-4 text-[30px] font-extrabold tracking-tight">
                        퀴즈 결과
                    </h1>
                    <p className="mt-3 text-[15px] leading-7 text-slate-600">
                        오늘의 학습 결과를 확인하고, 다음 복습으로 이어가 보세요.
                    </p>

                    <div className="mt-5 rounded-[28px] bg-white p-5 shadow-[0_14px_36px_rgba(15,23,42,0.07)] ring-1 ring-slate-100">
                        <div className="text-3xl font-extrabold text-slate-900">
                            {score} / {total}
                        </div>

                        <div className="mt-2 text-lg font-semibold text-slate-700">
                            정답률 {percent}%
                        </div>

                        <div className="mt-4 rounded-2xl bg-sky-50 p-4 text-sm leading-6 text-slate-700 ring-1 ring-sky-100">
                            {resultMessage}
                        </div>

                        <div className="mt-4 rounded-2xl bg-white p-4 text-sm leading-6 text-slate-600 ring-1 ring-slate-200">
                            {modeMessage}
                        </div>

                        <div className="mt-4 rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-semibold text-slate-700">
                                    현재 오답 개수
                                </span>
                                <span className="text-lg font-bold text-slate-900">
                                    {wrongCount}개
                                </span>
                            </div>
                            <p className="mt-2 text-sm leading-6 text-slate-500">
                                틀린 문자는 오답 복습에서 다시 확인할 수 있습니다.
                            </p>
                        </div>

                        <div className="mt-6 grid gap-3">
                            <Link
                                href="/quiz"
                                className="flex w-full items-center justify-center rounded-2xl bg-sky-500 px-4 py-3.5 text-base font-bold text-white transition hover:bg-sky-600"
                            >
                                다시 풀기
                            </Link>

                            {wrongCount > 0 && (
                                <Link
                                    href="/review"
                                    className="flex w-full items-center justify-center rounded-2xl bg-white px-4 py-3.5 text-base font-bold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50"
                                >
                                    오답 복습하러 가기
                                </Link>
                            )}

                            <Link
                                href="/letters"
                                className="flex w-full items-center justify-center rounded-2xl bg-white px-4 py-3.5 text-base font-bold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50"
                            >
                                문자 학습으로 가기
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <BottomNav />
        </main>
    );
}