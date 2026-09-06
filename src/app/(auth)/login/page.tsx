import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { AuthForm } from "../auth-form";
import { login } from "../actions";

export default async function LoginPage() {
  const user = await getCurrentUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-6 py-12">
      <section className="w-full max-w-sm rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-zinc-950">Log in</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Access your bug tracker workspace.
        </p>
        <div className="mt-6">
          <AuthForm
            action={login}
            buttonLabel="Log in"
            footerHref="/register"
            footerLabel="Create one"
            footerText="Need an account?"
          />
        </div>
      </section>
    </main>
  );
}
