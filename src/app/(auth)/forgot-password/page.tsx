"use client";

import Link from "next/link";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Field, FormError, Input } from "@/components/ui/form";

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = String(new FormData(e.currentTarget).get("email")).trim();
    setPending(true);
    setError(null);
    const { error } = await authClient.requestPasswordReset({ email, redirectTo: "/reset-password" });
    setPending(false);
    if (error) setError(error.message ?? "Something went wrong. Please try again.");
    else setSent(true);
  }

  return (
    <>
      <h1 className="text-xl font-semibold">Reset your password</h1>
      {sent ? (
        <p role="status" className="mt-4 text-sm text-muted">
          If an account exists for that email, we&apos;ve sent a reset link. It is valid for one hour.
        </p>
      ) : (
        <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
          <FormError message={error} />
          <Field id="email" label="Email">
            <Input id="email" name="email" type="email" autoComplete="email" required />
          </Field>
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Sending…" : "Send reset link"}
          </Button>
        </form>
      )}
      <p className="mt-6 text-center text-sm">
        <Link href="/login" className="text-primary underline-offset-2 hover:underline">
          Back to log in
        </Link>
      </p>
    </>
  );
}
