"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { type ProjectFormState, validateName, validateProjectDescription } from "@/lib/validation";

export async function createProject(_state: ProjectFormState, formData: FormData): Promise<ProjectFormState> {
  const user = await getCurrentUser();
  if (!user) return { error: "You must be logged in to create a project." };
  const name = validateName(formData.get("name"));
  const description = validateProjectDescription(formData.get("description"));
  if ("error" in name) return name;
  if ("error" in description) return description;
  let project;
  try {
    project = await prisma.project.create({ data: { name: name.value, description: description.value, ownerId: user.id } });
  } catch {
    return { error: "The project could not be saved. Please try again." };
  }
  revalidatePath("/dashboard", "layout");
  redirect(`/dashboard/projects/${project.id}`);
}

export async function updateProject(projectId: string, _state: ProjectFormState, formData: FormData): Promise<ProjectFormState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Please log in to edit this project." };
  const name = validateName(formData.get("name"));
  const description = validateProjectDescription(formData.get("description"));
  if ("error" in name) return name;
  if ("error" in description) return description;
  try {
    const result = await prisma.project.updateMany({
      where: { id: projectId, ownerId: user.id },
      data: { name: name.value, description: description.value },
    });
    if (!result.count) return { error: "Project not found." };
  } catch {
    return { error: "The project could not be saved. Please try again." };
  }
  revalidatePath("/dashboard", "layout");
  return { success: true };
}

export async function deleteProject(projectId: string): Promise<ProjectFormState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Please log in to delete this project." };
  try {
    // The existing database relation cascades deletion to this project's issues.
    const result = await prisma.project.deleteMany({ where: { id: projectId, ownerId: user.id } });
    if (!result.count) return { error: "Project not found." };
  } catch {
    return { error: "The project could not be deleted. Please try again." };
  }
  revalidatePath("/dashboard", "layout");
  redirect("/dashboard/projects");
}
