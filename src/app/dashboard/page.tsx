import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/workspace";
import { EmptyState, IssueTable, PageHeading, ProjectCards } from "@/components/workspace-ui";

export default async function DashboardPage() {
  const user = await requireUser();
  const owned = { project: { ownerId: user.id } };
  const [total, open, progress, done, projects, issues] = await Promise.all([
    prisma.project.count({ where: { ownerId: user.id } }),
    prisma.issue.count({ where: { ...owned, status: { not: "DONE" } } }),
    prisma.issue.count({ where: { ...owned, status: "IN_PROGRESS" } }),
    prisma.issue.count({ where: { ...owned, status: "DONE" } }),
    prisma.project.findMany({ where: { ownerId: user.id }, orderBy: { createdAt: "desc" }, take: 3, include: { _count: { select: { issues: true } } } }),
    prisma.issue.findMany({ where: owned, orderBy: { createdAt: "desc" }, take: 6, include: { project: { select: { name: true } } } }),
  ]);
  return <>
    <PageHeading eyebrow="YOUR WORK, AT A GLANCE" title={`Welcome back, ${user.name.split(" ")[0]}`} description="A clear view of your projects and what needs your attention." action={<Link className="button" href="/dashboard/projects#new-project"><span aria-hidden="true">+</span> New project</Link>} />
    <div className="stats-grid">{[["Total Projects", total, "All your workspaces", "\u25a1"], ["Open Issues", open, "Todo and in progress", "\u25c9"], ["In Progress Issues", progress, "Work in motion", "\u25d0"], ["Completed Issues", done, "Issues marked done", "\u2713"]].map(([label, value, detail, icon], index) => <div className="stat-card" key={label}><div className="stat-label">{label}<span className={`stat-icon tone-${index % 3}`} aria-hidden="true">{icon}</span></div><p className="stat-value">{value}</p><p className="stat-detail">{detail}</p></div>)}</div>
    <section className="section"><div className="section-heading"><div><h2>Recent Projects</h2><p>Your latest spaces to make things happen.</p></div><Link className="text-link" href="/dashboard/projects">View all projects <span aria-hidden="true">&#8599;</span></Link></div>{projects.length ? <ProjectCards projects={projects} /> : <div className="panel"><EmptyState title="Your next project starts here" description="Create a project to bring your bugs, features, and tasks together." href="/dashboard/projects#new-project" label="Create your first project" /></div>}</section>
    <section className="section panel"><div className="section-heading panel-heading"><div><h2>Recent Issues</h2><p>The latest additions across your projects.</p></div><Link className="text-link" href="/dashboard/issues">View all issues <span aria-hidden="true">&#8599;</span></Link></div>{issues.length ? <IssueTable issues={issues} /> : <EmptyState title="A clean slate" description="Issues you create in your projects will appear here." href="/dashboard/projects" label="Go to projects" />}</section>
  </>;
}
