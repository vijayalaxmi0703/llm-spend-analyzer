'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ClipboardCopy, ExternalLink, Mail, Shield, RefreshCw, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/toast';
import { ReportHero } from '@/components/report/ReportHero';
import { ToolBreakdownCard } from '@/components/report/ToolBreakdownCard';
import { getConversionCopy, getSavingsTier } from '@/lib/auditEngine';
import { calculateBenchmarks } from '@/lib/benchmarks';
import { buildTwitterShareUrl } from '@/lib/email';
import type { AuditRecommendation, BenchmarkInsight, ToolAuditBreakdown } from '@/types/audit';

const LeadCaptureModal = dynamic(
  () => import('@/components/report/LeadCaptureModal').then((m) => m.LeadCaptureModal),
  { ssr: false }
);

interface ReportRecord {
  id: string;
  company_name?: string | null;
  role?: string | null;
  team_size?: number | null;
  total_monthly: number;
  total_annual: number;
  total_savings: number;
  efficiency_score: number;
  recommendations: AuditRecommendation[];
  tool_breakdowns?: ToolAuditBreakdown[];
  benchmarks?: BenchmarkInsight;
  summary_text: string;
  report_data: Array<{
    id: string;
    toolKey: string;
    plan: string;
    monthlySpend: number;
    seats: number;
    useCase: string;
  }>;
}

interface ReportDetailProps {
  report: ReportRecord | null;
  fallbackReportId?: string;
  isPublicView?: boolean;
  shareUrl?: string;
}

const FALLBACK_PREFIX = 'credex-audit-fallback-';

export function ReportDetail({ report, fallbackReportId, isPublicView = false, shareUrl }: ReportDetailProps) {
  const { push } = useToast();
  const [localReport, setLocalReport] = useState<ReportRecord | null>(report);
  const [isLocalDraft, setIsLocalDraft] = useState(false);
  const [reportUrl, setReportUrl] = useState(shareUrl ?? '');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalIntent, setModalIntent] = useState<'alerts' | 'consultation' | 'share'>('alerts');
  const [savedEmail, setSavedEmail] = useState('');
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [ctaSubmitting, setCtaSubmitting] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setReportUrl(shareUrl ?? window.location.href);
    setSavedEmail(window.localStorage.getItem('credex-lead-email') ?? '');
  }, [fallbackReportId, report, shareUrl]);

  useEffect(() => {
    if (!report && fallbackReportId && typeof window !== 'undefined') {
      try {
        const saved = window.localStorage.getItem(`${FALLBACK_PREFIX}${fallbackReportId}`);
        if (saved) {
          setLocalReport(JSON.parse(saved) as ReportRecord);
          setIsLocalDraft(true);
        }
      } catch {
        // ignore
      }
    }
  }, [fallbackReportId, report]);

  const reportToShow = localReport;

  const benchmarks = useMemo(() => {
    if (!reportToShow) return null;
    return (
      reportToShow.benchmarks ??
      calculateBenchmarks(
        reportToShow.total_monthly,
        reportToShow.team_size ?? 3,
        reportToShow.efficiency_score
      )
    );
  }, [reportToShow]);

  const annualSavings = useMemo(() => {
    if (!reportToShow) return 0;
    return Number((reportToShow.total_savings * 12).toFixed(0));
  }, [reportToShow]);

  const conversion = useMemo(() => {
    if (!reportToShow) return null;
    return getConversionCopy(getSavingsTier(reportToShow.total_savings));
  }, [reportToShow]);

  const toolBreakdowns = reportToShow?.tool_breakdowns ?? [];
  const twitterShareUrl = reportToShow
    ? buildTwitterShareUrl(reportToShow.id, reportToShow.total_savings)
    : '#';

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(reportUrl);
      push({ variant: 'success', title: 'Copied!', description: 'Share link copied to clipboard.' });
    } catch {
      push({ variant: 'error', title: 'Copy failed', description: 'Copy the URL from your browser address bar.' });
    }
  }, [reportUrl, push]);

  const openModal = useCallback((intent: 'alerts' | 'consultation' | 'share') => {
    setModalIntent(intent);
    setModalOpen(true);
  }, []);

  const handleShareByEmail = useCallback(() => {
    if (savedEmail) {
      void sendShareEmail(savedEmail);
      return;
    }
    openModal('share');
  }, [savedEmail, openModal]);

  const sendShareEmail = useCallback(async (email: string) => {
    if (!reportToShow) return;
    try {
      const response = await fetch('/api/share-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          reportId: reportToShow.id,
          totalMonthly: reportToShow.total_monthly,
          totalSavings: reportToShow.total_savings,
          summaryText: reportToShow.summary_text,
          honeypot: ''
        })
      });
      const data = await response.json();
      if (response.ok) {
        window.localStorage.setItem('credex-lead-email', email);
        push({ variant: 'success', title: 'Report sent', description: `Audit summary emailed to ${email}` });
      } else {
        push({ variant: 'error', title: 'Email failed', description: data.error ?? 'Try again shortly.' });
      }
    } catch {
      push({ variant: 'error', title: 'Network error', description: 'Could not send report email.' });
    }
  }, [reportToShow, push]);

  const handleNativeShare = useCallback(async () => {
    if (!reportToShow || typeof navigator === 'undefined' || !navigator.share) {
      await copyLink();
      return;
    }
    try {
      await navigator.share({
        title: 'Credex AI Spend Audit',
        text: `Potential savings: $${reportToShow.total_savings.toFixed(0)}/mo`,
        url: reportUrl
      });
    } catch {
      // user cancelled
    }
  }, [reportToShow, reportUrl, copyLink]);

  const retrySummary = useCallback(async () => {
    if (!reportToShow) return;
    setSummaryLoading(true);
    try {
      const response = await fetch('/api/audit-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportId: reportToShow.id,
          teamSize: reportToShow.team_size ?? 3,
          tools: reportToShow.report_data
        })
      });
      const data = await response.json();
      if (response.ok && data.summaryText) {
        setLocalReport((prev) => (prev ? { ...prev, summary_text: data.summaryText } : prev));
        push({ variant: 'success', title: 'Summary refreshed' });
      }
    } catch {
      push({ variant: 'error', title: 'Could not refresh summary' });
    } finally {
      setSummaryLoading(false);
    }
  }, [reportToShow, push]);

  if (!reportToShow || !benchmarks || !conversion) {
    return (
      <main className="min-h-screen bg-primary-bg px-4 py-20 sm:px-10">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-2xl border border-accent-primary/12 bg-gradient-to-br from-card-bg/95 to-secondary-bg/95 p-10 text-center backdrop-blur-sm sm:p-14">
            <div className="mb-8 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent-primary/10 text-accent-primary">
                <ExternalLink className="h-8 w-8" />
              </div>
            </div>
            
            <p className="text-xs font-semibold uppercase tracking-widest text-accent-primary">Audit Not Available</p>
            <h1 className="mt-4 text-3xl font-bold text-text-primary sm:text-4xl">
              {fallbackReportId?.startsWith('local-') 
                ? 'Local audit not found' 
                : 'Audit could not be loaded'}
            </h1>
            
            <p className="mt-6 text-base leading-7 text-text-muted">
              {fallbackReportId?.startsWith('local-') 
                ? 'This local audit is only saved in your browser. Try creating a new audit, or ensure you\'re using the same browser where it was generated.'
                : 'This audit either doesn\'t exist, has expired, or you don\'t have permission to view it. Shareable audits require a Supabase connection.'}
            </p>
            
            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center sm:gap-4">
              <Link
                href="/audit"
                className="inline-flex items-center justify-center rounded-lg bg-gradient-to-br from-accent-primary to-accent-secondary px-6 py-3.5 text-sm font-semibold text-primary-bg transition hover:shadow-lg hover:shadow-accent-primary/20 active:scale-95"
              >
                Create new audit
              </Link>
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-lg border border-accent-primary/20 bg-card-bg/60 px-6 py-3.5 text-sm font-semibold text-text-primary transition hover:border-accent-primary/40 hover:bg-card-bg/80"
              >
                Back to home
              </Link>
            </div>
            
            {!fallbackReportId?.startsWith('local-') && (
              <div className="mt-10 rounded-lg border border-accent-primary/10 bg-elevated/30 p-5 text-left text-sm text-text-muted">
                <p className="font-medium text-text-primary">Need help?</p>
                <p className="mt-2">If you recently generated this audit, make sure:</p>
                <ul className="mt-3 space-y-2 text-xs">
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-accent-primary" />
                    You're using the same browser and network
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-accent-primary" />
                    Your browser hasn't cleared recent data
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-accent-primary" />
                    Supabase is properly configured with RLS policies
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-primary-bg px-4 py-10 sm:px-8 sm:py-14">
      <div className="mx-auto grid max-w-6xl gap-8 sm:gap-10">
        {isLocalDraft && !isPublicView ? (
          <div className="rounded-xl border border-accent-primary/20 bg-accent-primary/10 p-4 text-sm text-text-primary">
            <p className="font-semibold">Audit saved locally in this browser.</p>
            <p className="mt-1 text-text-muted">
              Configure Supabase for shareable incognito links. Copy the URL below to share this session.
            </p>
          </div>
        ) : null}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-accent-primary">Audit Report</p>
            <h1 className="mt-2 text-2xl font-bold text-text-primary sm:text-3xl">{conversion.headline}</h1>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <Button variant="secondary" size="sm" onClick={copyLink} className="w-full sm:w-auto" aria-label="Copy share URL">
              <ClipboardCopy className="mr-2 h-4 w-4" />
              Copy share URL
            </Button>
            <a
              href={twitterShareUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex w-full items-center justify-center rounded-lg border border-accent-primary/20 bg-card-bg/60 px-4 py-2 text-sm font-semibold text-text-primary transition hover:border-accent-primary/40 sm:w-auto"
            >
              <Share2 className="mr-2 h-4 w-4" />
              Share on X
            </a>
            <Button variant="secondary" size="sm" onClick={handleShareByEmail} className="w-full sm:w-auto">
              <Mail className="mr-2 h-4 w-4" />
              Share by email
            </Button>
            {typeof navigator !== 'undefined' && 'share' in navigator ? (
              <Button variant="outline" size="sm" onClick={handleNativeShare} className="w-full sm:w-auto">
                Share…
              </Button>
            ) : null}
          </div>
        </div>

        <ReportHero
          annualSavings={annualSavings}
          totalMonthly={reportToShow.total_monthly}
          totalSavings={reportToShow.total_savings}
          efficiencyScore={reportToShow.efficiency_score}
          benchmarks={benchmarks}
        />

        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <Card className="space-y-5 p-6 sm:p-8">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs uppercase tracking-widest text-accent-primary">Executive summary</p>
                {!reportToShow.summary_text ? (
                  <Button variant="ghost" size="sm" onClick={retrySummary} disabled={summaryLoading}>
                    <RefreshCw className={`mr-2 h-4 w-4 ${summaryLoading ? 'animate-spin' : ''}`} />
                    Retry
                  </Button>
                ) : null}
              </div>
              {reportToShow.summary_text ? (
                <p className="text-base leading-7 text-text-primary">{reportToShow.summary_text}</p>
              ) : (
                <div className="space-y-2" aria-hidden="true">
                  <div className="h-4 w-3/4 animate-pulse rounded bg-accent-primary/10" />
                  <div className="h-4 w-full animate-pulse rounded bg-accent-primary/10" />
                  <div className="h-4 w-5/6 animate-pulse rounded bg-accent-primary/10" />
                </div>
              )}
              <p className="flex items-center gap-2 text-xs text-text-muted">
                <Shield className="h-3.5 w-3.5 text-accent-primary" />
                {isPublicView ? 'Public view — no email or company data shown' : 'Deterministic rules engine'}
              </p>
            </Card>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-text-primary">Per-tool audit breakdown</h2>
                <Badge variant="default">{toolBreakdowns.length} tools analyzed</Badge>
              </div>
              {toolBreakdowns.length > 0 ? (
                toolBreakdowns.map((item) => <ToolBreakdownCard key={item.toolId} breakdown={item} />)
              ) : (
                reportToShow.recommendations.map((item) => (
                  <Card key={item.id} className="space-y-4 p-6 transition hover:border-accent-primary/20">
                    <p className="text-lg font-semibold text-text-primary">{item.recommendedAction}</p>
                    <p className="text-sm text-text-muted">{item.reason}</p>
                    <Badge variant="success">${item.monthlySavings.toFixed(0)}/mo</Badge>
                  </Card>
                ))
              )}
            </div>
          </div>

          <div className="space-y-6">
            <Card className="lg:sticky lg:top-6 space-y-6 p-6 sm:p-8">
              <div>
                <p className="text-xs uppercase tracking-widest text-accent-primary">Next step</p>
                <h2 className="mt-3 text-xl font-bold text-text-primary sm:text-2xl">{conversion.cta}</h2>
                <p className="mt-4 text-sm leading-7 text-text-muted">{conversion.subtext}</p>
              </div>
              <Button
                className="w-full py-3.5"
                disabled={ctaSubmitting}
                onClick={() => {
                  setCtaSubmitting(true);
                  openModal(conversion.intent);
                  setCtaSubmitting(false);
                }}
              >
                {conversion.cta}
              </Button>
              <div className="rounded-lg border border-accent-primary/10 bg-elevated/40 p-4 text-sm text-text-muted">
                <p className="font-medium text-text-primary">Public share preview</p>
                <p className="mt-2 text-xs">Shareable URL — safe for investors and team leads.</p>
                <div className="mt-3 flex items-center gap-2 text-accent-primary">
                  <ExternalLink className="h-4 w-4 shrink-0" />
                  <a href={reportUrl} target="_blank" rel="noreferrer" className="truncate text-xs underline">
                    {reportUrl.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              </div>
            </Card>
          </div>
        </section>
      </div>

      <LeadCaptureModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        reportId={reportToShow.id}
        totalSavings={reportToShow.total_savings}
        intent={modalIntent}
        defaultEmail={savedEmail}
      />
    </main>
  );
}
