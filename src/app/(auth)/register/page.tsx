import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { AuthForm } from "../auth-form";
import { AuthShell } from "../auth-shell";
import { register } from "../actions";

export default async function RegisterPage() {
  if (await getCurrentUser()) redirect("/dashboard");
  return <AuthShell mode="register"><AuthForm action={register} buttonLabel="Create account" footerHref="/login" footerLabel="Log in" footerText="Already have an account?" showName /></AuthShell>;
}
