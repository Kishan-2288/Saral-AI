import StatCard from '../components/StatCard';
import Table from '../components/Table';
import Status from '../components/Status';
import { formatTime, today } from '../utils/format';

export default function Dashboard({ user, stats, appointments, onNewAppointment, goToAppointments }) {
  const todays = appointments.filter((a) => a.scheduled_at.slice(0, 10) === today());
  const waiting = todays.filter((a) => ['pending', 'scheduled'].includes(a.status)).length;
  const completed = todays.filter((a) => a.status === 'completed').length;

  const cards = [
    ['Today’s appointments', stats.today, '◷'],
    ['Waiting patients', waiting, '♙'],
    ['Completed appointments', completed, '✓'],
    ['Upcoming appointments', stats.upcoming, '↗'],
  ];

  return (
    <>
      <p className="eyebrow">DASHBOARD</p>
      <h1 className="page-title">Good morning, {user.full_name.split(' ')[0]}</h1>
      <p className="page-subtitle">
        Here’s today’s reception activity at {stats.hospital || 'your hospital'}.
      </p>

      <div className="stats-grid">
        {cards.map(([label, value, icon]) => (
          <StatCard key={label} label={label} value={value} icon={icon} />
        ))}
      </div>

      <Table
        title="Today’s appointments"
        action={<button className="btn-primary" onClick={onNewAppointment}>+ New appointment</button>}
      >
        <thead>
          <tr><th>Time</th><th>Patient</th><th>Doctor</th><th>Status</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {todays.map((a) => (
            <tr key={a.id}>
              <td>{formatTime(a.scheduled_at)}</td>
              <td>{a.patient_name}</td>
              <td>{a.doctor_name}</td>
              <td><Status value={a.status} /></td>
              <td><button className="table-action" onClick={goToAppointments}>View</button></td>
            </tr>
          ))}
          {todays.length === 0 && (
            <tr><td colSpan={5}>No appointments scheduled for today.</td></tr>
          )}
        </tbody>
      </Table>
    </>
  );
}