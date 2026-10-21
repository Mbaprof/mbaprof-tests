"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// Sits at the top of the student list form: tick students (or "select all on
// this page"), choose a batch, and assign them in one go.
export function BulkAssignBar({
  batches,
}: {
  batches: { id: string; name: string }[];
}) {
  const barRef = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState(0);
  const [batchId, setBatchId] = useState("");

  const boxes = useCallback(() => {
    const form = barRef.current?.closest("form");
    return form
      ? Array.from(form.querySelectorAll<HTMLInputElement>('input[name="ids"]'))
      : [];
  }, []);

  const recount = useCallback(() => {
    const ids = new Set(boxes().filter((b) => b.checked).map((b) => b.value));
    setSelected(ids.size);
  }, [boxes]);

  useEffect(() => {
    const form = barRef.current?.closest("form");
    if (!form) return;
    form.addEventListener("change", recount);
    return () => form.removeEventListener("change", recount);
  }, [recount]);

  function toggleAll(checked: boolean) {
    boxes().forEach((b) => {
      b.checked = checked;
    });
    recount();
  }

  return (
    <div
      ref={barRef}
      className="flex flex-wrap items-center gap-3 border-b border-black/5 bg-brand-cream/60 px-4 py-3 text-sm"
    >
      <label className="flex items-center gap-2 text-brand-ink/80">
        <input
          type="checkbox"
          onChange={(e) => toggleAll(e.target.checked)}
          className="h-4 w-4 accent-brand-navy"
        />
        Select all on this page
      </label>
      <span className="text-brand-ink/60">{selected} selected</span>
      <div className="ml-auto flex w-full flex-wrap items-center gap-2 sm:w-auto">
        <select
          name="batchId"
          value={batchId}
          onChange={(e) => setBatchId(e.target.value)}
          aria-label="Batch to assign"
          className="min-w-0 flex-1 rounded-md border border-black/10 bg-white px-3 py-2 text-sm focus:border-brand-navy focus:outline-none focus:ring-1 focus:ring-brand-navy sm:w-52 sm:flex-none"
        >
          <option value="">Choose a batch...</option>
          {batches.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
          <option value="none">Remove from batch</option>
        </select>
        <button
          type="submit"
          disabled={selected === 0 || !batchId}
          className="cursor-pointer rounded-md bg-brand-navy px-4 py-2 text-sm font-semibold text-white hover:bg-brand-navy-light disabled:cursor-not-allowed disabled:opacity-40"
        >
          Assign selected
        </button>
      </div>
    </div>
  );
}
