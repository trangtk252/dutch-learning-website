"use client";

import { useSyncExternalStore } from "react";

const noop = () => () => {};

/** True after hydration; false during SSR. Avoids setState-in-effect for browser-only checks. */
export function useIsClient() {
  return useSyncExternalStore(noop, () => true, () => false);
}
