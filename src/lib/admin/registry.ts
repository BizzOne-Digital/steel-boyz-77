import "server-only";
import type { Model } from "mongoose";
import { COLLECTION_FIELDS, type CollectionKey } from "@/lib/content/schema";
import { fieldsToZod } from "@/lib/fields";
import { FAQ, LeadershipMember, Merchandise, Service, Team } from "@/models";
import { TAGS } from "@/lib/api";

export const REGISTRY: Record<CollectionKey, { model: Model<unknown>; tag: string; sort: Record<string, 1 | -1> }> = {
  services: { model: Service, tag: TAGS.services, sort: { displayOrder: 1 } },
  teams: { model: Team, tag: TAGS.teams, sort: { displayOrder: 1 } },
  leadership: { model: LeadershipMember, tag: TAGS.leadership, sort: { displayOrder: 1 } },
  merchandise: { model: Merchandise, tag: TAGS.merchandise, sort: { displayOrder: 1 } },
  faqs: { model: FAQ, tag: TAGS.faqs, sort: { displayOrder: 1 } },
};

export function isCollectionKey(v: string): v is CollectionKey {
  return v in REGISTRY;
}

const slugRule = (v: Record<string, unknown>) => !("slug" in v) || /^[a-z0-9]+(-[a-z0-9]+)*$/.test(String(v.slug));

export function collectionSchema(key: CollectionKey) {
  return fieldsToZod(COLLECTION_FIELDS[key]).refine(slugRule, { message: "Slug may only contain lowercase letters, numbers and dashes", path: ["slug"] });
}
