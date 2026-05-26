import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import dynamic from 'next/dynamic';
import { fetchAuditById, toPublicAudit } from '@/lib/reports';
import { buildReportUrl } from '@/lib/email';
import { ReportPageSkeleton } from '@/components/report/ReportPageSkeleton';

const ReportDetail = dynamic(
  () => import('@/components/report/ReportDetail').then((mod) => mod.ReportDetail),
  { loading: () => <ReportPageSkeleton /> }
);

export const revalidate = 3600;

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const audit = await fetchAuditById(id);
  const monthlySavings = audit ? Math.round(audit.total_savings) : 0;
  const annualSavings = monthlySavings * 12;

  const title = audit
    ? `Save $${monthlySavings}/mo on AI spend | Credex Audit`
    : 'AI Spend Audit Report | Credex Audit';

  const description = audit
    ? `This Credex audit found $${monthlySavings}/mo ($${annualSavings.toLocaleString()}/yr) in defensible AI subscription savings. View the full breakdown.`
    : 'Shareable AI subscription audit with savings recommendations and efficiency score.';

  const reportUrl = buildReportUrl(id);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      url: reportUrl,
      siteName: 'Credex Audit',
      images: [{ url: '/og-image.svg', width: 1200, height: 630, alt: 'Credex AI Spend Audit' }]
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/og-image.svg']
    },
    robots: { index: true, follow: true }
  };
}

export default async function PublicAuditPage({ params }: Props) {
  const { id } = await params;
  const record = await fetchAuditById(id);
  const shareUrl = buildReportUrl(id);

  if (record) {
    return (
      <ReportDetail
        report={toPublicAudit(record)}
        fallbackReportId={id}
        isPublicView
        shareUrl={shareUrl}
      />
    );
  }

  if (id.startsWith('local-')) {
    return <ReportDetail report={null} fallbackReportId={id} isPublicView shareUrl={shareUrl} />;
  }

  notFound();
}
