import { toolCatalog } from '@/data/tools';

export type SupportedToolKey = keyof typeof toolCatalog;
export type UseCaseType = 'coding' | 'writing' | 'research' | 'data' | 'mixed';
export type OptimizationStatus = 'lean' | 'moderate' | 'overprovisioned' | 'highly_optimized';

export interface ToolEntry {
  id: string;
  toolKey: SupportedToolKey;
  plan: string;
  monthlySpend: number;
  seats: number;
  useCase: UseCaseType;
}

export interface AuditRecommendation {
  id: string;
  toolId?: string;
  toolKey?: SupportedToolKey;
  toolName?: string;
  plan?: string;
  currentSpend: number;
  recommendedAction: string;
  monthlySavings: number;
  annualSavings: number;
  confidence: number;
  reason: string;
  ruleId?: string;
}

export interface ToolAuditBreakdown {
  toolId: string;
  toolKey: SupportedToolKey;
  toolName: string;
  plan: string;
  currentSpend: number;
  seats: number;
  useCase: UseCaseType;
  recommendedAction: string;
  monthlySavings: number;
  annualSavings: number;
  confidence: number;
  reason: string;
  ruleId: string;
}

export interface BenchmarkInsight {
  spendPerDeveloper: number;
  benchmarkSpendPerDeveloper: number;
  percentAboveBenchmark: number;
  optimizationStatus: OptimizationStatus;
  statusLabel: string;
  percentile: number;
  teamSize: number;
}

export interface AuditSummary {
  totalMonthly: number;
  totalAnnual: number;
  totalSavings: number;
  annualSavings: number;
  efficiencyScore: number;
  recommendations: AuditRecommendation[];
  toolBreakdowns: ToolAuditBreakdown[];
  benchmarks: BenchmarkInsight;
  summaryText: string;
  optimizationStatus: OptimizationStatus;
}

export interface AuditReport {
  id: string;
  created_at: string;
  companyName: string | null;
  role: string | null;
  teamSize: number | null;
  totalMonthly: number;
  totalAnnual: number;
  totalSavings: number;
  efficiencyScore: number;
  recommendations: AuditRecommendation[];
  toolBreakdowns?: ToolAuditBreakdown[];
  benchmarks?: BenchmarkInsight;
  summaryText: string;
  reportData: ToolEntry[];
}
