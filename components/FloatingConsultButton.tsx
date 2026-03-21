"use client";

export default function FloatingConsultButton() {
  return (
    <a
      href="http://talk.naver.com/W45141"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="수강상담"
      className={[
        "fixed right-4 z-[60] inline-flex items-center gap-2",
        "rounded-full bg-sky-500 px-4 py-3 text-sm font-extrabold text-white",
        "shadow-[0_14px_34px_rgba(14,165,233,0.34)] ring-1 ring-sky-400/40",
        "transition hover:-translate-y-0.5 hover:bg-sky-600 active:translate-y-0",
        "sm:right-6",
      ].join(" ")}
      style={{
        bottom: "calc(env(safe-area-inset-bottom, 0px) + 88px)",
      }}
    >
      <span className="text-base leading-none">💬</span>
      <span>수강상담</span>
    </a>
  );
}