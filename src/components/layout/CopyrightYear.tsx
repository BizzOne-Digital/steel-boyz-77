"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/** Current year from the visitor's clock, so a long-lived static shell never shows a stale year. */
export function CopyrightYear() {
  const year = useSyncExternalStore(
    subscribe,
    () => new Date().getFullYear(),
    () => null,
  );
  return <span suppressHydrationWarning>{year ?? ""}</span>;
}
