"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { deleteMyGrammarTopicAction } from "../actions";
import { useT } from "@/lib/i18n/client";

export function DeleteTopicButton({ id }: { id: string }) {
  const router = useRouter();
  const t = useT();
  const [pending, start] = useTransition();
  return (
    <Button
      variant="secondary"
      size="sm"
      disabled={pending}
      onClick={() => {
        if (!confirm(t("Delete this grammar topic?"))) return;
        start(async () => {
          await deleteMyGrammarTopicAction(id);
          router.push("/grammar");
        });
      }}
    >
      {pending ? t("Deleting…") : t("Delete")}
    </Button>
  );
}
