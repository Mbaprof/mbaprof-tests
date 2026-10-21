"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

function formatRemaining(ms: number) {
  const totalMinutes = Math.max(0, Math.ceil(ms / 60_000));
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${String(minutes).padStart(2, "0")}m`;
  return `${minutes} min`;
}

// Counts down to a moment, then reloads the page so the Join button appears
// (or the class state changes) without the student refreshing.
export function Countdown({ targetIso, label }: { targetIso: string; label: string }) {
  const router = useRouter();
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    const target = new Date(targetIso).getTime();
    let refreshed = false;
    const tick = () => {
      const left = target - Date.now();
      setRemaining(left);
      if (left <= 0 && !refreshed) {
        refreshed = true;
        router.refresh();
      }
    };
    tick();
    const id = setInterval(tick, 15_000);
    return () => clearInterval(id);
  }, [targetIso, router]);

  if (remaining === null || remaining <= 0) return null;
  return (
    <span>
      {label} <strong className="font-semibold">{formatRemaining(remaining)}</strong>
    </span>
  );
}

export function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {
          // Clipboard blocked: the text is still visible next to the button.
        }
      }}
      className="cursor-pointer rounded-md border border-black/10 px-2.5 py-1 text-xs font-semibold text-brand-navy hover:bg-brand-cream"
    >
      {copied ? "Copied" : label}
    </button>
  );
}
