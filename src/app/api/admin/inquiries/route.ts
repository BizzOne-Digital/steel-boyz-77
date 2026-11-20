import { z } from "zod";
import { withAdmin, jsonError, jsonOk, audit } from "@/lib/api";
import { connectDB, toPlain } from "@/lib/mongodb";
import { INTEREST_OPTIONS } from "@/lib/constants";
import { getSettings } from "@/lib/data";
import { ContactSubmission } from "@/models";

const query = z.object({
  page: z.coerce.number().int().min(1).max(1000).default(1),
  status: z.enum(["all", "new", "read", "replied"]).default("all"),
  interest: z.enum(["all", ...INTEREST_OPTIONS.map((o) => o.value)] as [string, ...string[]]).default("all"),
  q: z.string().trim().max(100).default(""),
});

const PAGE_SIZE = 20;

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export const GET = withAdmin(async (req) => {
  const url = new URL(req.url);
  const parsed = query.safeParse(Object.fromEntries(url.searchParams));
  if (!parsed.success) return jsonError("Invalid filters");
  const { page, status, interest, q } = parsed.data;

  const filter: Record<string, unknown> = {};
  if (status !== "all") filter.status = status;
  if (interest !== "all") filter.interest = interest;
  if (q) {
    const rx = new RegExp(escapeRegex(q), "i");
    filter.$or = [{ guardianName: rx }, { athleteName: rx }, { email: rx }, { phone: rx }, { message: rx }];
  }

  await connectDB();
  const [items, total] = await Promise.all([
    ContactSubmission.find(filter)
      .select({ submissionKey: 0, __v: 0 })
      .sort({ createdAt: -1 })
      .skip((page - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE)
      .lean(),
    ContactSubmission.countDocuments(filter),
  ]);
  return jsonOk({ items: toPlain(items), total, page, pageSize: PAGE_SIZE });
});

/** Data-retention tool: permanently delete inquiries older than the configured retention period. */
export const DELETE = withAdmin(async (_req, _ctx, admin) => {
  const settings = await getSettings();
  const days = Number(settings.privacy.retentionDays) || 365;
  await connectDB();
  const cutoff = new Date(Date.now() - days * 86400 * 1000);
  const res = await ContactSubmission.deleteMany({ createdAt: { $lt: cutoff } });
  await audit(admin, "purge", "inquiries", "", `Deleted ${res.deletedCount} older than ${days} days`);
  return jsonOk({ deleted: res.deletedCount, days });
});
