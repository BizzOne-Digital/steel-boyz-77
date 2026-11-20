/**
 * End-to-end API tests against a running server.
 *   BASE_URL=http://localhost:3100 ADMIN_EMAIL=... ADMIN_PASSWORD=... npm test
 * Requires a seeded database and an admin account. Creates and cleans up its own test data.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import zlib from "node:zlib";

const BASE = process.env.BASE_URL ?? "http://localhost:3100";
const EMAIL = process.env.ADMIN_EMAIL ?? process.env.ADMIN_SETUP_EMAIL ?? "";
const PASSWORD = process.env.ADMIN_PASSWORD ?? process.env.ADMIN_SETUP_PASSWORD ?? "";
const ORIGIN = { Origin: BASE };
let cookie = "";

async function req(path: string, init: RequestInit & { json?: unknown; auth?: boolean } = {}) {
  const headers: Record<string, string> = { ...ORIGIN, ...(init.headers as Record<string, string>) };
  if (init.json !== undefined) headers["Content-Type"] = "application/json";
  if (init.auth !== false && cookie) headers.Cookie = cookie;
  const res = await fetch(BASE + path, { ...init, headers, body: init.json !== undefined ? JSON.stringify(init.json) : init.body, redirect: "manual" });
  return res;
}

function png(w = 2, h = 2) {
  const crcTable = Array.from({ length: 256 }, (_, n) => {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    return c >>> 0;
  });
  const crc = (b: Buffer) => {
    let c = 0xffffffff;
    for (const x of b) c = crcTable[(c ^ x) & 0xff] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
  };
  const chunk = (type: string, data: Buffer) => {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length);
    const td = Buffer.concat([Buffer.from(type), data]);
    const c = Buffer.alloc(4);
    c.writeUInt32BE(crc(td));
    return Buffer.concat([len, td, c]);
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8;
  ihdr[9] = 2;
  const raw = Buffer.alloc((w * 3 + 1) * h, 0xff);
  return Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), chunk("IHDR", ihdr), chunk("IDAT", zlib.deflateSync(raw)), chunk("IEND", Buffer.alloc(0))]);
}

const SIGS: Record<string, Buffer> = {
  jpeg: Buffer.concat([Buffer.from([0xff, 0xd8, 0xff, 0xe0]), randomBytes(200)]),
  png: png(),
  webp: Buffer.concat([Buffer.from("RIFF"), Buffer.from([0, 0, 0, 0]), Buffer.from("WEBPVP8 "), randomBytes(100)]),
  gif: Buffer.concat([Buffer.from("GIF89a"), randomBytes(100)]),
};

async function upload(buf: Buffer, folder = "gallery", type = "image/png", extra: Record<string, string> = {}) {
  const fd = new FormData();
  fd.append("file", new Blob([new Uint8Array(buf)], { type }), "test.bin");
  fd.append("folder", folder);
  for (const [k, v] of Object.entries(extra)) fd.append(k, v);
  return req("/api/upload", { method: "POST", body: fd });
}

test("public pages render with key content", async () => {
  const pages: [string, string][] = [
    ["/", "DIFFERENT"],
    ["/about", "More Than Football"],
    ["/services", "$35 / hour"],
    ["/our-team", "Cameron Stephens"],
    ["/contact", "sdstephens321@gmail.com"],
    ["/privacy", "Privacy"],
    ["/sitemap.xml", "/our-team"],
    ["/robots.txt", "Disallow: /admin"],
  ];
  for (const [path, text] of pages) {
    const res = await req(path, { auth: false });
    assert.equal(res.status, 200, path);
    assert.ok((await res.text()).includes(text), `${path} contains ${text}`);
  }
  const home = await (await req("/", { auth: false })).text();
  assert.match(home, /<link rel="canonical"/);
  assert.match(home, /og:title/);
  assert.equal((await req("/nope-404", { auth: false })).status, 404);
});

test("admin routes and APIs reject unauthenticated access", async () => {
  const page = await req("/admin", { auth: false });
  assert.ok([307, 308].includes(page.status));
  assert.match(page.headers.get("location") ?? "", /\/admin\/login/);
  for (const p of ["/api/admin/stats", "/api/admin/inquiries", "/api/admin/collections/services"]) {
    assert.equal((await req(p, { auth: false })).status, 401, p);
  }
  assert.equal((await upload(SIGS.png)).status, 401);
  // forged cookie is rejected by the database check
  const forged = await fetch(BASE + "/api/admin/stats", { headers: { Cookie: `sb_admin_session=${"a".repeat(64)}` } });
  assert.equal(forged.status, 401);
});

test("login rejects bad credentials and cross-origin requests", async () => {
  assert.equal((await req("/api/auth/login", { method: "POST", json: { email: EMAIL, password: "wrong-password" } })).status, 401);
  const xo = await fetch(BASE + "/api/auth/login", { method: "POST", headers: { Origin: "https://evil.example", "Content-Type": "application/json" }, body: JSON.stringify({ email: EMAIL, password: PASSWORD }) });
  assert.equal(xo.status, 403);
});

test("login succeeds and sets a secure session cookie", async () => {
  const res = await req("/api/auth/login", { method: "POST", json: { email: EMAIL, password: PASSWORD } });
  assert.equal(res.status, 200);
  const set = res.headers.get("set-cookie") ?? "";
  assert.match(set, /HttpOnly/i);
  assert.match(set, /SameSite=Strict/i);
  cookie = set.split(";")[0];
  const stats = await (await req("/api/admin/stats")).json();
  assert.equal(stats.counts.services, 5);
  assert.equal(stats.counts.teams, 3);
});

test("contact form validates, saves, de-duplicates and filters spam", async () => {
  const key = randomBytes(16).toString("hex");
  const valid = {
    guardianName: `Test Parent ${key.slice(0, 6)}`,
    athleteName: "Test",
    athleteAge: 16,
    email: "parent@example.com",
    phone: "+1 555 000 0000",
    interest: "training",
    product: "",
    message: "Interested in one-on-one training sessions.",
    consent: true,
    website: "",
    submissionKey: key,
    startedAt: Date.now() - 10_000,
  };
  const bad = await req("/api/contact", { method: "POST", json: { ...valid, email: "x", consent: false }, auth: false });
  assert.equal(bad.status, 422);
  const badBody = await bad.json();
  assert.ok(badBody.fieldErrors.email && badBody.fieldErrors.consent);

  assert.equal((await req("/api/contact", { method: "POST", json: valid, auth: false })).status, 201);
  const dup = await (await req("/api/contact", { method: "POST", json: valid, auth: false })).json();
  assert.equal(dup.duplicate, true);
  // honeypot: accepted silently, not stored
  await req("/api/contact", { method: "POST", json: { ...valid, website: "spam", submissionKey: randomBytes(16).toString("hex") }, auth: false });

  const list = await (await req(`/api/admin/inquiries?q=${key.slice(0, 6)}`)).json();
  assert.equal(list.total, 1);
  const id = list.items[0]._id;
  assert.equal(list.items[0].submissionKey, undefined);

  const patched = await (await req(`/api/admin/inquiries/${id}`, { method: "PATCH", json: { status: "replied", internalNotes: "Called back" } })).json();
  assert.equal(patched.item.status, "replied");
  assert.equal((await (await req(`/api/admin/inquiries?interest=training&status=replied&q=${key.slice(0, 6)}`)).json()).total, 1);
  assert.equal((await req(`/api/admin/inquiries/${id}`, { method: "DELETE" })).status, 200);
});

test("uploads: all formats, validation and limits", async () => {
  for (const [name, buf] of Object.entries(SIGS)) {
    const res = await upload(buf, "products");
    const body = await res.json();
    assert.equal(res.status, 201, name);
    assert.match(body.url, /^\/api\/uploads\/products\/\d{13}-[a-f0-9]{16}\.(jpg|png|webp|gif)$/);
    const get = await fetch(BASE + body.url);
    assert.equal(get.status, 200);
    assert.match(get.headers.get("cache-control") ?? "", /immutable/);
    assert.match(get.headers.get("content-type") ?? "", /^image\//);
    assert.equal((await get.arrayBuffer()).byteLength, buf.length);
  }
  assert.equal((await upload(Buffer.from("<script>alert(1)</script>".repeat(10)), "gallery", "image/png")).status, 415);
  assert.equal((await upload(SIGS.png, "../etc")).status, 400);
  assert.equal((await fetch(BASE + "/api/uploads/products/..%2F..%2Fsecret")).status, 404);
  assert.equal((await fetch(BASE + "/api/uploads/products/1700000000000-0000000000000000.png")).status, 404);

  // chunked 5 MB upload (over Vercel's single-request limit) succeeds
  const big = Buffer.concat([SIGS.jpeg, randomBytes(5 * 1024 * 1024)]);
  const uploadId = randomBytes(16).toString("hex");
  const size = 3 * 1024 * 1024;
  const total = Math.ceil(big.length / size);
  let last: { url?: string; size?: number } = {};
  for (let i = 0; i < total; i++) {
    const r = await upload(big.subarray(i * size, (i + 1) * size), "gallery", "image/jpeg", { uploadId, index: String(i), total: String(total) });
    assert.ok(r.ok, `chunk ${i}`);
    last = await r.json();
  }
  assert.equal(last.size, big.length);
  assert.equal((await fetch(BASE + last.url)).status, 200);

  // 9 MB via chunks is rejected
  const huge = Buffer.concat([SIGS.jpeg, randomBytes(9 * 1024 * 1024)]);
  const id2 = randomBytes(16).toString("hex");
  const t2 = Math.ceil(huge.length / size);
  let status = 0;
  for (let i = 0; i < t2; i++) {
    const r = await upload(huge.subarray(i * size, (i + 1) * size), "gallery", "image/jpeg", { uploadId: id2, index: String(i), total: String(t2) });
    status = r.status;
    if (!r.ok) break;
  }
  assert.ok(status === 400 || status === 413, `oversize rejected (${status})`);
});

test("CRUD updates public content; image replacement cleans up the old file", async () => {
  const img1 = (await (await upload(SIGS.png, "products")).json()).url as string;
  const created = await req("/api/admin/collections/merchandise", {
    method: "POST",
    json: { name: "E2E Hoodie", slug: "e2e-hoodie", price: 45, description: "Test item", image: img1, illustrative: false, availability: "inquire", displayOrder: 9, active: true },
  });
  assert.equal(created.status, 201);
  const item = (await created.json()).item;
  assert.ok((await (await req("/", { auth: false })).text()).includes("E2E Hoodie"), "new product visible on homepage");

  // invalid input rejected
  assert.equal((await req("/api/admin/collections/merchandise", { method: "POST", json: { name: "x", slug: "Bad Slug!", price: 1 } })).status, 422);
  assert.equal((await req("/api/admin/collections/merchandise", { method: "POST", json: { ...item, slug: "x2", image: "javascript:alert(1)" } })).status, 422);

  // referenced image cannot be deleted without confirmation
  const media = (await (await req("/api/admin/media?folder=products")).json()).items as { _id: string; url: string }[];
  const m1 = media.find((m) => m.url === img1)!;
  assert.equal((await req(`/api/admin/media/${m1._id}`, { method: "DELETE" })).status, 409);

  // replace image on the product: old upload is removed only after the new one is saved
  const img2 = (await (await upload(SIGS.gif, "products")).json()).url as string;
  const { _id, createdAt, updatedAt, __v, ...rest } = item;
  void createdAt; void updatedAt; void __v;
  assert.equal((await req(`/api/admin/collections/merchandise/${_id}`, { method: "PATCH", json: { ...rest, image: img2 } })).status, 200);
  assert.equal((await fetch(BASE + img1)).status, 404, "old image cleaned up");
  assert.equal((await fetch(BASE + img2)).status, 200);

  // delete product removes it publicly and orphans its image
  assert.equal((await req(`/api/admin/collections/merchandise/${_id}`, { method: "DELETE" })).status, 200);
  assert.ok(!(await (await req("/", { auth: false })).text()).includes("E2E Hoodie"));
  assert.equal((await fetch(BASE + img2)).status, 404);
});

test("page editor and settings update the live site", async () => {
  const home = (await (await req("/api/admin/pages/home")).json()).content;
  const tagline = home.hero.tagline;
  assert.equal((await req("/api/admin/pages/home", { method: "PUT", json: { ...home, hero: { ...home.hero, tagline: "E2E Tagline Check" } } })).status, 200);
  assert.ok((await (await req("/", { auth: false })).text()).includes("E2E Tagline Check"));
  assert.equal((await req("/api/admin/pages/home", { method: "PUT", json: { ...home, sectionOrder: ["bogus"] } })).status, 422);
  await req("/api/admin/pages/home", { method: "PUT", json: { ...home, hero: { ...home.hero, tagline } } });

  const { settings } = await (await req("/api/admin/settings")).json();
  await req("/api/admin/settings", { method: "PUT", json: { ...settings, social: { ...settings.social, twitter: "https://x.com/e2e_test" } } });
  assert.ok((await (await req("/about", { auth: false })).text()).includes("https://x.com/e2e_test"), "social link shown");
  await req("/api/admin/settings", { method: "PUT", json: settings });
  assert.ok(!(await (await req("/about", { auth: false })).text()).includes("e2e_test"), "empty social hidden");
});

test("logout invalidates the session server-side", async () => {
  const old = cookie;
  assert.equal((await req("/api/auth/logout", { method: "POST" })).status, 200);
  const res = await fetch(BASE + "/api/admin/stats", { headers: { Cookie: old } });
  assert.equal(res.status, 401);
});
