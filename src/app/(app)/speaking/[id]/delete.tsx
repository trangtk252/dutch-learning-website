"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { deleteConversationAction } from "../actions";
import { useT } from "@/lib/i18n/client";

export function DeleteConversation({ id }: { id: string }) {
  const t = useT();
  const [pending, start] = useTransition();
  return (
    <Button variant="ghost" size="sm" className="text-danger!" disabled={pending} onClick={() => confirm(t("Delete this conversation and its report?")) && start(() => deleteConversationAction(id))}>
      {t("Delete")}
    </Button>
  );
}
