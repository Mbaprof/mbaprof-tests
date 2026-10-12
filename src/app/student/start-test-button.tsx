"use client";

import { useFormStatus } from "react-dom";

export function StartTestButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-brand-navy px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-navy-light disabled:cursor-wait disabled:opacity-70"
    >
      {pending ? (
        <span className="flex items-center gap-2">
          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          Loading test...
        </span>
      ) : (
        label
      )}
    </button>
  );
}
