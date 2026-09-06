"use client";
import { useActionState } from "react";
import { createProject, updateProject } from "@/app/dashboard/actions";

type ProjectValues = { id: string; name: string; description: string | null };
export function ProjectForm({ project }: { project?: ProjectValues }) {
  const [state, action, pending] = useActionState(project ? updateProject.bind(null, project.id) : createProject, {});
  return (
    <form action={action} className="space-y-5">
      <label className="field">Project name
        <input name="name" required minLength={2} maxLength={80} defaultValue={project?.name} autoComplete="off" placeholder="e.g. Website redesign" />
      </label>
      <label className="field">Description <span className="font-normal text-zinc-400">(optional)</span>
        <textarea name="description" maxLength={500} rows={4} defaultValue={project?.description ?? ""} placeholder="What are you working on?" />
      </label>
      <div aria-live="polite">
        {state.error && <p className="form-error">{state.error}</p>}
        {state.success && <p className="form-success">Project saved.</p>}
      </div>
      <button className="button w-full" type="submit" disabled={pending}>
        {pending ? "Saving..." : project ? "Save project" : "Create project"}
      </button>
    </form>
  );
}
