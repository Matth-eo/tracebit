import { redirect } from "next/navigation";
import { logout } from "@/app/(auth)/actions";
import { ProjectForm } from "@/app/dashboard/project-form";
import { getCurrentUser } from "@/lib/auth";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-10">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between border-b border-zinc-200 pb-6">
        <div>
          <p className="text-sm font-medium text-zinc-500">Dashboard</p>
          <h1 className="mt-1 text-3xl font-semibold text-zinc-950">
            Welcome, {user.name}
          </h1>
        </div>
        <form action={logout}>
          <button
            className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-800 transition hover:bg-zinc-100"
            type="submit"
          >
            Log out
          </button>
        </form>
      </div>
      <section className="mx-auto mt-10 w-full max-w-5xl">
        <div className="max-w-xl rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-zinc-950">Create a project</h2>
            <p className="mt-1 text-sm text-zinc-600">
              Projects are private to your account for now.
            </p>
          </div>
          <ProjectForm />
        </div>
      </section>
    </main>
  );
}
