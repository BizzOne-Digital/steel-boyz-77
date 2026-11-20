import { withAdmin, jsonOk } from "@/lib/api";
import { connectDB, toPlain } from "@/lib/mongodb";
import { AuditLog, ContactSubmission, FAQ, LeadershipMember, Merchandise, Service, StoredUpload, Team } from "@/models";

export const GET = withAdmin(async () => {
  await connectDB();
  const [inquiries, newInquiries, services, teams, leadership, merchandise, faqs, media, recent, latestInquiries] = await Promise.all([
    ContactSubmission.countDocuments(),
    ContactSubmission.countDocuments({ status: "new" }),
    Service.countDocuments(),
    Team.countDocuments(),
    LeadershipMember.countDocuments(),
    Merchandise.countDocuments(),
    FAQ.countDocuments(),
    StoredUpload.countDocuments(),
    AuditLog.find().sort({ timestamp: -1 }).limit(10).select({ adminEmail: 1, action: 1, resource: 1, summary: 1, timestamp: 1 }).lean(),
    ContactSubmission.find().sort({ createdAt: -1 }).limit(5).select({ guardianName: 1, interest: 1, status: 1, createdAt: 1 }).lean(),
  ]);
  return jsonOk({
    counts: { inquiries, newInquiries, services, teams, leadership, merchandise, faqs, media },
    recent: toPlain(recent),
    latestInquiries: toPlain(latestInquiries),
  });
});
