import Link from "next/link";
import { logout } from "@/app/(auth)/actions";
import { SidebarNav } from "@/components/sidebar-nav";
import { requireUser } from "@/lib/workspace";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  return <div className="workspace">
    <a href="#main-content" className="skip-link">Skip to content</a>
    <aside className="sidebar">
      <Link href="/dashboard" className="brand"><span className="brand-mark" aria-hidden="true">t</span>tracebit<span className="brand-dot">.</span></Link>
      <div className="workspace-label">WORKSPACE</div>
      <SidebarNav />
      <div className="sidebar-bottom"><div className="personal-note"><span className="small-dot" /> Personal workspace</div><div className="profile"><span className="avatar">{user.name.slice(0, 1).toUpperCase()}</span><div className="min-w-0"><p className="truncate font-medium">{user.name}</p><p className="truncate text-xs text-zinc-500">{user.email}</p></div></div><form action={logout}><button className="logout" type="submit">Log out <span aria-hidden="true">&#8599;</span></button></form></div>
    </aside>
    <div className="workspace-body"><header className="topbar"><span>Personal workspace <span className="mx-3 text-zinc-300">/</span> <span className="text-zinc-800">Overview</span></span><span className="topbar-note">A little clarity. A lot of progress.</span></header><main id="main-content" className="page-content">{children}</main><footer className="workspace-footer">Tracebit <span>Keep work moving.</span></footer></div>
  </div>;
}
