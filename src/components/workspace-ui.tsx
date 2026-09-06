import Link from "next/link";
import type { Issue, Project } from "@prisma/client";
import { priorityLabels, statusLabels, typeLabels } from "@/lib/issues";

export function PageHeading({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: React.ReactNode }) {
  return <div className="page-heading"><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p className="page-description">{description}</p></div>{action}</div>;
}
export function EmptyState({ title, description, href, label }: { title: string; description: string; href?: string; label?: string }) {
  return <div className="empty-state"><span className="empty-icon" aria-hidden="true">&#9633;</span><h3>{title}</h3><p>{description}</p>{href && <Link className="button secondary" href={href}>{label}</Link>}</div>;
}
export function ProjectCards({ projects }: { projects: (Project & { _count: { issues: number } })[] }) {
  return <div className="project-grid">{projects.map((project, index) => <Link className="project-card" href={`/dashboard/projects/${project.id}`} key={project.id}><div className="flex items-center justify-between"><span className={`project-icon tone-${index % 3}`}>{project.name.slice(0, 2).toUpperCase()}</span><span className="text-zinc-400" aria-hidden="true">&#8599;</span></div><h3>{project.name}</h3><p className="project-description">{project.description || "A fresh space for your next idea."}</p><div className="project-meta"><span>{project._count.issues} {project._count.issues === 1 ? "issue" : "issues"}</span><span>{formatDate(project.createdAt)}</span></div></Link>)}</div>;
}
function formatDate(date: Date) { return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }).format(date); }
export function IssueTable({ issues, showProject = true }: { issues: (Issue & { project?: { name: string } })[]; showProject?: boolean }) {
  return <div className="table-scroll"><table><thead><tr><th>Issue</th>{showProject && <th>Project</th>}<th>Type</th><th>Status</th><th>Priority</th><th>Created</th></tr></thead><tbody>{issues.map(issue => <tr key={issue.id}><td><Link className="issue-title" href={`/dashboard/projects/${issue.projectId}#issue-${issue.id}`}>{issue.title}</Link></td>{showProject && <td className="max-w-48 truncate">{issue.project?.name}</td>}<td>{typeLabels[issue.type]}</td><td><span className={`badge status-${issue.status}`}>{statusLabels[issue.status]}</span></td><td><span className={`priority priority-${issue.priority}`}><span aria-hidden="true">&#9679;</span> {priorityLabels[issue.priority]}</span></td><td className="whitespace-nowrap">{formatDate(issue.createdAt)}</td></tr>)}</tbody></table></div>;
}
