"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function SidebarNav() {
  const path = usePathname();
  return <nav aria-label="Main navigation" className="sidebar-nav">
    {[["/dashboard", "Dashboard", "\u25a6"], ["/dashboard/projects", "Projects", "\u25a1"], ["/dashboard/issues", "Issues", "\u25c9"]].map(([href, label, icon]) => {
      const active = href === "/dashboard" ? path === href : path.startsWith(href);
      return <Link key={href} href={href} aria-current={active ? "page" : undefined} className={`nav-link ${active ? "active" : ""}`}><span aria-hidden="true" className="nav-icon">{icon}</span>{label}</Link>;
    })}
  </nav>;
}
