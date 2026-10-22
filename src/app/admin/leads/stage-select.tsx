"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { LEAD_STAGES } from "@/lib/leads";

import { setLeadStage } from "./actions";

// A dropdown that saves as soon as it changes.
export function StageSelect({ leadId, stage }: { leadId: string; stage: string }) {
  const router = useRouter();
  const [value, setValue] = useState(stage);
  const [failed, setFailed] = useState(false);
  const [isPending, startTransition] = useTransition();

  const tone = LEAD_STAGES.find((s) => s.value === value)?.tone ?? "";

  return (
    <div>
      <select
        value={value}
        disabled={isPending}
        aria-label="Lead stage"
        onChange={(e) => {
          const next = e.target.value;
          const previous = value;
          setValue(next);
          setFailed(false);
          startTransition(async () => {
            const result = await setLeadStage(leadId, next);
            if (!result.ok) {
              setValue(previous);
              setFailed(true);
            } else {
              router.refresh();
            }
          });
        }}
        className={`cursor-pointer rounded-full border-0 py-1.5 pl-3 pr-7 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-navy/30 disabled:opacity-60 ${tone}`}
      >
        {LEAD_STAGES.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
      {failed && <p className="mt-1 text-xs text-red-700">Could not save. Try again.</p>}
    </div>
  );
}
