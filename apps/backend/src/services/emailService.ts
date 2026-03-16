import type { FulfillmentStatus } from "@prisma/client";
import { ServerClient } from "postmark";

import { env } from "@/config/env";
import { logger } from "@/lib/logger";

function formatFulfillmentStatus(status: FulfillmentStatus): string {
  return status
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&#39;");
}

const hasPostmarkConfig = Boolean(env.POSTMARK_SERVER_TOKEN && env.POSTMARK_FROM_EMAIL);

type InfoLogger = {
  info: (payload: object, message: string) => void;
};

export function createEmailService(deps: {
  postmarkClient: Pick<ServerClient, "sendEmail"> | null;
  fromEmail: string | null;
  loggerInstance: InfoLogger;
} = {
  postmarkClient: hasPostmarkConfig ? new ServerClient(env.POSTMARK_SERVER_TOKEN!) : null,
  fromEmail: env.POSTMARK_FROM_EMAIL ?? null,
  loggerInstance: logger,
}) {
  return {
    async sendOrderFulfillmentEmail(input: {
      to: string;
      orderId: string;
      fulfillmentStatus: FulfillmentStatus;
      trackingNumber: string | null;
      trackingUrl: string | null;
    }): Promise<void> {
      if (!deps.postmarkClient || !deps.fromEmail) {
        deps.loggerInstance.info(
          { userEmail: input.to, orderId: input.orderId },
          "Skipping order fulfillment email: Postmark not configured",
        );
        return;
      }

      const formattedStatus = formatFulfillmentStatus(input.fulfillmentStatus);
      const htmlParts = [
        "<p>Your order fulfillment status has been updated.</p>",
        `<p>Order: <strong>${escapeHtml(input.orderId)}</strong></p>`,
        `<p>Fulfillment status: <strong>${escapeHtml(formattedStatus)}</strong></p>`,
      ];
      const textParts = [
        "Your order fulfillment status has been updated.",
        `Order: ${input.orderId}`,
        `Fulfillment status: ${formattedStatus}`,
      ];

      if (input.trackingNumber) {
        htmlParts.push(`<p>Tracking number: <strong>${escapeHtml(input.trackingNumber)}</strong></p>`);
        textParts.push(`Tracking number: ${input.trackingNumber}`);
      }

      if (input.trackingUrl) {
        htmlParts.push(
          `<p>Tracking link: <a href="${escapeHtml(input.trackingUrl)}">${escapeHtml(input.trackingUrl)}</a></p>`,
        );
        textParts.push(`Tracking link: ${input.trackingUrl}`);
      }

      await deps.postmarkClient.sendEmail({
        From: deps.fromEmail,
        To: input.to,
        Subject: `Order update #${input.orderId.slice(0, 10)}: ${formattedStatus}`,
        HtmlBody: htmlParts.join(""),
        TextBody: textParts.join("\n"),
      });
    },
  };
}

const emailService = createEmailService();

export const sendOrderFulfillmentEmail = emailService.sendOrderFulfillmentEmail;
