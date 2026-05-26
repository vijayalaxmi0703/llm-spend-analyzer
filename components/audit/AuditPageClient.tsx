'use client';

import { useMemo } from 'react';
import { AuditForm } from '@/components/audit/AuditForm';
import { Card } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';

export function AuditPageClient() {
  const leadText = useMemo(
    () => 'Start with your current tool stack, and we’ll show you savings before asking for email details.',
    []
  );

  return (
    <main className="min-h-screen bg-primary-bg px-6 py-14 sm:px-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-10">
        <section className="space-y-4 text-center">
          <p className="text-xs uppercase tracking-widest text-accent-primary">Audit Your AI Spend</p>
          <h1 className="text-4xl font-bold text-text-primary sm:text-5xl">Submit your AI subscriptions and get an instant financial audit.</h1>
          <p className="mx-auto max-w-2xl text-base leading-8 text-text-muted">The audit logic is deterministic, vendor-aware, and designed for small teams that need credible savings recommendations.</p>
        </section>

        <div className="grid gap-10 lg:grid-cols-[1fr_0.58fr]">
          <AuditForm />
          <Card className="space-y-6 rounded-lg p-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-accent-primary/10 text-accent-primary">
              <Sparkles className="h-6 w-6" />
            </div>
            <div className="space-y-3">
              <h2 className="text-2xl font-bold text-text-primary">Why this audit works</h2>
              <p className="text-sm leading-7 text-text-muted">We combine current billing with rules-based heuristics for plan fit, team size, duplicate subscriptions, and API pricing. No AI is used for the decision rules.</p>
            </div>
            <div className="space-y-3 rounded-lg border border-accent-primary/10 bg-elevated/40 p-4 text-sm text-text-muted">
              <p className="flex items-start gap-2">
                <span className="text-accent-primary mt-0.5 flex-shrink-0">•</span>
                <span>Supports Copilot, Claude, ChatGPT, Anthropic, OpenAI, Gemini, Cursor, and Windsurf.</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-accent-primary mt-0.5 flex-shrink-0">•</span>
                <span>Live totals, autosave, inline validation, and one-click report generation.</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-accent-primary mt-0.5 flex-shrink-0">•</span>
                <span>Email gate only after value is shown.</span>
              </p>
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
}
