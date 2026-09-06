import type { Prisma } from "@prisma/client";
import { priorityLabels, statusLabels, typeLabels } from "@/lib/issues";

export type IssueSearchParams = Record<string, string | string[] | undefined>;

function enumFilter<T extends string>(value: string | string[] | undefined, labels: Record<T, string>): T | "" {
  return typeof value === "string" && Object.hasOwn(labels, value) ? value as T : "";
}

export function buildIssueFilters(params: IssueSearchParams, ownerId: string) {
  const q = typeof params.q === "string" ? params.q.trim().slice(0, 160) : "";
  const status = enumFilter(params.status, statusLabels);
  const priority = enumFilter(params.priority, priorityLabels);
  const type = enumFilter(params.type, typeLabels);
  const where: Prisma.IssueWhereInput = { project: { ownerId } };
  if (q) {
    // PostgreSQL LIKE treats these characters as wildcards; search for them literally.
    where.title = { contains: q.replace(/[\\%_]/g, "\\$&"), mode: "insensitive" };
  }
  if (status) where.status = status;
  if (priority) where.priority = priority;
  if (type) where.type = type;
  return { q, status, priority, type, where, active: Boolean(q || status || priority || type) };
}
