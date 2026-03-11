"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "홈", icon: "🏠" },
  { href: "/letters", label: "문자", icon: "あ" },
  { href: "/quiz", label: "퀴즈", icon: "✍️" },
  { href: "/rules", label: "규칙", icon: "っ" },
  { href: "/review", label: "복습", icon: "🔁" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto grid w-full max-w-md grid-cols-5 px-2 py-1">
        {navItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : item.href === "/letters"
                ? pathname === "/letters" ||
                  pathname === "/hiragana" ||
                  pathname === "/katakana"
                : pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={[
                "flex flex-col items-center justify-center rounded-2xl py-2 text-[11px] font-semibold transition",
                isActive
                  ? "bg-sky-50 text-sky-600"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-700",
              ].join(" ")}
            >
              <span className="text-base leading-none">{item.icon}</span>
              <span className="mt-1">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}