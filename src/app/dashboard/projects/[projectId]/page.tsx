import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/workspace";
import { priorityLabels, statusLabels, typeLabels } from "@/lib/issues";
import { EmptyState, PageHeading } from "@/components/workspace-ui";
import { DeleteForm } from "@/components/delete-form";
import { ProjectForm } from "@/app/dashboard/project-form";
import { deleteProject } from "@/app/dashboard/actions";
import { deleteIssue } from "@/app/dashboard/issues/actions";
import { IssueForm, StatusForm } from "@/app/dashboard/issues/issue-form";

export default async function ProjectPage({ params }: { params: Promise<{ projectId: string }> }) {
  const user = await requireUser();
  const { projectId } = await params;
  const project = await prisma.project.findFirst({
    where: { id: projectId, ownerId: user.id },
    include: { issues: { orderBy: { createdAt: "desc" } } },
  });
  if (!project) notFound();

  return (
    <>
      <Link href="/dashboard/projects" className="back-link">&#8592; All projects</Link>
      <PageHeading eyebrow="PROJECT OVERVIEW" title={project.name} description={project.description || "Every small step moves this project forward."} />
      <details className="panel project-settings">
        <summary>Edit project</summary>
        <div className="settings-content">
          <ProjectForm project={{ id: project.id, name: project.name, description: project.description }} />
          <div className="delete-section">
            <h2>Delete project</h2>
            <p className="form-intro">Deleting this project also permanently deletes all of its issues.</p>
            <DeleteForm action={deleteProject.bind(null, project.id)} label="Delete project" message={`Delete "${project.name}" and all ${project.issues.length} of its issues?`} />
          </div>
        </div>
      </details>
      <div className="content-with-form">
        <section>
          <div className="section-heading"><h2>Project issues <span className="count">{project.issues.length}</span></h2></div>
          {project.issues.length ? (
            <div className="issue-list">
              {project.issues.map(issue => (
                <article className="panel issue-card" id={`issue-${issue.id}`} key={issue.id}>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`badge status-${issue.status}`}>{statusLabels[issue.status]}</span>
                    <span className="text-xs text-zinc-500">{typeLabels[issue.type]}</span>
                    <span className={`priority priority-${issue.priority} ml-auto`}>&#9679; {priorityLabels[issue.priority]}</span>
                  </div>
                  <h3>{issue.title}</h3>
                  {issue.description && <p className="issue-description">{issue.description}</p>}
                  <StatusForm issueId={issue.id} status={issue.status} />
                  <details className="issue-edit">
                    <summary>Edit issue</summary>
                    <div className="pt-4">
                      <IssueForm projectId={project.id} issue={{ id: issue.id, title: issue.title, description: issue.description, type: issue.type, status: issue.status, priority: issue.priority }} />
                    </div>
                  </details>
                  <div className="mt-4">
                    <DeleteForm action={deleteIssue.bind(null, issue.id)} label="Delete issue" message={`Delete "${issue.title}"?`} />
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="panel"><EmptyState title="Let's get this project moving" description="Create your first issue using the form. Track a bug, plan a feature, or add a task." /></div>
          )}
        </section>
        <section className="panel form-panel" id="new-issue">
          <h2>Create an issue</h2>
          <p className="form-intro">A clear next step for this project.</p>
          <IssueForm projectId={project.id} />
        </section>
      </div>
    </>
  );
}
