import { toolCatalog } from '@/data/tools';
import { AuditRecommendation, AuditSummary, ToolEntry } from '@/types/audit';

export function buildExecutiveSummary(
  tools: ToolEntry[],
  audit: Pick<AuditSummary, 'totalMonthly' | 'totalSavings' | 'annualSavings' | 'recommendations' | 'benchmarks'>
): string {
  const topRec = [...audit.recommendations].sort((a, b) => b.monthlySavings - a.monthlySavings)[0];
  const topTool = tools.reduce((max, t) => (t.monthlySpend > max.monthlySpend ? t : max), tools[0]);
  const topToolLabel = topTool ? toolCatalog[topTool.toolKey].label : 'your stack';
  const annual = audit.annualSavings || audit.totalSavings * 12;

  if (!topRec || audit.totalSavings <= 50) {
    return `Your ${topToolLabel}-led AI stack at $${audit.totalMonthly.toFixed(0)}/mo is relatively efficient for a ${audit.benchmarks.teamSize}-person team. Spend per developer is ${Math.abs(audit.benchmarks.percentAboveBenchmark)}% ${audit.benchmarks.percentAboveBenchmark > 0 ? 'above' : 'below'} the early-stage benchmark. Continue monitoring plan tiers as headcount scales.`;
  }

  const inefficiency =
    topRec.toolName && topRec.plan
      ? `${topRec.toolName} (${topRec.plan})`
      : topRec.toolName ?? topToolLabel;

  return `This audit identifies $${annual.toLocaleString()}/year in defensible savings across ${tools.length} subscription${tools.length > 1 ? 's' : ''}. The largest opportunity is ${inefficiency}: ${topRec.recommendedAction.toLowerCase().replace(/\.$/, '')}, worth ~$${topRec.monthlySavings.toFixed(0)}/mo. At $${audit.benchmarks.spendPerDeveloper.toFixed(0)}/developer, you are ${Math.max(0, audit.benchmarks.percentAboveBenchmark)}% above typical startup benchmarks — prioritizing seat rationalization and API credit sourcing will improve runway without disrupting core workflows.`;
}

export function buildSummaryPrompt(tools: ToolEntry[], audit: AuditSummary): string {
  return `You are a SaaS finance analyst writing an investor-grade executive summary (90-110 words).

Rules:
- Mention the biggest inefficiency by vendor name
- Include annual savings figure: $${audit.annualSavings.toLocaleString()}
- Reference team size: ${audit.benchmarks.teamSize}
- Mention spend per developer vs benchmark (${audit.benchmarks.percentAboveBenchmark}% vs benchmark)
- Be specific, operational, and finance-defensible
- Do NOT use generic filler phrases

Stack:
${tools
  .map(
    (t) =>
      `- ${toolCatalog[t.toolKey].label} ${t.plan}: $${t.monthlySpend}/mo, ${t.seats} seats, ${t.useCase}`
  )
  .join('\n')}

Top recommendations:
${audit.recommendations
  .slice(0, 4)
  .map((r) => `- ${r.recommendedAction} ($${r.monthlySavings}/mo savings)`)
  .join('\n')}

Write the summary:`;
}
