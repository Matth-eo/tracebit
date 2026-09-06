import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { AuthForm } from "../auth-form";
import { register } from "../actions";

export default async function RegisterPage() {
  const user = await getCurrentUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-6 py-12">
      <section className="w-full max-w-sm rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-zinc-950">Create account</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Start with a secure local account.
        </p>
        <div className="mt-6">
          <AuthForm
            action={register}
            buttonLabel="Create account"
            footerHref="/login"
            footerLabel="Log in"
            footerText="Already have an account?"
            showName
          />
        </div>
      </section>
    </main>
  );
}
