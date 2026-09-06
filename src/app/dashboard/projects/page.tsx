import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/workspace";
import { ProjectForm } from "@/app/dashboard/project-form";
import { EmptyState, PageHeading, ProjectCards } from "@/components/workspace-ui";

export default async function ProjectsPage() {
  const user = await requireUser();
  const projects = await prisma.project.findMany({ where: { ownerId: user.id }, orderBy: { createdAt: "desc" }, include: { _count: { select: { issues: true } } } });
  return <><PageHeading eyebrow="ORGANIZE YOUR WORK" title="Projects" description="Give every idea a home. Keep every issue in context." /><div className="content-with-form"><section><div className="section-heading"><h2>All projects <span className="count">{projects.length}</span></h2></div>{projects.length ? <ProjectCards projects={projects} /> : <div className="panel"><EmptyState title="Room for your first project" description="Use the form to create a project, then start adding issues." /></div>}</section><section className="panel form-panel" id="new-project"><h2>Create a project</h2><p className="form-intro">Start small. Build something great.</p><ProjectForm /></section></div></>;
}
