"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { AuthFormState } from "@/lib/validation";

type AuthFormProps = {
  action: (
    previousState: AuthFormState,
    formData: FormData,
  ) => Promise<AuthFormState>;
  buttonLabel: string;
  footerHref: string;
  footerLabel: string;
  footerText: string;
  showName?: boolean;
};

export function AuthForm({
  action,
  buttonLabel,
  footerHref,
  footerLabel,
  footerText,
  showName = false,
}: AuthFormProps) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="space-y-5">
      {showName ? (
        <label className="block text-sm font-medium text-zinc-800">
          Name
          <input
            className="mt-2 w-full rounded-md border border-zinc-300 px-3 py-2 text-base outline-none transition focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10"
            name="name"
            required
            minLength={2}
            maxLength={80}
            autoComplete="name"
          />
        </label>
      ) : null}
      <label className="block text-sm font-medium text-zinc-800">
        Email
        <input
          className="mt-2 w-full rounded-md border border-zinc-300 px-3 py-2 text-base outline-none transition focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10"
          name="email"
          type="email"
          required
          autoComplete="email"
        />
      </label>
      <label className="block text-sm font-medium text-zinc-800">
        Password
        <input
          className="mt-2 w-full rounded-md border border-zinc-300 px-3 py-2 text-base outline-none transition focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10"
          name="password"
          type="password"
          required
          minLength={8}
          maxLength={128}
          autoComplete={showName ? "new-password" : "current-password"}
        />
      </label>
      {state.error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}
      <button
        className="w-full rounded-md bg-zinc-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
        type="submit"
        disabled={pending}
      >
        {pending ? "Working..." : buttonLabel}
      </button>
      <p className="text-center text-sm text-zinc-600">
        {footerText}{" "}
        <Link className="font-medium text-zinc-950 underline" href={footerHref}>
          {footerLabel}
        </Link>
      </p>
    </form>
  );
}
