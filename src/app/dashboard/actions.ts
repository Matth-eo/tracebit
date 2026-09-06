"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  type ProjectFormState,
  validateName,
  validateProjectDescription,
} from "@/lib/validation";

export async function createProject(
  _previousState: ProjectFormState,
  formData: FormData,
): Promise<ProjectFormState> {
  const user = await getCurrentUser();

  if (!user) {
    return { error: "You must be logged in to create a project." };
  }

  const name = validateName(formData.get("name"));
  const description = validateProjectDescription(formData.get("description"));

  if ("error" in name) return name;
  if ("error" in description) return description;

  await prisma.project.create({
    data: {
      name: name.value,
      description: description.value,
      ownerId: user.id,
    },
  });

  revalidatePath("/dashboard");
  return { success: true };
}
