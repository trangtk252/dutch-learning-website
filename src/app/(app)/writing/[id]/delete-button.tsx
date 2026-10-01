"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { deleteSubmissionAction } from "../actions";

export function DeleteSubmission({ id }: { id: string }) {
  const [pending, start] = useTransition();
  return (
    <Button
      variant="ghost"
      size="sm"
      className="text-danger!"
      disabled={pending}
      onClick={() => confirm("Delete this text and its feedback?") && start(() => deleteSubmissionAction(id))}
    >
      Delete
    </Button>
  );
}
