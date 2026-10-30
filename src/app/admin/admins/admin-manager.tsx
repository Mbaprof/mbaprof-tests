"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import {
  findAccountForAdmin,
  promoteToAdmin,
  removeAdmin,
  type AccountPreview,
} from "./actions";

const field =
  "w-full rounded-md border border-black/15 bg-white px-3 py-2 text-base text-brand-ink placeholder:text-brand-ink/40 focus:border-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-navy/20 sm:text-sm";

const joinedFormat = new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeZone: "Asia/Kolkata" });

type Notice = { tone: "ok" | "error"; text: string } | null;

function NoticeLine({ notice }: { notice: Notice }) {
  if (!notice) return null;
  return (
    <p
      role={notice.tone === "error" ? "alert" : "status"}
      className={`mt-3 rounded-md px-3 py-2 text-sm font-medium ${
        notice.tone === "ok" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
      }`}
    >
      {notice.text}
    </p>
  );
}

// Add an admin in two steps: look the account up, show who it is, then confirm.
export function AddAdmin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [found, setFound] = useState<AccountPreview | null>(null);
  const [notice, setNotice] = useState<Notice>(null);
  const [isPending, startTransition] = useTransition();

  function lookUp(e: React.FormEvent) {
    e.preventDefault();
    setNotice(null);
    setFound(null);
    startTransition(async () => {
      const result = await findAccountForAdmin(email);
      if (result.ok) setFound(result.account);
      else setNotice({ tone: "error", text: result.message });
    });
  }

  function confirm() {
    if (!found) return;
    startTransition(async () => {
      const result = await promoteToAdmin(found.id);
      setNotice({ tone: result.ok ? "ok" : "error", text: result.message });
      if (result.ok) {
        setFound(null);
        setEmail("");
        router.refresh();
      }
    });
  }

  return (
    <div className="rounded-2xl border border-black/5 bg-white shadow-[0_2px_10px_rgba(11,29,46,0.05)] p-5">
      <h2 className="text-lg font-bold text-brand-navy">Add an admin</h2>
      <p className="mt-1 text-sm text-brand-ink/60">
        The person must already have registered an account. Enter the email they used.
      </p>

      <form onSubmit={lookUp} className="mt-4 flex flex-col gap-3 sm:flex-row">
        <div className="min-w-0 flex-1">
          <label htmlFor="admin-email" className="sr-only">
            Email address
          </label>
          <input
            id="admin-email"
            type="email"
            inputMode="email"
            autoComplete="off"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setFound(null);
            }}
            className={field}
            required
          />
        </div>
        <button
          type="submit"
          disabled={isPending || !email.trim()}
          className="min-h-11 cursor-pointer rounded-md bg-brand-navy px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-navy-light disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending && !found ? "Looking up..." : "Find account"}
        </button>
      </form>

      {found && (
        <div className="mt-4 rounded-lg border-2 border-brand-gold/50 bg-brand-gold-tint p-4">
          <p className="text-sm font-semibold text-brand-navy">Is this the right person?</p>
          <dl className="mt-2 space-y-1 text-sm text-brand-ink">
            <div className="flex gap-2">
              <dt className="w-16 shrink-0 text-brand-ink/60">Name</dt>
              <dd className="font-medium">{found.name}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="w-16 shrink-0 text-brand-ink/60">Email</dt>
              <dd className="min-w-0 break-all">{found.email}</dd>
            </div>
            {found.phone && (
              <div className="flex gap-2">
                <dt className="w-16 shrink-0 text-brand-ink/60">Phone</dt>
                <dd>{found.phone}</dd>
              </div>
            )}
            {found.college && (
              <div className="flex gap-2">
                <dt className="w-16 shrink-0 text-brand-ink/60">College</dt>
                <dd>{found.college}</dd>
              </div>
            )}
            <div className="flex gap-2">
              <dt className="w-16 shrink-0 text-brand-ink/60">Joined</dt>
              <dd>{joinedFormat.format(new Date(found.joined))}</dd>
            </div>
          </dl>
          <p className="mt-3 text-xs text-brand-ink/70">
            Admins can see every student&apos;s details, download student and lead lists, and edit or delete tests.
            Anyone can register with any email address, so only continue if you know this is the right person.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={confirm}
              disabled={isPending}
              className="min-h-11 cursor-pointer rounded-md bg-brand-navy px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-navy-light disabled:opacity-50"
            >
              {isPending ? "Saving..." : "Yes, make admin"}
            </button>
            <button
              type="button"
              onClick={() => setFound(null)}
              disabled={isPending}
              className="min-h-11 cursor-pointer rounded-md border border-black/15 bg-white px-5 py-2 text-sm font-semibold text-brand-navy transition-colors hover:bg-black/5"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <NoticeLine notice={notice} />
    </div>
  );
}

// "Remove" asks twice, so a stray tap cannot take access away.
export function RemoveAdminButton({ userId, name }: { userId: string; name: string }) {
  const router = useRouter();
  const [asking, setAsking] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);
  const [isPending, startTransition] = useTransition();

  function remove() {
    startTransition(async () => {
      const result = await removeAdmin(userId);
      if (result.ok) {
        router.refresh();
      } else {
        setNotice({ tone: "error", text: result.message });
        setAsking(false);
      }
    });
  }

  if (!asking) {
    return (
      <div>
        <button
          type="button"
          onClick={() => {
            setNotice(null);
            setAsking(true);
          }}
          className="min-h-11 cursor-pointer rounded-md px-3 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-50"
        >
          Remove admin access
        </button>
        <NoticeLine notice={notice} />
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-brand-ink/80">Remove {name}&apos;s admin access?</span>
      <button
        type="button"
        onClick={remove}
        disabled={isPending}
        className="min-h-11 cursor-pointer rounded-md bg-red-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-800 disabled:opacity-50"
      >
        {isPending ? "Removing..." : "Yes, remove"}
      </button>
      <button
        type="button"
        onClick={() => setAsking(false)}
        disabled={isPending}
        className="min-h-11 cursor-pointer rounded-md border border-black/15 bg-white px-4 py-2 text-sm font-semibold text-brand-navy transition-colors hover:bg-black/5"
      >
        Keep
      </button>
    </div>
  );
}
