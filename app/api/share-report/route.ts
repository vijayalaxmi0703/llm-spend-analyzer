import { NextResponse } from 'next/server';
import { shareReportSchema } from '@/lib/validation';
import { sendReportEmail } from '@/lib/email';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const limit = checkRateLimit(`share-report:${ip}`, 6, 60_000);
  if (!limit.allowed) {
    return NextResponse.json({ error: 'Too many share requests. Please wait and try again.' }, { status: 429 });
  }

  const body = await request.json();
  const parsed = shareReportSchema.safeParse(body);

  if (!parsed.success || parsed.data.honeypot) {
    return NextResponse.json({ error: 'Invalid submission' }, { status: 422 });
  }

  const sent = await sendReportEmail({
    email: parsed.data.email,
    reportId: parsed.data.reportId,
    totalMonthly: parsed.data.totalMonthly,
    totalSavings: parsed.data.totalSavings,
    annualSavings: parsed.data.totalSavings * 12,
    summaryText:
      parsed.data.summaryText ??
      'Your Credex audit highlights plan-fit and overlap savings across your AI stack.'
  });

  return NextResponse.json({
    success: true,
    emailSent: sent,
    message: sent ? 'Report emailed successfully' : 'Report queued (email service not configured)'
  });
}
