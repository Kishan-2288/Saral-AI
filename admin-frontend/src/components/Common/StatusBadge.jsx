export function StatusBadge({ active }) {
  return <span className={`status-badge ${active ? 'is-active' : 'is-inactive'}`}>{active ? 'Active' : 'Inactive'}</span>;
}
