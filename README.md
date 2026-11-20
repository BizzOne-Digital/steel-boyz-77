# STEEL BOYZ 7-7 — Website & Admin Portal

Next.js 16 (App Router, Cache Components) · TypeScript · Tailwind CSS 4 · MongoDB Atlas + Mongoose · Zod · Motion

Public site: Home, About Us, Services, Our Team, Contact (+ Privacy). Admin Portal at `/admin`.

---

## 1. Local setup

```bash
npm install
cp .env.example .env.local      # fill in MONGODB_URI, AUTH_SECRET, NEXT_PUBLIC_SITE_URL
npm run seed                    # inserts starter content (safe to re-run, never overwrites edits)
npm run create-admin            # creates the first admin from ADMIN_SETUP_EMAIL / ADMIN_SETUP_PASSWORD
npm run dev                     # http://localhost:3000
```

Generate `AUTH_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

Admin password rules: 12+ characters with uppercase, lowercase, a number and a symbol.
After creating the admin, **remove `ADMIN_SETUP_PASSWORD`** from your environment.
To reset a forgotten password: set the env vars again and run `npm run create-admin -- --reset-password`.

There is no public admin signup and no default password.

## 2. Quality checks

```bash
npm run typecheck
npm run lint
npm run build
# End-to-end API suite against a running, seeded server with an admin account:
BASE_URL=http://localhost:3000 npm test   # reads ADMIN_SETUP_EMAIL / ADMIN_SETUP_PASSWORD from env
```

The e2e suite creates and removes its own test data, so run it against a **test database, never production**.
Note: login is rate-limited (5 attempts per email per 15 min), so running the suite many times in a row will return 429s until the window passes.

## 3. Deploy to Vercel

1. **MongoDB Atlas:** create a cluster and a database user, and allow network access from Vercel (`0.0.0.0/0`, or use the Atlas Vercel integration). Copy the connection string.
2. **Vercel:** import the repository (framework: Next.js; defaults are fine).
3. **Environment variables** (Production + Preview):
   | Variable | Required | Notes |
   |---|---|---|
   | `MONGODB_URI` | Yes | Server-only. Never prefix with `NEXT_PUBLIC_`. |
   | `AUTH_SECRET` | Yes | 32+ random characters. Changing it signs out all admins. |
   | `NEXT_PUBLIC_SITE_URL` | Yes | Final domain, e.g. `https://www.example.com` (canonical URLs, sitemap, OG). |
   | `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM` | Optional | Enables inquiry emails. Without them, inquiries are still saved and shown in Admin. |
   | `CONTACT_NOTIFICATION_EMAIL` | Optional | Fallback recipient. |
4. **Seed + admin (once):** run locally with `MONGODB_URI` pointing at the production database:
   `npm run seed` then `npm run create-admin`. Deployments never touch the database.
5. **Domain:** in Vercel → Project → Domains, add the domain and set the DNS records Vercel shows at your registrar. Then update `NEXT_PUBLIC_SITE_URL` and redeploy.

## 4. How things work

**Content and caching.** Public pages are prerendered. Data is read through `'use cache'` functions tagged per collection (`src/lib/data.ts`). Every admin save calls `revalidateTag(tag, { expire: 0 })`, so the next visitor gets fresh content. If the database is unreachable, the site renders the verified starter content instead of an error page.

**One schema, two jobs.** `src/lib/content/schema.ts` defines every editable field once. The admin UI renders forms from those definitions, and the API validates with Zod schemas built from the same definitions. Links accept only `/path`, `#anchor`, `https://`, `mailto:` and `tel:`. Images must be same-origin. No HTML is ever stored or rendered.

**Image uploads (MongoDB storage).**
- `POST /api/upload` (admin only) with `file` + `folder` (`products|gallery|pages|misc`). It validates magic bytes, allows JPEG, PNG, WEBP and GIF up to 8 MB, and stores the buffer in `StoredUpload` with a unique `(folder, filename)` index.
- **Difference from the original spec:** Vercel rejects request bodies over **4.5 MB**, so one 8 MB request cannot work there. The admin uploader sends files over 3 MB as 3 MB chunks (`uploadId`, `index`, `total`). The server reassembles and validates them, and returns the same `{ success, url, filename, size, folder }` response. Files of 3 MB or less use the single-request contract unchanged.
- `GET /api/uploads/[folder]/[filename]` serves images with a one-year immutable cache. Uploads live in MongoDB, so they survive redeploys.
- On replacement, the new image is saved first. The old upload is deleted only once no other content references it. Media Library deletion refuses images in use unless the admin confirms. "Replace everywhere" re-points every reference before deleting the old file.
- At larger scale, move to GridFS or object storage (e.g. Vercel Blob, S3).

**Security.** bcrypt (cost 12) password hashes. Sessions are random 256-bit tokens stored as HMAC hashes, with 12-hour expiry, TTL cleanup, and HttpOnly, Secure, SameSite=Strict cookies. Same-origin checks run on every mutation. Login, contact and upload rate limits are stored in MongoDB, so they apply across serverless instances. `proxy.ts` is only an early redirect: every admin page and API validates the session against the database. The site also sends security headers (`next.config.ts`).

**Contact form / youth privacy.** The form is parent/guardian-focused and requires consent. It is protected by a honeypot, a minimum fill time, rate limiting, and an idempotency key against double submits. Submissions are never public. Admin → Contact Inquiries supports filtering, search, status, internal notes, deletion, and a retention purge (days are set in Site Settings).

## 5. Content to replace before launch

- **Logo / favicon:** the current logo was cropped from the design screenshot (low resolution). Upload the original logo file in Admin → Site Settings → Branding.
- **Photography:** hero, helmet and team images are interim crops from the design mockup. Replace them with licensed or original photos via each page/collection editor.
- **Merchandise:** the images are SVG mockups and are labeled "Illustrative mockup" on the site. Untick "illustrative" once real product photos are uploaded.
- **Leadership:** show silhouettes until real photos are uploaded. Bios are empty by design. Add them only with client-approved text.
- **Twitter/X URL:** add it in Site Settings → Social links. Empty links stay hidden.
