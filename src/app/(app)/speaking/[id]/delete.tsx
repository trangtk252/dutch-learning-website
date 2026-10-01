"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { deleteConversationAction } from "../actions";

export function DeleteConversation({ id }: { id: string }) {
  const [pending, start] = useTransition();
  return (
    <Button variant="ghost" size="sm" className="text-danger!" disabled={pending} onClick={() => confirm("Delete this conversation and its report?") && start(() => deleteConversationAction(id))}>
      Delete
    </Button>
  );
}
