import PageHeading from '../components/PageHeading';
import Table from '../components/Table';
import Status from '../components/Status';
import { today } from '../utils/format';

export default function Doctors({ doctors, appointments, onViewSchedule }) {
  const todaysCount = (doctorId) =>
    appointments.filter((a) => a.doctor_id === doctorId && a.scheduled_at.slice(0, 10) === today()).length;

  return (
    <>
      <PageHeading title="Doctors" subtitle="Today’s schedules and doctor availability." />

      <Table title="Doctor availability">
        <thead>
          <tr>
            <th>Doctor</th><th>Department</th><th>Specialization</th>
            <th>Today’s appointments</th><th>Availability</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {doctors.map((d) => (
            <tr key={d.id}>
              <td>{d.name}</td>
              <td>{d.department}</td>
              <td>{d.specialization || '—'}</td>
              <td>{todaysCount(d.id)}</td>
              <td><Status value="confirmed" /></td>
              <td>
                <button className="table-action" onClick={() => onViewSchedule(d.name)}>
                  View schedule
                </button>
              </td>
            </tr>
          ))}
          {doctors.length === 0 && (
            <tr><td colSpan={6}>No doctors found.</td></tr>
          )}
        </tbody>
      </Table>
    </>
  );
}