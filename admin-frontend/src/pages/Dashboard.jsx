import { useEffect, useState } from 'react';
import { StatCard } from '../components/Dashboard/StatCard';
import { Loading } from '../components/Common/Loading';
import { ErrorMessage } from '../components/Common/ErrorMessage';
import { getDashboard } from '../services/analytics';
import { formatNumber } from '../utils/formatters';

export default function Dashboard() { const [stats, setStats] = useState(null); const [error, setError] = useState(''); useEffect(() => { getDashboard().then(setStats).catch((e) => setError(e.message)); }, []); if (error) return <ErrorMessage message={error} />; if (!stats) return <Loading />; return <><p className="eyebrow">OVERVIEW</p><h1>Platform dashboard</h1><p className="subtitle">A clear view of the organizations and people using Saral AI.</p><div className="stats-grid"><StatCard label="Total enterprises" value={formatNumber(stats.enterprises)} /><StatCard label="Active enterprises" value={formatNumber(stats.active_enterprises)} detail="Currently operating" /><StatCard label="Staff accounts" value={formatNumber(stats.staff)} /><StatCard label="Patients" value={formatNumber(stats.patients)} /><StatCard label="Appointments" value={formatNumber(stats.appointments)} /></div><section className="panel welcome-panel"><p className="eyebrow">ADMIN WORKSPACE</p><h2>Keep every enterprise moving.</h2><p>Use the navigation to review enterprise details, manage staff access, and monitor activity.</p></section></>; }
