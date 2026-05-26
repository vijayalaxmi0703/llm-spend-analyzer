import { z } from 'zod';
import { supportedToolKeys } from '@/data/tools';

const toolKeyEnum = z.enum([...supportedToolKeys] as const);

export const toolEntrySchema = z.object({
  id: z.string(),
  toolKey: toolKeyEnum,
  plan: z.string().min(1),
  monthlySpend: z.number().min(0),
  seats: z.number().min(0),
  useCase: z.enum(['coding', 'writing', 'research', 'data', 'mixed'])
});

export const auditPayloadSchema = z.object({
  reportName: z.string().max(128).optional(),
  companyName: z.string().max(128).optional().nullable(),
  role: z.string().max(128).optional().nullable(),
  teamSize: z.number().int().min(1).max(500).optional().nullable(),
  tools: z.array(toolEntrySchema).min(1),
  honeypot: z.string().optional()
});

/** Accepts UUID reports and local fallback IDs */
export const reportIdSchema = z
  .string()
  .min(8)
  .max(80)
  .refine((id) => z.string().uuid().safeParse(id).success || /^local-[a-z0-9-]+$/i.test(id), {
    message: 'Invalid report id'
  });

export const leadSchema = z.object({
  reportId: reportIdSchema,
  email: z.string().email(),
  company: z.string().max(128).optional().nullable(),
  role: z.string().max(128).optional().nullable(),
  teamSize: z.number().int().min(1).max(500).optional().nullable(),
  intent: z.enum(['alerts', 'consultation', 'share']).optional().default('alerts'),
  totalSavings: z.number().min(0).optional(),
  honeypot: z.string().optional()
});

export const shareReportSchema = z.object({
  email: z.string().email(),
  reportId: reportIdSchema,
  totalMonthly: z.number().min(0),
  totalSavings: z.number().min(0),
  summaryText: z.string().max(2000).optional(),
  honeypot: z.string().optional()
});
