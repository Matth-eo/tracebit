"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { logout } from "@/app/(auth)/actions";

function LogoutButton() {
  const { pending } = useFormStatus();
  return <button type="submit" className="account-menu-item account-logout" disabled={pending}>{pending ? "Logging out..." : "Log out"}<span aria-hidden="true">&#8599;</span></button>;
}

export function AccountMenu({ name, email }: { name: string; email: string }) {
  const [open, setOpen] = useState(false);
  const container = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    function outside(event: PointerEvent) {
      if (!container.current?.contains(event.target as Node)) setOpen(false);
    }
    function escape(event: KeyboardEvent) {
      if (event.key === "Escape") { setOpen(false); trigger.current?.focus(); }
    }
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
    };
  }, [open]);
  return (
    <div className="account-menu" ref={container} onBlur={event => {
      if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
    }}>
      <button ref={trigger} type="button" className="account-trigger" aria-label="Account options" aria-expanded={open} aria-controls="account-dropdown" onClick={() => setOpen(!open)}>
        <span className="avatar" aria-hidden="true">{name.slice(0, 1).toUpperCase()}</span>
        <span className="account-trigger-name">{name}</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
      </button>
      {open && <div id="account-dropdown" className="account-dropdown">
        <div className="account-summary"><p>{name}</p><span>{email}</span></div>
        <Link href="/dashboard/profile" className="account-menu-item" onClick={() => setOpen(false)}>Profile<span aria-hidden="true">&#8594;</span></Link>
        <form action={logout}><LogoutButton /></form>
      </div>}
    </div>
  );
}
