"use client";

import { useActionState } from "react";
import type { Issue } from "@prisma/client";
import { createIssue, updateIssue, updateIssueStatus } from "@/app/dashboard/issues/actions";
import { typeLabels, statusLabels, priorityLabels } from "@/lib/issues";

type IssueValues = Pick<Issue, "id" | "title" | "description" | "type" | "status" | "priority">;
export function IssueForm({ projectId, issue }: { projectId: string; issue?: IssueValues }) {
  const [state, action, pending] = useActionState(issue ? updateIssue.bind(null, issue.id) : createIssue.bind(null, projectId), {});
  return (
    <form action={action} className="space-y-5">
      <label className="field">Title
        <input name="title" required minLength={2} maxLength={160} defaultValue={issue?.title} placeholder="What needs to be done?" />
      </label>
      <label className="field">Description <span className="font-normal text-zinc-400">(optional)</span>
        <textarea name="description" maxLength={5000} rows={5} defaultValue={issue?.description ?? ""} placeholder="Add context, steps to reproduce, or the desired outcome..." />
      </label>
      <label className="field">Type
        <select key={issue?.type} name="type" defaultValue={issue?.type ?? "BUG"}>
          {Object.entries(typeLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </label>
      <div className="grid grid-cols-2 gap-4">
        <label className="field">Status
          <select key={issue?.status} name="status" defaultValue={issue?.status ?? "TODO"}>
            {Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
        <label className="field">Priority
          <select key={issue?.priority} name="priority" defaultValue={issue?.priority ?? "MEDIUM"}>
            {Object.entries(priorityLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
      </div>
      <div aria-live="polite">
        {state.error && <p className="form-error">{state.error}</p>}
        {state.success && <p className="form-success">{issue ? "Issue saved." : "Issue created."}</p>}
      </div>
      <button className="button w-full" disabled={pending}>{pending ? "Saving..." : issue ? "Save issue" : "Create issue"}</button>
    </form>
  );
}

export function StatusForm({ issueId, status }: { issueId: string; status: keyof typeof statusLabels }) {
  const [state, action, pending] = useActionState(updateIssueStatus.bind(null, issueId), {});
  return (
    <form action={action} className="status-form">
      <label className="sr-only" htmlFor={`status-${issueId}`}>Issue status</label>
      <select key={status} id={`status-${issueId}`} name="status" defaultValue={status}>
        {Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
      </select>
      <button className="button secondary" disabled={pending}>{pending ? "Saving..." : "Save status"}</button>
      <span aria-live="polite" className={state.error ? "text-red-700 text-xs" : "text-emerald-700 text-xs"}>{state.error || (state.success ? "Saved" : "")}</span>
    </form>
  );
}
