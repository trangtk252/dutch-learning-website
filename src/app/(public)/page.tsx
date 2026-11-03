import { redirect } from "next/navigation";

/** The home page goes straight into the app (which sends visitors who are not signed in to the login page). */
export default function HomePage() {
  redirect("/dashboard");
}
