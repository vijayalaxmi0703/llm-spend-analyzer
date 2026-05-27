'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import {
  ClipboardCopy,
  ExternalLink,
  Mail,
  Shield,
  RefreshCw,
  Share2
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/toast';
import { ReportHero } from '@/components/report/ReportHero';
import { ToolBreakdownCard } from '@/components/report/ToolBreakdownCard';

import { getConversionCopy, getSavingsTier } from '@/lib/auditEngine';
import { calculateBenchmarks } from '@/lib/benchmarks';
import { buildTwitterShareUrl } from '@/lib/email';

import type {
  AuditRecommendation,
  BenchmarkInsight,
  ToolAuditBreakdown
} from '@/types/audit';

const LeadCaptureModal = dynamic(
  () =>
    import('@/components/report/LeadCaptureModal').then(
      (m) => m.LeadCaptureModal
    ),
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

export function ReportDetail({
  report,
  fallbackReportId,
  isPublicView = false,
  shareUrl
}: ReportDetailProps) {
  const { push } = useToast();

  const [localReport, setLocalReport] = useState<ReportRecord | null>(report);
  const [isLocalDraft, setIsLocalDraft] = useState(false);
  const [reportUrl, setReportUrl] = useState(shareUrl ?? '');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalIntent, setModalIntent] = useState<
    'alerts' | 'consultation' | 'share'
  >('alerts');

  const [savedEmail, setSavedEmail] = useState('');
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [ctaSubmitting, setCtaSubmitting] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    setReportUrl(shareUrl ?? window.location.href);
    setSavedEmail(
      window.localStorage.getItem('credex-lead-email') ?? ''
    );
  }, [fallbackReportId, report, shareUrl]);

  useEffect(() => {
    if (!report && fallbackReportId && typeof window !== 'undefined') {
      try {
        const saved = window.localStorage.getItem(
          `${FALLBACK_PREFIX}${fallbackReportId}`
        );

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

    return Number(
      (reportToShow.total_savings * 12).toFixed(0)
    );
  }, [reportToShow]);

  const conversion = useMemo(() => {
    if (!reportToShow) return null;

    return getConversionCopy(
      getSavingsTier(reportToShow.total_savings)
    );
  }, [reportToShow]);

  const toolBreakdowns =
    reportToShow?.tool_breakdowns ?? [];

  const twitterShareUrl = reportToShow
    ? buildTwitterShareUrl(
        reportToShow.id,
        reportToShow.total_savings
      )
    : '#';

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(reportUrl);

      push({
        variant: 'success',
        title: 'Copied!',
        description: 'Share link copied to clipboard.'
      });
    } catch {
      push({
        variant: 'error',
        title: 'Copy failed',
        description:
          'Copy the URL from your browser address bar.'
      });
    }
  }, [reportUrl, push]);

  const openModal = useCallback(
    (
      intent: 'alerts' | 'consultation' | 'share'
    ) => {
      setModalIntent(intent);
      setModalOpen(true);
    },
    []
  );

  const sendShareEmail = useCallback(
    async (email: string) => {
      if (!reportToShow) return;

      try {
        const response = await fetch('/api/share-report', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
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
          window.localStorage.setItem(
            'credex-lead-email',
            email
          );

          push({
            variant: 'success',
            title: 'Report sent',
            description: `Audit summary emailed to ${email}`
          });
        } else {
          push({
            variant: 'error',
            title: 'Email failed',
            description:
              data.error ?? 'Try again shortly.'
          });
        }
      } catch {
        push({
          variant: 'error',
          title: 'Network error',
          description:
            'Could not send report email.'
        });
      }
    },
    [reportToShow, push]
  );

  const handleShareByEmail = useCallback(() => {
    if (savedEmail) {
      void sendShareEmail(savedEmail);
      return;
    }

    openModal('share');
  }, [savedEmail, openModal, sendShareEmail]);

  const handleNativeShare = useCallback(async () => {
    if (
      !reportToShow ||
      typeof navigator === 'undefined' ||
      !navigator.share
    ) {
      await copyLink();
      return;
    }

    try {
      await navigator.share({
        title: 'Credex AI Spend Audit',
        text: `Potential savings: $${reportToShow.total_savings.toFixed(
          0
        )}/mo`,
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
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          reportId: reportToShow.id,
          teamSize: reportToShow.team_size ?? 3,
          tools: reportToShow.report_data
        })
      });

      const data = await response.json();

      if (response.ok && data.summaryText) {
        setLocalReport((prev) =>
          prev
            ? {
                ...prev,
                summary_text: data.summaryText
              }
            : prev
        );

        push({
          variant: 'success',
          title: 'Summary refreshed'
        });
      }
    } catch {
      push({
        variant: 'error',
        title: 'Could not refresh summary'
      });
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

            <p className="text-xs font-semibold uppercase tracking-widest text-accent-primary">
              Audit Not Available
            </p>

            <h1 className="mt-4 text-3xl font-bold text-text-primary sm:text-4xl">
              {fallbackReportId?.startsWith('local-')
                ? 'Local audit not found'
                : 'Audit could not be loaded'}
            </h1>

            <p className="mt-6 text-base leading-7 text-text-muted">
              {fallbackReportId?.startsWith('local-')
                ? 'This local audit is only saved in your browser. Try creating a new audit, or ensure you&apos;re using the same browser where it was generated.'
                : 'This audit either doesn&apos;t exist, has expired, or you don&apos;t have permission to view it. Shareable audits require a Supabase connection.'}
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
                <p className="font-medium text-text-primary">
                  Need help?
                </p>

                <p className="mt-2">
                  If you recently generated this audit,
                  make sure:
                </p>

                <ul className="mt-3 space-y-2 text-xs">
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-accent-primary" />
                    You&apos;re using the same browser and network
                  </li>

                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-accent-primary" />
                    Your browser hasn&apos;t cleared recent data
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
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <p className="text-xs uppercase tracking-widest text-accent-primary">Shareable audit</p>
            <h1 className="mt-2 text-2xl font-bold text-text-primary">Audit results</h1>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => void copyLink()}>
              <ClipboardCopy className="mr-2 h-4 w-4" /> Copy link
            </Button>
            <Button variant="secondary" size="sm" onClick={() => handleNativeShare()}>
              <Share2 className="mr-2 h-4 w-4" /> Share
            </Button>
          </div>
        </div>

        <ReportHero
          annualSavings={annualSavings}
          totalMonthly={reportToShow.total_monthly}
          totalSavings={reportToShow.total_savings}
          efficiencyScore={reportToShow.efficiency_score}
          benchmarks={benchmarks}
        />

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-text-primary">Executive summary</h2>
              <p className="mt-3 text-sm text-text-muted whitespace-pre-line">{reportToShow.summary_text}</p>
            </Card>

            <Card className="p-6">
              <h3 className="text-md font-semibold text-text-primary">Recommendations</h3>
              <div className="mt-4 space-y-3">
                {reportToShow.recommendations && reportToShow.recommendations.length ? (
                  reportToShow.recommendations.map((rec, idx) => (
                    <div key={rec.id ?? idx} className="rounded-md border border-accent-primary/10 p-4">
                      <p className="font-medium text-text-primary">{rec.recommendedAction}</p>
                      <p className="mt-1 text-sm text-text-muted">{rec.reason}</p>
                      <p className="mt-2 text-xs text-text-muted">Estimated savings: ${rec.monthlySavings.toFixed(0)}/mo</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-text-muted">No recommendations available.</p>
                )}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-md font-semibold text-text-primary">Tool breakdown</h3>
              <div className="mt-4 space-y-4">
                {toolBreakdowns.length ? (
                  toolBreakdowns.map((tb) => (
                    <ToolBreakdownCard key={tb.toolKey + tb.plan} breakdown={tb} />
                  ))
                ) : (
                  <p className="text-sm text-text-muted">No tool breakdowns available.</p>
                )}
              </div>
            </Card>
          </div>

          <aside className="space-y-6">
            <Card className="p-6">
              <h4 className="text-sm font-semibold text-text-primary">Conversion copy</h4>
              <p className="mt-3 text-sm text-text-muted">{conversion?.headline}</p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-text-muted">Audit ID</p>
                  <p className="font-mono mt-1 text-sm text-text-primary">{reportToShow.id}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <Button size="sm" onClick={() => retrySummary()} disabled={summaryLoading}>
                    <RefreshCw className="mr-2 h-4 w-4" /> Refresh summary
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => openModal('consultation')}>
                    Request help
                  </Button>
                </div>
              </div>
            </Card>
          </aside>
        </div>

        <LeadCaptureModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          intent={modalIntent}
          reportId={reportToShow.id}
          totalSavings={reportToShow.total_savings}
          defaultEmail={savedEmail}
        />
      </div>
    </main>
  );
}