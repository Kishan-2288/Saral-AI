export default function Topbar({ query, setQuery, user }) {
  return (
    <header className="top-navbar">
      <input
        className="global-search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search patients, doctors, appointments..."
      />
      <div className="user-info">
        <span className="user-avatar">{user.full_name[0]}</span>
        <div>
          <div className="user-name">{user.full_name}</div>
          <div className="user-role">Receptionist</div>
        </div>
      </div>
    </header>
  );
}