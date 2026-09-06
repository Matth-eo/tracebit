import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/workspace";
import { EmptyState, IssueTable, PageHeading } from "@/components/workspace-ui";

export default async function IssuesPage() {
  const user = await requireUser();
  const issues = await prisma.issue.findMany({ where: { project: { ownerId: user.id } }, orderBy: { createdAt: "desc" }, include: { project: { select: { name: true } } } });
  return <><PageHeading eyebrow="THE DETAILS THAT MATTER" title="Issues" description="Every bug, feature, and task. All in one place." action={<Link className="button" href="/dashboard/projects">Open a project <span aria-hidden="true">&#8599;</span></Link>} /><section className="panel"><div className="panel-heading section-heading"><h2>All issues <span className="count">{issues.length}</span></h2><span className="text-sm text-zinc-500">Newest first</span></div>{issues.length ? <IssueTable issues={issues} /> : <EmptyState title="Nothing to track just yet" description="Open a project to create your first issue." href="/dashboard/projects" label="Browse projects" />}</section></>;
}
