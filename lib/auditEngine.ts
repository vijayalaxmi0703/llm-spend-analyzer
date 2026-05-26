import { toolCatalog } from '@/data/tools';
import { calculateBenchmarks } from '@/lib/benchmarks';
import {
  AuditRecommendation,
  AuditSummary,
  SupportedToolKey,
  ToolAuditBreakdown,
  ToolEntry,
  UseCaseType
} from '@/types/audit';

interface RuleCandidate {
  ruleId: string;
  action: string;
  savings: number;
  reason: string;
  confidence: number;
}

const TEAM_PLAN_PATTERN = /team|business/i;
const ENTERPRISE_PLAN_PATTERN = /enterprise|ultra/i;
const PRO_PLAN_PATTERN = /pro|plus|max/i;

function planLabel(toolKey: SupportedToolKey, plan: string) {
  return `${toolCatalog[toolKey].label}`;
}

function isTeamPlan(plan: string) {
  return TEAM_PLAN_PATTERN.test(plan);
}

function isEnterprisePlan(plan: string) {
  return ENTERPRISE_PLAN_PATTERN.test(plan);
}

function isApiTool(toolKey: SupportedToolKey) {
  return toolKey === 'openai' || toolKey === 'anthropic';
}

function buildRecommendation(
  tool: ToolEntry,
  candidate: RuleCandidate
): AuditRecommendation {
  const monthlySavings = Math.max(0, Number(candidate.savings.toFixed(2)));
  return {
    id: `${tool.id}-${candidate.ruleId}`,
    toolId: tool.id,
    toolKey: tool.toolKey,
    toolName: planLabel(tool.toolKey, tool.plan),
    plan: tool.plan,
    currentSpend: tool.monthlySpend,
    recommendedAction: candidate.action,
    monthlySavings,
    annualSavings: Number((monthlySavings * 12).toFixed(2)),
    confidence: candidate.confidence,
    reason: candidate.reason,
    ruleId: candidate.ruleId
  };
}

function toBreakdown(tool: ToolEntry, rec: AuditRecommendation): ToolAuditBreakdown {
  return {
    toolId: tool.id,
    toolKey: tool.toolKey,
    toolName: planLabel(tool.toolKey, tool.plan),
    plan: tool.plan,
    currentSpend: tool.monthlySpend,
    seats: tool.seats,
    useCase: tool.useCase,
    recommendedAction: rec.recommendedAction,
    monthlySavings: rec.monthlySavings,
    annualSavings: rec.annualSavings,
    confidence: rec.confidence,
    reason: rec.reason,
    ruleId: rec.ruleId ?? rec.id
  };
}

function evaluateToolRules(tool: ToolEntry, teamSize: number): RuleCandidate[] {
  const rules: RuleCandidate[] = [];
  const name = planLabel(tool.toolKey, tool.plan);
  const spend = tool.monthlySpend;
  const seats = Math.max(tool.seats, 1);
  const spendPerSeat = spend / seats;

  if (isTeamPlan(tool.plan) && seats <= 2) {
    rules.push({
      ruleId: 'team-to-pro',
      action: `Switch ${name} from ${tool.plan} to a Pro or individual tier for small teams.`,
      savings: Math.min(spend * 0.4, 180),
      reason: `Team tier economics become inefficient below 3 active users. At ${seats} seat${seats > 1 ? 's' : ''}, ${tool.plan} is likely over-provisioned relative to utilization.`,
      confidence: 0.91
    });
  }

  if (isEnterprisePlan(tool.plan) && seats <= 5) {
    rules.push({
      ruleId: 'enterprise-overkill',
      action: `Downgrade ${name} from ${tool.plan} to a smaller plan aligned with ${seats} active seats.`,
      savings: Math.min(spend * 0.35, spend - 25),
      reason: `Enterprise and ultra tiers are designed for larger organizations. With ${seats} seats on ${tool.plan}, you are paying for capacity you likely do not use.`,
      confidence: 0.89
    });
  }

  if (tool.seats > teamSize + 1 && spend > 80) {
    rules.push({
      ruleId: 'seat-overallocation',
      action: `Reduce unused ${name} seats or migrate inactive users.`,
      savings: Math.min(spend * 0.33, (tool.seats - teamSize) * spendPerSeat * 0.7),
      reason: `Seat count (${tool.seats}) exceeds reported team size (${teamSize}), suggesting underutilization relative to headcount.`,
      confidence: 0.87
    });
  }

  if (tool.toolKey === 'copilot' && tool.plan === 'Individual' && spend >= 90 && teamSize >= 3) {
    rules.push({
      ruleId: 'copilot-seat-review',
      action: `Reduce unused ${name} seats or migrate inactive users.`,
      savings: Math.min(40, spend * 0.33),
      reason: `Seat count suggests underutilization relative to reported team size. Individual licenses often accumulate for departed teammates.`,
      confidence: 0.84
    });
  }

  if (tool.toolKey === 'claude' && isTeamPlan(tool.plan) && seats < 5 && spend >= 200) {
    rules.push({
      ruleId: 'claude-team-to-pro',
      action: `Switch small teams on ${name} from ${tool.plan} to Claude Pro.`,
      savings: Math.min(spend * 0.4, 120),
      reason: `Team tier economics become inefficient below 5 active users. Pro covers most small-team workflows at materially lower cost.`,
      confidence: 0.9
    });
  }

  if (isApiTool(tool.toolKey) && spend >= 350) {
    rules.push({
      ruleId: 'api-credex-credits',
      action: `Use prepaid API credits via Credex for ${name} instead of pay-as-you-go billing.`,
      savings: Math.min(spend * 0.26, 260),
      reason: `High-volume API consumption ($${spend}/mo) qualifies for discounted infrastructure sourcing through committed credits.`,
      confidence: 0.88
    });
  }

  if (isApiTool(tool.toolKey) && spend >= 200 && spendPerSeat > 100) {
    rules.push({
      ruleId: 'api-spend-optimization',
      action: `Move portions of ${name} usage to committed credits or volume discounts.`,
      savings: Math.min(spend * 0.22, 180),
      reason: `Bursty API usage patterns typically benefit from committed credits versus direct pay-as-you-go pricing.`,
      confidence: 0.82
    });
  }

  if (spend > 0 && spend < 130 && tool.plan !== 'Free' && tool.plan !== 'Hobby') {
    rules.push({
      ruleId: 'starter-tier-fit',
      action: `Evaluate ${name} against a free or starter tier for current usage levels.`,
      savings: Math.min(spend * 0.25, 80),
      reason: `At $${spend}/mo, premium features may exceed actual utilization. A lower tier often preserves core capability.`,
      confidence: 0.78
    });
  }

  if (PRO_PLAN_PATTERN.test(tool.plan) && seats <= 2 && spend > 150 && !isApiTool(tool.toolKey)) {
    rules.push({
      ruleId: 'premium-downgrade',
      action: `Compare ${name} ${tool.plan} against the next-lower vendor plan.`,
      savings: Math.min(spend * 0.2, 150),
      reason: `A ${seats}-seat team on ${tool.plan} often fits a lower tier with the same core features at reduced recurring cost.`,
      confidence: 0.8
    });
  }

  if (rules.length === 0 && spend > 0) {
    rules.push({
      ruleId: 'monitor',
      action: `Continue monitoring ${name} ${tool.plan} for usage-based optimization opportunities.`,
      savings: Math.min(spend * 0.08, 40),
      reason: `Current spend profile appears reasonable, but periodic seat and plan reviews help prevent drift as team size changes.`,
      confidence: 0.62
    });
  }

  return rules;
}

function evaluateOverlapRules(tools: ToolEntry[]): AuditRecommendation[] {
  const overlap: AuditRecommendation[] = [];

  for (let i = 0; i < tools.length; i++) {
    for (let j = i + 1; j < tools.length; j++) {
      const left = tools[i];
      const right = tools[j];

      const codingOverlap =
        left.useCase === 'coding' &&
        right.useCase === 'coding' &&
        isTeamPlan(left.plan) &&
        isTeamPlan(right.plan);

      const sameUseCase = left.useCase === right.useCase && left.toolKey !== right.toolKey;

      if (codingOverlap && (left.toolKey === 'chatgpt' || left.toolKey === 'claude') && (right.toolKey === 'chatgpt' || right.toolKey === 'claude')) {
        const savings = Math.min(left.monthlySpend, right.monthlySpend) * 0.45;
        overlap.push({
          id: `overlap-${left.id}-${right.id}`,
          toolKey: left.toolKey,
          toolName: `${toolCatalog[left.toolKey].label} + ${toolCatalog[right.toolKey].label}`,
          currentSpend: left.monthlySpend + right.monthlySpend,
          recommendedAction: `Consolidate coding workflows between ${toolCatalog[left.toolKey].label} Team and ${toolCatalog[right.toolKey].label} Team.`,
          monthlySavings: Number(savings.toFixed(2)),
          annualSavings: Number((savings * 12).toFixed(2)),
          confidence: 0.86,
          reason: `Paying for both ChatGPT Team and Claude Team on coding-heavy workflows creates redundant capability. Standardizing on one provider typically reduces overlap waste.`,
          ruleId: 'coding-team-overlap'
        });
      } else if (sameUseCase && Math.abs(left.monthlySpend - right.monthlySpend) < 280) {
        const savings = Math.min(left.monthlySpend, right.monthlySpend) * 0.4;
        overlap.push({
          id: `overlap-${left.id}-${right.id}`,
          currentSpend: left.monthlySpend + right.monthlySpend,
          recommendedAction: `Reduce overlapping ${left.useCase} spend between ${toolCatalog[left.toolKey].label} and ${toolCatalog[right.toolKey].label}.`,
          monthlySavings: Number(savings.toFixed(2)),
          annualSavings: Number((savings * 12).toFixed(2)),
          confidence: 0.83,
          reason: `Maintaining two tools for the same ${left.useCase} workflow often creates redundant subscription spend.`,
          ruleId: 'duplicate-capability'
        });
      }
    }
  }

  return overlap.slice(0, 3);
}

function pickPrimaryPerTool(tools: ToolEntry[], all: AuditRecommendation[]): ToolAuditBreakdown[] {
  return tools.map((tool) => {
    const forTool = all.filter((r) => r.toolId === tool.id);
    const best = [...forTool].sort((a, b) => b.monthlySavings - a.monthlySavings)[0];
    if (best) {
      return toBreakdown(tool, best);
    }
    return {
      toolId: tool.id,
      toolKey: tool.toolKey,
      toolName: planLabel(tool.toolKey, tool.plan),
      plan: tool.plan,
      currentSpend: tool.monthlySpend,
      seats: tool.seats,
      useCase: tool.useCase,
      recommendedAction: `No immediate action required for ${planLabel(tool.toolKey, tool.plan)}.`,
      monthlySavings: 0,
      annualSavings: 0,
      confidence: 0.6,
      reason: `Spend on ${tool.plan} appears aligned with current team profile.`,
      ruleId: 'no-action'
    };
  });
}

export function calculateAudit(input: ToolEntry[], teamSize = 3): AuditSummary {
  const safeTeamSize = Math.max(teamSize, 1);
  const totalMonthly = input.reduce((sum, item) => sum + item.monthlySpend, 0);
  const perToolRecs: AuditRecommendation[] = [];

  input.forEach((tool) => {
    const candidates = evaluateToolRules(tool, safeTeamSize);
    const best = candidates.sort((a, b) => b.savings - a.savings)[0];
    if (best) {
      perToolRecs.push(buildRecommendation(tool, best));
    }
  });

  const overlapRecs = evaluateOverlapRules(input);
  const recommendations = [...perToolRecs, ...overlapRecs];
  const totalSavings = recommendations.reduce((sum, r) => sum + r.monthlySavings, 0);
  const annualSavings = Number((totalSavings * 12).toFixed(2));
  const efficiencyScore = Math.max(50, Math.min(98, Math.round(100 - (totalSavings / Math.max(totalMonthly, 1)) * 28)));
  const benchmarks = calculateBenchmarks(totalMonthly, safeTeamSize, efficiencyScore);
  const toolBreakdowns = pickPrimaryPerTool(input, perToolRecs);

  return {
    totalMonthly: Number(totalMonthly.toFixed(2)),
    totalAnnual: Number((totalMonthly * 12).toFixed(2)),
    totalSavings: Number(totalSavings.toFixed(2)),
    annualSavings,
    efficiencyScore,
    recommendations,
    toolBreakdowns,
    benchmarks,
    summaryText: '',
    optimizationStatus: benchmarks.optimizationStatus
  };
}

export function getSavingsTier(monthlySavings: number): 'high' | 'medium' | 'low' {
  if (monthlySavings > 500) return 'high';
  if (monthlySavings > 150) return 'medium';
  return 'low';
}

export function getConversionCopy(tier: ReturnType<typeof getSavingsTier>) {
  switch (tier) {
    case 'high':
      return {
        headline: 'High-confidence savings identified',
        cta: 'Book a Credex consultation',
        subtext: 'Credex can help reduce these costs further with discounted infrastructure credits.',
        intent: 'consultation' as const
      };
    case 'medium':
      return {
        headline: 'Meaningful optimization opportunities found',
        cta: 'Get optimization alerts',
        subtext: 'We will notify you when new vendor pricing or credit programs match your stack.',
        intent: 'alerts' as const
      };
    default:
      return {
        headline: 'Your AI stack is relatively optimized',
        cta: 'Monitor future savings opportunities',
        subtext: 'Your stack is already relatively optimized. We will notify you when new savings opportunities appear.',
        intent: 'alerts' as const
      };
  }
}
