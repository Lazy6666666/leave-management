import { z } from 'zod';

export const SendEmailSchema = z.object({
  to: z.array(z.string().email()).min(1, 'At least one recipient is required'),
  subject: z.string().min(1, 'Subject is required'),
  html: z.string().optional(),
  text: z.string().optional(),
  from: z
    .object({
      email: z.string().email().optional(),
      name: z.string().optional(),
    })
    .optional(),
});

export type SendEmailInput = z.infer<typeof SendEmailSchema>;

/**
 * Sends an email via SendGrid API v3.
 * Requires SENDGRID_API_KEY in environment. Optionally SENDGRID_FROM_EMAIL and SENDGRID_FROM_NAME.
 */
export async function sendEmail(input: SendEmailInput): Promise<{ id?: string; response: Response }> {
  const parsed = SendEmailSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(
      'Invalid email payload: ' + JSON.stringify(parsed.error.flatten(), null, 2)
    );
  }

  const apiKey = process.env.SENDGRID_API_KEY;
  if (!apiKey) {
    throw new Error('Missing SENDGRID_API_KEY in environment');
  }

  const fromEmail =
    input.from?.email ??
    process.env.SENDGRID_FROM_EMAIL ??
    process.env.FROM_EMAIL ??
    'no-reply@example.com';
  const fromName =
    input.from?.name ??
    process.env.SENDGRID_FROM_NAME ??
    process.env.FROM_NAME ??
    'Leave Management';

  const content: Array<{ type: string; value: string }> = [];
  if (input.text) content.push({ type: 'text/plain', value: input.text });
  if (input.html) content.push({ type: 'text/html', value: input.html });
  if (content.length === 0) content.push({ type: 'text/plain', value: '' });

  const payload = {
    personalizations: [
      {
        to: input.to.map((email) => ({ email })),
      },
    ],
    from: { email: fromEmail, name: fromName },
    subject: input.subject,
    content,
  };

  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(
      `SendGrid error: ${response.status} ${response.statusText} ${text}`
    );
  }

  const messageId = response.headers.get('x-message-id') || response.headers.get('x-request-id') || undefined;
  return { id: messageId || undefined, response };
}

export default { sendEmail };