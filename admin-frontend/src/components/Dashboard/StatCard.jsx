export function StatCard({ label, value, detail }) { return <article className="stat-card"><p>{label}</p><strong>{value ?? '—'}</strong>{detail && <small>{detail}</small>}</article>; }
