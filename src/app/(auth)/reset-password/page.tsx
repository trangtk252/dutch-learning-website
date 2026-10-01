import type { Metadata } from "next";
import Link from "next/link";
import { ResetForm } from "./reset-form";

export const metadata: Metadata = { title: "Choose a new password" };

export default async function ResetPasswordPage({ searchParams }: PageProps<"/reset-password">) {
  const { token, error } = await searchParams;
  if (typeof token !== "string" || error) {
    return (
      <>
        <h1 className="text-xl font-semibold">Link expired</h1>
        <p className="mt-2 text-sm text-muted">This reset link is invalid or has expired.</p>
        <Link href="/forgot-password" className="mt-6 inline-block text-sm text-primary underline">
          Request a new link
        </Link>
      </>
    );
  }
  return (
    <>
      <h1 className="text-xl font-semibold">Choose a new password</h1>
      <ResetForm token={token} />
    </>
  );
}
