"use client";

import { useActionState, useState } from "react";
import type { IssueFormState } from "@/lib/issues";

type DeleteAction = (state: IssueFormState, data: FormData) => Promise<IssueFormState>;
export function DeleteForm({ action, label, message }: { action: DeleteAction; label: string; message: string }) {
  const [confirming, setConfirming] = useState(false);
  const [state, formAction, pending] = useActionState(action, {});
  if (!confirming) return <button type="button" className="button danger" onClick={() => setConfirming(true)}>{label}</button>;
  return (
    <form action={formAction} className="delete-confirmation">
      <p>{message} This cannot be undone.</p>
      <div className="flex flex-wrap gap-2">
        <button type="submit" className="button danger" disabled={pending}>{pending ? "Deleting..." : `Confirm ${label.toLowerCase()}`}</button>
        <button type="button" className="button secondary" disabled={pending} onClick={() => setConfirming(false)}>Cancel</button>
      </div>
      <div aria-live="polite">{state.error && <p className="form-error">{state.error}</p>}</div>
    </form>
  );
}
