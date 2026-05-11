import { z } from 'zod'
import type { StreamPayload } from '@/types/domain'

const MetricNameSchema = z.enum(['cpu', 'memory', 'network', 'latency', 'throughput', 'errorRate'])
const SeveritySchema = z.enum(['info', 'warning', 'error', 'critical'])

const MetricPointSchema = z.object({
  timestamp: z.number().int().positive(),
  value: z.number().min(0).max(100_000),
  metric: MetricNameSchema,
})

const AlertEventSchema = z.object({
  id: z.string().min(1).max(64),
  timestamp: z.number().int().positive(),
  severity: SeveritySchema,
  metric: MetricNameSchema,
  message: z.string().min(1).max(256),
  value: z.number(),
  threshold: z.number(),
})

const StreamPayloadSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('metric'), data: MetricPointSchema, ts: z.number() }),
  z.object({ type: z.literal('alert'), data: AlertEventSchema, ts: z.number() }),
  z.object({ type: z.literal('heartbeat'), data: z.null(), ts: z.number() }),
])

export function validatePayload(raw: unknown): StreamPayload | null {
  const result = StreamPayloadSchema.safeParse(raw)
  if (!result.success) {
    console.warn('[Validator] Invalid payload:', result.error.flatten())
    return null
  }
  return result.data as StreamPayload
}

export function sanitizeString(value: unknown): string {
  if (typeof value !== 'string') return ''
  return value
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .trim()
    .slice(0, 512)
}
