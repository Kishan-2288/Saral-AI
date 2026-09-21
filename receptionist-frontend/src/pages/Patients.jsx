import PageHeading from '../components/PageHeading';
import Table from '../components/Table';
import { formatDate } from '../utils/format';

export default function Patients({ patients, appointments, reports, onAddPatient }) {
  const lastVisit = (patientId) =>
    appointments
      .filter((a) => a.patient_id === patientId)
      .sort((a, b) => new Date(b.scheduled_at) - new Date(a.scheduled_at))[0];

  return (
    <>
      <PageHeading
        title="Patients"
        subtitle="Patient details and their care history."
        action={<button className="btn-primary" onClick={onAddPatient}>+ Add patient</button>}
      />

      <Table title="Patients">
        <thead>
          <tr>
            <th>Patient name</th><th>Phone</th><th>Email</th>
            <th>Last visit</th><th>Doctor</th><th>Reports</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {patients.map((p) => {
            const visit = lastVisit(p.id);
            return (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td>{p.phone}</td>
                <td>{p.email || '—'}</td>
                <td>{visit ? formatDate(visit.scheduled_at) : '—'}</td>
                <td>{visit?.doctor_name || '—'}</td>
                <td>{reports.filter((r) => r.patient_id === p.id).length}</td>
                <td><button className="table-action">View</button></td>
              </tr>
            );
          })}
          {patients.length === 0 && (
            <tr><td colSpan={7}>No patients found.</td></tr>
          )}
        </tbody>
      </Table>
    </>
  );
}