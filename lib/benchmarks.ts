import { BenchmarkInsight, OptimizationStatus } from '@/types/audit';

const BENCHMARK_SPEND_PER_DEV = 185;

function statusFromDelta(percentAbove: number, efficiencyScore: number): {
  status: OptimizationStatus;
  label: string;
} {
  if (efficiencyScore >= 88 || percentAbove <= -8) {
    return { status: 'highly_optimized', label: 'Highly optimized' };
  }
  if (percentAbove <= 5) {
    return { status: 'lean', label: 'Lean stack' };
  }
  if (percentAbove <= 28) {
    return { status: 'moderate', label: 'Moderately overprovisioned' };
  }
  return { status: 'overprovisioned', label: 'Spend review recommended' };
}

export function calculateBenchmarks(
  totalMonthly: number,
  teamSize: number,
  efficiencyScore: number
): BenchmarkInsight {
  const safeTeam = Math.max(teamSize, 1);
  const spendPerDeveloper = Number((totalMonthly / safeTeam).toFixed(2));
  const percentAboveBenchmark = Number(
    (((spendPerDeveloper - BENCHMARK_SPEND_PER_DEV) / BENCHMARK_SPEND_PER_DEV) * 100).toFixed(0)
  );
  const { status, label } = statusFromDelta(percentAboveBenchmark, efficiencyScore);
  const percentile = Math.max(5, Math.min(95, 72 - percentAboveBenchmark));

  return {
    spendPerDeveloper,
    benchmarkSpendPerDeveloper: BENCHMARK_SPEND_PER_DEV,
    percentAboveBenchmark,
    optimizationStatus: status,
    statusLabel: label,
    percentile,
    teamSize: safeTeam
  };
}
