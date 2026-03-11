"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import {
  createKanaQuiz,
  type QuizMode,
  type QuizQuestion,
  type QuizScope,
} from "@/lib/quiz";
import { addWrongKanaId } from "@/lib/storage";
import { playSfx } from "@/lib/sfx";

const modeLabels: Record<QuizMode, string> = {
  hiragana: "히라가나만",
  katakana: "가타카나만",
  mixed: "섞기",
  rules: "발음 규칙",
};

const scopeLabels: Record<QuizScope, string> = {
  basic: "기본",
  extended: "확장",
  full: "전체",
};

function speakJapanese(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  if (!text) return;

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "ja-JP";
  utterance.rate = 0.85;
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

export default function QuizPage() {
  const router = useRouter();

  const [mode, setMode] = useState<QuizMode | null>(null);
  const [scope, setScope] = useState<QuizScope>("basic");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [isChecked, setIsChecked] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (!mode) return;
    setQuestions(createKanaQuiz(mode, 10, scope));
  }, [mode, scope]);

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const currentQuestion = useMemo(() => {
    return questions[currentIndex];
  }, [questions, currentIndex]);

  const totalCount = questions.length;
  const isLastQuestion = currentIndex + 1 === totalCount;
  const isRuleMode = mode === "rules";

  const startQuiz = (nextMode: QuizMode) => {
    const newQuestions = createKanaQuiz(nextMode, 10, scope);
    setMode(nextMode);
    setQuestions(newQuestions);
    setCurrentIndex(0);
    setSelectedChoice(null);
    setIsChecked(false);
    setScore(0);
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
      playSfx("correct.mp3");
    } else {
      if (!isRuleMode) {
        addWrongKanaId(currentQuestion.kanaId);
      }
      playSfx("wrong.mp3");
    }

    setIsChecked(true);
  };

  const handleNextQuestion = () => {
    if (!currentQuestion) return;

    if (isLastQuestion) {
      router.push(
        `/result?score=${score}&total=${questions.length}&mode=${mode ?? "mixed"}`
      );
      return;
    }

    setCurrentIndex((prev) => prev + 1);
    setSelectedChoice(null);
    setIsChecked(false);
  };

  const handleRestart = () => {
    if (!mode) return;

    const newQuestions = createKanaQuiz(mode, 10, scope);
    setQuestions(newQuestions);
    setCurrentIndex(0);
    setSelectedChoice(null);
    setIsChecked(false);
    setScore(0);
    playSfx("start.mp3");
  };

  const handleSpeakPrompt = () => {
    if (!currentQuestion) return;
    speakJapanese(currentQuestion.promptValue);
  };

  if (!mode) {
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
              퀴즈 모드 선택
            </h1>
            <p className="mt-3 text-[15px] leading-7 text-slate-600">
              문자 종류와 문제 범위를 선택하고 10문제 퀴즈를 시작해 보세요.
            </p>
          </div>

          <div className="mb-5 rounded-[28px] bg-white p-5 shadow-[0_14px_36px_rgba(15,23,42,0.07)] ring-1 ring-slate-100">
            <div className="text-sm font-semibold text-sky-700">문제 범위 선택</div>
            <div className="mt-3 grid grid-cols-3 gap-3">
              {(["basic", "extended", "full"] as QuizScope[]).map((item) => {
                const isActive = scope === item;

                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setScope(item)}
                    className={[
                      "rounded-2xl px-4 py-3 text-sm font-semibold transition ring-1",
                      isActive
                        ? "bg-sky-500 text-white ring-sky-500"
                        : "bg-white text-slate-700 ring-slate-200 hover:bg-slate-50",
                    ].join(" ")}
                  >
                    {scopeLabels[item]}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 rounded-2xl bg-sky-50 p-4 text-sm leading-6 text-slate-600 ring-1 ring-sky-100">
              <div>
                <span className="font-semibold text-sky-700">기본</span> : 청음만
              </div>
              <div className="mt-1">
                <span className="font-semibold text-sky-700">확장</span> : 청음 + 탁음/반탁음
              </div>
              <div className="mt-1">
                <span className="font-semibold text-sky-700">전체</span> : 청음 + 탁음/반탁음 + 요음
              </div>
            </div>
          </div>

          <div className="grid gap-4">
            <button
              type="button"
              onClick={() => startQuiz("hiragana")}
              className="rounded-[28px] bg-white p-5 text-left shadow-[0_14px_36px_rgba(15,23,42,0.07)] ring-1 ring-slate-100 transition hover:-translate-y-0.5"
            >
              <div className="text-sm font-semibold text-sky-700">문자 퀴즈</div>
              <div className="mt-1 text-xl font-bold">히라가나만</div>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                선택한 범위로 히라가나만 집중해서 퀴즈를 풉니다.
              </p>
            </button>

            <button
              type="button"
              onClick={() => startQuiz("katakana")}
              className="rounded-[28px] bg-white p-5 text-left shadow-[0_14px_36px_rgba(15,23,42,0.07)] ring-1 ring-slate-100 transition hover:-translate-y-0.5"
            >
              <div className="text-sm font-semibold text-sky-700">문자 퀴즈</div>
              <div className="mt-1 text-xl font-bold">가타카나만</div>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                선택한 범위로 가타카나만 집중해서 퀴즈를 풉니다.
              </p>
            </button>

            <button
              type="button"
              onClick={() => startQuiz("mixed")}
              className="rounded-[28px] bg-white p-5 text-left shadow-[0_14px_36px_rgba(15,23,42,0.07)] ring-1 ring-slate-100 transition hover:-translate-y-0.5"
            >
              <div className="text-sm font-semibold text-sky-700">종합 복습</div>
              <div className="mt-1 text-xl font-bold">섞기</div>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                선택한 범위로 히라가나와 가타카나를 함께 복습합니다.
              </p>
            </button>

            <button
              type="button"
              onClick={() => startQuiz("rules")}
              className="rounded-[28px] bg-white p-5 text-left shadow-[0_14px_36px_rgba(15,23,42,0.07)] ring-1 ring-slate-100 transition hover:-translate-y-0.5"
            >
              <div className="text-sm font-semibold text-sky-700">발음 규칙</div>
              <div className="mt-1 text-xl font-bold">촉음 · 장음 퀴즈</div>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                っ / ッ, ー 의 읽기 규칙과 차이를 문제로 익혀봅니다.
              </p>
            </button>
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

            <div className="mt-5 text-sm font-semibold text-sky-700">퀴즈 준비 중</div>
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
              onClick={() => setMode(null)}
              className="inline-flex rounded-full bg-white px-3 py-1 text-sm font-semibold text-slate-700 ring-1 ring-slate-200"
            >
              모드 바꾸기
            </button>
          </div>

          <h1 className="mt-4 text-[30px] font-extrabold tracking-tight">
            오늘의 10문제
          </h1>
          <p className="mt-3 text-[15px] leading-7 text-slate-600">
            문제를 보고 알맞은 답을 골라 보세요.
          </p>
        </div>

        <div className="mb-4 rounded-[28px] bg-white p-4 shadow-[0_14px_36px_rgba(15,23,42,0.07)] ring-1 ring-slate-100">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <div className="inline-flex rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700 ring-1 ring-sky-100">
              {modeLabels[mode]}
            </div>
            {!isRuleMode && (
              <div className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                {scopeLabels[scope]}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold text-sky-700">
              {currentIndex + 1} / {totalCount}
            </span>
            <span className="text-slate-500">현재 점수: {score}</span>
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
            <div className="mt-3 text-2xl font-bold text-slate-900 whitespace-pre-line">
              {currentQuestion.promptValue}
            </div>
          </div>

          {isRuleMode && (
            <button
              type="button"
              onClick={handleSpeakPrompt}
              className="mt-4 flex w-full items-center justify-center rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50"
            >
              문제 듣기
            </button>
          )}

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
                  ? "정답입니다!"
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

        <button
          type="button"
          onClick={handleRestart}
          className="mt-5 w-full rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50"
        >
          이 모드로 새 문제 만들기
        </button>
      </section>

      <BottomNav />
    </main>
  );
}