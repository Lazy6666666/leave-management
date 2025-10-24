import { z } from 'zod';
import { sendEmail, SendEmailSchema } from '@/lib/notifications/sendgrid';
import { notificationService } from '@/lib/services/notification-service';

const NotificationTypeSchema = z.enum([
  'leave_request',
  'leave_approved',
  'leave_rejected',
  'leave_cancelled',
  'system',
  'reminder',
]);

const InAppSchema = z.object({
  userId: z.string().min(1),
  type: NotificationTypeSchema,
  title: z.string().min(1),
  message: z.string().min(1),
  data: z.record(z.string(), z.any()).optional(),
});

const NotifySchema = z
  .object({
    email: SendEmailSchema.optional(),
    inApp: InAppSchema.optional(),
  })
  .refine((d) => !!(d.email || d.inApp), {
    message: 'Provide at least one of email or inApp payload',
    path: ['email'],
  });

export async function POST(req: Request): Promise<Response> {
  try {
    const json = await req.json();
    const parsed = NotifySchema.safeParse(json);
    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: parsed.error.flatten() }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const results: Record<string, unknown> = {};

    if (parsed.data.email) {
      const { id } = await sendEmail(parsed.data.email);
      results.email = { id };
    }

    if (parsed.data.inApp) {
      const created = await notificationService.createNotification({
        userId: parsed.data.inApp.userId,
        type: parsed.data.inApp.type,
        title: parsed.data.inApp.title,
        message: parsed.data.inApp.message,
        data: parsed.data.inApp.data,
        read: false,
      });
      results.inApp = { id: created.id };
    }

    return new Response(
      JSON.stringify({ ok: true, results }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Notify route error:', error);
    return new Response(
      JSON.stringify({ error: error?.message ?? 'Unknown error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}