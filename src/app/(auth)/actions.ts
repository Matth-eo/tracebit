"use server";

import { redirect } from "next/navigation";
import { createSession, deleteCurrentSession } from "@/lib/auth";
import { hashPassword, verifyPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import {
  type AuthFormState,
  validateEmail,
  validateName,
  validatePassword,
} from "@/lib/validation";

export async function register(
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const name = validateName(formData.get("name"));
  const email = validateEmail(formData.get("email"));
  const password = validatePassword(formData.get("password"));

  if ("error" in name) return name;
  if ("error" in email) return email;
  if ("error" in password) return password;

  const existingUser = await prisma.user.findUnique({
    where: { email: email.value },
  });

  if (existingUser) {
    return { error: "An account with this email already exists." };
  }

  const user = await prisma.user.create({
    data: {
      name: name.value,
      email: email.value,
      passwordHash: await hashPassword(password.value),
    },
  });

  await createSession(user.id);
  redirect("/dashboard");
}

export async function login(
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = validateEmail(formData.get("email"));
  const password = validatePassword(formData.get("password"));

  if ("error" in email) return email;
  if ("error" in password) return password;

  const user = await prisma.user.findUnique({
    where: { email: email.value },
  });

  if (!user || !(await verifyPassword(password.value, user.passwordHash))) {
    return { error: "Invalid email or password." };
  }

  await createSession(user.id);
  redirect("/dashboard");
}

export async function logout() {
  await deleteCurrentSession();
  redirect("/login");
}
