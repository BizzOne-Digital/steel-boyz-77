/**
 * Applies client-supplied content to an already-seeded database.
 * Targeted and idempotent: only touches the fields listed here.
 *
 *   npm run apply-updates
 */
import mongoose from "mongoose";
import { CAM_STEPHENS_BIO, CAM_STEPHENS_PHOTO } from "../src/lib/content/client-copy";
import { LeadershipMember } from "../src/models";

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set");
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });

  const cam = await LeadershipMember.updateOne(
    { name: /^Cam(eron)? Stephens$/i },
    { $set: { bio: CAM_STEPHENS_BIO, image: CAM_STEPHENS_PHOTO } },
  );
  console.log(`  • Cameron Stephens bio + photo: ${cam.matchedCount ? "updated" : "NOT FOUND (add him in Admin > Leadership)"}`);
  console.log("Done. Redeploy (or wait up to 1 hour) for cached pages to show the change.");
}

main()
  .catch((err) => {
    console.error("apply-updates failed:", err.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
