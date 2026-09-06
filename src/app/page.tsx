import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { ProductPreview, PublicBrand } from "@/components/public-ui";
import "./public.css";

export default async function Home() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");
  return <div className="public-site">
    <header className="public-header"><PublicBrand /><nav aria-label="Main navigation" className="public-nav"><a href="#features">Features</a><a href="#how-it-works">How it works</a></nav><div className="public-nav-actions"><Link href="/login" className="public-login">Log in</Link><Link href="/register" className="public-button compact">Get started <span aria-hidden="true">&#8599;</span></Link></div></header>
    <main>
      <section className="landing-hero">
        <div className="hero-badge"><span /> A little less chaos. A lot more clarity.</div>
        <h1>Big ideas.<br />Small tasks. <em>Real progress.</em></h1>
        <p className="hero-description">A simple home for your projects, bugs, and next big thing.<br className="desktop-break" /> Keep track of the details. Get back to building.</p>
        <div className="hero-actions"><Link href="/register" className="public-button">Start your workspace <span aria-hidden="true">&#8594;</span></Link><a href="#preview" className="public-button outline">Take a look <span aria-hidden="true">&#8600;</span></a></div>
        <p className="hero-footnote">Just you, your ideas, and a clear next step.</p>
        <div className="hero-preview-wrap"><ProductPreview /></div>
      </section>
      <section className="landing-features" id="features"><div className="landing-section-heading"><p className="public-eyebrow">LESS TO MANAGE. MORE TO MAKE.</p><h2>Everything you need.<br />Room to focus.</h2><p>From the first idea to the final fix, keep your work in sight.</p></div>
        <div className="landing-feature-grid">{[["01", "A home for every project", "Bring related work together. Create a project, add a little context, and give your ideas somewhere to grow.", "\u25a1"], ["02", "The details, under control", "Capture bugs, features, and tasks. Set a priority, update a status, and always know what comes next.", "\u25ce"], ["03", "Clarity at a glance", "See your progress on the dashboard. Find the right issue with title search and simple, useful filters.", "\u25d4"]].map(([number, title, description, icon]) => <article className="landing-feature" key={number}><div className="feature-top"><span className="feature-icon" aria-hidden="true">{icon}</span><span>{number}</span></div><h3>{title}</h3><p>{description}</p></article>)}</div>
      </section>
      <section className="landing-workflow" id="how-it-works"><div className="landing-section-heading"><p className="public-eyebrow">A SIMPLE WAY FORWARD</p><h2>Idea. Issue. Done.</h2><p>A workflow that takes minutes to make your own.</p></div><ol>{[["Create a project", "Give your next idea a name and a place to start."], ["Break it into issues", "Add the bugs to fix, features to build, and tasks to tackle."], ["Move things forward", "Go from Todo to In Progress to Done, one issue at a time."]].map(([title, description], index) => <li key={title}><span className="workflow-number">0{index + 1}</span><h3>{title}</h3><p>{description}</p></li>)}</ol></section>
      <section className="landing-cta"><span className="public-mark" aria-hidden="true">t</span><h2>Your next idea deserves<br />a clear next step.</h2><p>Make a little space for great work.</p><Link href="/register" className="public-button">Let&apos;s get building <span aria-hidden="true">&#8594;</span></Link></section>
    </main>
    <footer className="public-footer"><PublicBrand /><p>Keep work moving.</p><div><Link href="/login">Log in</Link><Link href="/register">Create an account</Link></div></footer>
  </div>;
}
