"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { setEnrollBatch } from "./actions";

// A dropdown that saves as soon as it changes.
export function EnrollBatchSelect({
  batches,
  current,
}: {
  batches: { id: string; name: string }[];
  current: string;
}) {
  const router = useRouter();
  const [value, setValue] = useState(current);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div>
      <select
        id="enroll-batch"
        value={value}
        disabled={isPending}
        onChange={(e) => {
          const next = e.target.value;
          const previous = value;
          setValue(next);
          setMessage(null);
          startTransition(async () => {
            const result = await setEnrollBatch(next);
            if (result?.error) {
              setValue(previous);
              setMessage({ ok: false, text: result.error });
            } else {
              setMessage({ ok: true, text: "Saved" });
              router.refresh();
            }
          });
        }}
        className="w-full rounded-md border border-black/10 bg-white px-3 py-2 text-sm text-brand-ink focus:outline-none focus:ring-2 focus:ring-brand-navy/30 disabled:opacity-60 sm:w-80"
      >
        <option value="">No batch: place students by hand</option>
        {batches.map((b) => (
          <option key={b.id} value={b.id}>
            {b.name}
          </option>
        ))}
      </select>
      {message && (
        <p className={`mt-1 text-xs ${message.ok ? "text-green-700" : "text-red-700"}`}>{message.text}</p>
      )}
    </div>
  );
}
