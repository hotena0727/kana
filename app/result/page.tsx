import ResultClient from "./ResultClient";
import type { QuizMode } from "@/lib/quiz";

type ResultPageProps = {
  searchParams: Promise<{
    score?: string;
    total?: string;
    mode?: string;
  }>;
};

export default async function ResultPage({ searchParams }: ResultPageProps) {
  const params = await searchParams;

  const score = Number(params.score ?? 0);
  const total = Number(params.total ?? 10);
  const rawMode = params.mode ?? "mixed";

  const mode: QuizMode =
    rawMode === "hiragana" || rawMode === "katakana" || rawMode === "mixed"
      ? rawMode
      : "mixed";

  return <ResultClient score={score} total={total} mode={mode} />;
}