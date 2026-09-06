"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import type { AuthFormState } from "@/lib/validation";

type AuthFormProps = {
  action: (previousState: AuthFormState, formData: FormData) => Promise<AuthFormState>;
  buttonLabel: string;
  footerHref: string;
  footerLabel: string;
  footerText: string;
  showName?: boolean;
};

export function AuthForm({ action, buttonLabel, footerHref, footerLabel, footerText, showName = false }: AuthFormProps) {
  const [state, formAction, pending] = useActionState(action, {});
  const [visible, setVisible] = useState(false);
  const [values, setValues] = useState({ name: "", email: "", password: "" });
  return <form action={formAction} className="modern-auth-form">
    {showName && <label className="auth-field">Full name<input name="name" required minLength={2} maxLength={80} autoComplete="name" placeholder="Alex Morgan" value={values.name} onChange={event => setValues({ ...values, name: event.target.value })} /></label>}
    <label className="auth-field">Email address<input name="email" type="email" required maxLength={254} autoComplete="email" placeholder="you@example.com" value={values.email} onChange={event => setValues({ ...values, email: event.target.value })} /></label>
    <div className="auth-field"><label htmlFor="auth-password">Password</label><div className="auth-password-wrap"><input id="auth-password" name="password" type={visible ? "text" : "password"} required minLength={8} maxLength={128} autoComplete={showName ? "new-password" : "current-password"} placeholder={showName ? "Create a strong password" : "Enter your password"} value={values.password} onChange={event => setValues({ ...values, password: event.target.value })} aria-describedby={showName ? "password-help" : undefined} /><button type="button" aria-label={visible ? "Hide password" : "Show password"} aria-pressed={visible} onClick={() => setVisible(!visible)}>{visible ? "Hide" : "Show"}</button></div>{showName && <p id="password-help" className="password-help">Use at least 8 characters.</p>}</div>
    <div aria-live="polite">{state.error && <p className="auth-error" role="alert">{state.error}</p>}</div>
    <button className="public-button auth-submit" type="submit" disabled={pending}>{pending ? "Working..." : buttonLabel}<span aria-hidden="true">&#8594;</span></button>
    <p className="auth-switch">{footerText} <Link href={footerHref}>{footerLabel}</Link></p>
  </form>;
}
