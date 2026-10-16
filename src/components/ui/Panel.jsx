export default function Panel({ className = '', children }) {
  return <section className={`panel ${className}`}>{children}</section>
}

export function PanelHeading({ title, subtitle, action }) {
  return (
    <div className="panel-heading">
      <div><h3 style={{fontSize: "16px"}}>{title}</h3>{subtitle && <p style={{fontSize: "12px"}}>{subtitle}</p>}</div>
      {action}
    </div>
  )
}