import { describe, expect, it } from 'vitest';
import { calculateAudit, getSavingsTier } from '@/lib/auditEngine';
import type { ToolEntry } from '@/types/audit';

const baseTool = (overrides: Partial<ToolEntry> = {}): ToolEntry => ({
  id: 'tool-1',
  toolKey: 'copilot',
  plan: 'Enterprise',
  monthlySpend: 200,
  seats: 2,
  useCase: 'coding',
  ...overrides
});

describe('auditEngine', () => {
  it('flags enterprise overkill for small teams', () => {
    const summary = calculateAudit([baseTool()], 3);
    expect(summary.recommendations.some((item) => item.ruleId === 'enterprise-overkill')).toBe(true);
    expect(summary.toolBreakdowns).toHaveLength(1);
    expect(summary.totalSavings).toBeGreaterThan(0);
  });

  it('identifies coding team overlap between ChatGPT and Claude', () => {
    const summary = calculateAudit(
      [
        baseTool({ toolKey: 'chatgpt', plan: 'Team', monthlySpend: 250, seats: 3, useCase: 'coding' }),
        baseTool({
          id: 'tool-2',
          toolKey: 'claude',
          plan: 'Team',
          monthlySpend: 280,
          seats: 3,
          useCase: 'coding'
        })
      ],
      4
    );
    expect(summary.recommendations.some((item) => item.ruleId === 'coding-team-overlap')).toBe(true);
  });

  it('recommends Credex API credits for high OpenAI usage', () => {
    const summary = calculateAudit(
      [baseTool({ toolKey: 'openai', plan: 'API', monthlySpend: 420, seats: 2, useCase: 'data' })],
      5
    );
    expect(summary.recommendations.some((item) => item.ruleId === 'api-credex-credits')).toBe(true);
  });

  it('recommends Claude Team to Pro for small teams', () => {
    const summary = calculateAudit(
      [baseTool({ toolKey: 'claude', plan: 'Team', monthlySpend: 300, seats: 3, useCase: 'writing' })],
      3
    );
    expect(summary.recommendations.some((item) => item.ruleId === 'claude-team-to-pro')).toBe(true);
  });

  it('includes benchmark insights', () => {
    const summary = calculateAudit([baseTool({ monthlySpend: 400 })], 5);
    expect(summary.benchmarks.spendPerDeveloper).toBeGreaterThan(0);
    expect(summary.benchmarks.statusLabel).toBeTruthy();
  });

  it('does not produce negative total savings', () => {
    const summary = calculateAudit(
      [baseTool({ toolKey: 'gemini', plan: 'Pro', monthlySpend: 100, seats: 1, useCase: 'research' })],
      2
    );
    expect(summary.totalSavings).toBeGreaterThanOrEqual(0);
    expect(summary.annualSavings).toBe(summary.totalSavings * 12);
  });

  it('classifies savings tiers correctly', () => {
    expect(getSavingsTier(600)).toBe('high');
    expect(getSavingsTier(200)).toBe('medium');
    expect(getSavingsTier(50)).toBe('low');
  });
});
