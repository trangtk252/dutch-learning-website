"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, FormError, Input } from "@/components/ui/form";
import { useT } from "@/lib/i18n/client";
import { loginAction, signupAction } from "./auth-actions";

export function LoginForm() {
  const t = useT();
  const [state, action, pending] = useActionState(loginAction, null);
  return (
    <Card className="mx-auto w-full max-w-sm">
      <h1 className="mb-4 text-xl font-semibold">{t("Log in")}</h1>
      <form action={action} className="grid gap-4">
        <Field id="email" label={t("Email")}>
          <Input id="email" name="email" type="email" autoComplete="email" required />
        </Field>
        <Field id="password" label={t("Password")}>
          <Input id="password" name="password" type="password" autoComplete="current-password" required />
        </Field>
        <FormError message={state?.error} />
        <Button type="submit" disabled={pending}>{t("Log in")}</Button>
      </form>
      <p className="mt-4 text-sm text-muted">
        {t("Have an invite code?")}{" "}
        <Link href="/signup" className="text-primary-strong underline">{t("Create an account")}</Link>
      </p>
    </Card>
  );
}

export function SignupForm() {
  const t = useT();
  const [state, action, pending] = useActionState(signupAction, null);
  return (
    <Card className="mx-auto w-full max-w-sm">
      <h1 className="mb-4 text-xl font-semibold">{t("Create an account")}</h1>
      <form action={action} className="grid gap-4">
        <Field id="invite" label={t("Invite code")}>
          <Input id="invite" name="invite" autoComplete="off" required />
        </Field>
        <Field id="name" label={t("Your name")}>
          <Input id="name" name="name" autoComplete="name" maxLength={80} required />
        </Field>
        <Field id="email" label={t("Email")}>
          <Input id="email" name="email" type="email" autoComplete="email" required />
        </Field>
        <Field id="password" label={t("Password")} hint={t("At least 8 characters.")}>
          <Input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required />
        </Field>
        <FormError message={state?.error} />
        <Button type="submit" disabled={pending}>{t("Create account")}</Button>
      </form>
      <p className="mt-4 text-sm text-muted">
        {t("Already have an account?")}{" "}
        <Link href="/login" className="text-primary-strong underline">{t("Log in")}</Link>
      </p>
    </Card>
  );
}
