import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/workspace";
import { buildIssueFilters, type IssueSearchParams } from "@/lib/issue-filters";
import { priorityLabels, statusLabels, typeLabels } from "@/lib/issues";
import { EmptyState, IssueTable, PageHeading } from "@/components/workspace-ui";

export default async function IssuesPage({ searchParams }: { searchParams: Promise<IssueSearchParams> }) {
  const user = await requireUser();
  const filters = buildIssueFilters(await searchParams, user.id);
  const issues = await prisma.issue.findMany({
    where: filters.where,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    include: { project: { select: { name: true } } },
  });

  return (
    <>
      <PageHeading
        eyebrow="THE DETAILS THAT MATTER"
        title="Issues"
        description="Every bug, feature, and task. All in one place."
        action={<Link className="button" href="/dashboard/projects">Open a project <span aria-hidden="true">&#8599;</span></Link>}
      />
      <section className="panel">
        <form action="/dashboard/issues" method="get" role="search" aria-label="Search and filter issues" className="issue-filters" key={JSON.stringify([filters.q, filters.status, filters.priority, filters.type])}>
          <label className="field issue-search">Search by title
            <input type="search" name="q" defaultValue={filters.q} maxLength={160} placeholder="Search issues..." />
          </label>
          <label className="field">Status
            <select name="status" defaultValue={filters.status}>
              <option value="">All statuses</option>
              {Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
          <label className="field">Priority
            <select name="priority" defaultValue={filters.priority}>
              <option value="">All priorities</option>
              {Object.entries(priorityLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
          <label className="field">Type
            <select name="type" defaultValue={filters.type}>
              <option value="">All types</option>
              {Object.entries(typeLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
          <div className="filter-actions">
            <button type="submit" className="button">Apply filters</button>
            <Link href="/dashboard/issues" className="button secondary">Clear</Link>
          </div>
        </form>
        <div className="panel-heading section-heading">
          <h2>{filters.active ? "Matching issues" : "All issues"} <span className="count">{issues.length}</span></h2>
          <span className="text-sm text-zinc-500">Newest first</span>
        </div>
        {issues.length ? <IssueTable issues={issues} /> : filters.active ? (
          <EmptyState title="No matching issues" description="Try another title or clear the filters to see all your issues." href="/dashboard/issues" label="Clear filters" />
        ) : (
          <EmptyState title="Nothing to track just yet" description="Open a project to create your first issue." href="/dashboard/projects" label="Browse projects" />
        )}
      </section>
    </>
  );
}
