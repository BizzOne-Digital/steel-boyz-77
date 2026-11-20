import "server-only";
import nodemailer from "nodemailer";
import { INTEREST_OPTIONS } from "@/lib/constants";

export function isSmtpConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_USER && process.env.SMTP_PASSWORD && process.env.SMTP_FROM);
}

type Inquiry = {
  guardianName: string;
  athleteName: string;
  athleteAge: number;
  email: string;
  phone: string;
  interest: string;
  product: string;
  message: string;
};

/** Returns the real delivery outcome. Never reports success it did not get. */
export async function sendInquiryNotification(to: string, inquiry: Inquiry, adminUrl: string): Promise<{ sent: boolean; error: string }> {
  if (!isSmtpConfigured()) return { sent: false, error: "SMTP not configured" };
  try {
    const port = Number(process.env.SMTP_PORT);
    const transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD },
    });
    const interest = INTEREST_OPTIONS.find((o) => o.value === inquiry.interest)?.label ?? inquiry.interest;
    // Plain text only: user input is never interpolated into HTML.
    const text = [
      "New inquiry from the STEEL BOYZ 7-7 website",
      "",
      `Parent / Guardian: ${inquiry.guardianName}`,
      `Athlete: ${inquiry.athleteName || "(not provided)"}, age ${inquiry.athleteAge}`,
      `Email: ${inquiry.email}`,
      `Phone: ${inquiry.phone || "(not provided)"}`,
      `Interested in: ${interest}${inquiry.product ? ` (${inquiry.product})` : ""}`,
      "",
      inquiry.message,
      "",
      `Manage this inquiry: ${adminUrl}`,
    ].join("\n");
    const info = await transport.sendMail({
      from: process.env.SMTP_FROM,
      to,
      replyTo: inquiry.email,
      subject: `New inquiry: ${interest} (${inquiry.guardianName.replace(/[\r\n]/g, " ")})`,
      text,
    });
    return { sent: info.accepted.length > 0, error: info.accepted.length ? "" : "Recipient rejected" };
  } catch (err) {
    return { sent: false, error: (err as Error).message.slice(0, 200) };
  }
}
