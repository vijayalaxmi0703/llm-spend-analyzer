'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { ToolAuditBreakdown } from '@/types/audit';

interface ToolBreakdownCardProps {
  breakdown: ToolAuditBreakdown;
}

export function ToolBreakdownCard({ breakdown }: ToolBreakdownCardProps) {
  const confidencePct = Math.round(breakdown.confidence * 100);

  return (
    <Card className="group space-y-5 p-6 transition duration-300 hover:border-accent-primary/25 hover:shadow-glow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-lg font-semibold text-text-primary">
            {breakdown.toolName} <span className="text-text-muted font-normal">· {breakdown.plan}</span>
          </p>
          <p className="mt-1 text-xs uppercase tracking-widest text-text-muted">{breakdown.useCase} workflow</p>
        </div>
        <Badge variant={breakdown.monthlySavings > 100 ? 'success' : 'default'}>
          ${breakdown.monthlySavings.toFixed(0)}/mo savings
        </Badge>
      </div>

      <div className="grid gap-3 rounded-lg border border-accent-primary/8 bg-elevated/30 p-4 text-sm sm:grid-cols-3">
        <div>
          <p className="text-xs text-text-muted">Current spend</p>
          <p className="mt-1 font-semibold text-text-primary">${breakdown.currentSpend.toFixed(0)}/mo</p>
        </div>
        <div>
          <p className="text-xs text-text-muted">Seats</p>
          <p className="mt-1 font-semibold text-text-primary">{breakdown.seats}</p>
        </div>
        <div>
          <p className="text-xs text-text-muted">Confidence</p>
          <p className="mt-1 font-semibold text-accent-primary">{confidencePct}%</p>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs uppercase tracking-widest text-accent-primary">Recommended action</p>
        <p className="text-sm font-medium leading-relaxed text-text-primary">{breakdown.recommendedAction}</p>
        <p className="text-sm leading-relaxed text-text-muted">{breakdown.reason}</p>
      </div>

      <div className="flex items-center justify-between border-t border-accent-primary/8 pt-4 text-xs text-text-muted">
        <span>Potential annual benefit</span>
        <span className="font-semibold text-success">${breakdown.annualSavings.toLocaleString()}</span>
      </div>
    </Card>
  );
}
