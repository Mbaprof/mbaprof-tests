export default function ExamLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-3 text-brand-navy">
        <span className="h-8 w-8 animate-spin rounded-full border-4 border-brand-navy/20 border-t-brand-navy" />
        <p className="text-sm font-medium text-brand-ink/60">
          Loading your test...
        </p>
      </div>
    </div>
  );
}
