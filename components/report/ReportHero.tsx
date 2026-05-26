'use client';

import { Badge } from '@/components/ui/badge';
import { useCountUp } from '@/hooks/useCountUp';
import type { BenchmarkInsight } from '@/types/audit';
import { TrendingDown, TrendingUp, ShieldCheck } from 'lucide-react';

interface ReportHeroProps {
  annualSavings: number;
  totalMonthly: number;
  totalSavings: number;
  efficiencyScore: number;
  benchmarks: BenchmarkInsight;
}

export function ReportHero({
  annualSavings,
  totalMonthly,
  totalSavings,
  efficiencyScore,
  benchmarks
}: ReportHeroProps) {
  const animatedAnnual = useCountUp(annualSavings, 1100);
  const animatedMonthly = useCountUp(totalMonthly, 900);

  const benchmarkMessage =
    benchmarks.percentAboveBenchmark > 0
      ? `You spend ${benchmarks.percentAboveBenchmark}% more than teams your size`
      : `You spend ${Math.abs(benchmarks.percentAboveBenchmark)}% less than teams your size`;

  const TrendIcon = benchmarks.percentAboveBenchmark > 10 ? TrendingUp : TrendingDown;

  return (
    <section className="relative overflow-hidden rounded-2xl border border-accent-primary/20 bg-gradient-to-br from-card-bg via-elevated/80 to-primary-bg p-8 shadow-glow-lg sm:p-10">
      <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-accent-primary/10 opacity-60 md:blur-2xl" />
      <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-accent-primary/5 opacity-50 md:blur-2xl" />

      <div className="relative grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-5">
          <Badge variant={totalSavings > 500 ? 'success' : totalSavings > 150 ? 'warning' : 'default'}>
            {benchmarks.statusLabel}
          </Badge>
          <div>
            <p className="text-xs uppercase tracking-widest text-accent-primary">Annual savings opportunity</p>
            <p className="mt-3 text-5xl font-bold text-text-primary sm:text-6xl">
              You could save{' '}
              <span className="bg-accent-gradient bg-clip-text text-transparent">
                ${animatedAnnual.toLocaleString()}
              </span>
              <span className="text-text-muted text-2xl font-semibold">/year</span>
            </p>
          </div>
          <p className="max-w-xl text-sm leading-7 text-text-muted">
            Based on deterministic plan-fit, seat utilization, and overlap analysis across your current AI stack.
            Pricing verified against official vendor sources.
          </p>
          <div className="flex flex-wrap items-center gap-3 text-xs text-text-muted">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-accent-primary/15 bg-elevated/60 px-3 py-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-accent-primary" />
              Verified pricing · Updated this week
            </span>
            <span className="rounded-full border border-accent-primary/15 bg-elevated/60 px-3 py-1.5">
              Audit confidence: {efficiencyScore}%
            </span>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          <div className="rounded-xl border border-accent-primary/12 bg-primary-bg/50 p-5">
            <p className="text-xs uppercase tracking-widest text-text-muted">Current monthly spend</p>
            <p className="mt-2 text-3xl font-bold text-accent-primary">${animatedMonthly.toLocaleString()}</p>
          </div>
          <div className="rounded-xl border border-success/20 bg-success/5 p-5">
            <p className="text-xs uppercase tracking-widest text-text-muted">Monthly savings</p>
            <p className="mt-2 text-3xl font-bold text-success">${totalSavings.toLocaleString()}</p>
          </div>
          <div className="rounded-xl border border-accent-primary/12 bg-primary-bg/50 p-5 sm:col-span-2 lg:col-span-1">
            <div className="flex items-start gap-3">
              <TrendIcon className="mt-1 h-5 w-5 shrink-0 text-accent-primary" />
              <div>
                <p className="text-sm font-medium text-text-primary">{benchmarkMessage}</p>
                <p className="mt-1 text-xs text-text-muted">
                  ${benchmarks.spendPerDeveloper.toFixed(0)}/developer vs $
                  {benchmarks.benchmarkSpendPerDeveloper}/benchmark · Top {benchmarks.percentile}% efficiency band
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
