export default function ScheduleRow({ item }) {
  return (
    <div className="schedule-row">
      <span className="schedule-time">{item[0]}</span>
      <span className={`subject-dot ${item[4]}`} />
      <div><b>{item[1]}</b><small>{item[2]} · {item[3]}</small></div>
      <span className="row-status">Berlangsung</span>
    </div>
  )
}