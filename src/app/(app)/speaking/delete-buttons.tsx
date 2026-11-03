"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteAllConversationsAction, deleteConversationFromListAction } from "./actions";
import { useT } from "@/lib/i18n/client";

export function DeleteConversationButton({ id, title }: { id: string; title: string }) {
  const t = useT();
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      aria-label={t("Delete conversation: {title}", { title })}
      title={t("Delete")}
      onClick={() => confirm(t("Delete this conversation and its report?")) && start(() => deleteConversationFromListAction(id))}
      className="absolute right-3 top-3 z-10 grid size-8 place-items-center rounded-full text-muted hover:bg-danger-soft hover:text-danger disabled:opacity-50"
    >
      <Trash2 aria-hidden className="size-4" />
    </button>
  );
}

export function ClearAllConversations() {
  const t = useT();
  const [pending, start] = useTransition();
  return (
    <Button
      variant="ghost"
      size="sm"
      className="text-danger!"
      disabled={pending}
      onClick={() => confirm(t("Delete ALL previous conversations and their reports? This can't be undone.")) && start(() => deleteAllConversationsAction())}
    >
      {t("Delete all")}
    </Button>
  );
}
