"use client";

import Link from "next/link";
import BottomNav from "@/components/BottomNav";

type RuleExample = {
  jp: string;
  ko: string;
  point: string;
};

type RuleCard = {
  id: string;
  badge: string;
  title: string;
  symbol: string;
  description: string;
  examples: RuleExample[];
  tip: string;
};

const ruleCards: RuleCard[] = [
  {
    id: "sokuon",
    badge: "촉음",
    title: "っ / ッ 는 잠깐 끊어 읽어요",
    symbol: "っ",
    description:
      "촉음은 앞소리를 한 번 멈췄다가 뒤 자음을 강하게 이어주는 느낌입니다.",
    examples: [
      { jp: "きって", ko: "우표", point: "ki-tte" },
      { jp: "がっこう", ko: "학교", point: "ga-kko-u" },
      { jp: "カップ", ko: "컵", point: "ka-ppu" },
    ],
    tip: "작은 っ / ッ가 보이면 바로 넘기지 말고, 한 박자 멈춘 뒤 다음 소리를 이어 보세요.",
  },
  {
    id: "choon",
    badge: "장음",
    title: "ー 는 앞소리를 길게 늘여 읽어요",
    symbol: "ー",
    description:
      "장음 부호는 바로 앞 음을 길게 끌어주는 표시입니다. 특히 가타카나 단어에서 자주 나옵니다.",
    examples: [
      { jp: "ケーキ", ko: "케이크", point: "ke-e-ki" },
      { jp: "スーパー", ko: "슈퍼", point: "su-u-pa-a" },
      { jp: "コーヒー", ko: "커피", point: "ko-o-hi-i" },
    ],
    tip: "ー를 별도의 소리로 읽지 말고, 바로 앞 음을 길게 늘여 읽는다고 생각하면 쉽습니다.",
  },
  {
    id: "compare",
    badge: "비교",
    title: "짧게 / 끊어서 / 길게 읽는 차이를 구별해요",
    symbol: "あ・っ・ー",
    description:
      "일본어는 소리를 짧게 읽는지, 끊는지, 길게 읽는지에 따라 느낌이 달라집니다.",
    examples: [
      { jp: "さか", ko: "언덕", point: "그냥 자연스럽게" },
      { jp: "さっか", ko: "작가", point: "중간을 끊어서" },
      { jp: "カー", ko: "자동차(car)", point: "앞소리를 길게" },
    ],
    tip: "문자만 보지 말고 박자를 세듯이 읽으면 촉음과 장음이 훨씬 잘 익습니다.",
  },
];

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

export default function RulesPage() {
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
            발음 규칙 학습
          </h1>
          <p className="mt-3 text-[15px] leading-7 text-slate-600">
            촉음과 장음처럼 헷갈리기 쉬운 발음 규칙을 카드로 익혀봅시다.
          </p>
        </div>

        <div className="grid gap-4">
          {ruleCards.map((card) => (
            <article
              key={card.id}
              className="rounded-[28px] bg-white p-5 shadow-[0_14px_36px_rgba(15,23,42,0.07)] ring-1 ring-slate-100"
            >
              <div className="inline-flex rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700 ring-1 ring-sky-100">
                {card.badge}
              </div>

              <div className="mt-4 flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-sky-50 text-3xl font-extrabold text-slate-900 ring-1 ring-sky-100">
                  {card.symbol}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{card.title}</h2>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    {card.description}
                  </p>
                </div>
              </div>

              <div className="mt-5 rounded-2xl bg-sky-50/70 p-4 ring-1 ring-sky-100">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-xs font-semibold tracking-wide text-sky-700">
                    예시 단어
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      speakJapanese(card.examples.map((example) => example.jp).join("、"))
                    }
                    className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50"
                  >
                    카드 전체 듣기
                  </button>
                </div>

                <div className="mt-3 grid gap-3">
                  {card.examples.map((example) => (
                    <div
                      key={`${card.id}_${example.jp}`}
                      className="rounded-2xl bg-white p-3 ring-1 ring-slate-100"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-lg font-bold text-slate-900">{example.jp}</div>
                          <div className="mt-1 text-sm text-slate-600">{example.ko}</div>
                          <div className="mt-1 text-xs font-semibold text-sky-700">
                            읽는 느낌: {example.point}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => speakJapanese(example.jp)}
                          className="shrink-0 rounded-full bg-sky-50 px-3 py-1.5 text-xs font-semibold text-sky-700 ring-1 ring-sky-100 transition hover:bg-sky-100"
                        >
                          듣기
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-dashed border-sky-200 bg-white p-4 text-sm leading-6 text-slate-600">
                {card.tip}
              </div>
            </article>
          ))}
        </div>
      </section>

      <BottomNav />
    </main>
  );
}