export default function StatCard({ label, value, icon }) {
  return (
    <article className="stat-card">
      <div>
        <p className="stat-title">{label}</p>
        <strong className="stat-value">{value ?? '—'}</strong>
      </div>
      <span className="stat-icon">{icon}</span>
    </article>
  );
}