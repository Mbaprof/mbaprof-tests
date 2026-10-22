"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { deleteTest, setTestPublished } from "./actions";

export function PublishToggle({
  testId,
  published,
}: {
  testId: string;
  published: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          await setTestPublished(testId, !published);
          router.refresh();
        })
      }
      className="cursor-pointer text-brand-navy hover:text-brand-gold-dark hover:underline disabled:opacity-50"
    >
      {published ? "Unpublish" : "Publish"}
    </button>
  );
}

export function DeleteTestButton({ testId }: { testId: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (confirming) {
    return (
      <span className="flex items-center gap-2">
        <span className="text-red-700">Delete with all student results?</span>
        <button
          type="button"
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              await deleteTest(testId);
              router.refresh();
            })
          }
          className="cursor-pointer font-semibold text-red-700 hover:underline disabled:opacity-50"
        >
          Yes
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="cursor-pointer text-brand-ink/60 hover:underline"
        >
          No
        </button>
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      className="cursor-pointer text-red-700 hover:underline"
    >
      Delete
    </button>
  );
}
