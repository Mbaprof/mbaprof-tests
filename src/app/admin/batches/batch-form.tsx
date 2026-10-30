"use client";

import { useState, useTransition } from "react";

import { WEEKDAYS, type BatchInput } from "@/lib/lectures";
import { MBA_ENTRANCE_EXAMS } from "@/lib/validation";

import { createBatch, updateBatch } from "./actions";

const inputClass =
  "mt-1 w-full rounded-md border border-black/10 bg-white px-3 py-2 text-sm focus:border-brand-navy focus:outline-none focus:ring-1 focus:ring-brand-navy";

export function BatchForm({
  batchId,
  initial,
}: {
  batchId?: string;
  initial?: BatchInput;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [targetExam, setTargetExam] = useState<string>(
    initial?.targetExam ?? MBA_ENTRANCE_EXAMS[0]
  );
  const [zoomJoinUrl, setZoomJoinUrl] = useState(initial?.zoomJoinUrl ?? "");
  const [zoomPasscode, setZoomPasscode] = useState(initial?.zoomPasscode ?? "");
  const [days, setDays] = useState<number[]>(initial?.days ?? [1, 2, 3, 4, 5, 6]);
  const [startTime, setStartTime] = useState(initial?.startTime ?? "19:00");
  const [durationMinutes, setDurationMinutes] = useState(initial?.durationMinutes ?? 120);
  const [active, setActive] = useState(initial?.active ?? true);
  const [personalLinks, setPersonalLinks] = useState(initial?.personalLinks ?? false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  function toggleDay(day: number) {
    setDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  }

  function handleSave() {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const payload = {
        name,
        targetExam: targetExam as BatchInput["targetExam"],
        zoomJoinUrl,
        zoomPasscode,
        days,
        startTime,
        durationMinutes,
        active,
        personalLinks,
      };
      const result = batchId
        ? await updateBatch(batchId, payload)
        : await createBatch(payload);
      if (result?.error) setError(result.error);
      else if (result?.ok) setSaved(true);
    });
  }

  return (
    <div className="space-y-5 rounded-2xl border border-black/5 bg-white shadow-[0_2px_10px_rgba(11,29,46,0.05)] p-5 sm:p-6">
      {error && (
        <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}
      {saved && (
        <p className="rounded-md bg-green-50 px-4 py-3 text-sm text-green-700">
          Saved.
        </p>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-brand-ink">Batch name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. MBA CET - Batch 1"
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-brand-ink">Entrance exam</label>
          <select
            value={targetExam}
            onChange={(e) => setTargetExam(e.target.value)}
            className={inputClass}
          >
            {MBA_ENTRANCE_EXAMS.map((exam) => (
              <option key={exam} value={exam}>
                {exam}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <p className="block text-sm font-medium text-brand-ink">Class days</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {WEEKDAYS.map((d) => {
            const on = days.includes(d.value);
            return (
              <button
                key={d.value}
                type="button"
                aria-pressed={on}
                onClick={() => toggleDay(d.value)}
                className={`min-h-9 cursor-pointer rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
                  on
                    ? "bg-brand-navy text-white"
                    : "border border-black/10 bg-white text-brand-ink/70 hover:bg-brand-navy/10"
                }`}
              >
                {d.short}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-brand-ink">
            Start time (IST)
          </label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-brand-ink">
            Class length (minutes)
          </label>
          <input
            type="number"
            min={15}
            max={480}
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(Number(e.target.value))}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-brand-ink">
          Zoom meeting link
        </label>
        <input
          value={zoomJoinUrl}
          onChange={(e) => setZoomJoinUrl(e.target.value)}
          placeholder="https://us02web.zoom.us/j/1234567890?pwd=..."
          className={inputClass}
        />
        <p className="mt-1 text-xs text-brand-ink/50">
          Use your recurring Zoom meeting, so the same link works every day.
          Students only see it once class is about to start, and recordings are
          matched to this batch by the meeting number inside this link, so each
          batch needs its own meeting.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-brand-ink">
            Zoom passcode (optional)
          </label>
          <input
            value={zoomPasscode}
            onChange={(e) => setZoomPasscode(e.target.value)}
            placeholder="Only if the link does not include it"
            className={inputClass}
          />
        </div>
        <label className="flex items-center gap-2 self-end pb-2 text-sm text-brand-ink">
          <input
            type="checkbox"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
            className="h-4 w-4 accent-brand-navy"
          />
          Batch is active
        </label>
      </div>

      <label className="flex items-start gap-3 rounded-lg border border-black/10 bg-brand-cream/50 p-4 text-sm text-brand-ink">
        <input
          type="checkbox"
          checked={personalLinks}
          onChange={(e) => setPersonalLinks(e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 accent-brand-navy"
        />
        <span>
          <span className="font-semibold text-brand-navy">
            Give each student a personal Zoom link (recommended)
          </span>
          <span className="mt-1 block text-brand-ink/70">
            Each student joins with a link made just for them, so a shared link
            can&apos;t let outsiders in and Zoom shows exactly who joined. Needs
            the Zoom connection and Registration turned on for this meeting.
            See the &quot;Personal Zoom links&quot; section below after saving.
          </span>
        </span>
      </label>

      <div className="flex justify-end">
        <button
          type="button"
          disabled={isPending}
          onClick={handleSave}
          className="w-full cursor-pointer rounded-md bg-brand-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-navy-light disabled:opacity-50 sm:w-auto"
        >
          {isPending ? "Saving..." : batchId ? "Save changes" : "Create batch"}
        </button>
      </div>
    </div>
  );
}
