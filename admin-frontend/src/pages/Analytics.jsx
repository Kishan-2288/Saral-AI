import { useEffect, useState } from 'react';
import { getAnalytics } from '../services/analytics';
import { StatCard } from '../components/Dashboard/StatCard';
import { Loading } from '../components/Common/Loading';
import { ErrorMessage } from '../components/Common/ErrorMessage';
import { formatNumber } from '../utils/formatters';

export default function Analytics() { const [stats, setStats] = useState(null); const [error, setError] = useState(''); useEffect(() => { getAnalytics().then(setStats).catch((e) => setError(e.message)); }, []); if (error) return <ErrorMessage message={error} />; if (!stats) return <Loading />; return <><p className="eyebrow">PERFORMANCE</p><h1>Analytics</h1><p className="subtitle">Platform activity across the last 30 days.</p><div className="stats-grid"><StatCard label="Appointments" value={formatNumber(stats.appointments_last_30_days)} detail="Last 30 days" /><StatCard label="New enterprises" value={formatNumber(stats.new_enterprises_last_30_days)} detail="Last 30 days" /><StatCard label="Active enterprises" value={formatNumber(stats.active_enterprises)} /><StatCard label="Total patients" value={formatNumber(stats.total_patients)} /><StatCard label="Staff accounts" value={formatNumber(stats.staff_count)} /></div></>; }
