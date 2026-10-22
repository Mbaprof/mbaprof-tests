"use client";

import { useEffect, useState } from "react";

// Phone-only bar pinned to the bottom so the "Claim seat" button is always one
// tap away; it slides out of the way while the registration form is on screen.
export function StickyCta() {
  const [formVisible, setFormVisible] = useState(false);

  useEffect(() => {
    const form = document.getElementById("register");
    if (!form || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => setFormVisible(entry.isIntersecting), {
      threshold: 0.15,
    });
    observer.observe(form);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      aria-hidden={formVisible}
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-brand-gold/40 bg-brand-navy px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-8px_24px_rgba(0,0,0,0.25)] transition-transform duration-300 lg:hidden ${
        formVisible ? "translate-y-full" : "translate-y-0"
      }`}
    >
      <div className="mx-auto flex max-w-[560px] items-center gap-3">
        <div className="min-w-0 flex-1 leading-tight">
          <p className="truncate text-[13px] font-bold text-white">CET Basic FREE</p>
          <p className="truncate text-xs text-[#aebccb]">CET Plus ₹2,999 · first 200 only</p>
        </div>
        <a
          href="#register"
          tabIndex={formVisible ? -1 : 0}
          className="inline-flex min-h-11 flex-none items-center rounded-[10px] bg-brand-gold px-5 text-sm font-extrabold text-brand-navy no-underline hover:bg-brand-gold-light"
        >
          Claim seat
        </a>
      </div>
    </div>
  );
}
