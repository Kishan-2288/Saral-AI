const NAV_ITEMS = [
  ['dashboard', '⌂', 'Dashboard'],
  ['appointments', '◷', 'Appointments'],
  ['patients', '♙', 'Patients'],
  ['doctors', '⚕', 'Doctors'],
  ['reports', '▤', 'Reports'],
  ['settings', '⚙', 'Settings'],
];

export default function Sidebar({ page, setPage, hospital, onLogout }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">SARAL AI</div>
      <p className="sidebar-hospital">{hospital || 'Reception desk'}</p>

      <nav className="sidebar-menu">
        {NAV_ITEMS.map(([id, glyph, label]) => (
          <button
            key={id}
            className={`sidebar-item ${page === id ? 'active' : ''}`}
            onClick={() => setPage(id)}
          >
            <i>{glyph}</i>
            <span>{label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <a className="sidebar-item" href="mailto:support@saralai.com">
          <i>?</i>
          <span>Help & support</span>
        </a>
        <button className="sidebar-item" onClick={onLogout}>
          <i>⇥</i>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}