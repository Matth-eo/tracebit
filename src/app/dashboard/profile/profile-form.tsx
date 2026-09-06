"use client";

import { useActionState, useState } from "react";
import { updateProfile } from "./actions";

export function ProfileForm({ name, email }: { name: string; email: string }) {
  const [state, action, pending] = useActionState(updateProfile, {});
  const [values, setValues] = useState({ name, email });
  return <form action={action} className="space-y-5">
    <label className="field">Full name
      <input name="name" required minLength={2} maxLength={80} autoComplete="name" value={values.name} onChange={event => setValues({ ...values, name: event.target.value })} />
    </label>
    <label className="field">Email address
      <input name="email" type="email" required maxLength={254} autoComplete="email" value={values.email} onChange={event => setValues({ ...values, email: event.target.value })} aria-describedby="email-help" />
    </label>
    <p id="email-help" className="text-xs text-zinc-500">Use this email address the next time you log in.</p>
    <div aria-live="polite">{state.error && <p className="form-error">{state.error}</p>}{state.success && <p className="form-success">Your profile has been updated.</p>}</div>
    <button className="button" type="submit" disabled={pending}>{pending ? "Saving..." : "Save changes"}</button>
  </form>;
}
