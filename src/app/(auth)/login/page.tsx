import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Log in" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  if (await getSession()) redirect("/dashboard");
  const { next, reset } = await searchParams;
  const safeNext = typeof next === "string" && next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
  return (
    <>
      <h1 className="text-xl font-semibold">Welkom terug</h1>
      <p className="mb-6 mt-1 text-sm text-muted">Log in to continue learning.</p>
      {reset === "1" && (
        <p role="status" className="mb-4 rounded-xl bg-success-soft px-3 py-2 text-sm text-success">
          Your password was changed. Please log in.
        </p>
      )}
      <LoginForm next={safeNext} />
      <p className="mt-6 text-center text-sm text-muted">
        New here?{" "}
        <Link href="/signup" className="font-medium text-primary underline-offset-2 hover:underline">
          Create an account
        </Link>
      </p>
    </>
  );
}
