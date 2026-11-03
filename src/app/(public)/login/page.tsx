import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { pageTitle } from "@/lib/i18n/server";
import { LoginForm } from "../auth-form";

export const generateMetadata = pageTitle("Log in");

export default async function LoginPage() {
  if (await getSession()) redirect("/dashboard");
  return <div className="px-4 py-12"><LoginForm /></div>;
}
