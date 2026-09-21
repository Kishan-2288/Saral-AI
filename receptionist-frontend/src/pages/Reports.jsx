import PageHeading from '../components/PageHeading';
import Table from '../components/Table';
import { formatDate } from '../utils/format';

export default function Reports({ reports, appointments, onUploadReport }) {
  const lastDoctorFor = (patientId) =>
    appointments
      .filter((a) => a.patient_id === patientId)
      .sort((a, b) => new Date(b.scheduled_at) - new Date(a.scheduled_at))[0]?.doctor_name;

  return (
    <>
      <PageHeading
        title="Reports"
        subtitle="Patient documents and clinical reports."
        action={<button className="btn-primary" onClick={onUploadReport}>Upload report</button>}
      />

      <Table title="Patient reports">
        <thead>
          <tr>
            <th>Report name</th><th>Patient</th><th>Doctor</th>
            <th>Report type</th><th>Uploaded date</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((r) => (
            <tr key={r.id}>
              <td>{r.file_name}</td>
              <td>{r.patient_name}</td>
              <td>{lastDoctorFor(r.patient_id) || '—'}</td>
              <td>Clinical report</td>
              <td>{formatDate(r.created_at)}</td>
              <td>
                {r.file_url ? (
                  <a className="table-action" target="_blank" rel="noreferrer" href={r.file_url}>
                    View / download
                  </a>
                ) : '—'}
              </td>
            </tr>
          ))}
          {reports.length === 0 && (
            <tr><td colSpan={6}>No reports uploaded yet.</td></tr>
          )}
        </tbody>
      </Table>
    </>
  );
}