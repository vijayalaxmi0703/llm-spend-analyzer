import Link from 'next/link';

export default function AuditNotFound() {
  return (
    <main className="min-h-screen bg-primary-bg px-4 py-14 sm:px-10">
      <div className="mx-auto max-w-3xl rounded-xl border border-accent-primary/12 bg-card-bg/82 p-10 text-center shadow-soft">
        <p className="text-sm font-semibold uppercase tracking-widest text-accent-primary">Report not found</p>
        <h1 className="mt-4 text-3xl font-bold text-text-primary">This audit could not be loaded</h1>
        <p className="mt-4 text-sm leading-7 text-text-muted">
          This audit may have expired or been removed. If you created it offline, open it in the same browser where
          it was generated.
        </p>
        <Link
          href="/audit"
          className="mt-8 inline-flex items-center justify-center rounded-lg bg-gradient-to-br from-accent-primary to-accent-secondary px-6 py-3 text-sm font-semibold text-primary-bg shadow-glow"
        >
          Create new audit
        </Link>
      </div>
    </main>
  );
}
