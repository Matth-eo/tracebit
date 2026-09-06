"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { validateEmail, validateName } from "@/lib/validation";

export type ProfileFormState = { error?: string; success?: boolean };

export async function updateProfile(_state: ProfileFormState, data: FormData): Promise<ProfileFormState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Please log in to update your profile." };
  const name = validateName(data.get("name"));
  const email = validateEmail(data.get("email"));
  if ("error" in name) return name;
  if ("error" in email) return email;
  try {
    await prisma.user.update({ where: { id: user.id }, data: { name: name.value, email: email.value } });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { error: "That email address is already in use." };
    }
    return { error: "Your profile could not be saved. Please try again." };
  }
  revalidatePath("/dashboard", "layout");
  return { success: true };
}
