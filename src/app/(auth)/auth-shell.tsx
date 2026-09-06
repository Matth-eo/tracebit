import Link from "next/link";
import { PublicBrand } from "@/components/public-ui";
import "@/app/public.css";

export function AuthShell({ children, mode }: { children: React.ReactNode; mode: "login" | "register" }) {
  const login = mode === "login";
  return <div className="public-site auth-site">
    <header className="public-header"><PublicBrand /><Link href="/" className="auth-home-link"><span aria-hidden="true">&#8592;</span> Back to home</Link></header>
    <main className="auth-main"><section className="auth-card">
      <div className="auth-heading"><span className="auth-emblem" aria-hidden="true"><svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="5" y="10" width="14" height="11" rx="3" /><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3" /></svg></span><p className="public-eyebrow">{login ? "YOUR WORKSPACE AWAITS" : "A FRESH START"}</p><h1>{login ? "Good to see you again." : "Make room for your ideas."}</h1><p>{login ? "Log in and pick up where you left off." : "Create your account. Bring your next project to life."}</p></div>
      {children}
    </section><p className="auth-bottom-note"><span aria-hidden="true">&#9675;</span> Your projects. Your space. Your pace.</p></main>
    <footer className="auth-footer">Tracebit <span>Keep work moving.</span></footer>
  </div>;
}
