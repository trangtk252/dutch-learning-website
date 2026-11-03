"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { deleteSubmissionAction } from "../actions";
import { useT } from "@/lib/i18n/client";

export function DeleteSubmission({ id }: { id: string }) {
  const [pending, start] = useTransition();
  const t = useT();
  return (
    <Button
      variant="ghost"
      size="sm"
      className="text-danger!"
      disabled={pending}
      onClick={() => confirm(t("Delete this text and its feedback?")) && start(() => deleteSubmissionAction(id))}
    >
      {t("Delete")}
    </Button>
  );
}
