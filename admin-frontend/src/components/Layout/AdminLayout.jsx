import { NavLink } from '../../routes/router';
import { NAV_ITEMS } from '../../utils/constants';
import { useAuth } from '../../hooks/useAuth';

export function AdminLayout({ children }) {
  const { user, logout } = useAuth();

  return (
    <div className="shell">
      <aside className="sidebar">
        <NavLink className="sidebar-brand" to="/dashboard">
          SARAL AI<span>ADMIN CONSOLE</span>
        </NavLink>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => (isActive ? 'active' : '')}
            >
              <span>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="side-bottom">
          <a href="mailto:support@saralai.com">? Help &amp; Support</a>
          <button className="side-logout" onClick={logout}>⇥ Logout</button>
        </div>
      </aside>

      <main className="content">
        <header className="topbar">
          <div>
            <p className="eyebrow">ADMIN CONSOLE</p>
            <p className="topbar-user">{user?.full_name || user?.email}</p>
          </div>
          <span className="user-pill">{user?.email}</span>
        </header>
        {children}
      </main>
    </div>
  );
}
