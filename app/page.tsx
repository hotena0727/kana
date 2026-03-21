"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import { getKanaProgress, getTodayKanaStats } from "@/lib/progress";

type HomeStats = {
  streakDays: number;
  todaySolved: number;
  todayCorrect: number;
};

type InstallCopy = {
  badge: string;
  title: string;
  desc: string;
  steps: string[];
  note: string;
};

type BeforeInstallPromptEventLike = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

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
    title: "손으로 써보기",
    description: "배운 문자를 직접 써보면서 모양과 순서를 익혀보세요.",
    href: "/write",
    cta: "손으로 써보기",
    icon: "✍️",
  },
  {
    id: "step_4",
    badge: "4단계",
    title: "퀴즈로 확인하기",
    description: "기본, 확장, 전체 범위를 골라 지금 배운 내용을 바로 문제로 확인해 보세요.",
    href: "/quiz",
    cta: "퀴즈 풀기",
    icon: "📋",
  },
  {
    id: "step_5",
    badge: "5단계",
    title: "틀린 것 다시 보기",
    description: "틀린 문자만 다시 복습하면서 약한 부분을 줄여보세요.",
    href: "/review",
    cta: "오답 복습 가기",
    icon: "🔁",
  },
];

const INSTALL_VISIT_KEY = "kana_install_visit_count";
const INSTALL_HIDE_KEY = "kana_install_hide_forever";
const INSTALL_PROMPT_SHOWN_KEY = "kana_install_prompt_shown_map";
const INSTALL_PROMPT_STEPS = [3, 7, 10];

function isStandaloneMode() {
  if (typeof window === "undefined") return false;

  const byMedia = window.matchMedia?.("(display-mode: standalone)")?.matches;
  const byNavigator = (window.navigator as Navigator & { standalone?: boolean }).standalone === true;

  return Boolean(byMedia || byNavigator);
}

function detectIosSafari() {
  if (typeof window === "undefined") return false;

  const ua = window.navigator.userAgent;
  const isIos = /iphone|ipad|ipod/i.test(ua);
  const isSafari =
    /safari/i.test(ua) && !/crios|fxios|edgios|chrome|android|samsungbrowser/i.test(ua);

  return isIos && isSafari;
}

function detectSamsungInternet() {
  if (typeof window === "undefined") return false;
  return /samsungbrowser/i.test(window.navigator.userAgent);
}

function detectAndroidChrome() {
  if (typeof window === "undefined") return false;

  const ua = window.navigator.userAgent;
  const isAndroid = /android/i.test(ua);
  const isChrome = /chrome/i.test(ua) && !/edg|opr|samsungbrowser/i.test(ua);

  return isAndroid && isChrome;
}

function getInstallPromptStep(count: number) {
  return INSTALL_PROMPT_STEPS.includes(count) ? count : null;
}

function getInstallPromptCopy(
  step: number | null,
  platform: "samsung" | "ios" | "chrome" | "generic",
  canInstall: boolean
): InstallCopy {
  const suffix =
    step === 3
      ? "처음 한 번만 해두면 다음부터 훨씬 편하게 들어올 수 있어요."
      : step === 7
      ? "이미 설치하셨다면 닫으셔도 괜찮습니다."
      : "이번이 마지막 안내입니다. 원치 않으시면 다시 보지 않기를 눌러 주세요.";

  if (canInstall) {
    return {
      badge: step === 10 ? "마지막 안내" : "앱처럼 바로 쓰기",
      title: "이 기기에서는\n지금 바로 설치할 수 있어요.",
      desc: "아래 버튼을 누르면 홈화면에 추가할 수 있습니다.",
      steps: [
        "아래의 ‘지금 홈화면에 추가하기’ 버튼을 누르세요.",
        "설치 창이 보이면 확인을 눌러 주세요.",
        "설치가 끝나면 홈화면에서 바로 실행할 수 있어요.",
      ],
      note: suffix,
    };
  }

  if (platform === "samsung") {
    return {
      badge: step === 10 ? "마지막 안내" : "삼성 인터넷 추천",
      title: "갤럭시에서는\n삼성 인터넷으로 설치가 편해요.",
      desc: "삼성 인터넷은 자주 방문한 앱에서 주소창의 ‘+’ 아이콘이나 홈화면 추가 안내를 보여줄 수 있어요.",
      steps: [
        "삼성 인터넷으로 이 페이지를 여세요.",
        "주소창 근처의 ‘+’ 아이콘이 보이면 눌러 주세요.",
        "안 보이면 메뉴에서 ‘홈 화면에 추가’를 찾아 눌러 주세요.",
      ],
      note: suffix,
    };
  }

  if (platform === "ios") {
    return {
      badge: step === 10 ? "마지막 안내" : "iPhone Safari 안내",
      title: "아이폰은 Safari에서\n홈화면에 추가해 주세요.",
      desc: "iPhone Safari에서는 공유 메뉴에서 홈화면 추가를 진행하면 됩니다.",
      steps: [
        "Safari로 이 페이지를 여세요.",
        "아래의 ‘공유’ 버튼을 누르세요.",
        "‘홈 화면에 추가’를 누른 뒤 ‘추가’를 누르세요.",
      ],
      note: suffix,
    };
  }

  if (platform === "chrome") {
    return {
      badge: step === 10 ? "마지막 안내" : "Chrome 설치 안내",
      title: "안드로이드 Chrome에서도\n간단히 추가할 수 있어요.",
      desc: "Chrome에서는 메뉴의 ‘홈 화면에 추가’ 또는 비슷한 설치 항목으로 진행하면 됩니다.",
      steps: [
        "Chrome으로 이 페이지를 여세요.",
        "오른쪽 위 ‘⋮’ 메뉴를 누르세요.",
        "‘홈 화면에 추가’ 또는 설치 관련 항목을 눌러 추가하세요.",
      ],
      note: suffix,
    };
  }

  return {
    badge: step === 10 ? "마지막 안내" : "홈화면 추가 안내",
    title: "브라우저 메뉴에서\n홈화면에 추가해 보세요.",
    desc: "브라우저마다 이름은 조금 다르지만 보통 ‘홈 화면에 추가’ 또는 ‘앱 설치’ 메뉴가 있습니다.",
    steps: [
      "브라우저 메뉴를 여세요.",
      "‘홈 화면에 추가’ 또는 ‘앱 설치’ 같은 항목을 찾으세요.",
      "추가 후 홈화면에서 바로 실행해 보세요.",
    ],
    note: suffix,
  };
}

export default function HomePage() {
  const [stats, setStats] = useState<HomeStats>({
    streakDays: 0,
    todaySolved: 0,
    todayCorrect: 0,
  });

  const [showInstallModal, setShowInstallModal] = useState(false);
  const [canInstall, setCanInstall] = useState(false);
  const [installPromptStep, setInstallPromptStep] = useState<number | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEventLike | null>(null);

  const [isIosSafari, setIsIosSafari] = useState(false);
  const [isSamsungInternet, setIsSamsungInternet] = useState(false);
  const [isAndroidChrome, setIsAndroidChrome] = useState(false);

  useEffect(() => {
    const progress = getKanaProgress();
    const today = getTodayKanaStats();

    setStats({
      streakDays: progress.streakDays,
      todaySolved: today.solved,
      todayCorrect: today.correct,
    });
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const hiddenForever = localStorage.getItem(INSTALL_HIDE_KEY) === "true";
    const standalone = isStandaloneMode();

    setIsSamsungInternet(detectSamsungInternet());
    setIsIosSafari(detectIosSafari());
    setIsAndroidChrome(detectAndroidChrome());

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEventLike);
      setCanInstall(true);
    };

    const handleAppInstalled = () => {
      setShowInstallModal(false);
      setCanInstall(false);
      setDeferredPrompt(null);
      localStorage.setItem(INSTALL_HIDE_KEY, "true");
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt as EventListener);
    window.addEventListener("appinstalled", handleAppInstalled);

    if (!hiddenForever && !standalone) {
      const nextCount = Number(localStorage.getItem(INSTALL_VISIT_KEY) || "0") + 1;
      localStorage.setItem(INSTALL_VISIT_KEY, String(nextCount));

      const promptStep = getInstallPromptStep(nextCount);

      let shownMap: Record<string, boolean> = {};
      try {
        shownMap = JSON.parse(localStorage.getItem(INSTALL_PROMPT_SHOWN_KEY) || "{}");
      } catch {
        shownMap = {};
      }

      if (promptStep && !shownMap[String(promptStep)]) {
        setInstallPromptStep(promptStep);
        setShowInstallModal(true);
        shownMap[String(promptStep)] = true;
        localStorage.setItem(INSTALL_PROMPT_SHOWN_KEY, JSON.stringify(shownMap));
      }
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt as EventListener);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const installPlatform = useMemo<"samsung" | "ios" | "chrome" | "generic">(() => {
    if (isSamsungInternet) return "samsung";
    if (isIosSafari) return "ios";
    if (isAndroidChrome) return "chrome";
    return "generic";
  }, [isSamsungInternet, isIosSafari, isAndroidChrome]);

  const installCopy = useMemo(() => {
    return getInstallPromptCopy(installPromptStep, installPlatform, canInstall);
  }, [installPromptStep, installPlatform, canInstall]);

  const handleInstallApp = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;

      if (choice?.outcome === "accepted") {
        localStorage.setItem(INSTALL_HIDE_KEY, "true");
      }
    } catch (error) {
      console.error("install prompt failed", error);
    } finally {
      setDeferredPrompt(null);
      setCanInstall(false);
      setShowInstallModal(false);
    }
  };

  const handleCloseInstallModal = () => {
    if (installPromptStep === 10) {
      localStorage.setItem(INSTALL_HIDE_KEY, "true");
    }
    setShowInstallModal(false);
  };

  const handleHideInstallModalForever = () => {
    localStorage.setItem(INSTALL_HIDE_KEY, "true");
    setShowInstallModal(false);
  };

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f7fbff_0%,#eef6ff_45%,#f9fcff_100%)] pb-24 text-slate-900">
      <section className="mx-auto flex min-h-screen w-full max-w-md flex-col px-5 py-7">
        <div className="mb-6 overflow-hidden rounded-[32px] bg-white/85 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)] ring-1 ring-sky-100 backdrop-blur">
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

          <div className="mt-5 grid grid-cols-2 gap-3">
            <Link
              href="/letters"
              className="flex items-center justify-center rounded-2xl bg-sky-500 px-4 py-3.5 text-base font-bold text-white transition hover:bg-sky-600"
            >
              문자 학습 시작
            </Link>

            <Link
              href="/quiz"
              className="flex items-center justify-center rounded-2xl bg-white px-4 py-3.5 text-base font-bold text-sky-700 ring-1 ring-sky-100 transition hover:bg-sky-50"
            >
              오늘의 10문제
            </Link>
          </div>
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

        <div className="rounded-[30px] bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.08)] ring-1 ring-slate-100">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-sky-700">추천 학습 코스</div>
              <div className="mt-2 text-xl font-bold text-slate-900">
                문자 → 규칙 → 퀴즈 → 복습
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                처음이라면 아래 순서대로 따라가면 가장 자연스럽게 익힐 수 있습니다.
              </p>
            </div>

            <div className="shrink-0 rounded-2xl bg-sky-50 px-3 py-2 text-xs font-semibold text-sky-700 ring-1 ring-sky-100">
              처음 시작용
            </div>
          </div>

          <div className="mt-5 grid gap-3">
            {learningSteps.map((step, index) => {
              const isFirst = index === 0;

              return (
                <Link
                  key={step.id}
                  href={step.href}
                  className={[
                    "group rounded-[24px] p-4 transition",
                    isFirst
                      ? "bg-[linear-gradient(180deg,#eff8ff_0%,#f8fbff_100%)] ring-2 ring-sky-200 shadow-[0_14px_32px_rgba(56,189,248,0.10)]"
                      : "bg-sky-50/70 ring-1 ring-sky-100 hover:bg-sky-50",
                  ].join(" ")}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={[
                        "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-lg font-bold text-slate-900",
                        isFirst ? "bg-white ring-2 ring-sky-100" : "bg-white ring-1 ring-sky-100",
                      ].join(" ")}
                    >
                      {step.icon}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <div className="inline-flex rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-sky-700 ring-1 ring-sky-100">
                          {step.badge}
                        </div>

                        {isFirst && (
                          <div className="inline-flex rounded-full bg-sky-500 px-2.5 py-1 text-[11px] font-semibold text-white">
                            여기서 시작
                          </div>
                        )}
                      </div>

                      <div className="mt-2 text-base font-bold text-slate-900">
                        {step.title}
                      </div>

                      <p className="mt-1 text-sm leading-6 text-slate-600">
                        {step.description}
                      </p>

                      <div className="mt-3 flex items-center justify-between">
                        <div className="text-sm font-semibold text-sky-700">
                          {step.cta}
                        </div>
                        <div className="text-sky-400 transition group-hover:translate-x-0.5">
                          →
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="mt-5 rounded-2xl bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600 ring-1 ring-slate-200">
            처음에는 순서대로 가볍게 보시고, 익숙해지면 필요한 단계만 골라서 반복해도 좋습니다.
          </div>
        </div>
      </section>

      {showInstallModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 px-4 pb-6 pt-10 backdrop-blur-[2px]">
          <div className="relative w-full max-w-md overflow-hidden rounded-[30px] bg-white shadow-[0_28px_80px_rgba(15,23,42,0.28)] ring-1 ring-white/70">
            <div className="bg-[linear-gradient(135deg,#e0f2fe_0%,#f0f9ff_38%,#ffffff_100%)] px-5 pb-4 pt-5">
              <div className="inline-flex rounded-full bg-white/85 px-3 py-1 text-xs font-semibold text-sky-700 ring-1 ring-sky-100">
                {installCopy.badge}
              </div>

              <h2 className="mt-3 whitespace-pre-line text-[24px] font-extrabold leading-tight tracking-tight text-slate-900">
                {installCopy.title}
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-600">{installCopy.desc}</p>

              <div className="mt-4 rounded-[24px] bg-white/90 p-4 ring-1 ring-sky-100">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-sky-50 text-lg ring-1 ring-sky-100">
                    {installPlatform === "samsung"
                      ? "📱"
                      : installPlatform === "ios"
                      ? "🍎"
                      : installPlatform === "chrome"
                      ? "🌐"
                      : "✨"}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900">
                      {installPlatform === "samsung"
                        ? "삼성 인터넷 안내"
                        : installPlatform === "ios"
                        ? "iPhone Safari 안내"
                        : installPlatform === "chrome"
                        ? "Android Chrome 안내"
                        : "브라우저 설치 안내"}
                    </div>
                    <div className="text-xs text-slate-500">
                      홈화면에 두면 앱처럼 바로 실행할 수 있어요
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid gap-2.5">
                  {installCopy.steps.map((step, idx) => (
                    <div
                      key={`${idx}-${step}`}
                      className="flex gap-3 rounded-2xl bg-sky-50/70 px-3 py-3 ring-1 ring-sky-100"
                    >
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-xs font-extrabold text-sky-700 ring-1 ring-sky-100">
                        {idx + 1}
                      </div>
                      <div className="text-sm leading-6 text-slate-700">{step}</div>
                    </div>
                  ))}
                </div>

                <p className="mt-4 text-xs leading-5 text-slate-500">{installCopy.note}</p>
              </div>
            </div>

            <div className="px-5 pb-5 pt-4">
              <div className="grid gap-3">
                {canInstall && (
                  <button
                    type="button"
                    onClick={handleInstallApp}
                    className="w-full rounded-2xl bg-sky-500 px-4 py-3.5 text-sm font-bold text-white transition hover:bg-sky-600"
                  >
                    지금 홈화면에 추가하기
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleCloseInstallModal}
                  className="w-full rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50"
                >
                  {installPromptStep === 7 || installPromptStep === 10
                    ? "이미 설치했으면 닫기"
                    : "나중에 보기"}
                </button>

                <button
                  type="button"
                  onClick={handleHideInstallModalForever}
                  className="w-full rounded-2xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                >
                  다시 보지 않기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </main>
  );
}