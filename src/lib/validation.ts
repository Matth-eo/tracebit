import { IssuePriority, IssueStatus, IssueType } from "@prisma/client";
export type AuthFormState = {
  error?: string;
};

export type ProjectFormState = {
  error?: string;
  success?: boolean;
};

export function validateName(value: FormDataEntryValue | null) {
  const name = String(value ?? "").trim();

  if (name.length < 2 || name.length > 80) {
    return { error: "Name must be between 2 and 80 characters." };
  }

  return { value: name };
}

export function validateEmail(value: FormDataEntryValue | null) {
  const email = String(value ?? "").trim().toLowerCase();
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(email) || email.length > 254) {
    return { error: "Enter a valid email address." };
  }

  return { value: email };
}

export function validatePassword(value: FormDataEntryValue | null) {
  const password = String(value ?? "");

  if (password.length < 8 || password.length > 128) {
    return { error: "Password must be between 8 and 128 characters." };
  }

  return { value: password };
}

export function validateProjectDescription(value: FormDataEntryValue | null) {
  const description = String(value ?? "").trim();

  if (description.length > 500) {
    return { error: "Description must be 500 characters or fewer." };
  }

  return { value: description || null };
}

export function validateIssue(data: FormData) {
  const title = String(data.get("title") ?? "").trim();
  const description = String(data.get("description") ?? "").trim();
  const type = String(data.get("type")) as IssueType;
  const status = String(data.get("status")) as IssueStatus;
  const priority = String(data.get("priority")) as IssuePriority;
  if (title.length < 2 || title.length > 160) return { error: "Title must be between 2 and 160 characters." };
  if (description.length > 5000) return { error: "Description must be 5,000 characters or fewer." };
  if (!Object.values(IssueType).includes(type) || !Object.values(IssueStatus).includes(status) || !Object.values(IssuePriority).includes(priority)) {
    return { error: "Choose a valid type, status, and priority." };
  }
  // An omitted description is stored as an empty string in the existing schema.
  return { value: { title, description, type, status, priority } };
}
