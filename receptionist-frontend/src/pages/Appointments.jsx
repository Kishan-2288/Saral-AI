import PageHeading from '../components/PageHeading';
import Table from '../components/Table';
import Status from '../components/Status';
import { formatDate, formatTime } from '../utils/format';

export default function Appointments({ appointments, doctors, onNewAppointment, onUpdateStatus }) {
  const doctorByName = (name) => doctors.find((d) => d.name === name);

  return (
    <>
      <PageHeading
        title="Appointments"
        subtitle="Manage bookings, arrivals, and appointment status."
        action={<button className="btn-primary" onClick={onNewAppointment}>+ New appointment</button>}
      />

      <Table title="Appointments">
        <thead>
          <tr>
            <th>Date</th><th>Time</th><th>Patient</th><th>Doctor</th>
            <th>Department</th><th>Status</th><th>Payment</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {appointments.map((a) => (
            <tr key={a.id}>
              <td>{formatDate(a.scheduled_at)}</td>
              <td>{formatTime(a.scheduled_at)}</td>
              <td>{a.patient_name}</td>
              <td>{a.doctor_name}</td>
              <td>{doctorByName(a.doctor_name)?.department || '—'}</td>
              <td><Status value={a.status} /></td>
              <td><Status value={a.payment_status} /></td>
              <td>
                {!['completed', 'cancelled'].includes(a.status) && (
                  <>
                    <button className="table-action" onClick={() => onUpdateStatus('complete', a.id)}>
                      Complete
                    </button>
                    <button className="table-action danger" onClick={() => onUpdateStatus('cancel', a.id)}>
                      Cancel
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
          {appointments.length === 0 && (
            <tr><td colSpan={8}>No appointments found.</td></tr>
          )}
        </tbody>
      </Table>
    </>
  );
}