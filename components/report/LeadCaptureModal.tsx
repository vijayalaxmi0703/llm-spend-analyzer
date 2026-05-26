'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { CheckCircle2, Loader2 } from 'lucide-react';

interface LeadCaptureModalProps {
  open: boolean;
  onClose: () => void;
  reportId: string;
  totalSavings: number;
  intent: 'alerts' | 'consultation' | 'share';
  defaultEmail?: string;
}

export function LeadCaptureModal({
  open,
  onClose,
  reportId,
  totalSavings,
  intent,
  defaultEmail = ''
}: LeadCaptureModalProps) {
  const { push } = useToast();
  const [email, setEmail] = useState(defaultEmail);
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [teamSize, setTeamSize] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const [error, setError] = useState<string | null>(null);

  const isHighSavings = totalSavings > 500;

  const title =
    intent === 'share'
      ? 'Send your audit report'
      : intent === 'consultation'
        ? 'Book a Credex consultation'
        : 'Get optimization alerts';

  const description =
    intent === 'share'
      ? 'We will email your shareable report link and savings summary.'
      : isHighSavings
        ? 'Credex can help reduce these costs further with discounted infrastructure credits.'
        : 'Your stack is already relatively optimized. We will notify you when new savings opportunities appear.';

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('Email is required.');
      return;
    }

    setStatus('loading');

    try {
      const response = await fetch('/api/record-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportId,
          email: email.trim(),
          company: company.trim() || null,
          role: role.trim() || null,
          teamSize: teamSize ? Number(teamSize) : null,
          intent,
          totalSavings,
          honeypot
        }),
        signal: AbortSignal.timeout(20_000)
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? 'Unable to submit. Please try again.');
        setStatus('idle');
        return;
      }

      setStatus('success');
      window.localStorage.setItem('credex-lead-email', email.trim());
      push({
        variant: 'success',
        title:
          intent === 'share'
            ? 'Report sent to your inbox'
            : intent === 'consultation'
              ? 'Consultation request received'
              : "You're on the list",
        description:
          intent === 'share'
            ? 'Check your email for the shareable audit link.'
            : intent === 'consultation'
              ? 'Our team will follow up with infrastructure credit options.'
              : "You're on the list for future AI spend optimization alerts."
      });

      window.setTimeout(() => {
        onClose();
        setStatus('idle');
      }, 1400);
    } catch {
      setError('Network error. Please try again.');
      setStatus('idle');
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={title} description={description}>
      {status === 'success' ? (
        <div className="flex flex-col items-center gap-4 py-8 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/15 text-success">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <p className="text-lg font-semibold text-text-primary">Request received</p>
          <p className="text-sm text-text-muted">
            {intent === 'alerts'
              ? "You're on the list for future AI spend optimization alerts."
              : 'Check your inbox shortly for next steps.'}
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="website"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
            className="hidden"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
          />

          <label className="block space-y-2 text-sm">
            <span className="font-medium text-text-primary">Email *</span>
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="founder@company.com"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-2 text-sm">
              <span className="font-medium text-text-primary">Company</span>
              <Input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Acme Labs" />
            </label>
            <label className="block space-y-2 text-sm">
              <span className="font-medium text-text-primary">Role</span>
              <Input value={role} onChange={(e) => setRole(e.target.value)} placeholder="Founder" />
            </label>
          </div>

          <label className="block space-y-2 text-sm">
            <span className="font-medium text-text-primary">Team size</span>
            <Input
              type="number"
              min={1}
              max={500}
              value={teamSize}
              onChange={(e) => setTeamSize(e.target.value)}
              placeholder="5"
            />
          </label>

          {error ? <p className="text-sm text-error">{error}</p> : null}

          <Button type="submit" className="w-full py-3.5" disabled={status === 'loading'}>
            {status === 'loading' ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending…
              </span>
            ) : (
              'Send My Audit Report'
            )}
          </Button>

          <p className="text-center text-xs text-text-muted">
            Pricing verified against official vendor sources · Updated this week
          </p>
        </form>
      )}
    </Modal>
  );
}
