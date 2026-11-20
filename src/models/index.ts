import { Schema } from "mongoose";
import { defineModel } from "./_util";

/* ---------------- Admin auth ---------------- */

const AdminUserSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, lowercase: true, trim: true, unique: true, maxlength: 200 },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ["owner", "admin"], default: "admin" },
    lastLoginAt: Date,
  },
  { timestamps: true },
);
export const AdminUser = defineModel("AdminUser", AdminUserSchema);

const AdminSessionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "AdminUser", required: true, index: true },
    sessionTokenHash: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
    userAgent: { type: String, maxlength: 300 },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);
// MongoDB removes expired sessions automatically.
AdminSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
export const AdminSession = defineModel("AdminSession", AdminSessionSchema);

/* ---------------- Content ---------------- */

const PageSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, enum: ["home", "about", "services", "team", "contact"] },
    title: { type: String, required: true, maxlength: 100 },
    // Validated against PAGE_FIELDS (Zod) before every write. Plain text only, never HTML.
    content: { type: Schema.Types.Mixed, default: {} },
    published: { type: Boolean, default: true },
  },
  { timestamps: true, minimize: false },
);
export const Page = defineModel("Page", PageSchema);

const SiteSettingsSchema = new Schema(
  {
    key: { type: String, default: "site", unique: true },
    branding: { type: Schema.Types.Mixed, default: {} },
    contact: { type: Schema.Types.Mixed, default: {} },
    social: { type: Schema.Types.Mixed, default: {} },
    footer: { type: Schema.Types.Mixed, default: {} },
    seo: { type: Schema.Types.Mixed, default: {} },
    notifications: { type: Schema.Types.Mixed, default: {} },
    privacy: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true, minimize: false },
);
export const SiteSettingsModel = defineModel("SiteSettings", SiteSettingsSchema);

const ServiceSchema = new Schema(
  {
    title: { type: String, required: true, maxlength: 80 },
    slug: { type: String, required: true, unique: true, lowercase: true, maxlength: 60 },
    shortLabel: { type: String, default: "" },
    icon: { type: String, default: "football" },
    summary: { type: String, default: "" },
    description: { type: String, default: "" },
    benefits: { type: [String], default: [] },
    image: { type: String, default: "" },
    price: { type: Number, default: null },
    priceLabel: { type: String, default: "" },
    note: { type: String, default: "" },
    ctaLabel: { type: String, default: "" },
    faqs: { type: [{ question: String, answer: String, _id: false }], default: [] },
    displayOrder: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);
ServiceSchema.index({ active: 1, displayOrder: 1 });
export const Service = defineModel("Service", ServiceSchema);

const TeamSchema = new Schema(
  {
    name: { type: String, required: true, maxlength: 80 },
    ageGroup: { type: String, required: true, maxlength: 10 },
    coach: { type: String, default: "" },
    image: { type: String, default: "" },
    description: { type: String, default: "" },
    status: { type: String, enum: ["active", "tba", "development"], default: "tba" },
    displayOrder: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);
TeamSchema.index({ active: 1, displayOrder: 1 });
export const Team = defineModel("Team", TeamSchema);

const LeadershipMemberSchema = new Schema(
  {
    name: { type: String, required: true, maxlength: 80 },
    role: { type: String, required: true, maxlength: 120 },
    image: { type: String, default: "" },
    bio: { type: String, default: "" },
    email: { type: String, default: "" },
    phone: { type: String, default: "" },
    showOnHome: { type: Boolean, default: true },
    displayOrder: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);
LeadershipMemberSchema.index({ active: 1, displayOrder: 1 });
export const LeadershipMember = defineModel("LeadershipMember", LeadershipMemberSchema);

const MerchandiseSchema = new Schema(
  {
    name: { type: String, required: true, maxlength: 80 },
    slug: { type: String, required: true, unique: true, lowercase: true, maxlength: 60 },
    image: { type: String, default: "" },
    illustrative: { type: Boolean, default: false },
    price: { type: Number, required: true, min: 0 },
    description: { type: String, default: "" },
    availability: { type: String, enum: ["inquire", "coming-soon", "unavailable"], default: "inquire" },
    displayOrder: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);
MerchandiseSchema.index({ active: 1, displayOrder: 1 });
export const Merchandise = defineModel("Merchandise", MerchandiseSchema);

const FAQSchema = new Schema(
  {
    question: { type: String, required: true, maxlength: 200 },
    answer: { type: String, required: true, maxlength: 1500 },
    displayOrder: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);
FAQSchema.index({ active: 1, displayOrder: 1 });
export const FAQ = defineModel("FAQ", FAQSchema);

/* ---------------- Inquiries ---------------- */

const ContactSubmissionSchema = new Schema(
  {
    guardianName: { type: String, required: true, maxlength: 100 },
    athleteName: { type: String, default: "", maxlength: 100 },
    athleteAge: { type: Number, default: null },
    email: { type: String, required: true, maxlength: 200 },
    phone: { type: String, default: "", maxlength: 30 },
    interest: { type: String, required: true },
    product: { type: String, default: "", maxlength: 80 },
    message: { type: String, required: true, maxlength: 3000 },
    consent: { type: Boolean, required: true },
    status: { type: String, enum: ["new", "read", "replied"], default: "new", index: true },
    internalNotes: { type: String, default: "", maxlength: 5000 },
    submissionKey: { type: String, required: true, unique: true },
    notification: {
      attempted: { type: Boolean, default: false },
      sent: { type: Boolean, default: false },
      error: { type: String, default: "" },
    },
  },
  { timestamps: true },
);
ContactSubmissionSchema.index({ createdAt: -1 });
ContactSubmissionSchema.index({ interest: 1, createdAt: -1 });
export const ContactSubmission = defineModel("ContactSubmission", ContactSubmissionSchema);

/* ---------------- Media ---------------- */

const StoredUploadSchema = new Schema(
  {
    folder: { type: String, required: true, enum: ["products", "gallery", "pages", "misc"] },
    filename: { type: String, required: true, maxlength: 120 },
    originalName: { type: String, default: "", maxlength: 200 },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    // Excluded from every query by default; only the delivery route selects it.
    data: { type: Buffer, required: true, select: false },
  },
  { timestamps: true },
);
StoredUploadSchema.index({ folder: 1, filename: 1 }, { unique: true });
StoredUploadSchema.index({ createdAt: -1 });
export const StoredUpload = defineModel("StoredUpload", StoredUploadSchema);

/** Temporary chunks for uploads larger than the serverless request-body limit. */
const UploadChunkSchema = new Schema({
  uploadId: { type: String, required: true },
  index: { type: Number, required: true },
  total: { type: Number, required: true },
  adminId: { type: String, required: true },
  data: { type: Buffer, required: true },
  createdAt: { type: Date, default: Date.now },
});
UploadChunkSchema.index({ uploadId: 1, index: 1 }, { unique: true });
UploadChunkSchema.index({ createdAt: 1 }, { expireAfterSeconds: 3600 });
export const UploadChunk = defineModel("UploadChunk", UploadChunkSchema);

/* ---------------- Ops ---------------- */

const AuditLogSchema = new Schema({
  adminId: { type: Schema.Types.ObjectId, ref: "AdminUser" },
  adminEmail: { type: String, default: "" },
  action: { type: String, required: true },
  resource: { type: String, required: true },
  resourceId: { type: String, default: "" },
  summary: { type: String, default: "" },
  timestamp: { type: Date, default: Date.now },
});
AuditLogSchema.index({ timestamp: -1 });
export const AuditLog = defineModel("AuditLog", AuditLogSchema);

/** Fixed-window counters shared across serverless instances. */
const RateLimitSchema = new Schema({
  key: { type: String, required: true, unique: true },
  count: { type: Number, default: 0 },
  expiresAt: { type: Date, required: true },
});
RateLimitSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
export const RateLimit = defineModel("RateLimit", RateLimitSchema);
