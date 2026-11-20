import { destroySession } from "@/lib/auth";
import { isSameOrigin } from "@/lib/security";
import { jsonError, jsonOk } from "@/lib/api";

export async function POST(req: Request) {
  if (!isSameOrigin(req)) return jsonError("Invalid request origin", 403);
  try {
    await destroySession();
  } catch (err) {
    console.error("[logout]", err);
  }
  return jsonOk();
}
