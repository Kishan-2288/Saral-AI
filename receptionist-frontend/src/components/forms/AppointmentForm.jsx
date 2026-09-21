import { useEffect, useState } from 'react';
import Modal from '../Modal';
import { api } from '../../services/api';
import { today } from '../../utils/format';

export default function AppointmentForm({ close, save, patients, doctors }) {
  const [form, setForm] = useState({ patient_id: '', doctor_id: '', day: today(), slot: '' });
  const [slots, setSlots] = useState([]);

  useEffect(() => {
    if (!form.doctor_id) {
      setSlots([]);
      return;
    }
    api(`/receptionist/doctors/${form.doctor_id}/slots?slot_date=${form.day}`)
      .then((x) => setSlots(x.slots))
      .catch(console.error);
  }, [form.doctor_id, form.day]);

  async function handleSubmit(e) {
    e.preventDefault();
    await save({
      patient_id: form.patient_id,
      doctor_id: form.doctor_id,
      scheduled_at: `${form.day}T${form.slot}:00`,
    });
    close();
  }

  return (
    <Modal title="New appointment" close={close}>
      <form className="form" onSubmit={handleSubmit}>
        <label>
          Patient
          <select
            required
            value={form.patient_id}
            onChange={(e) => setForm({ ...form, patient_id: e.target.value })}
          >
            <option value="">Select patient</option>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>{p.name} · {p.phone}</option>
            ))}
          </select>
        </label>

        <label>
          Doctor
          <select
            required
            value={form.doctor_id}
            onChange={(e) => setForm({ ...form, doctor_id: e.target.value, slot: '' })}
          >
            <option value="">Select doctor</option>
            {doctors.map((d) => (
              <option key={d.id} value={d.id}>{d.name} · {d.department}</option>
            ))}
          </select>
        </label>

        <label>
          Date
          <input
            type="date"
            value={form.day}
            onChange={(e) => setForm({ ...form, day: e.target.value, slot: '' })}
          />
        </label>

        <div>
          <b>Available times</b>
          <div className="slots">
            {slots.filter((s) => s.available).map((s) => (
              <button
                type="button"
                key={s.time}
                className={form.slot === s.time ? 'picked' : ''}
                onClick={() => setForm({ ...form, slot: s.time })}
              >
                {s.time}
              </button>
            ))}
            {form.doctor_id && slots.filter((s) => s.available).length === 0 && (
              <small>No open slots for this date.</small>
            )}
          </div>
        </div>

        <button disabled={!form.slot} className="btn-primary">Book appointment</button>
      </form>
    </Modal>
  );
}