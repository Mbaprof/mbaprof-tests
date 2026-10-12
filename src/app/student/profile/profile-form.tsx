"use client";

import { useActionState } from "react";

import { updateProfile } from "../profile-actions";
import { MBA_ENTRANCE_EXAMS } from "@/lib/validation";

const inputClass =
  "mt-1 w-full rounded-md border border-black/10 px-3 py-2 text-sm focus:border-brand-navy focus:outline-none focus:ring-1 focus:ring-brand-navy";

type Initial = {
  name: string;
  email: string;
  phone: string;
  college: string;
  course: string;
  targetExam: string;
};

export function ProfileForm({ initial }: { initial: Initial }) {
  const [state, formAction, pending] = useActionState(updateProfile, undefined);

  return (
    <form action={formAction} className="space-y-4">
      {state?.error && (
        <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{state.error}</p>
      )}
      {state?.success && (
        <p className="rounded-md bg-brand-gold/15 px-4 py-3 text-sm text-brand-navy">
          Profile updated.
        </p>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-brand-ink">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={initial.email}
          disabled
          className={`${inputClass} bg-black/5 text-brand-ink/50`}
        />
        <p className="mt-1 text-xs text-brand-ink/50">Email can&apos;t be changed.</p>
      </div>

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-brand-ink">
          Full name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          minLength={2}
          defaultValue={initial.name}
          autoComplete="name"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-brand-ink">
          Contact number
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          required
          defaultValue={initial.phone}
          autoComplete="tel"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="college" className="block text-sm font-medium text-brand-ink">
          College
        </label>
        <input
          id="college"
          name="college"
          type="text"
          required
          defaultValue={initial.college}
          autoComplete="organization"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="course" className="block text-sm font-medium text-brand-ink">
          Course
        </label>
        <input
          id="course"
          name="course"
          type="text"
          required
          defaultValue={initial.course}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="targetExam" className="block text-sm font-medium text-brand-ink">
          MBA entrance exam
        </label>
        <select
          id="targetExam"
          name="targetExam"
          required
          defaultValue={initial.targetExam}
          className={inputClass}
        >
          <option value="" disabled>
            Select an exam
          </option>
          {MBA_ENTRANCE_EXAMS.map((exam) => (
            <option key={exam} value={exam}>
              {exam}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-brand-ink/50">
          This controls which tests show up on your dashboard.
        </p>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-brand-navy px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-navy-light disabled:opacity-60"
      >
        {pending ? "Saving..." : "Save changes"}
      </button>
    </form>
  );
}
