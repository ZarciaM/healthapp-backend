import { Resend } from "resend";
import { env } from "../../config/env.js";
import logger from "../../utils/logger.js";

const resend = new Resend(env.RESEND_API_KEY);

export async function sendEmail(params: {
  to: string;
  subject: string;
  html: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await resend.emails.send({
      from: env.EMAIL_FROM,
      to: params.to,
      subject: params.subject,
      html: params.html,
    });

    if (error) {
      logger.error(`Failed to send email to ${params.to} | subject: ${params.subject} | error: ${error.message}`);
      return { success: false, error: error.message };
    }

    logger.info(`Email sent successfully to ${params.to} | subject: ${params.subject}`);
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error(`Failed to send email to ${params.to} | subject: ${params.subject} | error: ${message}`);
    return { success: false, error: message };
  }
}
