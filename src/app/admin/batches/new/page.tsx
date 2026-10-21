import type { Metadata } from "next";
import Link from "next/link";

import { BatchForm } from "../batch-form";

export const metadata: Metadata = { title: "New batch | MBAProf Tests" };

export default function NewBatchPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/admin/batches" className="text-sm text-brand-navy hover:underline">
        ← Back to batches
      </Link>
      <h1 className="mt-2 text-2xl font-bold text-brand-navy">New batch</h1>
      <p className="mt-1 text-sm text-brand-ink/60">
        Set the weekly class schedule and the Zoom link. You can add students
        from the Students page afterwards.
      </p>
      <div className="mt-6">
        <BatchForm />
      </div>
    </div>
  );
}
