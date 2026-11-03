import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { pageTitle } from "@/lib/i18n/server";
import { SignupForm } from "../auth-form";

export const generateMetadata = pageTitle("Create an account");

export default async function SignupPage() {
  if (await getSession()) redirect("/dashboard");
  return <div className="px-4 py-12"><SignupForm /></div>;
}
