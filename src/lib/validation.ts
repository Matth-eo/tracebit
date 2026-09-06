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
