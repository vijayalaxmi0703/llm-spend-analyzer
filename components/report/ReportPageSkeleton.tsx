export function ReportPageSkeleton() {
  return (
    <main className="min-h-screen bg-primary-bg px-4 py-10 sm:px-8 sm:py-14" aria-busy="true" aria-label="Loading audit report">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="h-10 w-64 animate-pulse rounded-lg bg-accent-primary/10" />
        <div className="h-48 animate-pulse rounded-2xl bg-card-bg/80" />
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
            <div className="h-40 animate-pulse rounded-xl bg-card-bg/80" />
            <div className="h-56 animate-pulse rounded-xl bg-card-bg/80" />
            <div className="h-56 animate-pulse rounded-xl bg-card-bg/80" />
          </div>
          <div className="h-72 animate-pulse rounded-xl bg-card-bg/80" />
        </div>
      </div>
    </main>
  );
}
