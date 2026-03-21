"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import {
  clearWrongKanaIds,
  getWrongKanaIds,
  removeWrongKanaId,
} from "@/lib/storage";
import { createReviewQuizByIds, type QuizQuestion } from "@/lib/quiz";
import { playSfx } from "@/lib/sfx";

type ChoiceLike =
  | string
  | {
    value?: string;
    label?: string;
    text?: string;
    reading?: string;
    answer?: string;
  };

function getChoiceValue(choice: ChoiceLike): string {
  if (typeof choice === "string") return choice;
  return (
    choice.value ??
    choice.label ??
    choice.text ??
    choice.reading ??
    choice.answer ??
    ""
  );
}

function ReviewCenterPromoCard() {
  return (
    <div className="mt-5 rounded-[28px] bg-gradient-to-br from-sky-50 to-white p-5 shadow-[0_14px_36px_rgba(15,23,42,0.06)] ring-1 ring-sky-100">
      <div className="text-sm font-semibold text-sky-700">
        하테나 교육센터 안내
      </div>

      <div className="mt-2 text-xl font-bold tracking-tight text-slate-900">
        혼자 정리하기 어려운 부분이 있나요?
      </div>

      <p className="mt-2 text-sm leading-6 text-slate-600">
        문자와 발음 다음 단계가 궁금하다면, 하테나 교육센터에서 더
        체계적으로 이어서 학습할 수 있어요.
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

export default function ReviewPage() {
  const [wrongIds, setWrongIds] = useState<string[]>([]);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [started, setStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [isChecked, setIsChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    const ids = getWrongKanaIds();
    setWrongIds(ids);
  }, []);

  const currentQuestion = useMemo(() => {
    return questions[currentIndex];
  }, [questions, currentIndex]);

  const totalCount = questions.length;
  const isLastQuestion = currentIndex + 1 === totalCount;

  const startReview = () => {
    const ids = getWrongKanaIds();
    setWrongIds(ids);

    const nextQuestions = createReviewQuizByIds(ids);
    setQuestions(nextQuestions);
    setStarted(true);
    setCurrentIndex(0);
    setSelectedChoice(null);
    setIsChecked(false);
    setScore(0);
    setFinished(false);

    playSfx("start.mp3");
  };

  const handleChoiceClick = (label: string) => {
    if (isChecked) return;
    setSelectedChoice(label);
    playSfx("click.mp3", 0.5);
  };

  const handleCheckAnswer = () => {
    if (!currentQuestion || !selectedChoice || isChecked) return;

    const isCorrect = selectedChoice === currentQuestion.answer;

    if (isCorrect) {
      setScore((prev) => prev + 1);
      removeWrongKanaId(currentQuestion.kanaId);
      setWrongIds((prev) => prev.filter((id) => id !== currentQuestion.kanaId));
      playSfx("correct.mp3");
    } else {
      playSfx("wrong.mp3");
    }

    setIsChecked(true);
  };

  const handleNextQuestion = () => {
    const nextIndex = currentIndex + 1;

    if (nextIndex >= questions.length) {
      setFinished(true);
      return;
    }

    setCurrentIndex(nextIndex);
    setSelectedChoice(null);
    setIsChecked(false);
  };

  const handleClear = () => {
    clearWrongKanaIds();
    setWrongIds([]);
    setQuestions([]);
    setStarted(false);
    setCurrentIndex(0);
    setSelectedChoice(null);
    setIsChecked(false);
    setScore(0);
    setFinished(false);
  };

  if (wrongIds.length === 0 && !started) {
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

            <h1 className="mt-4 text-[30px] font-extrabold tracking-tight">
              틀린 문자 다시 보기
            </h1>
            <p className="mt-3 text-[15px] leading-7 text-slate-600">
              퀴즈에서 틀린 문자가 생기면 이곳에서 다시 복습할 수 있습니다.
            </p>

            <div className="mt-5 rounded-[28px] bg-white p-5 shadow-[0_14px_36px_rgba(15,23,42,0.07)] ring-1 ring-slate-100">
              <div className="text-sm font-semibold text-sky-700">오답복습</div>
              <div className="mt-2 text-xl font-bold text-slate-900">
                아직 저장된 오답이 없습니다.
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                퀴즈를 풀면서 틀린 문자가 자동 저장됩니다.
              </p>

              <Link
                href="/quiz"
                className="mt-5 flex w-full items-center justify-center rounded-2xl bg-sky-500 px-4 py-3.5 text-base font-bold text-white transition hover:bg-sky-600"
              >
                퀴즈로 이동하기
              </Link>
            </div>

            <ReviewCenterPromoCard />
          </div>
        </section>

        <BottomNav />
      </main>
    );
  }

  if (!started) {
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

            <h1 className="mt-4 text-[30px] font-extrabold tracking-tight">
              틀린 문자 다시 보기
            </h1>
            <p className="mt-3 text-[15px] leading-7 text-slate-600">
              저장된 오답만 다시 맞혀 보세요.
            </p>

            <div className="mt-5 rounded-[28px] bg-white p-5 shadow-[0_14px_36px_rgba(15,23,42,0.07)] ring-1 ring-slate-100">
              <div className="text-sm font-semibold text-sky-700">
                오답복습 준비 완료
              </div>
              <div className="mt-2 text-xl font-bold text-slate-900">
                저장된 문자 {wrongIds.length}개
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                맞힌 문자는 자동으로 목록에서 빠집니다.
              </p>

              <div className="mt-5 grid gap-3">
                <button
                  type="button"
                  onClick={startReview}
                  className="flex w-full items-center justify-center rounded-2xl bg-sky-500 px-4 py-3.5 text-base font-bold text-white transition hover:bg-sky-600"
                >
                  오답 퀴즈 시작하기
                </button>

                <button
                  type="button"
                  onClick={handleClear}
                  className="flex w-full items-center justify-center rounded-2xl bg-white px-4 py-3.5 text-base font-bold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50"
                >
                  오답 비우기
                </button>
              </div>
            </div>

            <ReviewCenterPromoCard />
          </div>
        </section>

        <BottomNav />
      </main>
    );
  }

  if (finished) {
    const percent = totalCount > 0 ? Math.round((score / totalCount) * 100) : 0;
    const remaining = wrongIds.length;

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

            <h1 className="mt-4 text-[30px] font-extrabold tracking-tight">
              오답복습 결과
            </h1>
            <p className="mt-3 text-[15px] leading-7 text-slate-600">
              맞힌 문자는 자동으로 빠지고, 남은 오답만 다시 복습할 수 있습니다.
            </p>

            <div className="mt-5 rounded-[28px] bg-white p-5 shadow-[0_14px_36px_rgba(15,23,42,0.07)] ring-1 ring-slate-100">
              <div className="text-3xl font-extrabold text-slate-900">
                {score} / {totalCount}
              </div>

              <div className="mt-2 text-lg font-semibold text-slate-700">
                정답률 {percent}%
              </div>

              <div className="mt-4 rounded-2xl bg-sky-50 p-4 text-sm leading-6 text-slate-700 ring-1 ring-sky-100">
                남아 있는 오답은 {remaining}개입니다.
              </div>

              <div className="mt-6 grid gap-3">
                {remaining > 0 ? (
                  <button
                    type="button"
                    onClick={startReview}
                    className="flex w-full items-center justify-center rounded-2xl bg-sky-500 px-4 py-3.5 text-base font-bold text-white transition hover:bg-sky-600"
                  >
                    남은 오답 다시 풀기
                  </button>
                ) : (
                  <Link
                    href="/quiz"
                    className="flex w-full items-center justify-center rounded-2xl bg-sky-500 px-4 py-3.5 text-base font-bold text-white transition hover:bg-sky-600"
                  >
                    새 퀴즈 풀기
                  </Link>
                )}

                <button
                  type="button"
                  onClick={handleClear}
                  className="flex w-full items-center justify-center rounded-2xl bg-white px-4 py-3.5 text-base font-bold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50"
                >
                  오답 비우기
                </button>
              </div>
            </div>

            <ReviewCenterPromoCard />
          </div>
        </section>

        <BottomNav />
      </main>
    );
  }

  if (!currentQuestion) {
    return null;
  }

  const progress = `${currentIndex + 1} / ${totalCount}`;
  const isCorrectChoice = (choice: string) => choice === currentQuestion.answer;
  const isSelectedChoice = (choice: string) => choice === selectedChoice;

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f7fbff_0%,#eef6ff_45%,#f9fcff_100%)] pb-24 text-slate-900">
      <section className="mx-auto w-full max-w-md px-5 py-7">
        <div className="rounded-[32px] bg-white/85 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)] ring-1 ring-sky-100 backdrop-blur">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="inline-flex rounded-full bg-sky-50 px-3 py-1 text-sm font-semibold text-sky-700 ring-1 ring-sky-100"
            >
              ← 홈으로
            </Link>

            <div className="rounded-full bg-slate-100 px-3 py-1 text-sm font-bold text-slate-700">
              {progress}
            </div>
          </div>

          <h1 className="mt-5 text-[28px] font-extrabold tracking-tight">
            오답복습 퀴즈
          </h1>
          <p className="mt-2 text-[15px] leading-7 text-slate-600">
            틀렸던 문자를 다시 보면서 감각을 익혀 보세요.
          </p>

          <div className="mt-5 rounded-[28px] bg-white p-6 text-center shadow-[0_14px_36px_rgba(15,23,42,0.07)] ring-1 ring-slate-100">
            <div className="text-[42px] font-extrabold tracking-tight text-slate-900">
              {currentQuestion.prompt}
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              알맞은 읽기 또는 문자를 골라 보세요.
            </p>

            <div className="mt-6 grid gap-3">
              {currentQuestion.choices.map((choice, index) => {
                const choiceValue = getChoiceValue(choice as ChoiceLike);

                const activeClass = !isChecked
                  ? isSelectedChoice(choiceValue)
                    ? "border-sky-500 bg-sky-50 text-sky-700"
                    : "border-slate-200 bg-white text-slate-800 hover:border-sky-300 hover:bg-sky-50/50"
                  : isCorrectChoice(choiceValue)
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                    : isSelectedChoice(choiceValue)
                      ? "border-rose-500 bg-rose-50 text-rose-700"
                      : "border-slate-200 bg-slate-50 text-slate-400";

                return (
                  <button
                    key={`${choiceValue}-${index}`}
                    type="button"
                    onClick={() => handleChoiceClick(choiceValue)}
                    disabled={isChecked}
                    className={[
                      "rounded-2xl border px-4 py-4 text-base font-bold transition",
                      activeClass,
                    ].join(" ")}
                  >
                    {choiceValue}
                  </button>
                );
              })}
            </div>

            {!isChecked ? (
              <button
                type="button"
                onClick={handleCheckAnswer}
                disabled={!selectedChoice}
                className={[
                  "mt-6 flex w-full items-center justify-center rounded-2xl px-4 py-3.5 text-base font-bold text-white transition",
                  selectedChoice
                    ? "bg-sky-500 hover:bg-sky-600"
                    : "cursor-not-allowed bg-slate-300",
                ].join(" ")}
              >
                정답 확인
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNextQuestion}
                className="mt-6 flex w-full items-center justify-center rounded-2xl bg-sky-500 px-4 py-3.5 text-base font-bold text-white transition hover:bg-sky-600"
              >
                {isLastQuestion ? "결과 보기" : "다음 문제"}
              </button>
            )}
          </div>
        </div>
      </section>

      <BottomNav />
    </main>
  );
}