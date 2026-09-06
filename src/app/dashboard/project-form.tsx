"use client";

import { useActionState, useEffect, useRef } from "react";
import { createProject } from "@/app/dashboard/actions";

export function ProjectForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(createProject, {});

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state.success]);

  return (
    <form ref={formRef} action={formAction} className="space-y-5">
      <label className="block text-sm font-medium text-zinc-800">
        Project name
        <input
          className="mt-2 w-full rounded-md border border-zinc-300 px-3 py-2 text-base outline-none transition focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10"
          name="name"
          required
          minLength={2}
          maxLength={80}
          autoComplete="off"
        />
      </label>
      <label className="block text-sm font-medium text-zinc-800">
        Description <span className="font-normal text-zinc-500">(optional)</span>
        <textarea
          className="mt-2 min-h-28 w-full rounded-md border border-zinc-300 px-3 py-2 text-base outline-none transition focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10"
          name="description"
          maxLength={500}
        />
      </label>
      {state.error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          Project created.
        </p>
      ) : null}
      <button
        className="rounded-md bg-zinc-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
        type="submit"
        disabled={pending}
      >
        {pending ? "Creating..." : "Create project"}
      </button>
    </form>
  );
}
