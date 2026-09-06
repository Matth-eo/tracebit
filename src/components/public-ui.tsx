import Link from "next/link";

export function PublicBrand() {
  return <Link href="/" className="public-brand" aria-label="Tracebit home"><span className="public-mark" aria-hidden="true">t</span>tracebit<span className="public-brand-dot">.</span></Link>;
}

export function ProductPreview() {
  return <figure className="product-preview" id="preview" aria-label="Example Tracebit workspace">
    <div className="preview-window"><div className="window-dots" aria-hidden="true"><i /><i /><i /></div><span>tracebit / your workspace</span><span className="preview-demo">Product preview</span></div>
    <div className="preview-app">
      <aside className="preview-sidebar"><div className="preview-logo">t<span>tracebit.</span></div><p>WORKSPACE</p><div className="preview-nav selected">&#9638; <span>Dashboard</span></div><div className="preview-nav">&#9633; <span>Projects</span></div><div className="preview-nav">&#9673; <span>Issues</span></div><div className="preview-private">Your personal workspace</div></aside>
      <div className="preview-content"><div className="preview-heading"><div><p>A LITTLE CLARITY GOES A LONG WAY</p><h3>Let&apos;s make progress.</h3></div><span className="preview-add">+ New project</span></div>
        <div className="preview-stats">{[["Projects", "3"], ["Open issues", "12"], ["In progress", "4"], ["Completed", "24"]].map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}</strong></div>)}</div>
        <div className="preview-list-title">Recent issues <span>Across your projects</span></div>
        <div className="preview-rows">{[["Fix mobile navigation", "Website", "In Progress", "purple"], ["Add an empty state", "Dashboard", "Todo", "gray"], ["Polish the signup flow", "Website", "Done", "green"]].map(([title, project, status, color]) => <div className="preview-row" key={title}><span className={`preview-check ${color}`} aria-hidden="true">{color === "green" ? "\u2713" : "\u25cb"}</span><span className="preview-issue">{title}<small>{project}</small></span><span className={`preview-pill ${color}`}>{status}</span></div>)}</div>
      </div>
    </div>
    <figcaption>One calm place for everything you&apos;re building. <span>Illustrative workspace with example data.</span></figcaption>
  </figure>;
}
