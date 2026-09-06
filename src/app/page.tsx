import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export default async function Home() {
  const user = await getCurrentUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-6 py-12">
      <section className="w-full max-w-xl text-center">
        <p className="text-sm font-medium uppercase tracking-wide text-zinc-500">
          Tracebit
        </p>
        <h1 className="mt-3 text-4xl font-semibold text-zinc-950">
          Less friction. More progress.
        </h1>
        <p className="mt-4 text-base leading-7 text-zinc-600">
          Bring your projects, bugs, features, and tasks together in one simple workspace.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link
            className="rounded-md bg-zinc-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800"
            href="/register"
          >
            Create account
          </Link>
          <Link
            className="rounded-md border border-zinc-300 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-100"
            href="/login"
          >
            Log in
          </Link>
        </div>
      </section>
    </main>
  );
}
