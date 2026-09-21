import { useState } from 'react';
import Modal from '../Modal';

export default function ReportForm({ close, save, patients }) {
  const [form, setForm] = useState({ patient_id: '', file_name: '', file_url: '', notes: '' });

  async function handleSubmit(e) {
    e.preventDefault();
    await save(form);
    close();
  }

  return (
    <Modal title="Upload patient report" close={close}>
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
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </label>
        <label>
          Report name *
          <input
            required
            value={form.file_name}
            onChange={(e) => setForm({ ...form, file_name: e.target.value })}
          />
        </label>
        <label>
          File URL
          <input
            value={form.file_url}
            onChange={(e) => setForm({ ...form, file_url: e.target.value })}
          />
        </label>
        <label>
          Description
          <textarea
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
        </label>
        <button className="btn-primary">Upload report</button>
      </form>
    </Modal>
  );
}