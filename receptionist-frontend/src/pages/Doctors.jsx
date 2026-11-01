import { useEffect, useMemo, useState } from 'react';
import PageHeading from '../components/PageHeading';
import Table from '../components/Table';
import Status from '../components/Status';
import { today } from '../utils/format';
import { api } from '../services/api';

const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const pad = (value) => String(value).padStart(2, '0');
const toISODate = (value) => `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`;
const addDays = (value, count) => {
  const copy = new Date(value);
  copy.setDate(copy.getDate() + count);
  return copy;
};
const inputStyle = {
  width: '100%', boxSizing: 'border-box', padding: '10px 12px', border: '1px solid #d1d5db',
  borderRadius: 8, background: '#fff', color: '#111827', font: 'inherit', minHeight: 40,
};
const labelStyle = { display: 'grid', gap: 6, color: '#374151', fontSize: 13, fontWeight: 600 };
const secondaryButton = {
  border: '1px solid #d1d5db', background: '#fff', color: '#111827', borderRadius: 8,
  padding: '9px 12px', cursor: 'pointer', fontWeight: 600,
};
const primaryButton = {
  border: '1px solid #111827', background: '#111827', color: '#fff', borderRadius: 8,
  padding: '10px 14px', cursor: 'pointer', fontWeight: 600,
};

export default function Doctors({ doctors = [], appointments = [] }) {
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [rangeStart, setRangeStart] = useState(toISODate(new Date()));
  const [rangeEnd, setRangeEnd] = useState(toISODate(addDays(new Date(), 13)));
  const [form, setForm] = useState({ day_of_week: '0', start_time: '09:00', end_time: '17:00', slot_minutes: '30' });

  const todaysCount = (doctorId) => appointments.filter((a) =>
    String(a.doctor_id) === String(doctorId) && String(a.scheduled_at || a.appointment_date || '').slice(0, 10) === today()
  ).length;

  const loadScheduleData = async (doctorId = selectedDoctor?.id, start = rangeStart, end = rangeEnd) => {
    if (!doctorId) return;
    setLoading(true);
    setError('');
    try {
      const [scheduleRows, slotRows] = await Promise.all([
        api(`/receptionist/doctors/${doctorId}/schedules`),
        api(`/receptionist/doctors/${doctorId}/slot-calendar?from_date=${encodeURIComponent(start)}&to_date=${encodeURIComponent(end)}`),
      ]);
      setSchedules(Array.isArray(scheduleRows) ? scheduleRows : []);
      setSlots(Array.isArray(slotRows) ? slotRows : []);
    } catch (e) {
      setError(e.message || 'Unable to load schedule data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedDoctor) loadScheduleData(selectedDoctor.id, rangeStart, rangeEnd);
    // Only reload when doctor or calendar range changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDoctor?.id, rangeStart, rangeEnd]);

  const openManager = (doctor) => {
    setSelectedDoctor(doctor);
    setError('');
    setNotice('');
  };
  const closeManager = () => setSelectedDoctor(null);

  const createSchedule = async (event) => {
    event.preventDefault();
    setSaving(true); setError(''); setNotice('');
    try {
      await api(`/receptionist/doctors/${selectedDoctor.id}/schedules`, {
        method: 'POST',
        body: JSON.stringify({
          day_of_week: Number(form.day_of_week),
          start_time: form.start_time,
          end_time: form.end_time,
          slot_minutes: Number(form.slot_minutes),
          is_active: true,
        }),
      });
      setNotice('Weekly schedule saved. Generate dated slots below to make booking times available.');
      await loadScheduleData(selectedDoctor.id);
    } catch (e) {
      setError(e.message || 'Could not save the schedule.');
    } finally {
      setSaving(false);
    }
  };

  const toggleSchedule = async (schedule) => {
    setError(''); setNotice('');
    try {
      await api(`/receptionist/doctors/${selectedDoctor.id}/schedules/${schedule.id}`, {
        method: 'PATCH', body: JSON.stringify({ is_active: !schedule.is_active }),
      });
      setNotice(`Schedule ${schedule.is_active ? 'paused' : 'activated'}. Existing generated slots are not deleted.`);
      await loadScheduleData(selectedDoctor.id);
    } catch (e) { setError(e.message || 'Could not update the schedule.'); }
  };

  const generateSlots = async () => {
    setSaving(true); setError(''); setNotice('');
    try {
      const result = await api(`/receptionist/doctors/${selectedDoctor.id}/slots/generate`, {
        method: 'POST', body: JSON.stringify({ from_date: rangeStart, to_date: rangeEnd }),
      });
      setNotice(result.message || `Created ${result.created || 0} slots.`);
      await loadScheduleData(selectedDoctor.id);
    } catch (e) { setError(e.message || 'Could not generate slots.'); }
    finally { setSaving(false); }
  };

  const toggleSlot = async (slot) => {
    setError(''); setNotice('');
    try {
      await api(`/receptionist/doctors/${selectedDoctor.id}/slots/${slot.id}`, {
        method: 'PATCH', body: JSON.stringify({ available: !slot.available }),
      });
      setNotice(slot.available ? 'Slot blocked from new bookings.' : 'Slot is available for booking.');
      await loadScheduleData(selectedDoctor.id);
    } catch (e) { setError(e.message || 'Could not update this slot.'); }
  };

  const groupedSlots = useMemo(() => {
    const groups = {};
    for (const slot of slots) {
      if (!groups[slot.slot_date]) groups[slot.slot_date] = [];
      groups[slot.slot_date].push(slot);
    }
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [slots]);

  return (
    <>
      <PageHeading title="Doctors" subtitle="Manage doctors, weekly working hours, and appointment-slot availability." />
      <Table title="Doctor availability">
        <thead><tr><th>Doctor</th><th>Department</th><th>Specialization</th><th>Today’s appointments</th><th>Availability</th><th>Actions</th></tr></thead>
        <tbody>
          {doctors.map((doctor) => (
            <tr key={doctor.id}>
              <td>{doctor.name}</td><td>{doctor.department || '—'}</td><td>{doctor.specialization || '—'}</td>
              <td>{todaysCount(doctor.id)}</td><td><Status value={doctor.status || 'active'} /></td>
              <td><button className="table-action" onClick={() => openManager(doctor)}>Manage schedule & slots</button></td>
            </tr>
          ))}
          {doctors.length === 0 && <tr><td colSpan={6}>No doctors found.</td></tr>}
        </tbody>
      </Table>

      {selectedDoctor && (
        <div role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) closeManager(); }} style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(15, 23, 42, .55)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 16 }}>
          <section role="dialog" aria-modal="true" aria-labelledby="schedule-modal-title" style={{ width: 'min(100%, 980px)', maxHeight: '92vh', overflow: 'auto', background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 24px 80px rgba(0,0,0,.25)' }}>
            <header style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 20 }}>
              <div><h2 id="schedule-modal-title" style={{ margin: 0, fontSize: 22, color: '#111827' }}>Schedule: {selectedDoctor.name}</h2><p style={{ margin: '6px 0 0', color: '#64748b' }}>{selectedDoctor.department || 'Department not set'} · {selectedDoctor.specialization || 'Specialization not set'}</p></div>
              <button type="button" aria-label="Close schedule manager" onClick={closeManager} style={secondaryButton}>Close</button>
            </header>

            {error && <div role="alert" style={{ background: '#fef2f2', color: '#991b1b', padding: 12, borderRadius: 8, marginBottom: 12 }}>{error}</div>}
            {notice && <div role="status" style={{ background: '#ecfdf5', color: '#065f46', padding: 12, borderRadius: 8, marginBottom: 12 }}>{notice}</div>}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
              <div>
                <h3 style={{ margin: '0 0 12px', fontSize: 16 }}>Add weekly working hours</h3>
                <form onSubmit={createSchedule} style={{ display: 'grid', gap: 12 }}>
                  <label style={labelStyle}>Day of week<select style={inputStyle} value={form.day_of_week} onChange={(e) => setForm({ ...form, day_of_week: e.target.value })}>{DAY_NAMES.map((day, index) => <option key={day} value={index}>{day}</option>)}</select></label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <label style={labelStyle}>Start time<input type="time" required style={inputStyle} value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} /></label>
                    <label style={labelStyle}>End time<input type="time" required style={inputStyle} value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} /></label>
                  </div>
                  <label style={labelStyle}>Appointment duration<select style={inputStyle} value={form.slot_minutes} onChange={(e) => setForm({ ...form, slot_minutes: e.target.value })}>{[6, 10, 15, 20, 30, 45, 60, 90, 120].map((mins) => <option key={mins} value={mins}>{mins} minutes</option>)}</select></label>
                  <button type="submit" disabled={saving} style={{ ...primaryButton, opacity: saving ? .65 : 1 }}>{saving ? 'Saving…' : 'Save weekly schedule'}</button>
                </form>
                <h3 style={{ margin: '24px 0 10px', fontSize: 16 }}>Weekly schedules</h3>
                {schedules.length === 0 ? <p style={{ color: '#64748b', fontSize: 14 }}>No weekly schedules yet. Add working hours above.</p> : (
                  <div style={{ display: 'grid', gap: 8 }}>
                    {schedules.map((schedule) => <div key={schedule.id} style={{ border: '1px solid #e5e7eb', borderRadius: 10, padding: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                      <div><div style={{ fontWeight: 700, color: '#111827' }}>{schedule.day_name}</div><div style={{ color: '#64748b', fontSize: 13 }}>{schedule.start_time}–{schedule.end_time} · {schedule.slot_minutes} min</div><div style={{ fontSize: 12, color: schedule.is_active ? '#047857' : '#6b7280' }}>{schedule.is_active ? 'Active' : 'Paused'}</div></div>
                      <button type="button" style={secondaryButton} onClick={() => toggleSchedule(schedule)}>{schedule.is_active ? 'Pause' : 'Activate'}</button>
                    </div>)}
                  </div>
                )}
              </div>

              <div>
                <h3 style={{ margin: '0 0 12px', fontSize: 16 }}>Generate dated appointment slots</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <label style={labelStyle}>From date<input type="date" style={inputStyle} value={rangeStart} onChange={(e) => setRangeStart(e.target.value)} /></label>
                  <label style={labelStyle}>To date<input type="date" min={rangeStart} style={inputStyle} value={rangeEnd} onChange={(e) => setRangeEnd(e.target.value)} /></label>
                </div>
                <button type="button" disabled={saving || schedules.filter((s) => s.is_active).length === 0} onClick={generateSlots} style={{ ...primaryButton, marginTop: 12, opacity: saving ? .65 : 1, width: '100%' }}>{saving ? 'Working…' : 'Generate slots for date range'}</button>
                <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>Only active weekly schedules are used. Existing slots are not duplicated; past slots and overlapping times are skipped. Generate up to 90 days at a time.</p>
                <h3 style={{ margin: '20px 0 10px', fontSize: 16 }}>Slot calendar <span style={{ color: '#64748b', fontSize: 13, fontWeight: 400 }}>({slots.length} slots)</span></h3>
                {loading ? <p style={{ color: '#64748b' }}>Loading schedule…</p> : groupedSlots.length === 0 ? <p style={{ color: '#64748b', fontSize: 14 }}>No slots in this date range. Save a schedule and generate slots.</p> : (
                  <div style={{ display: 'grid', gap: 12 }}>
                    {groupedSlots.map(([day, daySlots]) => <div key={day}>
                      <div style={{ fontWeight: 700, marginBottom: 7, color: '#374151' }}>{new Date(`${day}T12:00:00`).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 7 }}>
                        {daySlots.map((slot) => <div key={slot.id} style={{ border: `1px solid ${slot.booked ? '#fecaca' : slot.available ? '#a7f3d0' : '#e5e7eb'}`, background: slot.booked ? '#fef2f2' : slot.available ? '#ecfdf5' : '#f3f4f6', borderRadius: 8, padding: 8 }}>
                          <div style={{ fontWeight: 700, fontSize: 13, color: '#111827' }}>{slot.start_time}–{slot.end_time}</div>
                          <div style={{ fontSize: 12, margin: '4px 0 7px', color: slot.booked ? '#991b1b' : slot.available ? '#065f46' : '#6b7280' }}>{slot.booked ? 'Booked' : slot.available ? 'Available' : 'Blocked'}</div>
                          {!slot.booked && <button type="button" onClick={() => toggleSlot(slot)} style={{ ...secondaryButton, width: '100%', padding: '5px 7px', fontSize: 12 }}>{slot.available ? 'Block slot' : 'Reopen slot'}</button>}
                        </div>)}
                      </div>
                    </div>)}
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
