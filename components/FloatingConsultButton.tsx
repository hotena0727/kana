"use client";

import { useEffect, useState } from "react";

const VISIT_COUNT_KEY = "hotena_app_visit_count";
const SESSION_MARK_KEY = "hotena_app_visit_counted_once";
const SHOW_AFTER = 3;

export default function FloatingConsultButton() {
    const [isReady, setIsReady] = useState(false);
    const [shouldShow, setShouldShow] = useState(false);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        try {
            const alreadyCounted = sessionStorage.getItem(SESSION_MARK_KEY) === "1";
            let nextCount = Number(localStorage.getItem(VISIT_COUNT_KEY) || "0");

            if (!alreadyCounted) {
                nextCount += 1;
                localStorage.setItem(VISIT_COUNT_KEY, String(nextCount));
                sessionStorage.setItem(SESSION_MARK_KEY, "1");
            }

            setShouldShow(nextCount >= SHOW_AFTER);
            setIsReady(true);
        } catch {
            setIsReady(true);
            setShouldShow(false);
        }
    }, []);

    useEffect(() => {
        if (!open) return;

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") setOpen(false);
        };

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [open]);

    if (!isReady || !shouldShow) return null;

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                aria-label="수강상담 안내 열기"
                className={[
                    "fixed right-4 z-[60] inline-flex items-center gap-2",
                    "rounded-full px-4 py-3 text-sm font-extrabold text-white",
                    "shadow-[0_14px_34px_rgba(0,98,65,0.28)] ring-1 transition",
                    "hover:-translate-y-0.5 active:translate-y-0 sm:right-6",
                ].join(" ")}
                style={{
                    bottom: "calc(env(safe-area-inset-bottom, 0px) + 88px)",
                    backgroundColor: "#006241",
                    borderColor: "rgba(0,98,65,0.18)",
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#004f34";
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#006241";
                }}
            >
                <span className="text-base leading-none">💬</span>
                <span>수강상담</span>
            </button>

            {open ? (
                <div className="fixed inset-0 z-[70]">
                    <button
                        type="button"
                        aria-label="닫기"
                        onClick={() => setOpen(false)}
                        className="absolute inset-0 bg-slate-900/45 backdrop-blur-[2px]"
                    />

                    <div className="absolute inset-x-0 bottom-0 mx-auto w-full max-w-md px-4 pb-4">
                        <div className="rounded-[32px] bg-white p-6 shadow-[0_24px_70px_rgba(15,23,42,0.22)] ring-1 ring-slate-200">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <div
                                        className="text-sm font-semibold"
                                        style={{ color: "#006241" }}
                                    >
                                        하테나일본어 교육센터
                                    </div>
                                    <div className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900">
                                        다음 단계 학습이 궁금하신가요?
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setOpen(false)}
                                    className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-lg font-bold text-slate-500 transition hover:bg-slate-200 hover:text-slate-700"
                                    aria-label="안내 닫기"
                                >
                                    ×
                                </button>
                            </div>

                            <p className="mt-3 text-sm leading-6 text-slate-600">
                                20년 넘게 일본어를 가르쳐 온 경험을 바탕으로, 입문자도
                                부담 없이 다음 단계로 이어갈 수 있는 학습 과정을
                                안내해드려요.
                            </p>

                            <div className="mt-5 grid gap-3">
                                <a
                                    href="https://hotena.com/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex w-full items-center justify-center rounded-2xl bg-white px-4 py-3.5 text-base font-bold transition"
                                    style={{
                                        color: "#006241",
                                        border: "1px solid #cfe3d8",
                                    }}
                                >
                                    교육센터 보기
                                </a>

                                <a
                                    href="http://talk.naver.com/W45141"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex w-full items-center justify-center rounded-2xl px-4 py-3.5 text-base font-bold transition"
                                    style={{
                                        backgroundColor: "#006241",
                                        color: "#ffffff",
                                        WebkitTextFillColor: "#ffffff",
                                    }}
                                >
                                    네이버톡으로 수강상담
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            ) : null}
        </>
    );
}