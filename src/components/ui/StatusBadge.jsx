export default function StatusBadge({ children, type }) {
  const normalized = type || String(children).toLowerCase()
  return <span className={`status ${normalized}`}>{children}</span>
}