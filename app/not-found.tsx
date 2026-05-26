import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-primary-bg px-6 py-24 text-center">
      <div className="max-w-xl rounded-lg border border-accent-primary/12 bg-card-bg/82 p-12 shadow-soft">
        <p className="text-xs uppercase tracking-widest text-accent-primary">404</p>
        <h1 className="mt-6 text-4xl font-bold text-text-primary">Report not found</h1>
        <p className="mt-4 text-base leading-7 text-text-muted">The audit link may have expired or the ID is incorrect. Return to the audit flow and generate a new report.</p>
        <div className="mt-8">
          <Link href="/audit">
            <Button>Run a new audit</Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
