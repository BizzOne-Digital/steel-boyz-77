import { after } from "next/server";
import { connectDB, isDbConfigured } from "@/lib/mongodb";
import { clientIp, isSameOrigin, rateLimit } from "@/lib/security";
import { contactSchema } from "@/lib/validation/contact";
import { jsonError, jsonOk } from "@/lib/api";
import { sendInquiryNotification } from "@/lib/mailer";
import { getSettings } from "@/lib/data";
import { siteUrl } from "@/lib/utils";
import { ContactSubmission } from "@/models";

const MIN_FILL_MS = 3000;

export async function POST(req: Request) {
  if (!isSameOrigin(req)) return jsonError("Invalid request origin", 403);
  if (!isDbConfigured()) return jsonError("Inquiries are temporarily unavailable. Please call or email us directly.", 503);

  let body: unknown;
  try {
    const text = await req.text();
    if (text.length > 20_000) return jsonError("Request too large", 413);
    body = JSON.parse(text);
  } catch {
    return jsonError("Invalid request");
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const i of parsed.error.issues) fieldErrors[String(i.path[0])] ??= i.message;
    // Silently accept bot submissions (honeypot / too fast) without storing them.
    if (fieldErrors.website) return jsonOk();
    return jsonError("Please fix the highlighted fields.", 422, { fieldErrors });
  }
  const data = parsed.data;
  if (Date.now() - data.startedAt < MIN_FILL_MS) return jsonOk();

  try {
    await connectDB();
    const limit = await rateLimit("contact", clientIp(req.headers), 5, 600);
    if (!limit.ok) return jsonError("Too many inquiries. Please wait a few minutes or call us directly.", 429);

    // Idempotent: a retried submission with the same key is not stored twice.
    const existing = await ContactSubmission.exists({ submissionKey: data.submissionKey });
    if (existing) return jsonOk({ duplicate: true });

    const doc = await ContactSubmission.create({
      guardianName: data.guardianName,
      athleteName: data.athleteName,
      athleteAge: data.athleteAge,
      email: data.email,
      phone: data.phone,
      interest: data.interest,
      product: data.interest === "merchandise" ? data.product : "",
      message: data.message,
      consent: data.consent,
      submissionKey: data.submissionKey,
    });

    // Notify after responding, so a slow mail server never blocks the visitor.
    after(async () => {
      try {
        const settings = await getSettings();
        const to = settings.notifications.recipient || process.env.CONTACT_NOTIFICATION_EMAIL || "";
        if (!settings.notifications.emailEnabled || !to) return;
        const result = await sendInquiryNotification(to, { ...data, athleteAge: data.athleteAge as number }, `${siteUrl()}/admin/inquiries`);
        await ContactSubmission.updateOne({ _id: doc._id }, { $set: { notification: { attempted: true, ...result } } });
      } catch (err) {
        console.error("[contact notify]", err);
      }
    });

    return jsonOk({}, 201);
  } catch (err) {
    if ((err as { code?: number }).code === 11000) return jsonOk({ duplicate: true });
    console.error("[contact]", err);
    return jsonError("We could not save your inquiry. Please try again or call us directly.", 500);
  }
}
