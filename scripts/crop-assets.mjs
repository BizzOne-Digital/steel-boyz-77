import sharp from "sharp";
const src = process.argv[2];
const out = "public/images/";
const jobs = [
  ["branding/logo.png", { left: 98, top: 4, width: 164, height: 156 }],
  ["hero/athletes.webp", { left: 620, top: 96, width: 916, height: 520 }],
  ["about/helmet.webp", { left: 0, top: 708, width: 400, height: 316 }],
  ["backgrounds/stadium-left.webp", { left: 0, top: 96, width: 640, height: 520 }],
];
for (const [file, region] of jobs) {
  let img = sharp(src).extract(region);
  if (file.endsWith(".webp")) img = img.webp({ quality: 82 });
  await img.toFile(out + file);
  console.log("wrote", file);
}
await sharp(src).extract({ left: 98, top: 4, width: 164, height: 156 }).resize(64, 64, { fit: "contain", background: "#050505" }).png().toFile("src/app/icon.png");
await sharp(src).extract({ left: 98, top: 4, width: 164, height: 156 }).resize(180, 180, { fit: "contain", background: "#050505" }).png().toFile("src/app/apple-icon.png");
