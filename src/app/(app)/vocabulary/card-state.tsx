"use client";

import { Badge } from "@/components/ui/badge";
import { bucketOf } from "@/lib/srs/fsrs";
import { useT } from "@/lib/i18n/client";

export function CardStateBadge({ state, scheduledDays, suspended }: { state: string; scheduledDays: number; suspended?: boolean }) {
  const t = useT();
  if (suspended) return <Badge>{t("Suspended")}</Badge>;
  const bucket = bucketOf({ state: state as "NEW", scheduledDays });
  const map = {
    new: <Badge tone="primary">{t("New")}</Badge>,
    learning: <Badge tone="warning">{t("Learning")}</Badge>,
    young: <Badge tone="neutral">{t("Young")}</Badge>,
    mature: <Badge tone="success">{t("Mature")}</Badge>,
  };
  return map[bucket];
}
