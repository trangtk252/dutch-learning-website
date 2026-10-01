import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { SignupForm } from "./signup-form";

export const metadata: Metadata = { title: "Create account" };

export default async function SignupPage() {
  if (await getSession()) redirect("/dashboard");
  return (
    <>
      <h1 className="text-xl font-semibold">Start learning Dutch</h1>
      <p className="mb-6 mt-1 text-sm text-muted">Free account · your data stays yours.</p>
      <SignupForm />
      <p className="mt-6 text-center text-sm text-muted">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-primary underline-offset-2 hover:underline">
          Log in
        </Link>
      </p>
    </>
  );
}
