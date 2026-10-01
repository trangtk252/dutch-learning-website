import { Badge } from "@/components/ui/badge";
import { bucketOf } from "@/lib/srs/fsrs";

export function CardStateBadge({ state, scheduledDays, suspended }: { state: string; scheduledDays: number; suspended?: boolean }) {
  if (suspended) return <Badge>Suspended</Badge>;
  const bucket = bucketOf({ state: state as "NEW", scheduledDays });
  const map = {
    new: <Badge tone="primary">New</Badge>,
    learning: <Badge tone="warning">Learning</Badge>,
    young: <Badge tone="neutral">Young</Badge>,
    mature: <Badge tone="success">Mature</Badge>,
  };
  return map[bucket];
}
