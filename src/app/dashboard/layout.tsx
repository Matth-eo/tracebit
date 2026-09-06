import Link from "next/link";
import { SidebarNav } from "@/components/sidebar-nav";
import { AccountMenu } from "@/components/account-menu";
import { requireUser } from "@/lib/workspace";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  return <div className="workspace">
    <a href="#main-content" className="skip-link">Skip to content</a>
    <aside className="sidebar">
      <Link href="/dashboard" className="brand"><span className="brand-mark" aria-hidden="true">t</span>tracebit<span className="brand-dot">.</span></Link>
      <div className="workspace-label">WORKSPACE</div>
      <SidebarNav />
    </aside>
    <div className="workspace-body">
      <header className="topbar"><span>Personal workspace</span><AccountMenu name={user.name} email={user.email} /></header>
      <main id="main-content" className="page-content">{children}</main>
      <footer className="workspace-footer">Tracebit <span>Keep work moving.</span></footer>
    </div>
  </div>;
}
