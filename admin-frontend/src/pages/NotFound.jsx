import { Link } from '../routes/router';
export default function NotFound() { return <section className="empty-page"><p className="eyebrow">404</p><h1>Page not found</h1><p>The page you requested does not exist.</p><Link className="button button-primary" to="/dashboard">Return to dashboard</Link></section>; }
