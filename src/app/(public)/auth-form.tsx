"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, FormError, Input } from "@/components/ui/form";
import { useT } from "@/lib/i18n/client";
import { loginAction, signupAction } from "./auth-actions";

function PasswordInput(props: { autoComplete: string; minLength?: number }) {
  const t = useT();
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <Input id="password" name="password" type={visible ? "text" : "password"} className="pr-10" required {...props} />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? t("Hide password") : t("Show password")}
        aria-pressed={visible}
        className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted hover:text-ink"
      >
        {visible ? <EyeOff size={18} aria-hidden /> : <Eye size={18} aria-hidden />}
      </button>
    </div>
  );
}

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
          <PasswordInput autoComplete="current-password" />
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
          <PasswordInput autoComplete="new-password" minLength={8} />
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
