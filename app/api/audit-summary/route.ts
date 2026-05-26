import { NextResponse } from 'next/server';
import { z } from 'zod';
import { calculateAudit } from '@/lib/auditEngine';
import { generateAuditSummary } from '@/lib/anthropic';
import { buildExecutiveSummary, buildSummaryPrompt } from '@/lib/summary';
import { toolEntrySchema } from '@/lib/validation';

const bodySchema = z.object({
  reportId: z.string().optional(),
  teamSize: z.number().int().min(1).max(500).optional(),
  tools: z.array(toolEntrySchema).min(1)
});

export async function POST(request: Request) {
  try {
    const parsed = bodySchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 422 });
    }

    const teamSize = parsed.data.teamSize ?? 3;
    const audit = calculateAudit(parsed.data.tools, teamSize);
    const fallback = buildExecutiveSummary(parsed.data.tools, audit);

    try {
      const prompt = buildSummaryPrompt(parsed.data.tools, audit);
      const aiPromise = generateAuditSummary(prompt);
      const timeout = new Promise<string>((resolve) => setTimeout(() => resolve(''), 6_000));
      const aiSummary = await Promise.race([aiPromise, timeout]);
      return NextResponse.json({ summaryText: aiSummary?.trim() || fallback });
    } catch {
      return NextResponse.json({ summaryText: fallback });
    }
  } catch {
    return NextResponse.json({ error: 'Summary generation failed' }, { status: 500 });
  }
}
