import { ReportDetail } from '@/components/report/ReportDetail';
import { calculateAudit } from '@/lib/auditEngine';
import { buildExecutiveSummary } from '@/lib/summary';
import type { ToolEntry } from '@/types/audit';

const sampleTools: ToolEntry[] = [
  { id: 'tool-1', toolKey: 'copilot', plan: 'Business', monthlySpend: 420, seats: 4, useCase: 'coding' },
  { id: 'tool-2', toolKey: 'claude', plan: 'Team', monthlySpend: 300, seats: 3, useCase: 'coding' },
  { id: 'tool-3', toolKey: 'openai', plan: 'API', monthlySpend: 520, seats: 2, useCase: 'data' }
];

const audit = calculateAudit(sampleTools, 12);
const summary = buildExecutiveSummary(sampleTools, audit);

const sample = {
  id: 'sample-report',
  team_size: 12,
  total_monthly: audit.totalMonthly,
  total_annual: audit.totalAnnual,
  total_savings: audit.totalSavings,
  efficiency_score: audit.efficiencyScore,
  recommendations: audit.recommendations,
  tool_breakdowns: audit.toolBreakdowns,
  benchmarks: audit.benchmarks,
  summary_text: summary,
  report_data: sampleTools
};

export default function SampleAuditPage() {
  return <ReportDetail report={sample} fallbackReportId="sample-report" isPublicView shareUrl="/audit/sample" />;
}
