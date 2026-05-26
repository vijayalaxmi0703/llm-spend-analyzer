import { NextResponse } from 'next/server';
import { leadSchema } from '@/lib/validation';
import { supabaseAdmin } from '@/lib/supabase/server';
import { sendLeadConfirmationEmail, sendReportEmail } from '@/lib/email';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const limit = checkRateLimit(`record-lead:${ip}`, 8, 60_000);
  if (!limit.allowed) {
    return NextResponse.json({ error: 'Too many requests. Please try again shortly.' }, { status: 429 });
  }

  const payload = await request.json();
  const parsed = leadSchema.safeParse(payload);

  if (!parsed.success || parsed.data.honeypot) {
    return NextResponse.json({ error: 'Invalid submission' }, { status: 422 });
  }

  let savedToDb = false;

  if (!supabaseAdmin) {
    const totalSavings = parsed.data.totalSavings ?? 0;
    const intent = parsed.data.intent ?? 'alerts';
    await sendLeadConfirmationEmail(parsed.data.email, parsed.data.reportId, totalSavings, intent);
    return NextResponse.json({
      success: true,
      message: 'Lead captured (email queued)',
      emailSent: true,
      savedToDb: false
    });
  }

  const { error: insertError } = await supabaseAdmin.from('leads').insert({
    report_id: parsed.data.reportId,
    email: parsed.data.email,
    company: parsed.data.company ?? null,
    role: parsed.data.role ?? null,
    team_size: parsed.data.teamSize ?? null,
    intent: parsed.data.intent ?? 'alerts',
    created_at: new Date().toISOString()
  });

  if (insertError) {
    console.warn('Lead insert warning:', insertError.message);
  } else {
    savedToDb = true;
  }

  const totalSavings = parsed.data.totalSavings ?? 0;
  const intent = parsed.data.intent ?? 'alerts';

  if (intent === 'share') {
    await sendReportEmail({
      email: parsed.data.email,
      reportId: parsed.data.reportId,
      totalMonthly: 0,
      totalSavings,
      annualSavings: totalSavings * 12,
      summaryText: 'Your Credex AI spend audit report is ready. Open the link below for per-tool recommendations and savings breakdown.'
    });
  } else {
    await sendLeadConfirmationEmail(parsed.data.email, parsed.data.reportId, totalSavings, intent);
  }

  return NextResponse.json({
    success: true,
    message: 'Lead captured successfully',
    emailSent: true,
    savedToDb
  });
}
