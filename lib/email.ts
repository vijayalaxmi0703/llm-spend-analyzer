const resendKey = process.env.RESEND_API_KEY;
const fromAddress = process.env.RESEND_FROM_ADDRESS;

export function getSiteUrl() {
  const vercel = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null;
  return (process.env.NEXT_PUBLIC_SITE_URL ?? vercel ?? 'http://localhost:3000').replace(/\/$/, '');
}

export function buildReportUrl(reportId: string) {
  return `${getSiteUrl()}/audit/${reportId}`;
}

export function buildTwitterShareUrl(reportId: string, monthlySavings: number) {
  const url = buildReportUrl(reportId);
  const text = `I just audited our AI spend with Credex — potential savings of $${Math.round(monthlySavings)}/mo.`;
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
}

interface ReportEmailPayload {
  email: string;
  reportId: string;
  totalMonthly: number;
  totalSavings: number;
  annualSavings: number;
  summaryText: string;
}

export async function sendReportEmail(payload: ReportEmailPayload): Promise<boolean> {
  if (!resendKey || !fromAddress) {
    console.warn('Resend not configured; skipping email send');
    return false;
  }

  const reportUrl = buildReportUrl(payload.reportId);
  const annualFromMonthly = Number((payload.totalSavings * 12).toFixed(0));

  const html = `
    <div style="font-family: 'Segoe UI', Inter, sans-serif; background:#071120; color:#F8F5F0; padding:32px;">
      <div style="max-width:560px;margin:0 auto;background:#10213F;border:1px solid rgba(214,185,140,0.25);border-radius:16px;padding:32px;">
        <p style="font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#D6B98C;margin:0 0 8px;">Credex Audit</p>
        <h1 style="font-size:24px;margin:0 0 16px;color:#F8F5F0;">Your AI spend audit is ready</h1>
        <p style="font-size:15px;line-height:1.6;color:#A8B3C7;margin:0 0 24px;">${payload.summaryText}</p>
        <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
          <tr>
            <td style="padding:12px 0;border-bottom:1px solid rgba(214,185,140,0.12);color:#A8B3C7;">Current monthly spend</td>
            <td style="padding:12px 0;border-bottom:1px solid rgba(214,185,140,0.12);text-align:right;font-weight:600;color:#D6B98C;">$${payload.totalMonthly.toFixed(0)}</td>
          </tr>
          <tr>
            <td style="padding:12px 0;border-bottom:1px solid rgba(214,185,140,0.12);color:#A8B3C7;">Potential monthly savings</td>
            <td style="padding:12px 0;border-bottom:1px solid rgba(214,185,140,0.12);text-align:right;font-weight:600;color:#22C55E;">$${payload.totalSavings.toFixed(0)}</td>
          </tr>
          <tr>
            <td style="padding:12px 0;color:#A8B3C7;">Annual savings opportunity</td>
            <td style="padding:12px 0;text-align:right;font-weight:700;color:#22C55E;font-size:18px;">$${annualFromMonthly.toLocaleString()}</td>
          </tr>
        </table>
        <a href="${reportUrl}" style="display:inline-block;background:linear-gradient(135deg,#D6B98C,#C8A97E);color:#071120;text-decoration:none;font-weight:700;padding:14px 24px;border-radius:12px;">View full audit report</a>
        <p style="margin:24px 0 0;font-size:12px;color:#A8B3C7;">Credex helps startups reduce AI infrastructure costs with discounted credits and procurement support.</p>
      </div>
    </div>
  `;

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${resendKey}`
      },
      body: JSON.stringify({
        from: fromAddress,
        to: payload.email,
        subject: `Your Credex audit: save up to $${annualFromMonthly.toLocaleString()}/year`,
        html
      }),
      signal: AbortSignal.timeout(10_000)
    });
    return response.ok;
  } catch (error) {
    console.error('Resend email failed', error);
    return false;
  }
}

export async function sendLeadConfirmationEmail(
  email: string,
  reportId: string,
  totalSavings: number,
  intent: 'alerts' | 'consultation' | 'share'
): Promise<boolean> {
  if (!resendKey || !fromAddress) {
    return false;
  }

  const reportUrl = buildReportUrl(reportId);
  const subject =
    intent === 'consultation'
      ? 'Credex consultation request received'
      : intent === 'share'
        ? 'Your Credex audit report link'
        : 'You are on the Credex optimization alerts list';

  const body =
    intent === 'consultation'
      ? `<p>Thanks for requesting a Credex consultation. Our team will review your audit (report <strong>${reportId}</strong>) and follow up with infrastructure credit options.</p>`
      : intent === 'share'
        ? `<p>Your shareable audit report is ready: <a href="${reportUrl}">${reportUrl}</a></p>`
        : `<p>You will receive optimization alerts when new savings opportunities match your stack. Report: <a href="${reportUrl}">${reportUrl}</a></p>`;

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${resendKey}`
      },
      body: JSON.stringify({
        from: fromAddress,
        to: email,
        subject,
        html: `<div style="font-family:sans-serif;color:#111827;">${body}<p>Potential savings identified: <strong>$${totalSavings.toFixed(0)}/mo</strong></p></div>`
      }),
      signal: AbortSignal.timeout(10_000)
    });
    return response.ok;
  } catch {
    return false;
  }
}
