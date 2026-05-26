import { NextResponse } from 'next/server';
import { auditPayloadSchema } from '@/lib/validation';
import { calculateAudit } from '@/lib/auditEngine';
import { supabaseAdmin } from '@/lib/supabase/server';
import { generateAuditSummary } from '@/lib/anthropic';
import { buildExecutiveSummary, buildSummaryPrompt } from '@/lib/summary';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';

function getFallbackReportId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `local-${crypto.randomUUID()}`;
  }
  return `local-${Date.now()}`;
}

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const limit = checkRateLimit(`submit-audit:${ip}`, 12, 60_000);
    if (!limit.allowed) {
      return NextResponse.json(
        { error: 'Too many audit requests. Please wait a moment and try again.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil((limit.retryAfterMs ?? 5000) / 1000)) } }
      );
    }

    const body = await request.json();

    if (body?.honeypot) {
      return NextResponse.json({ error: 'Invalid submission' }, { status: 422 });
    }

    const parsed = auditPayloadSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid audit data provided. Please check your inputs.' }, { status: 422 });
    }

    const teamSize = parsed.data.teamSize ?? 3;

    let auditResult;
    try {
      auditResult = calculateAudit(parsed.data.tools, teamSize);
    } catch (calcError) {
      console.error('Audit calculation error:', calcError);
      return NextResponse.json(
        { error: 'Failed to process audit. Please try again with different data.' },
        { status: 500 }
      );
    }

    const narrativeBase = buildExecutiveSummary(parsed.data.tools, auditResult);
    let narrative = narrativeBase;

    try {
      const prompt = buildSummaryPrompt(parsed.data.tools, auditResult);
      const aiPromise = generateAuditSummary(prompt);
      const timeoutPromise = new Promise<string>((resolve) => {
        setTimeout(() => resolve(''), 4_000);
      });
      const aiSummary = await Promise.race([aiPromise, timeoutPromise]);
      if (aiSummary?.trim()) {
        narrative = aiSummary.trim();
      }
    } catch (aiError) {
      console.error('AI summary generation error:', aiError);
    }

    auditResult.summaryText = narrative;

    const record = {
      company_name: parsed.data.companyName ?? null,
      role: parsed.data.role ?? null,
      team_size: teamSize,
      total_monthly: auditResult.totalMonthly,
      total_annual: auditResult.totalAnnual,
      total_savings: auditResult.totalSavings,
      efficiency_score: auditResult.efficiencyScore,
      recommendations: auditResult.recommendations,
      tool_breakdowns: auditResult.toolBreakdowns,
      benchmarks: auditResult.benchmarks,
      summary_text: narrative,
      report_data: parsed.data.tools,
      created_at: new Date().toISOString()
    };

    let reportId = getFallbackReportId();
    let persistenceError: string | null = null;
    let savedToDb = false;

    try {
      if (!supabaseAdmin) {
        persistenceError = 'Database persistence skipped: Supabase admin is not configured.';
        console.warn('Supabase admin not configured — using local-only ID:', reportId);
      } else {
        console.log('Saving audit to Supabase:', {
          company_name: record.company_name,
          team_size: record.team_size,
          total_savings: record.total_savings,
          tools_count: record.report_data?.length
        });

        const insertPromise = supabaseAdmin
          .from('audits')
          .insert([record])
          .select()
          .single();
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Database request timed out.')), 8_000);
        });

        const response = await Promise.race([insertPromise, timeoutPromise]);

        if (response.error) {
          persistenceError = response.error.message || 'Database error occurred.';
          console.error('Supabase insert error:', {
            message: response.error.message,
            code: response.error.code,
            details: response.error.details,
            hint: response.error.hint
          });
        } else if (!response.data?.id) {
          persistenceError = 'Audit saved but ID not returned.';
          console.error('Database insert response missing ID:', response);
        } else {
          reportId = response.data.id;
          savedToDb = true;
          console.log('Successfully saved audit to Supabase with ID:', reportId);
        }
      }
    } catch (dbError) {
      persistenceError = dbError instanceof Error ? dbError.message : 'Database persistence failed.';
      console.error('Database persistence error:', {
        message: persistenceError,
        error: dbError
      });
    }

    return NextResponse.json({
      reportId,
      summaryText: narrative,
      audit: auditResult,
      persistence: {
        savedToDb,
        errorMessage: persistenceError
      }
    });
  } catch (unexpectedError) {
    console.error('Unexpected error in submit-audit:', unexpectedError);
    return NextResponse.json({ error: 'An unexpected error occurred. Please try again.' }, { status: 500 });
  }
}
