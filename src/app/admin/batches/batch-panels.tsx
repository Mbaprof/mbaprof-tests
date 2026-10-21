"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { formatDay } from "@/lib/lectures";

import {
  deleteBatch,
  deleteLecture,
  deleteOverride,
  saveLecture,
  saveOverride,
} from "./actions";

const inputClass =
  "mt-1 w-full rounded-md border border-black/10 bg-white px-3 py-2 text-sm focus:border-brand-navy focus:outline-none focus:ring-1 focus:ring-brand-navy";

const primaryButton =
  "cursor-pointer rounded-md bg-brand-navy px-4 py-2 text-sm font-semibold text-white hover:bg-brand-navy-light disabled:opacity-50";

// ---- Cancel or change one day --------------------------------------------------------

export type OverrideItem = {
  id: string;
  date: string; // YYYY-MM-DD
  kind: string;
  startTime: string | null;
  durationMinutes: number | null;
  note: string | null;
};

export function OverridesPanel({
  batchId,
  overrides,
  today,
}: {
  batchId: string;
  overrides: OverrideItem[];
  today: string;
}) {
  const router = useRouter();
  const [classDate, setClassDate] = useState(today);
  const [kind, setKind] = useState<"CANCELLED" | "CUSTOM">("CANCELLED");
  const [startTime, setStartTime] = useState("19:00");
  const [duration, setDuration] = useState(120);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function save() {
    setError(null);
    startTransition(async () => {
      const result = await saveOverride(batchId, {
        classDate,
        kind,
        startTime: kind === "CUSTOM" ? startTime : "",
        durationMinutes: kind === "CUSTOM" ? duration : undefined,
        note,
      });
      if (result?.error) setError(result.error);
      else {
        setNote("");
        router.refresh();
      }
    });
  }

  function remove(id: string) {
    startTransition(async () => {
      await deleteOverride(id);
      router.refresh();
    });
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-4">
        <div>
          <label className="block text-xs font-medium text-brand-ink/70">Date</label>
          <input
            type="date"
            value={classDate}
            onChange={(e) => setClassDate(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-brand-ink/70">What happens</label>
          <select
            value={kind}
            onChange={(e) => setKind(e.target.value as "CANCELLED" | "CUSTOM")}
            className={inputClass}
          >
            <option value="CANCELLED">Class is cancelled</option>
            <option value="CUSTOM">Different time / extra class</option>
          </select>
        </div>
        {kind === "CUSTOM" && (
          <>
            <div>
              <label className="block text-xs font-medium text-brand-ink/70">
                Start (IST)
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-brand-ink/70">
                Length (min)
              </label>
              <input
                type="number"
                min={15}
                max={480}
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className={inputClass}
              />
            </div>
          </>
        )}
      </div>
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-[14rem] flex-1">
          <label className="block text-xs font-medium text-brand-ink/70">
            Note shown to students (optional)
          </label>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Holiday - class resumes on Monday"
            className={inputClass}
          />
        </div>
        <button type="button" disabled={isPending} onClick={save} className={primaryButton}>
          {isPending ? "Saving..." : "Save change"}
        </button>
      </div>
      {error && <p className="text-sm text-red-700">{error}</p>}

      {overrides.length === 0 ? (
        <p className="text-sm text-brand-ink/60">No upcoming changes.</p>
      ) : (
        <ul className="divide-y divide-black/5 rounded-lg border border-black/5">
          {overrides.map((o) => (
            <li key={o.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm">
              <div>
                <span className="font-medium text-brand-ink">{formatDay(o.date)}</span>
                {" - "}
                {o.kind === "CANCELLED" ? (
                  <span className="font-semibold text-red-700">Cancelled</span>
                ) : (
                  <span className="font-semibold text-amber-700">
                    Changed to {o.startTime}
                    {o.durationMinutes ? ` (${o.durationMinutes} min)` : ""}
                  </span>
                )}
                {o.note && <span className="text-brand-ink/60"> - {o.note}</span>}
              </div>
              <button
                type="button"
                disabled={isPending}
                onClick={() => remove(o.id)}
                className="cursor-pointer text-red-700 hover:underline disabled:opacity-50"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ---- Recordings ----------------------------------------------------------------------

export type LectureItem = {
  id: string;
  date: string;
  topic: string | null;
  recordingUrl: string | null;
  recordingPasscode: string | null;
  published: boolean;
};

export function RecordingsPanel({
  batchId,
  lectures,
  today,
}: {
  batchId: string;
  lectures: LectureItem[];
  today: string;
}) {
  const router = useRouter();
  const [classDate, setClassDate] = useState(today);
  const [topic, setTopic] = useState("");
  const [recordingUrl, setRecordingUrl] = useState("");
  const [recordingPasscode, setRecordingPasscode] = useState("");
  const [published, setPublished] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function edit(item: LectureItem) {
    setClassDate(item.date);
    setTopic(item.topic ?? "");
    setRecordingUrl(item.recordingUrl ?? "");
    setRecordingPasscode(item.recordingPasscode ?? "");
    setPublished(item.published);
    setError(null);
    window.scrollTo({ top: document.getElementById("recording-form")?.offsetTop ?? 0, behavior: "smooth" });
  }

  function save() {
    setError(null);
    startTransition(async () => {
      const result = await saveLecture(batchId, {
        classDate,
        topic,
        recordingUrl,
        recordingPasscode,
        published,
      });
      if (result?.error) setError(result.error);
      else {
        setTopic("");
        setRecordingUrl("");
        setRecordingPasscode("");
        setPublished(true);
        router.refresh();
      }
    });
  }

  function remove(id: string) {
    startTransition(async () => {
      await deleteLecture(id);
      router.refresh();
    });
  }

  function togglePublished(item: LectureItem) {
    startTransition(async () => {
      await saveLecture(batchId, {
        classDate: item.date,
        topic: item.topic ?? "",
        recordingUrl: item.recordingUrl ?? "",
        recordingPasscode: item.recordingPasscode ?? "",
        published: !item.published,
      });
      router.refresh();
    });
  }

  return (
    <div className="space-y-5">
      <div id="recording-form" className="grid gap-4 sm:grid-cols-4">
        <div>
          <label className="block text-xs font-medium text-brand-ink/70">Class date</label>
          <input
            type="date"
            value={classDate}
            onChange={(e) => setClassDate(e.target.value)}
            className={inputClass}
          />
        </div>
        <div className="sm:col-span-3">
          <label className="block text-xs font-medium text-brand-ink/70">
            Topic (optional)
          </label>
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. Quant - Percentages and Profit & Loss"
            className={inputClass}
          />
        </div>
        <div className="sm:col-span-3">
          <label className="block text-xs font-medium text-brand-ink/70">
            Recording link (paste from Zoom)
          </label>
          <input
            value={recordingUrl}
            onChange={(e) => setRecordingUrl(e.target.value)}
            placeholder="https://us02web.zoom.us/rec/share/..."
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-brand-ink/70">
            Recording passcode
          </label>
          <input
            value={recordingPasscode}
            onChange={(e) => setRecordingPasscode(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="flex items-center gap-2 text-sm text-brand-ink">
          <input
            type="checkbox"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
            className="h-4 w-4 accent-brand-navy"
          />
          Visible to students
        </label>
        <button type="button" disabled={isPending} onClick={save} className={primaryButton}>
          {isPending ? "Saving..." : "Save recording"}
        </button>
      </div>
      <p className="text-xs text-brand-ink/50">
        Saving a date that already has a recording updates it.
      </p>
      {error && <p className="text-sm text-red-700">{error}</p>}

      {lectures.length === 0 ? (
        <p className="text-sm text-brand-ink/60">No recordings added yet.</p>
      ) : (
        <ul className="divide-y divide-black/5 rounded-lg border border-black/5">
          {lectures.map((item) => (
            <li key={item.id} className="space-y-2 px-4 py-3 text-sm">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-medium text-brand-ink">
                    {formatDay(item.date)}
                    {item.topic ? ` - ${item.topic}` : ""}
                  </p>
                  <p className="break-all text-xs text-brand-ink/60">
                    {item.recordingUrl ?? "No recording link yet"}
                    {item.recordingPasscode ? ` · passcode ${item.recordingPasscode}` : ""}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    item.published
                      ? "bg-green-100 text-green-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {item.published ? "Visible" : "Hidden"}
                </span>
              </div>
              <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm">
                <button type="button" onClick={() => edit(item)} className="cursor-pointer text-brand-navy hover:underline">
                  Edit
                </button>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => togglePublished(item)}
                  className="cursor-pointer text-brand-navy hover:underline disabled:opacity-50"
                >
                  {item.published ? "Hide" : "Show"}
                </button>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => remove(item.id)}
                  className="cursor-pointer text-red-700 hover:underline disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ---- Delete batch --------------------------------------------------------------------

export function DeleteBatchButton({ batchId, studentCount }: { batchId: string; studentCount: number }) {
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="cursor-pointer text-sm font-medium text-red-700 hover:underline"
      >
        Delete this batch
      </button>
    );
  }
  return (
    <div className="space-y-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm">
      <p className="text-red-800">
        Delete this batch with its recordings, schedule changes and attendance?
        {studentCount > 0
          ? ` ${studentCount} student${studentCount === 1 ? "" : "s"} will be left without a batch.`
          : ""}
      </p>
      <div className="flex gap-4">
        <button
          type="button"
          disabled={isPending}
          onClick={() => startTransition(async () => { await deleteBatch(batchId); })}
          className="cursor-pointer font-semibold text-red-700 hover:underline disabled:opacity-50"
        >
          Yes, delete
        </button>
        <button type="button" onClick={() => setConfirming(false)} className="cursor-pointer text-brand-ink/70 hover:underline">
          Cancel
        </button>
      </div>
    </div>
  );
}
