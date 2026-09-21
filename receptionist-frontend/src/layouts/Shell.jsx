import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import PatientForm from '../components/forms/PatientForm';
import AppointmentForm from '../components/forms/AppointmentForm';
import ReportForm from '../components/forms/ReportForm';
import Dashboard from '../pages/Dashboard';
import Appointments from '../pages/Appointments';
import Patients from '../pages/Patients';
import Doctors from '../pages/Doctors';
import Reports from '../pages/Reports';
import Settings from '../pages/Settings';

const EMPTY_DATA = { stats: {}, patients: [], doctors: [], appointments: [], reports: [] };

export default function Shell() {
  const { user, logout } = useAuth();
  const [page, setPage] = useState('dashboard');
  const [modal, setModal] = useState(null);
  const [query, setQuery] = useState('');
  const [data, setData] = useState(EMPTY_DATA);

  const load = () =>
    Promise.all([
      api('/receptionist/dashboard'),
      api('/receptionist/patients'),
      api('/receptionist/doctors'),
      api('/receptionist/appointments'),
      api('/receptionist/reports'),
    ]).then(([stats, patients, doctors, appointments, reports]) =>
      setData({ stats, patients, doctors, appointments, reports })
    );

  useEffect(() => {
    load().catch(console.error);
  }, []);

  function goTo(id, presetQuery = '') {
    setPage(id);
    setQuery(presetQuery);
  }

  function filtered(list) {
    if (!query) return list;
    return list.filter((item) => JSON.stringify(item).toLowerCase().includes(query.toLowerCase()));
  }

  async function updateAppointmentStatus(action, id) {
    await api(`/receptionist/appointments/${id}/${action}`, { method: 'PATCH' });
    load();
  }

  async function addPatient(form) {
    await api('/receptionist/patients', { method: 'POST', body: JSON.stringify(form) });
    load();
  }

  async function addAppointment(form) {
    await api('/receptionist/appointments', { method: 'POST', body: JSON.stringify(form) });
    load();
  }

  async function addReport(form) {
    await api('/receptionist/reports', { method: 'POST', body: JSON.stringify(form) });
    load();
  }

  return (
    <div className="app-shell">
      <Sidebar page={page} setPage={(id) => goTo(id)} hospital={data.stats.hospital} onLogout={logout} />

      <main className="main-content">
        <Topbar query={query} setQuery={setQuery} user={user} />

        <div className="page-content">
          {page === 'dashboard' && (
            <Dashboard
              user={user}
              stats={data.stats}
              appointments={data.appointments}
              onNewAppointment={() => setModal('appointment')}
              goToAppointments={() => goTo('appointments')}
            />
          )}

          {page === 'appointments' && (
            <Appointments
              appointments={filtered(data.appointments)}
              doctors={data.doctors}
              onNewAppointment={() => setModal('appointment')}
              onUpdateStatus={updateAppointmentStatus}
            />
          )}

          {page === 'patients' && (
            <Patients
              patients={filtered(data.patients)}
              appointments={data.appointments}
              reports={data.reports}
              onAddPatient={() => setModal('patient')}
            />
          )}

          {page === 'doctors' && (
            <Doctors
              doctors={filtered(data.doctors)}
              appointments={data.appointments}
              onViewSchedule={(name) => goTo('appointments', name)}
            />
          )}

          {page === 'reports' && (
            <Reports
              reports={filtered(data.reports)}
              appointments={data.appointments}
              onUploadReport={() => setModal('report')}
            />
          )}

          {page === 'settings' && <Settings user={user} />}
        </div>
      </main>

      {modal === 'patient' && (
        <PatientForm close={() => setModal(null)} save={addPatient} />
      )}

      {modal === 'appointment' && (
        <AppointmentForm
          close={() => setModal(null)}
          patients={data.patients}
          doctors={data.doctors}
          save={addAppointment}
        />
      )}

      {modal === 'report' && (
        <ReportForm close={() => setModal(null)} patients={data.patients} save={addReport} />
      )}
    </div>
  );
}