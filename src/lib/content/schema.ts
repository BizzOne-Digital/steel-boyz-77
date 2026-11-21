import type { FieldDef } from "@/lib/fields";

export const ICON_OPTIONS = [
  "football", "dumbbell", "video", "handshake", "users", "star", "shield", "target",
  "trophy", "flame", "zap", "clipboard", "message", "trending", "compass", "award",
].map((v) => ({ value: v, label: v }));

const cta = (name: string, label: string): FieldDef => ({
  name,
  label,
  type: "group",
  fields: [
    { name: "label", label: "Button label", type: "text", max: 40 },
    { name: "href", label: "Button link", type: "link" },
  ],
});

const visible: FieldDef = { name: "visible", label: "Show this section", type: "toggle" };

const seo: FieldDef = {
  name: "seo",
  label: "SEO",
  type: "group",
  fields: [
    { name: "title", label: "Meta title", type: "text", max: 70 },
    { name: "description", label: "Meta description", type: "textarea", max: 170, rows: 2 },
    { name: "ogImage", label: "Social share image", type: "image", folder: "pages" },
  ],
};

const innerHero: FieldDef = {
  name: "hero",
  label: "Page hero",
  type: "group",
  fields: [
    { name: "eyebrow", label: "Eyebrow", type: "text", max: 60 },
    { name: "heading", label: "Heading", type: "text", max: 90, required: true },
    { name: "text", label: "Subheading", type: "textarea", max: 300, rows: 2 },
    { name: "image", label: "Background image", type: "image", folder: "pages" },
  ],
};

const steps: FieldDef = {
  name: "steps",
  label: "Steps",
  type: "list",
  itemLabel: "Step",
  maxItems: 6,
  fields: [
    { name: "title", label: "Title", type: "text", max: 40 },
    { name: "text", label: "Text", type: "textarea", max: 400, rows: 2 },
    { name: "icon", label: "Icon", type: "select", options: ICON_OPTIONS },
  ],
};

export const HOME_SECTION_KEYS = [
  "features", "about", "services", "statement", "process", "teams", "leadership", "merch", "cta",
] as const;

export const PAGE_FIELDS: Record<PageSlug, FieldDef[]> = {
  home: [
    {
      name: "hero",
      label: "Hero",
      type: "group",
      fields: [
        { name: "line1", label: "Headline line 1 (white)", type: "text", max: 20 },
        { name: "line2", label: "Headline line 2 (yellow)", type: "text", max: 20 },
        { name: "line3", label: "Headline line 3 (hashtag)", type: "text", max: 20 },
        { name: "subheadline", label: "Supporting headline", type: "text", max: 60 },
        { name: "tagline", label: "Brand message", type: "text", max: 60 },
        { name: "description", label: "Description", type: "textarea", max: 300, rows: 3 },
        { name: "image", label: "Hero image (desktop)", type: "image", folder: "pages" },
        { name: "mobileImage", label: "Hero image (mobile, portrait crop)", type: "image", folder: "pages" },
        cta("primary", "Primary button"),
        cta("secondary", "Secondary button"),
        cta("tertiary", "Tertiary text link"),
      ],
    },
    {
      name: "sectionOrder",
      label: "Section order",
      type: "stringList",
      max: 20,
      help: `Order of homepage sections. Allowed keys: ${HOME_SECTION_KEYS.join(", ")}.`,
    },
    {
      name: "features",
      label: "Feature strip",
      type: "group",
      fields: [
        visible,
        {
          name: "items",
          label: "Items",
          type: "list",
          itemLabel: "Item",
          maxItems: 6,
          fields: [
            { name: "label", label: "Label", type: "text", max: 40 },
            { name: "icon", label: "Icon", type: "select", options: ICON_OPTIONS },
            { name: "href", label: "Link", type: "link" },
          ],
        },
      ],
    },
    {
      name: "about",
      label: "About preview",
      type: "group",
      fields: [
        visible,
        { name: "eyebrow", label: "Eyebrow", type: "text", max: 40 },
        { name: "heading", label: "Heading (white part)", type: "text", max: 60 },
        { name: "highlight", label: "Heading (yellow part)", type: "text", max: 60 },
        { name: "body", label: "Body (blank line = new paragraph)", type: "textarea", max: 1500, rows: 6 },
        { name: "image", label: "Image", type: "image", folder: "pages" },
        cta("cta", "Button"),
      ],
    },
    {
      name: "services",
      label: "Services preview",
      type: "group",
      fields: [
        visible,
        { name: "eyebrow", label: "Eyebrow", type: "text", max: 40 },
        { name: "heading", label: "Heading", type: "text", max: 60 },
        { name: "text", label: "Text", type: "textarea", max: 400, rows: 2 },
      ],
    },
    {
      name: "statement",
      label: "Brand statement",
      type: "group",
      fields: [
        visible,
        { name: "line1", label: "Line 1 (white)", type: "text", max: 80 },
        { name: "line2", label: "Line 2 (yellow)", type: "text", max: 80 },
        { name: "text", label: "Supporting message", type: "textarea", max: 300, rows: 2 },
        { name: "image", label: "Background image", type: "image", folder: "pages" },
        cta("cta", "Button"),
      ],
    },
    {
      name: "process",
      label: "Development process",
      type: "group",
      fields: [
        visible,
        { name: "eyebrow", label: "Eyebrow", type: "text", max: 40 },
        { name: "heading", label: "Heading", type: "text", max: 60 },
        { name: "text", label: "Text", type: "textarea", max: 400, rows: 2 },
        { name: "note", label: "Footnote", type: "text", max: 200 },
        steps,
      ],
    },
    {
      name: "teams",
      label: "Programs preview",
      type: "group",
      fields: [
        visible,
        { name: "eyebrow", label: "Eyebrow", type: "text", max: 40 },
        { name: "heading", label: "Heading", type: "text", max: 60 },
        { name: "text", label: "Text", type: "textarea", max: 400, rows: 2 },
      ],
    },
    {
      name: "leadership",
      label: "Leadership preview",
      type: "group",
      fields: [
        visible,
        { name: "eyebrow", label: "Eyebrow", type: "text", max: 40 },
        { name: "heading", label: "Heading", type: "text", max: 60 },
        { name: "text", label: "Text", type: "textarea", max: 400, rows: 2 },
        cta("cta", "Button"),
      ],
    },
    {
      name: "merch",
      label: "Merchandise preview",
      type: "group",
      fields: [
        visible,
        { name: "eyebrow", label: "Eyebrow", type: "text", max: 40 },
        { name: "heading", label: "Heading", type: "text", max: 60 },
        { name: "text", label: "Text", type: "textarea", max: 300, rows: 2 },
        { name: "note", label: "Ordering note", type: "text", max: 200 },
      ],
    },
    {
      name: "cta",
      label: "Contact CTA",
      type: "group",
      fields: [
        visible,
        { name: "heading", label: "Heading", type: "text", max: 60 },
        { name: "text", label: "Text", type: "textarea", max: 400, rows: 2 },
        { name: "image", label: "Background image", type: "image", folder: "pages" },
        cta("primary", "Primary button"),
        cta("secondary", "Secondary button"),
      ],
    },
    seo,
  ],
  about: [
    innerHero,
    {
      name: "story",
      label: "Our story",
      type: "group",
      fields: [
        visible,
        { name: "eyebrow", label: "Eyebrow", type: "text", max: 40 },
        { name: "heading", label: "Heading", type: "text", max: 80 },
        { name: "body", label: "Body (blank line = new paragraph)", type: "textarea", max: 3000, rows: 8 },
        { name: "image", label: "Image", type: "image", folder: "pages" },
      ],
    },
    {
      name: "mission",
      label: "Our mission",
      type: "group",
      fields: [
        visible,
        { name: "eyebrow", label: "Eyebrow", type: "text", max: 40 },
        { name: "heading", label: "Heading", type: "text", max: 80 },
        { name: "body", label: "Mission statement", type: "textarea", max: 800, rows: 4 },
      ],
    },
    {
      name: "values",
      label: "What we stand for",
      type: "group",
      fields: [
        visible,
        { name: "eyebrow", label: "Eyebrow", type: "text", max: 40 },
        { name: "heading", label: "Heading", type: "text", max: 80 },
        {
          name: "items",
          label: "Values",
          type: "list",
          itemLabel: "Value",
          maxItems: 8,
          fields: [
            { name: "title", label: "Title", type: "text", max: 40 },
            { name: "text", label: "Text", type: "textarea", max: 300, rows: 2 },
            { name: "icon", label: "Icon", type: "select", options: ICON_OPTIONS },
          ],
        },
      ],
    },
    {
      name: "why",
      label: "Why STEEL BOYZ",
      type: "group",
      fields: [
        visible,
        { name: "eyebrow", label: "Eyebrow", type: "text", max: 40 },
        { name: "heading", label: "Heading", type: "text", max: 80 },
        { name: "body", label: "Intro", type: "textarea", max: 800, rows: 3 },
        { name: "image", label: "Image", type: "image", folder: "pages" },
        {
          name: "points",
          label: "Points",
          type: "list",
          itemLabel: "Point",
          maxItems: 8,
          fields: [
            { name: "title", label: "Title", type: "text", max: 60 },
            { name: "text", label: "Text", type: "textarea", max: 300, rows: 2 },
          ],
        },
      ],
    },
    {
      name: "journey",
      label: "Athlete journey",
      type: "group",
      fields: [
        visible,
        { name: "eyebrow", label: "Eyebrow", type: "text", max: 40 },
        { name: "heading", label: "Heading", type: "text", max: 80 },
        { name: "text", label: "Intro", type: "textarea", max: 400, rows: 2 },
        { name: "note", label: "Footnote", type: "text", max: 200 },
        steps,
      ],
    },
    {
      name: "cta",
      label: "Closing CTA",
      type: "group",
      fields: [
        { name: "heading", label: "Heading", type: "text", max: 80 },
        { name: "text", label: "Text", type: "textarea", max: 300, rows: 2 },
        cta("button", "Button"),
      ],
    },
    seo,
  ],
  services: [
    innerHero,
    {
      name: "intro",
      label: "Intro",
      type: "group",
      fields: [
        { name: "eyebrow", label: "Eyebrow", type: "text", max: 40 },
        { name: "heading", label: "Heading", type: "text", max: 80 },
        { name: "text", label: "Text", type: "textarea", max: 600, rows: 3 },
      ],
    },
    { name: "disclaimer", label: "Recruiting / NIL disclaimer", type: "textarea", max: 800, rows: 3 },
    {
      name: "faq",
      label: "FAQ section",
      type: "group",
      fields: [
        visible,
        { name: "heading", label: "Heading", type: "text", max: 80 },
        { name: "text", label: "Text", type: "textarea", max: 300, rows: 2 },
      ],
    },
    {
      name: "cta",
      label: "Closing CTA",
      type: "group",
      fields: [
        { name: "heading", label: "Heading", type: "text", max: 80 },
        { name: "text", label: "Text", type: "textarea", max: 300, rows: 2 },
        cta("button", "Button"),
      ],
    },
    seo,
  ],
  team: [
    innerHero,
    {
      name: "leadership",
      label: "Leadership section",
      type: "group",
      fields: [
        { name: "eyebrow", label: "Eyebrow", type: "text", max: 40 },
        { name: "heading", label: "Heading", type: "text", max: 80 },
        { name: "text", label: "Text", type: "textarea", max: 400, rows: 2 },
      ],
    },
    {
      name: "programs",
      label: "Programs section",
      type: "group",
      fields: [
        { name: "eyebrow", label: "Eyebrow", type: "text", max: 40 },
        { name: "heading", label: "Heading", type: "text", max: 80 },
        { name: "text", label: "Text", type: "textarea", max: 400, rows: 2 },
      ],
    },
    {
      name: "cta",
      label: "Closing CTA",
      type: "group",
      fields: [
        { name: "heading", label: "Heading", type: "text", max: 80 },
        { name: "text", label: "Text", type: "textarea", max: 300, rows: 2 },
        cta("button", "Button"),
      ],
    },
    seo,
  ],
  contact: [
    innerHero,
    {
      name: "details",
      label: "Contact details block",
      type: "group",
      fields: [
        { name: "heading", label: "Heading", type: "text", max: 80 },
        { name: "text", label: "Text", type: "textarea", max: 400, rows: 2 },
      ],
    },
    {
      name: "form",
      label: "Inquiry form",
      type: "group",
      fields: [
        { name: "heading", label: "Heading", type: "text", max: 80 },
        { name: "text", label: "Intro", type: "textarea", max: 400, rows: 2 },
        { name: "successMessage", label: "Success message", type: "textarea", max: 300, rows: 2 },
      ],
    },
    seo,
  ],
};

export const PAGE_SLUGS = ["home", "about", "services", "team", "contact"] as const;
export type PageSlug = (typeof PAGE_SLUGS)[number];
export const PAGE_LABELS: Record<PageSlug, { label: string; path: string }> = {
  home: { label: "Home", path: "/" },
  about: { label: "About Us", path: "/about" },
  services: { label: "Services", path: "/services" },
  team: { label: "Our Team", path: "/our-team" },
  contact: { label: "Contact", path: "/contact" },
};

/* ------------------------- Collections ------------------------- */

export const COLLECTION_FIELDS = {
  services: [
    { name: "title", label: "Title", type: "text", max: 80, required: true },
    { name: "slug", label: "Slug (used for links, e.g. team-play)", type: "text", max: 60, required: true },
    { name: "shortLabel", label: "Feature strip label", type: "text", max: 40 },
    { name: "icon", label: "Icon", type: "select", options: ICON_OPTIONS },
    { name: "summary", label: "Card summary", type: "textarea", max: 300, rows: 2, required: true },
    { name: "description", label: "Full description", type: "textarea", max: 2000, rows: 5 },
    { name: "benefits", label: "Benefits", type: "stringList", max: 200 },
    { name: "image", label: "Image", type: "image", folder: "pages" },
    { name: "price", label: "Price (USD, leave empty for contact pricing)", type: "number", min: 0, max: 100000 },
    { name: "priceLabel", label: "Price label (e.g. $35 / hour, Contact for team fees)", type: "text", max: 60, required: true },
    { name: "note", label: "Pricing note", type: "textarea", max: 400, rows: 2 },
    { name: "ctaLabel", label: "Button label", type: "text", max: 40 },
    {
      name: "faqs",
      label: "Service FAQs",
      type: "list",
      itemLabel: "FAQ",
      maxItems: 8,
      fields: [
        { name: "question", label: "Question", type: "text", max: 200 },
        { name: "answer", label: "Answer", type: "textarea", max: 1000, rows: 3 },
      ],
    },
    { name: "displayOrder", label: "Display order", type: "number", min: 0, max: 999 },
    { name: "active", label: "Visible on website", type: "toggle" },
  ],
  teams: [
    { name: "name", label: "Team name", type: "text", max: 80, required: true },
    { name: "ageGroup", label: "Age group (e.g. 18U)", type: "text", max: 10, required: true },
    { name: "coach", label: "Coach", type: "text", max: 80 },
    { name: "description", label: "Description", type: "textarea", max: 800, rows: 3 },
    { name: "image", label: "Team photo", type: "image", folder: "gallery" },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: [
        { value: "active", label: "Active" },
        { value: "tba", label: "Details to be announced" },
        { value: "development", label: "Under development" },
      ],
    },
    { name: "displayOrder", label: "Display order", type: "number", min: 0, max: 999 },
    { name: "active", label: "Visible on website", type: "toggle" },
  ],
  leadership: [
    { name: "name", label: "Name", type: "text", max: 80, required: true },
    { name: "role", label: "Role", type: "text", max: 120, required: true },
    { name: "bio", label: "Bio (leave empty until provided)", type: "textarea", max: 1500, rows: 4 },
    { name: "image", label: "Photo (leave empty for silhouette)", type: "image", folder: "gallery" },
    { name: "email", label: "Public email", type: "email" },
    { name: "phone", label: "Public phone", type: "phone" },
    { name: "showOnHome", label: "Show on homepage", type: "toggle" },
    { name: "displayOrder", label: "Display order", type: "number", min: 0, max: 999 },
    { name: "active", label: "Visible on website", type: "toggle" },
  ],
  merchandise: [
    { name: "name", label: "Product name", type: "text", max: 80, required: true },
    { name: "slug", label: "Slug (used for contact preselect)", type: "text", max: 60, required: true },
    { name: "price", label: "Price (USD)", type: "number", min: 0, max: 10000, required: true },
    { name: "description", label: "Description", type: "textarea", max: 600, rows: 2 },
    { name: "image", label: "Image", type: "image", folder: "products" },
    { name: "illustrative", label: "Image is an illustrative mockup (shows a label)", type: "toggle" },
    {
      name: "availability",
      label: "Availability",
      type: "select",
      options: [
        { value: "inquire", label: "Contact to order" },
        { value: "coming-soon", label: "Coming soon" },
        { value: "unavailable", label: "Currently unavailable" },
      ],
    },
    { name: "displayOrder", label: "Display order", type: "number", min: 0, max: 999 },
    { name: "active", label: "Visible on website", type: "toggle" },
  ],
  faqs: [
    { name: "question", label: "Question", type: "text", max: 200, required: true },
    { name: "answer", label: "Answer", type: "textarea", max: 1500, rows: 4, required: true },
    { name: "displayOrder", label: "Display order", type: "number", min: 0, max: 999 },
    { name: "active", label: "Visible on website", type: "toggle" },
  ],
} satisfies Record<string, FieldDef[]>;

export type CollectionKey = keyof typeof COLLECTION_FIELDS;
export const COLLECTION_KEYS = Object.keys(COLLECTION_FIELDS) as CollectionKey[];
export const COLLECTION_META: Record<CollectionKey, { label: string; singular: string; titleField: string }> = {
  services: { label: "Services", singular: "Service", titleField: "title" },
  teams: { label: "Teams", singular: "Team", titleField: "name" },
  leadership: { label: "Leadership", singular: "Leader", titleField: "name" },
  merchandise: { label: "Merchandise", singular: "Product", titleField: "name" },
  faqs: { label: "FAQs", singular: "FAQ", titleField: "question" },
};

/* ------------------------- Settings ------------------------- */

export const SETTINGS_FIELDS: FieldDef[] = [
  {
    name: "branding",
    label: "Branding",
    type: "group",
    fields: [
      { name: "businessName", label: "Business name", type: "text", max: 60, required: true },
      { name: "affiliation", label: "Affiliation line", type: "text", max: 100 },
      { name: "logo", label: "Logo", type: "image", folder: "misc" },
      { name: "favicon", label: "Favicon (square image)", type: "image", folder: "misc" },
    ],
  },
  {
    name: "contact",
    label: "Contact details",
    type: "group",
    fields: [
      { name: "ownerName", label: "Owner name", type: "text", max: 80 },
      { name: "ownerTitle", label: "Owner title", type: "text", max: 80 },
      { name: "email", label: "Primary email", type: "email" },
      { name: "phone", label: "Primary phone", type: "phone" },
      { name: "opsName", label: "Operations contact name", type: "text", max: 80 },
      { name: "opsTitle", label: "Operations contact title", type: "text", max: 120 },
      { name: "opsPhone", label: "Operations phone", type: "phone" },
    ],
  },
  {
    name: "social",
    label: "Social links (empty links are hidden)",
    type: "group",
    fields: [
      { name: "twitter", label: "Twitter / X URL", type: "link" },
      { name: "instagram", label: "Instagram URL", type: "link" },
      { name: "facebook", label: "Facebook URL", type: "link" },
      { name: "tiktok", label: "TikTok URL", type: "link" },
      { name: "youtube", label: "YouTube URL", type: "link" },
      { name: "hudl", label: "Hudl URL", type: "link" },
    ],
  },
  {
    name: "footer",
    label: "Footer",
    type: "group",
    fields: [
      { name: "mission", label: "Short mission statement", type: "textarea", max: 400, rows: 3 },
      { name: "tagline", label: "Footer tagline", type: "text", max: 100 },
    ],
  },
  {
    name: "seo",
    label: "SEO defaults",
    type: "group",
    fields: [
      { name: "titleTemplateSuffix", label: "Title suffix", type: "text", max: 60 },
      { name: "defaultDescription", label: "Default description", type: "textarea", max: 170, rows: 2 },
      { name: "ogImage", label: "Default social share image", type: "image", folder: "misc" },
    ],
  },
  {
    name: "registration",
    label: "Player registration & waivers",
    type: "group",
    help: "Used on the Register page, the Register menu link and the Tryout Registration service.",
    fields: [
      { name: "url", label: "Registration form URL (e.g. Google Form)", type: "link" },
      { name: "buttonLabel", label: "Button label", type: "text", max: 40 },
      { name: "qrImage", label: "QR code image (must point to the same form)", type: "image", folder: "misc" },
    ],
  },
  {
    name: "notifications",
    label: "Inquiry notifications",
    type: "group",
    fields: [
      { name: "emailEnabled", label: "Email the owner about new inquiries (requires SMTP environment variables)", type: "toggle" },
      { name: "recipient", label: "Notification recipient", type: "email" },
    ],
  },
  {
    name: "privacy",
    label: "Privacy & consent",
    type: "group",
    fields: [
      { name: "consentText", label: "Parent / guardian consent checkbox text", type: "textarea", max: 500, rows: 3, required: true },
      { name: "formNotice", label: "Privacy notice under the form", type: "textarea", max: 800, rows: 3 },
      { name: "retentionDays", label: "Inquiry retention (days) used by the purge tool", type: "number", min: 30, max: 3650 },
    ],
  },
];
