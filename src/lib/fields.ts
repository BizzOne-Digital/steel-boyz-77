import { z } from "zod";

/**
 * One field definition drives both the admin form UI and the server-side Zod
 * validation, so the editor can never submit a shape the API will not accept.
 */
export type FieldDef =
  | { name: string; label: string; type: "text"; max?: number; required?: boolean; help?: string }
  | { name: string; label: string; type: "textarea"; max?: number; required?: boolean; help?: string; rows?: number }
  | { name: string; label: string; type: "link"; required?: boolean; help?: string }
  | { name: string; label: string; type: "image"; folder?: UploadFolder; required?: boolean; help?: string }
  | { name: string; label: string; type: "email" | "phone"; required?: boolean; help?: string }
  | { name: string; label: string; type: "number"; min?: number; max?: number; required?: boolean; help?: string }
  | { name: string; label: string; type: "toggle"; help?: string }
  | { name: string; label: string; type: "select"; options: { value: string; label: string }[]; help?: string }
  | { name: string; label: string; type: "stringList"; max?: number; help?: string }
  | { name: string; label: string; type: "group"; fields: FieldDef[]; help?: string }
  | { name: string; label: string; type: "list"; fields: FieldDef[]; itemLabel?: string; maxItems?: number; help?: string };

export const UPLOAD_FOLDERS = ["products", "gallery", "pages", "misc"] as const;
export type UploadFolder = (typeof UPLOAD_FOLDERS)[number];

/** Internal paths, anchors, https URLs, mailto and tel only. Blocks javascript: and data: URLs. */
export const safeHref = z
  .string()
  .trim()
  .max(500)
  .refine((v) => v === "" || /^(\/(?!\/)|#|https:\/\/|mailto:|tel:)/i.test(v), "Use a path like /contact, #section, https://, mailto: or tel:");

/** Images must be same-origin: bundled /images assets or MongoDB uploads. */
export const safeImage = z
  .string()
  .trim()
  .max(300)
  .refine((v) => v === "" || /^\/(images|api\/uploads)\/[\w\-./]+$/.test(v) && !v.includes(".."), "Upload an image or use a /images/ path");

export function fieldToZod(f: FieldDef): z.ZodTypeAny {
  switch (f.type) {
    case "text":
    case "textarea": {
      let s = z.string().trim().max(f.max ?? (f.type === "text" ? 200 : 5000));
      if (f.required) s = s.min(1, `${f.label} is required`);
      return f.required ? s : s.default("");
    }
    case "link":
      return f.required ? safeHref.refine((v) => v.length > 0, `${f.label} is required`) : safeHref.default("");
    case "image":
      return f.required ? safeImage.refine((v) => v.length > 0, `${f.label} is required`) : safeImage.default("");
    case "email":
      return f.required ? z.string().trim().email().max(200) : z.union([z.literal(""), z.string().trim().email().max(200)]).default("");
    case "phone":
      return f.required
        ? z.string().trim().regex(/^[+\d][\d\s().-]{6,24}$/, "Enter a valid phone number")
        : z.union([z.literal(""), z.string().trim().regex(/^[+\d][\d\s().-]{6,24}$/, "Enter a valid phone number")]).default("");
    case "number": {
      let n = z.number({ message: `${f.label} must be a number` });
      if (f.min !== undefined) n = n.min(f.min);
      if (f.max !== undefined) n = n.max(f.max);
      return z.preprocess(
        (v) => (v === "" || v === null || v === undefined ? null : Number(v)),
        f.required ? n : n.nullable(),
      );
    }
    case "toggle":
      return z.boolean().default(false);
    case "select":
      return z.enum(f.options.map((o) => o.value) as [string, ...string[]]);
    case "stringList":
      return z.array(z.string().trim().max(f.max ?? 300)).max(30).default([]);
    case "group":
      return fieldsToZod(f.fields);
    case "list":
      return z.array(fieldsToZod(f.fields)).max(f.maxItems ?? 30).default([]);
  }
}

export function fieldsToZod(fields: FieldDef[]) {
  const shape: Record<string, z.ZodTypeAny> = {};
  for (const f of fields) shape[f.name] = fieldToZod(f);
  return z.object(shape).strip();
}

export function emptyValue(f: FieldDef): unknown {
  switch (f.type) {
    case "toggle":
      return false;
    case "number":
      return null;
    case "select":
      return f.options[0]?.value ?? "";
    case "stringList":
    case "list":
      return [];
    case "group":
      return emptyRecord(f.fields);
    default:
      return "";
  }
}

export function emptyRecord(fields: FieldDef[]) {
  return Object.fromEntries(fields.map((f) => [f.name, emptyValue(f)]));
}

export function formatZodError(err: z.ZodError) {
  return err.issues.slice(0, 6).map((i) => `${i.path.join(".") || "field"}: ${i.message}`).join("; ");
}
