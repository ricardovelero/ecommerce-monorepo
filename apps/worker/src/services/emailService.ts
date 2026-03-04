import postmark from "postmark";

import { env } from "@/config/env";
import { logger } from "@/lib/logger";

const hasPostmarkConfig = Boolean(env.POSTMARK_SERVER_TOKEN && env.POSTMARK_FROM_EMAIL);

const postmarkClient = hasPostmarkConfig
  ? new postmark.ServerClient(env.POSTMARK_SERVER_TOKEN!)
  : null;

export async function sendOrderConfirmationEmail(input: {
  to: string;
  orderId: string;
  totalCents: number;
  currency: string;
}): Promise<void> {
  if (!postmarkClient || !env.POSTMARK_FROM_EMAIL) {
    logger.info({ userEmail: input.to, orderId: input.orderId }, "Skipping order confirmation email: Postmark not configured");
    return;
  }

  await postmarkClient.sendEmail({
    From: env.POSTMARK_FROM_EMAIL,
    To: input.to,
    Subject: `Order confirmation #${input.orderId.slice(0, 10)}`,
    HtmlBody: `<p>Thanks for your purchase.</p><p>Order: <strong>${input.orderId}</strong></p><p>Total: ${(
      input.totalCents / 100
    ).toFixed(2)} ${input.currency}</p>`,
    TextBody: `Thanks for your purchase. Order ${input.orderId}. Total: ${(input.totalCents / 100).toFixed(2)} ${input.currency}`,
  });
}
