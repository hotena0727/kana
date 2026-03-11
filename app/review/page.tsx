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
              <div className="text-sm font-semibold text-sky-700">오답복습 준비 완료</div>
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
          </div>
        </section>

        <BottomNav />
      </main>
    );
  }

  if (!currentQuestion) {
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

            <div className="mt-5 text-sm font-semibold text-sky-700">오답복습 준비 중</div>
            <div className="mt-2 text-lg font-bold text-slate-900">
              문제를 불러오는 중입니다.
            </div>
          </div>
        </section>

        <BottomNav />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f7fbff_0%,#eef6ff_45%,#f9fcff_100%)] pb-24 text-slate-900">
      <section className="mx-auto w-full max-w-md px-5 py-7">
        <div className="mb-5 rounded-[32px] bg-white/85 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)] ring-1 ring-sky-100 backdrop-blur">
          <div className="flex items-center justify-between gap-3">
            <Link
              href="/"
              className="inline-flex rounded-full bg-sky-50 px-3 py-1 text-sm font-semibold text-sky-700 ring-1 ring-sky-100"
            >
              ← 홈으로
            </Link>

            <button
              type="button"
              onClick={handleClear}
              className="inline-flex rounded-full bg-white px-3 py-1 text-sm font-semibold text-slate-700 ring-1 ring-slate-200"
            >
              오답 비우기
            </button>
          </div>

          <h1 className="mt-4 text-[30px] font-extrabold tracking-tight">
            오답 퀴즈
          </h1>
          <p className="mt-3 text-[15px] leading-7 text-slate-600">
            저장된 오답만 다시 맞혀 보세요.
          </p>
        </div>

        <div className="mb-4 rounded-[28px] bg-white p-4 shadow-[0_14px_36px_rgba(15,23,42,0.07)] ring-1 ring-slate-100">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold text-sky-700">
              {currentIndex + 1} / {totalCount}
            </span>
            <span className="text-slate-500">현재 점수: {score}</span>
          </div>

          <div className="mt-2 text-xs text-slate-500">
            남아 있는 오답 {wrongIds.length}개
          </div>

          <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-sky-500 transition-all"
              style={{ width: `${((currentIndex + 1) / totalCount) * 100}%` }}
            />
          </div>
        </div>

        <div className="rounded-[28px] bg-white p-5 shadow-[0_14px_36px_rgba(15,23,42,0.07)] ring-1 ring-slate-100">
          <div className="text-sm font-semibold text-sky-700">문제</div>

          <div className="mt-4 rounded-[26px] bg-sky-50 p-6 text-center ring-1 ring-sky-100">
            <div className="text-sm text-slate-500">{currentQuestion.prompt}</div>
            <div className="mt-3 text-6xl font-bold text-slate-900">
              {currentQuestion.promptValue}
            </div>
          </div>

          <div className="mt-5 grid gap-3">
            {currentQuestion.choices.map((choice, index) => {
              const isSelected = selectedChoice === choice.label;
              const isCorrectChoice = isChecked && choice.isAnswer;
              const isWrongSelected = isChecked && isSelected && !choice.isAnswer;

              const className = [
                "rounded-2xl px-4 py-3 text-left font-semibold ring-1 transition",
                isCorrectChoice
                  ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                  : isWrongSelected
                    ? "bg-rose-50 text-rose-700 ring-rose-200"
                    : isSelected
                      ? "bg-sky-50 text-sky-700 ring-sky-200"
                      : "bg-white text-slate-800 ring-slate-200 hover:bg-slate-50",
              ].join(" ");

              return (
                <button
                  key={`${currentQuestion.id}_${choice.id}_${index}`}
                  type="button"
                  onClick={() => handleChoiceClick(choice.label)}
                  className={className}
                  disabled={isChecked}
                >
                  {index + 1}. {choice.label}
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
                "mt-5 flex w-full items-center justify-center rounded-2xl px-4 py-3.5 text-base font-bold text-white transition",
                selectedChoice
                  ? "bg-sky-500 hover:bg-sky-600"
                  : "cursor-not-allowed bg-slate-300",
              ].join(" ")}
            >
              정답 확인
            </button>
          ) : (
            <div className="mt-5">
              <div
                className={[
                  "rounded-2xl p-4 text-sm font-semibold",
                  selectedChoice === currentQuestion.answer
                    ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                    : "bg-rose-50 text-rose-700 ring-1 ring-rose-200",
                ].join(" ")}
              >
                {selectedChoice === currentQuestion.answer
                  ? "정답입니다! 이 문자는 오답 목록에서 제거됩니다."
                  : `아쉬워요. 정답은 "${currentQuestion.answer}" 입니다.`}
              </div>

              <button
                type="button"
                onClick={handleNextQuestion}
                className="mt-4 flex w-full items-center justify-center rounded-2xl bg-sky-500 px-4 py-3.5 text-base font-bold text-white transition hover:bg-sky-600"
              >
                {isLastQuestion ? "결과 보기" : "다음 문제"}
              </button>
            </div>
          )}
        </div>
      </section>

      <BottomNav />
    </main>
  );
}