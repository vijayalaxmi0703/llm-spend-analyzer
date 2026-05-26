import { supabase } from '@/lib/supabase/client';
import type { AuditRecommendation, BenchmarkInsight, ToolAuditBreakdown } from '@/types/audit';

export interface AuditRecord {
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

/** Public-safe audit payload — strips private lead/company fields */
export function toPublicAudit(record: AuditRecord): AuditRecord {
  return {
    id: record.id,
    team_size: record.team_size ?? null,
    total_monthly: record.total_monthly,
    total_annual: record.total_annual,
    total_savings: record.total_savings,
    efficiency_score: record.efficiency_score,
    recommendations: record.recommendations ?? [],
    tool_breakdowns: record.tool_breakdowns ?? [],
    benchmarks: record.benchmarks,
    summary_text: record.summary_text ?? '',
    report_data: record.report_data ?? []
  };
}

export async function fetchAuditById(id: string): Promise<AuditRecord | null> {
  if (!supabase) {
    console.warn('Supabase client not available for audit fetch:', id);
    return null;
  }

  try {
    console.log('Fetching audit from database:', id);
    const { data, error } = await supabase.from('audits').select('*').eq('id', id).single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        console.log('Audit not found in database (no rows):', id);
      } else {
        console.error('Database fetch error:', {
          code: error.code,
          message: error.message,
          details: error.details
        });
      }
      return null;
    }

    if (!data) {
      console.warn('Database returned null data for audit:', id);
      return null;
    }

    console.log('Successfully fetched audit from database:', {
      id: data.id,
      total_savings: data.total_savings,
      created_at: data.created_at
    });

    return data as AuditRecord;
  } catch (err) {
    console.error('Unexpected error fetching audit:', {
      id,
      error: err
    });
    return null;
  }
}
