"use server";

import { revalidatePath } from "next/cache";
import { IssueStatus } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { validateIssue } from "@/lib/validation";
import type { IssueFormState } from "@/lib/issues";

function refresh(projectId: string) {
  revalidatePath("/dashboard", "layout");
  revalidatePath(`/dashboard/projects/${projectId}`);
}

export async function createIssue(projectId: string, _state: IssueFormState, data: FormData): Promise<IssueFormState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Please log in to create an issue." };
  const project = await prisma.project.findFirst({ where: { id: projectId, ownerId: user.id }, select: { id: true } });
  if (!project) return { error: "Project not found." };
  const validated = validateIssue(data);
  if ("error" in validated) return { error: validated.error };
  try {
    await prisma.issue.create({ data: { ...validated.value, projectId: project.id } });
  } catch {
    return { error: "The issue could not be saved. Please try again." };
  }
  refresh(projectId);
  return { success: true };
}

export async function updateIssue(issueId: string, _state: IssueFormState, data: FormData): Promise<IssueFormState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Please log in to edit this issue." };
  const where = { id: issueId, project: { ownerId: user.id } };
  const issue = await prisma.issue.findFirst({ where, select: { projectId: true } });
  if (!issue) return { error: "Issue not found." };
  const validated = validateIssue(data);
  if ("error" in validated) return { error: validated.error };
  try {
    const result = await prisma.issue.updateMany({ where, data: validated.value });
    if (!result.count) return { error: "Issue not found." };
  } catch {
    return { error: "The issue could not be saved. Please try again." };
  }
  refresh(issue.projectId);
  return { success: true };
}

export async function deleteIssue(issueId: string): Promise<IssueFormState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Please log in to delete this issue." };
  const where = { id: issueId, project: { ownerId: user.id } };
  const issue = await prisma.issue.findFirst({ where, select: { projectId: true } });
  if (!issue) return { error: "Issue not found." };
  try {
    const result = await prisma.issue.deleteMany({ where });
    if (!result.count) return { error: "Issue not found." };
  } catch {
    return { error: "The issue could not be deleted. Please try again." };
  }
  refresh(issue.projectId);
  return { success: true };
}

export async function updateIssueStatus(issueId: string, _state: IssueFormState, data: FormData): Promise<IssueFormState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Please log in to update this issue." };
  const status = String(data.get("status")) as IssueStatus;
  if (!Object.values(IssueStatus).includes(status)) return { error: "Choose a valid status." };
  const issue = await prisma.issue.findFirst({ where: { id: issueId, project: { ownerId: user.id } }, select: { projectId: true } });
  if (!issue) return { error: "Issue not found." };
  try {
    const result = await prisma.issue.updateMany({ where: { id: issueId, project: { ownerId: user.id } }, data: { status } });
    if (!result.count) return { error: "Issue not found." };
  } catch {
    return { error: "The status could not be saved. Please try again." };
  }
  refresh(issue.projectId);
  return { success: true };
}
