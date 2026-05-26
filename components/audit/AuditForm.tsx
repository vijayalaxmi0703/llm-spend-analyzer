'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toolCatalog, toolOptions } from '@/data/tools';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Plus, Trash2, AlertCircle } from 'lucide-react';

const useCaseOptions = [
  { value: 'coding', label: 'Coding' },
  { value: 'writing', label: 'Writing' },
  { value: 'research', label: 'Research' },
  { value: 'data', label: 'Data' },
  { value: 'mixed', label: 'Mixed' }
] as const;

const toolKeys = toolOptions.map((tool) => tool.key) as readonly string[];

const toolEntrySchema = z.object({
  id: z.string(),
  toolKey: z.enum(toolKeys as [string, ...string[]]),
  plan: z.string().min(1),
  monthlySpend: z.number().min(0),
  seats: z.number().min(0),
  useCase: z.enum(['coding', 'writing', 'research', 'data', 'mixed'])
});

const auditSchema = z.object({
  companyName: z.string().max(128).optional().nullable(),
  role: z.string().max(128).optional().nullable(),
  teamSize: z.number().int().min(1).max(500).optional().nullable(),
  tools: z.array(toolEntrySchema).min(1)
});

type AuditFormValues = z.infer<typeof auditSchema>;

const defaultTool = {
  id: 'tool-1',
  toolKey: 'copilot' as const,
  plan: toolCatalog.copilot.default,
  monthlySpend: 120,
  seats: 1,
  useCase: 'coding' as const
};

const STORAGE_KEY = 'credex-audit-form';
const PERSISTENCE_KEY_PREFIX = 'credex-audit-fallback-';

const LOADING_STEPS = [
  'Analyzing subscription overlap…',
  'Calculating potential savings…',
  'Evaluating plan economics…',
  'Generating optimization report…'
] as const;

export function AuditForm() {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [honeypot, setHoneypot] = useState('');

  const form = useForm<AuditFormValues>({
    resolver: zodResolver(auditSchema),
    defaultValues: { companyName: '', role: '', teamSize: 3, tools: [defaultTool] }
  });

  const { control, handleSubmit, watch, setValue, formState } = form;
  const { errors } = formState;
  const { fields, append, remove } = useFieldArray({ control, name: 'tools' });
  const watchedTools = watch('tools');
  const totalMonthly = useMemo(() => watchedTools.reduce((sum, item) => sum + Number(item.monthlySpend || 0), 0), [watchedTools]);

  const vendorOptions = useMemo(
    () => toolOptions.map((tool) => ({ value: tool.key, label: tool.label })),
    []
  );

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as AuditFormValues;
        setValue('companyName', parsed.companyName ?? '');
        setValue('role', parsed.role ?? '');
        setValue('teamSize', parsed.teamSize ?? 3);
        setValue('tools', parsed.tools.length ? parsed.tools : [defaultTool]);
      } catch {
        // ignore invalid saved data
      }
    }
  }, [setValue]);

  const formValues = watch();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(formValues));
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [formValues]);

  useEffect(() => {
    if (!isSubmitting) {
      setLoadingStep(0);
      return;
    }
    const interval = window.setInterval(() => {
      setLoadingStep((step) => (step + 1) % LOADING_STEPS.length);
    }, 1400);
    return () => window.clearInterval(interval);
  }, [isSubmitting]);

  async function onSubmit(values: AuditFormValues) {
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/submit-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, honeypot }),
        signal: AbortSignal.timeout(30_000)
      });

      const data = await response.json();
      if (!response.ok) {
        setSubmitError(data.error ?? 'Unable to generate audit.');
        return;
      }

      const reportId = data.reportId as string;
      const fallbackKey = `${PERSISTENCE_KEY_PREFIX}${reportId}`;

      const fallbackReport = {
        id: reportId,
        company_name: values.companyName ?? null,
        role: values.role ?? null,
        team_size: values.teamSize ?? null,
        total_monthly: data.audit.totalMonthly,
        total_annual: data.audit.totalAnnual,
        total_savings: data.audit.totalSavings,
        efficiency_score: data.audit.efficiencyScore,
        recommendations: data.audit.recommendations,
        tool_breakdowns: data.audit.toolBreakdowns,
        benchmarks: data.audit.benchmarks,
        summary_text: data.summaryText,
        report_data: values.tools
      };

      window.localStorage.setItem(fallbackKey, JSON.stringify(fallbackReport));
      window.localStorage.removeItem(STORAGE_KEY);

      router.push(`/audit/${reportId}`);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'TimeoutError') {
        setSubmitError('The audit request timed out. Please try again.');
      } else {
        setSubmitError('Network error. Please refresh and try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-8 rounded-lg border border-accent-primary/12 bg-card-bg/82 p-6 shadow-soft sm:p-8"
      aria-busy={isSubmitting ? 'true' : 'false'}
      aria-live="polite"
    >
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
      <div className="space-y-3">
        <p className="text-xs uppercase tracking-widest text-accent-primary">Audit Setup</p>
        <h2 className="text-3xl font-bold text-text-primary">Current AI Budget</h2>
        <p className="text-sm text-text-muted mt-2">Enter your AI spend details. All data is private and processed securely.</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <label className="space-y-2.5 text-sm">
          <span className="text-text-primary font-medium">Company (optional)</span>
          <Input {...form.register('companyName')} placeholder="Acme Labs" />
        </label>
        <label className="space-y-2.5 text-sm">
          <span className="text-text-primary font-medium">Role (optional)</span>
          <Input {...form.register('role')} placeholder="Founder / Head of Ops" />
        </label>
      </div>

      <label className="space-y-2.5 text-sm">
        <span className="text-text-primary font-medium">Team size</span>
        <Input
          type="number"
          {...form.register('teamSize', { valueAsNumber: true })}
          min={1}
          max={500}
          placeholder="1"
        />
        {errors.teamSize ? (
          <p role="alert" className="mt-1.5 text-error text-xs font-medium flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {String((errors.teamSize as any)?.message ?? 'Invalid team size')}
          </p>
        ) : null}
      </label>

      <section className="space-y-6 pt-4 border-t border-accent-primary/10">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-text-primary">AI Tools</h3>
            <p className="text-sm text-text-muted mt-1">Add every subscription and API line item that affects your monthly spend.</p>
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() =>
              append({
                id: `tool-${Date.now()}`,
                toolKey: 'copilot',
                plan: toolCatalog.copilot.default,
                monthlySpend: 0,
                seats: 1,
                useCase: 'coding'
              })
            }
          >
            <Plus className="mr-2 h-4 w-4" />
            Add tool
          </Button>
        </div>

        <div className="space-y-4">
          {fields.map((field, index) => (
            <Card key={field.id} className="space-y-5 p-6 border-accent-primary/10 hover:border-accent-primary/20">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-text-primary">Tool {index + 1}</p>
                  <p className="text-xs text-text-muted mt-1">Select the vendor and subscription tier.</p>
                </div>
                <Button type="button" variant="ghost" size="sm" onClick={() => remove(index)} className="text-error hover:text-error hover:bg-error/10">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <label className="space-y-2.5 text-sm">
                  <span className="text-text-primary font-medium block">Tool</span>
                  <Controller
                    control={control}
                    name={`tools.${index}.toolKey` as const}
                    render={({ field: { value, onChange } }) => (
                      <Select
                        key={`tool-${field.id}`}
                        value={value ?? ''}
                        options={vendorOptions}
                        onValueChange={(selected) => {
                          onChange(selected);
                          const selectedTool = toolCatalog[selected as keyof typeof toolCatalog];
                          if (selectedTool) {
                            setValue(`tools.${index}.plan`, selectedTool.default, {
                              shouldDirty: true,
                              shouldTouch: true
                            });
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select tool" />
                        </SelectTrigger>
                        <SelectContent>
                          {toolOptions.map((opt) => (
                            <SelectItem key={opt.key} value={opt.key}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </label>
                <label className="space-y-2.5 text-sm">
                  <span className="text-text-primary font-medium block">Plan</span>
                  <Controller
                    control={control}
                    name={`tools.${index}.plan` as const}
                    render={({ field: ctrlField }) => {
                      const key = (watchedTools[index]?.toolKey ?? 'copilot') as keyof typeof toolCatalog;
                      const availablePlans = toolCatalog[key].plans;
                      const planOptions = availablePlans.map((plan) => ({ value: plan, label: plan }));

                      return (
                        <Select
                          key={`plan-${field.id}-${key}`}
                          value={ctrlField.value ?? ''}
                          options={planOptions}
                          onValueChange={(selected) => ctrlField.onChange(selected)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select plan" />
                          </SelectTrigger>
                          <SelectContent>
                            {availablePlans.map((plan) => (
                              <SelectItem key={`${field.id}-plan-${plan}`} value={plan}>
                                {plan}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      );
                    }}
                  />
                </label>
                <label className="space-y-2.5 text-sm">
                  <span className="text-text-primary font-medium block">Monthly spend</span>
                  <Input
                    type="number"
                    {...form.register(`tools.${index}.monthlySpend` as const, { valueAsNumber: true })}
                    min={0}
                    step={10}
                    placeholder="$0"
                    aria-invalid={Boolean((errors.tools && (errors.tools as any)[index]?.monthlySpend))}
                  />
                  {errors.tools && (errors.tools as any)[index]?.monthlySpend ? (
                    <p role="alert" className="mt-1.5 text-error text-xs font-medium flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {String((errors.tools as any)[index].monthlySpend.message)}
                    </p>
                  ) : null}
                </label>
                <label className="space-y-2.5 text-sm">
                  <span className="text-text-primary font-medium block">Seats</span>
                  <Input
                    type="number"
                    {...form.register(`tools.${index}.seats` as const, { valueAsNumber: true })}
                    min={0}
                    placeholder="1"
                    aria-invalid={Boolean((errors.tools && (errors.tools as any)[index]?.seats))}
                  />
                  {errors.tools && (errors.tools as any)[index]?.seats ? (
                    <p role="alert" className="mt-1.5 text-error text-xs font-medium flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {String((errors.tools as any)[index].seats.message)}
                    </p>
                  ) : null}
                </label>
                <label className="space-y-2.5 text-sm">
                  <span className="text-text-primary font-medium block">Primary use case</span>
                  <Controller
                    control={control}
                    name={`tools.${index}.useCase` as const}
                    render={({ field: ctrlField }) => (
                      <Select
                        value={ctrlField.value ?? ''}
                        options={useCaseOptions.map((opt) => ({ value: opt.value, label: opt.label }))}
                        onValueChange={(selected) => ctrlField.onChange(selected)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select use case" />
                        </SelectTrigger>
                        <SelectContent>
                          {useCaseOptions.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </label>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <div className="grid gap-4 rounded-lg border border-accent-primary/12 bg-elevated/40 p-6 shadow-soft sm:grid-cols-2 pt-6 border-t-2 border-accent-primary/20">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-widest text-text-muted">Monthly Total</p>
          <p className="text-4xl font-bold text-accent-primary">${totalMonthly.toFixed(0)}</p>
        </div>
        <div className="flex flex-col justify-between gap-3">
          <Badge variant={totalMonthly > 1000 ? 'warning' : 'success'}>
            {totalMonthly > 1000 ? '⚠ Spend Review Recommended' : '✓ Lean Stack'}
          </Badge>
          <p className="text-xs leading-relaxed text-text-muted">The audit engine uses this baseline to identify optimization opportunities.</p>
        </div>
      </div>

      {submitError ? (
        <div role="alert" className="rounded-lg border border-error/30 bg-error/10 px-4 py-3.5 text-sm text-error flex items-start gap-3">
          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Audit generation failed</p>
            <p className="text-xs mt-1 opacity-90">{submitError}</p>
          </div>
        </div>
      ) : null}

      {isSubmitting ? (
        <div className="rounded-lg border border-accent-primary/15 bg-elevated/40 px-4 py-3 text-center text-sm text-text-muted">
          {LOADING_STEPS[loadingStep]}
        </div>
      ) : null}

      <Button type="submit" disabled={isSubmitting} className="w-full py-4 text-base font-semibold" aria-disabled={isSubmitting} aria-label="Generate audit">
        {isSubmitting ? (
          <span className="flex flex-col items-center justify-center gap-1 sm:flex-row sm:gap-2">
            <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-100" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
            </svg>
            <span>Generating optimization report…</span>
          </span>
        ) : (
          'Get Instant Audit'
        )}
      </Button>

      <p className="text-center text-xs text-text-muted">
        Form autosaves locally · Rate-limited for abuse protection · Honeypot enabled
      </p>
    </form>
  );
}
