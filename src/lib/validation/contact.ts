import { z } from "zod";
import { INTEREST_OPTIONS } from "@/lib/constants";

const interestValues = INTEREST_OPTIONS.map((o) => o.value) as [string, ...string[]];

export const contactSchema = z.object({
  guardianName: z.string().trim().min(2, "Please enter the parent or guardian's name").max(100),
  athleteName: z.string().trim().max(100).default(""),
  athleteAge: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? undefined : Number(v)),
    z.number({ message: "Please enter the athlete's age" }).int("Use a whole number").min(8, "Age must be 8 or older").max(25, "Age must be 25 or younger"),
  ),
  email: z.string().trim().toLowerCase().email("Please enter a valid email address").max(200),
  phone: z
    .string()
    .trim()
    .max(30)
    .refine((v) => v === "" || /^[+\d][\d\s().-]{6,24}$/.test(v), "Please enter a valid phone number")
    .default(""),
  interest: z.enum(interestValues, { message: "Please choose what you are interested in" }),
  product: z.string().trim().max(80).default(""),
  message: z.string().trim().min(10, "Please add a few more details (at least 10 characters)").max(3000, "Message is too long"),
  consent: z.literal(true, { message: "Consent is required to submit this inquiry" }),
  submissionKey: z.string().regex(/^[a-f0-9]{32}$/, "Invalid form token"),
  // Anti-spam: honeypot must stay empty, and the form must not be submitted instantly.
  website: z.string().max(0).optional().default(""),
  startedAt: z.number().int().positive(),
});

export type ContactInput = z.input<typeof contactSchema>;
