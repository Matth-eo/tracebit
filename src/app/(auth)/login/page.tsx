import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { AuthForm } from "../auth-form";
import { AuthShell } from "../auth-shell";
import { login } from "../actions";

export default async function LoginPage() {
  if (await getCurrentUser()) redirect("/dashboard");
  return <AuthShell mode="login"><AuthForm action={login} buttonLabel="Log in" footerHref="/register" footerLabel="Create an account" footerText="New to Tracebit?" /></AuthShell>;
}
